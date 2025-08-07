/**
 * Event System - Phase 4C Implementation
 * Manages game events, triggers, and player responses
 * Integrates with EventAIGenerator for dynamic content
 */

class EventSystem {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.eventAI = null;
        this.timeSystem = null;
        this.activeEvents = new Map();
        this.eventHistory = [];
        this.triggerTimers = new Map();
        this.eventQueue = [];
        this.processingEvent = false;
        this.eventConfig = {
            maxActiveEvents: 5,
            defaultEventDuration: 3600000, // 1 hour
            emergencyPriority: 100,
            highPriority: 75,
            mediumPriority: 50,
            lowPriority: 25
        };
    }

    initialize(gameState, eventBus, eventAI, timeSystem) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        this.eventAI = eventAI;
        this.timeSystem = timeSystem;
        
        this.setupEventListeners();
        this.startEventProcessing();
        
        console.log('🎭 Event System initialized with AI generation');
    }

    setupEventListeners() {
        // Listen for AI-generated events
        this.eventBus.on('event.triggered', (event) => this.handleTriggeredEvent(event));
        this.eventBus.on('event.resolved', (data) => this.handleEventResolution(data));
        
        // Listen for game state changes that might trigger events
        this.eventBus.on('finance.debtChanged', () => this.checkFinancialTriggers());
        this.eventBus.on('staff.moraleLow', () => this.triggerStaffEvent());
        this.eventBus.on('customer.complaint', (data) => this.handleCustomerComplaint(data));
        this.eventBus.on('time.newDay', () => this.processNewDayEvents());
        this.eventBus.on('time.newWeek', () => this.processNewWeekEvents());
        
        console.log('📡 Event listeners configured');
    }

    // Main event handling methods
    async handleTriggeredEvent(event) {
        try {
            console.log('🎯 Processing triggered event:', event.title);
            
            // Add event to active events
            this.activeEvents.set(event.id, {
                ...event,
                startTime: Date.now(),
                responses: [],
                status: 'active'
            });
            
            // Check if immediate action is required
            if (this.requiresImmediateAttention(event)) {
                await this.presentEventToPlayer(event);
            } else {
                // Queue event for background processing
                this.queueEvent(event, event.priority || 'medium');
            }
            
            // Set expiration timer if event has duration
            if (event.duration) {
                this.setEventExpiration(event.id, event.duration);
            }
            
            // Update game state based on event
            this.applyEventEffects(event);
            
        } catch (error) {
            console.error('❌ Error handling triggered event:', error);
        }
    }

    async presentEventToPlayer(event) {
        // Pause the game for important events
        if (event.priority === 'emergency' || event.type === 'emergencyEvent') {
            this.gameState.paused = true;
        }
        
        // Create event UI data
        const eventPresentation = {
            id: event.id,
            title: event.title,
            description: event.description,
            type: event.type,
            priority: event.priority,
            effects: event.effects || [],
            options: event.options || [],
            consequences: event.consequences || {},
            timestamp: Date.now(),
            requiresImmediate: this.requiresImmediateAttention(event)
        };
        
        // Emit to UI
        this.eventBus.emit('ui.showEvent', eventPresentation);
        
        console.log('📋 Event presented to player:', event.title);
    }

    requiresImmediateAttention(event) {
        const immediateTypes = ['emergencyEvent', 'customerIncident'];
        const highPriorityEvents = ['emergency', 'high'];
        
        return immediateTypes.includes(event.type) || 
               highPriorityEvents.includes(event.priority);
    }

    // Event resolution handling
    async handleEventResolution(data) {
        const { event, resolution } = data;
        
        console.log('✅ Resolving event:', event.title, 'with resolution:', resolution);
        
        // Remove from active events
        if (this.activeEvents.has(event.id)) {
            const activeEvent = this.activeEvents.get(event.id);
            activeEvent.status = 'resolved';
            activeEvent.resolution = resolution;
            activeEvent.endTime = Date.now();
            
            // Apply resolution consequences
            await this.applyResolutionConsequences(activeEvent, resolution);
            
            // Move to history
            this.eventHistory.unshift(activeEvent);
            this.activeEvents.delete(event.id);
            
            // Clear any timers
            this.clearEventTimer(event.id);
        }
        
        // Unpause game if it was paused for this event
        if (this.gameState.paused && this.getHighPriorityActiveEvents().length === 0) {
            this.gameState.paused = false;
            this.eventBus.emit('game.unpaused');
        }
        
        // Generate follow-up events based on resolution
        await this.generateFollowUpEvents(event, resolution);
    }

    async applyResolutionConsequences(event, resolution) {
        const consequences = event.consequences[resolution];
        if (!consequences) return;
        
        // Parse and apply consequences
        if (typeof consequences === 'string') {
            // Simple text consequences - parse for common patterns
            await this.parseTextConsequences(consequences, event);
        } else if (typeof consequences === 'object') {
            // Structured consequences
            await this.applyStructuredConsequences(consequences, event);
        }
    }

    async parseTextConsequences(consequenceText, event) {
        const text = consequenceText.toLowerCase();
        
        // Financial consequences
        if (text.includes('money') || text.includes('cost') || text.includes('$')) {
            const amount = this.extractMoneyAmount(consequenceText);
            if (amount) {
                if (text.includes('lose') || text.includes('cost')) {
                    this.gameState.finance.cash -= Math.abs(amount);
                } else if (text.includes('gain') || text.includes('earn')) {
                    this.gameState.finance.cash += Math.abs(amount);
                }
            }
        }
        
        // Reputation consequences
        if (text.includes('reputation')) {
            if (text.includes('increase') || text.includes('improve')) {
                this.gameState.store.reputation += 5;
            } else if (text.includes('decrease') || text.includes('damage')) {
                this.gameState.store.reputation -= 5;
            }
        }
        
        // Customer consequences
        if (text.includes('customer')) {
            if (text.includes('satisfied') || text.includes('happy')) {
                this.gameState.store.customerSatisfaction += 10;
            } else if (text.includes('angry') || text.includes('upset')) {
                this.gameState.store.customerSatisfaction -= 10;
            }
        }
        
        // Staff consequences
        if (text.includes('staff') || text.includes('employee')) {
            const moraleChange = text.includes('improve') ? 10 : 
                               text.includes('damage') ? -10 : 0;
            
            this.gameState.staff.forEach(staff => {
                staff.morale = Math.max(0, Math.min(100, staff.morale + moraleChange));
            });
        }
    }

    extractMoneyAmount(text) {
        const matches = text.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
        return matches ? parseInt(matches[1].replace(/,/g, '')) : null;
    }

    // Event queuing and processing
    queueEvent(event, priority = 'medium') {
        const priorityValues = {
            emergency: this.eventConfig.emergencyPriority,
            high: this.eventConfig.highPriority,
            medium: this.eventConfig.mediumPriority,
            low: this.eventConfig.lowPriority
        };
        
        this.eventQueue.push({
            event,
            priority: priorityValues[priority] || priorityValues.medium,
            queueTime: Date.now()
        });
        
        // Sort queue by priority
        this.eventQueue.sort((a, b) => b.priority - a.priority);
        
        console.log('📋 Event queued:', event.title, 'Priority:', priority);
    }

    async processEventQueue() {
        if (this.processingEvent || this.eventQueue.length === 0) {
            return;
        }
        
        // Don't process events if game is paused for an emergency
        if (this.gameState.paused && this.getHighPriorityActiveEvents().length > 0) {
            return;
        }
        
        this.processingEvent = true;
        
        try {
            const queueItem = this.eventQueue.shift();
            await this.presentEventToPlayer(queueItem.event);
        } catch (error) {
            console.error('❌ Error processing event queue:', error);
        } finally {
            this.processingEvent = false;
        }
    }

    startEventProcessing() {
        // Process event queue every 5 seconds
        setInterval(() => this.processEventQueue(), 5000);
        
        // Clean up expired events every minute
        setInterval(() => this.cleanupExpiredEvents(), 60000);
        
        console.log('⏰ Event processing started');
    }

    // Event expiration and cleanup
    setEventExpiration(eventId, duration) {
        const timer = setTimeout(() => {
            this.expireEvent(eventId);
        }, duration);
        
        this.triggerTimers.set(eventId, timer);
    }

    expireEvent(eventId) {
        if (this.activeEvents.has(eventId)) {
            const event = this.activeEvents.get(eventId);
            console.log('⏱️ Event expired:', event.title);
            
            // Auto-resolve with default resolution
            this.handleEventResolution({
                event: event,
                resolution: 'timeout'
            });
        }
    }

    clearEventTimer(eventId) {
        if (this.triggerTimers.has(eventId)) {
            clearTimeout(this.triggerTimers.get(eventId));
            this.triggerTimers.delete(eventId);
        }
    }

    cleanupExpiredEvents() {
        const now = Date.now();
        const expiredEvents = [];
        
        for (const [eventId, event] of this.activeEvents.entries()) {
            const age = now - event.startTime;
            const maxAge = event.duration || this.eventConfig.defaultEventDuration;
            
            if (age > maxAge) {
                expiredEvents.push(eventId);
            }
        }
        
        expiredEvents.forEach(eventId => this.expireEvent(eventId));
        
        if (expiredEvents.length > 0) {
            console.log('🧹 Cleaned up', expiredEvents.length, 'expired events');
        }
    }

    // Event effect application
    applyEventEffects(event) {
        if (!event.effects || !Array.isArray(event.effects)) return;
        
        event.effects.forEach(effect => {
            if (typeof effect === 'string') {
                this.parseTextEffect(effect);
            } else if (typeof effect === 'object') {
                this.applyStructuredEffect(effect);
            }
        });
    }

    parseTextEffect(effectText) {
        const text = effectText.toLowerCase();
        
        // Customer traffic effects
        if (text.includes('foot traffic') || text.includes('customers')) {
            if (text.includes('increase') || text.includes('more')) {
                this.gameState.store.footTrafficModifier = (this.gameState.store.footTrafficModifier || 1) + 0.2;
            } else if (text.includes('decrease') || text.includes('less')) {
                this.gameState.store.footTrafficModifier = Math.max(0.1, (this.gameState.store.footTrafficModifier || 1) - 0.2);
            }
        }
        
        // Store atmosphere effects
        if (text.includes('atmosphere') || text.includes('mood')) {
            if (text.includes('positive') || text.includes('improve')) {
                this.gameState.store.atmosphereBonus = (this.gameState.store.atmosphereBonus || 0) + 10;
            } else if (text.includes('negative') || text.includes('tense')) {
                this.gameState.store.atmosphereBonus = (this.gameState.store.atmosphereBonus || 0) - 10;
            }
        }
    }

    // Trigger-specific handlers
    checkFinancialTriggers() {
        const finance = this.gameState.finance;
        
        // Low cash trigger
        if (finance.cash < 500 && !this.hasActiveEventOfType('financialEmergency')) {
            this.eventAI?.triggerEvent(['financialEvent'], 'high');
        }
        
        // High debt trigger
        if (finance.totalDebt > finance.cash * 4) {
            this.eventAI?.triggerEvent(['financialEvent'], 'high');
        }
    }

    async triggerStaffEvent() {
        if (!this.hasActiveEventOfType('staffDrama')) {
            await this.eventAI?.generateStaffDrama({ 
                priority: 'medium',
                urgencyLevel: 'high' 
            });
        }
    }

    async handleCustomerComplaint(data) {
        // Generate customer incident event based on complaint
        await this.eventAI?.generateCustomerIncident({
            incidentType: 'product_complaint',
            customer: data.customer,
            product: data.product,
            severityLevel: data.severity || 'medium'
        });
    }

    async processNewDayEvents() {
        // Generate daily news or minor events
        if (Math.random() < 0.3) { // 30% chance of daily event
            await this.eventAI?.generateLocalNews({
                scope: 'daily',
                impact: 'minor'
            });
        }
    }

    async processNewWeekEvents() {
        // Generate weekly events and news
        await this.eventAI?.generateLocalNews({
            scope: 'weekly',
            impact: 'moderate'
        });
        
        // Weekly business review event
        if (Math.random() < 0.5) {
            await this.eventAI?.generateBusinessEvent({
                eventType: 'weekly_review',
                priority: 'low'
            });
        }
    }

    // Follow-up event generation
    async generateFollowUpEvents(originalEvent, resolution) {
        // Generate consequences and follow-up events based on resolution
        const followUpChance = this.calculateFollowUpChance(originalEvent, resolution);
        
        if (Math.random() < followUpChance) {
            const followUpContext = {
                originalEvent: originalEvent.type,
                resolution: resolution,
                timeDelay: this.calculateFollowUpDelay(originalEvent),
                intensity: this.calculateFollowUpIntensity(originalEvent, resolution)
            };
            
            // Schedule follow-up event
            setTimeout(async () => {
                await this.generateContextualFollowUp(followUpContext);
            }, followUpContext.timeDelay);
        }
    }

    calculateFollowUpChance(event, resolution) {
        const baseChance = 0.3; // 30% base chance
        
        // Higher chance for unresolved issues
        if (resolution === 'timeout' || resolution === 'ignored') {
            return baseChance + 0.4;
        }
        
        // Lower chance for well-resolved issues
        if (resolution === 'resolved_positively') {
            return baseChance - 0.1;
        }
        
        return baseChance;
    }

    calculateFollowUpDelay(event) {
        const delays = {
            'emergencyEvent': 3600000, // 1 hour
            'customerIncident': 1800000, // 30 minutes
            'staffDrama': 7200000, // 2 hours
            'socialMediaEvent': 14400000, // 4 hours
            'financialEvent': 86400000 // 24 hours
        };
        
        return delays[event.type] || 3600000;
    }

    async generateContextualFollowUp(context) {
        // Generate appropriate follow-up based on original event
        switch (context.originalEvent) {
            case 'customerIncident':
                if (context.resolution === 'poorly_handled') {
                    await this.eventAI?.generateSocialMediaEvent({
                        triggeringIncident: 'poor customer service',
                        tone: 'negative',
                        viralPotential: 'high'
                    });
                }
                break;
                
            case 'staffDrama':
                if (context.resolution === 'unresolved') {
                    await this.eventAI?.generateStaffDrama({
                        dramaType: 'escalation',
                        complexity: 'high'
                    });
                }
                break;
                
            case 'financialEvent':
                // Generate market reaction events
                await this.eventAI?.generateBusinessEvent({
                    eventType: 'market_response',
                    context: context.resolution
                });
                break;
        }
    }

    // Utility methods
    hasActiveEventOfType(eventType) {
        for (const event of this.activeEvents.values()) {
            if (event.type === eventType) {
                return true;
            }
        }
        return false;
    }

    getHighPriorityActiveEvents() {
        return Array.from(this.activeEvents.values())
                   .filter(event => event.priority === 'emergency' || event.priority === 'high');
    }

    getActiveEvents() {
        return Array.from(this.activeEvents.values());
    }

    getEventHistory(limit = 20) {
        return this.eventHistory.slice(0, limit);
    }

    // Public API for manual event triggering
    async triggerCustomEvent(eventType, context = {}) {
        if (this.eventAI) {
            return await this.eventAI.generateEvent(eventType, {
                ...context,
                manualTrigger: true
            });
        }
    }

    // Emergency event handling
    async triggerEmergency(emergencyType, context = {}) {
        const emergency = await this.eventAI?.generateEmergency({
            emergencyType: emergencyType,
            severityLevel: 'high',
            priority: 'emergency',
            ...context
        });
        
        if (emergency) {
            // Immediately present emergency to player
            await this.presentEventToPlayer(emergency);
        }
        
        return emergency;
    }

    // Event statistics and reporting
    getEventStatistics() {
        const stats = {
            totalEvents: this.eventHistory.length,
            activeEvents: this.activeEvents.size,
            eventsByType: {},
            resolutionsByType: {},
            averageResolutionTime: 0
        };
        
        // Calculate event type distribution
        this.eventHistory.forEach(event => {
            stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1;
            if (event.resolution) {
                if (!stats.resolutionsByType[event.type]) {
                    stats.resolutionsByType[event.type] = {};
                }
                stats.resolutionsByType[event.type][event.resolution] = 
                    (stats.resolutionsByType[event.type][event.resolution] || 0) + 1;
            }
        });
        
        // Calculate average resolution time
        const resolvedEvents = this.eventHistory.filter(e => e.endTime);
        if (resolvedEvents.length > 0) {
            const totalTime = resolvedEvents.reduce((sum, e) => sum + (e.endTime - e.startTime), 0);
            stats.averageResolutionTime = totalTime / resolvedEvents.length;
        }
        
        return stats;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventSystem;
} else if (typeof window !== 'undefined') {
    window.EventSystem = EventSystem;
}
