/**
 * Customer Service System - Core customer interaction mechanics
 * Orchestrates conversations, checkout, and customer satisfaction
 */

class CustomerServiceSystem {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.conversationSystem = null;
        this.checkoutSystem = null;
        this.npcSystem = null;
        this.currentCustomer = null;
        this.serviceMode = 'idle'; // idle, greeting, conversation, checkout, resolving_complaint
        this.serviceMetrics = {
            customersServed: 0,
            averageSatisfaction: 0,
            totalSales: 0,
            complaintsResolved: 0,
            upsellSuccess: 0
        };
    }

    initialize(gameState, eventBus, conversationSystem, checkoutSystem, npcSystem) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        this.conversationSystem = conversationSystem;
        this.checkoutSystem = checkoutSystem;
        this.npcSystem = npcSystem;
        
        // Listen for customer service events
        this.eventBus.on('encounter.customerEntered', (data) => this.handleCustomerEntry(data));
        this.eventBus.on('encounter.customerAction', (data) => this.handleCustomerAction(data));
        this.eventBus.on('encounter.customerQuestion', (data) => this.handleCustomerQuestion(data));
        this.eventBus.on('encounter.customerComplaint', (data) => this.handleCustomerComplaint(data));
        this.eventBus.on('encounter.purchaseIntent', (data) => this.handlePurchaseIntent(data));
        this.eventBus.on('encounter.ended', (data) => this.handleCustomerExit(data));
        
        this.eventBus.on('conversation.ended', (data) => this.handleConversationEnd(data));
        this.eventBus.on('checkout.completed', (data) => this.handleCheckoutComplete(data));
        this.eventBus.on('checkout.cancelled', (data) => this.handleCheckoutCancel(data));
        
        // Player action events
        this.eventBus.on('player.greetCustomer', (data) => this.greetCustomer(data));
        this.eventBus.on('player.helpCustomer', (data) => this.helpCustomer(data));
        this.eventBus.on('player.startCheckout', (data) => this.startCheckout(data));
        this.eventBus.on('player.resolveComplaint', (data) => this.resolveComplaint(data));
        this.eventBus.on('player.ignoreCustomer', () => this.ignoreCustomer());
        
        console.log('🤝 Customer Service System initialized');
    }

    // Customer Entry and Flow Management
    handleCustomerEntry(data) {
        const { npc, behavior } = data;
        this.currentCustomer = npc;
        this.serviceMode = 'greeting';
        
        // Calculate initial satisfaction based on store conditions
        const initialSatisfaction = this.calculateInitialSatisfaction(npc);
        
        // Set timer for automatic greeting if player doesn't respond
        this.setAutoGreetingTimer();
        
        this.eventBus.emit('customerService.customerEntered', {
            customer: npc,
            behavior: behavior,
            initialSatisfaction: initialSatisfaction,
            suggestedActions: this.getSuggestedActions(npc, behavior)
        });
        
        console.log(`🤝 Customer entered: ${npc.name} (${behavior.action})`);
    }

    calculateInitialSatisfaction(npc) {
        let satisfaction = 60; // Base satisfaction
        
        // Store cleanliness (simplified)
        satisfaction += 10; // Assume clean for now
        
        // Store atmosphere based on type
        const storeType = this.gameState.data.store.type;
        if (storeType === 'boutique') satisfaction += 5;
        if (storeType === 'convenience') satisfaction -= 2;
        
        // Relationship bonus
        if (npc.relationshipLevel === 'regular') satisfaction += 10;
        if (npc.relationshipLevel === 'friend') satisfaction += 15;
        if (npc.relationshipLevel === 'vip') satisfaction += 20;
        
        // Mood modifier
        switch (npc.mood) {
            case 'happy': satisfaction += 10; break;
            case 'irritated': satisfaction -= 15; break;
            case 'stressed': satisfaction -= 10; break;
            case 'excited': satisfaction += 15; break;
            case 'tired': satisfaction -= 5; break;
        }
        
        return Math.max(20, Math.min(100, satisfaction));
    }

    getSuggestedActions(npc, behavior) {
        const suggestions = [];
        
        // Always available
        suggestions.push({
            action: 'greet',
            text: 'Greet customer',
            priority: 'high',
            relationshipImpact: '+1 to +3'
        });
        
        // Behavior-specific suggestions
        if (behavior.needsHelp) {
            suggestions.push({
                action: 'offer_help',
                text: 'Offer assistance',
                priority: 'high',
                relationshipImpact: '+2 to +4'
            });
        }
        
        if (behavior.action === 'immediate_purchase') {
            suggestions.push({
                action: 'quick_service',
                text: 'Provide quick service',
                priority: 'medium',
                satisfactionImpact: '+5'
            });
        }
        
        // Relationship-based suggestions
        if (npc.relationshipLevel !== 'stranger') {
            suggestions.push({
                action: 'personal_greeting',
                text: 'Personal greeting',
                priority: 'medium',
                relationshipImpact: '+3 to +5'
            });
        }
        
        return suggestions;
    }

    setAutoGreetingTimer() {
        // Auto-greet after 10 seconds if player hasn't acted
        this.autoGreetingTimer = setTimeout(() => {
            if (this.serviceMode === 'greeting' && this.currentCustomer) {
                this.greetCustomer({ type: 'auto', quality: 'neutral' });
            }
        }, 10000);
    }

    // Player Actions
    greetCustomer(data = {}) {
        if (!this.currentCustomer || this.serviceMode !== 'greeting') return;
        
        const { type = 'manual', quality = 'friendly', customMessage = null } = data;
        
        // Clear auto-greeting timer
        if (this.autoGreetingTimer) {
            clearTimeout(this.autoGreetingTimer);
            this.autoGreetingTimer = null;
        }
        
        this.serviceMode = 'conversation';
        
        // Calculate greeting impact
        const impact = this.calculateGreetingImpact(quality, this.currentCustomer);
        
        // Start conversation with greeting
        this.conversationSystem.handleGreeting({
            npc: this.currentCustomer,
            greetingType: quality
        });
        
        // Apply immediate relationship impact
        if (impact.relationshipChange !== 0) {
            this.npcSystem.updateRelationship(
                this.currentCustomer.id,
                impact.relationshipChange,
                `Greeting: ${quality}`
            );
        }
        
        this.eventBus.emit('customerService.customerGreeted', {
            customer: this.currentCustomer,
            greetingType: quality,
            impact: impact,
            isAutomatic: type === 'auto'
        });
        
        console.log(`🤝 Greeted ${this.currentCustomer.name} (${quality})`);
    }

    calculateGreetingImpact(quality, npc) {
        let relationshipChange = 0;
        let satisfactionChange = 0;
        
        switch (quality) {
            case 'friendly':
                relationshipChange = 2;
                satisfactionChange = 5;
                break;
            case 'professional':
                relationshipChange = 1;
                satisfactionChange = 3;
                break;
            case 'casual':
                relationshipChange = 1;
                satisfactionChange = 2;
                break;
            case 'enthusiastic':
                relationshipChange = 3;
                satisfactionChange = 7;
                break;
            case 'neutral':
                relationshipChange = 0;
                satisfactionChange = 0;
                break;
            case 'cold':
                relationshipChange = -1;
                satisfactionChange = -3;
                break;
        }
        
        // Relationship level modifiers
        if (npc.relationshipLevel === 'friend' || npc.relationshipLevel === 'vip') {
            relationshipChange += 1; // Bonus for existing relationship
        }
        
        // Mood modifiers
        if (npc.mood === 'irritated' && quality !== 'apologetic') {
            satisfactionChange -= 2;
        }
        if (npc.mood === 'happy') {
            satisfactionChange += 1;
        }
        
        return {
            relationshipChange: relationshipChange,
            satisfactionChange: satisfactionChange
        };
    }

    helpCustomer(data = {}) {
        if (!this.currentCustomer) return;
        
        const { approach = 'helpful', topic = 'general' } = data;
        
        // Different help approaches
        const helpQualities = {
            'helpful': { relationship: 2, satisfaction: 4, description: 'Genuinely helpful assistance' },
            'expert': { relationship: 1, satisfaction: 6, description: 'Expert knowledge displayed' },
            'patient': { relationship: 3, satisfaction: 3, description: 'Patient and understanding' },
            'efficient': { relationship: 1, satisfaction: 2, description: 'Quick and efficient help' },
            'personal': { relationship: 4, satisfaction: 5, description: 'Personal attention and care' }
        };
        
        const quality = helpQualities[approach] || helpQualities.helpful;
        
        // Apply help impact
        this.npcSystem.updateRelationship(
            this.currentCustomer.id,
            quality.relationship,
            `Help provided: ${approach}`
        );
        
        // Continue or start conversation about the help topic
        if (!this.conversationSystem.isInConversation()) {
            this.conversationSystem.handleQuestion({
                npc: this.currentCustomer,
                question: `Help with ${topic}`,
                category: topic
            });
        }
        
        this.eventBus.emit('customerService.helpProvided', {
            customer: this.currentCustomer,
            approach: approach,
            topic: topic,
            impact: quality
        });
        
        console.log(`🤝 Helped ${this.currentCustomer.name} (${approach})`);
    }

    startCheckout(data = {}) {
        if (!this.currentCustomer) return;
        
        const { items = [], approach = 'standard' } = data;
        
        this.serviceMode = 'checkout';
        
        // Start checkout process
        this.checkoutSystem.startCheckout({
            npc: this.currentCustomer,
            items: items,
            context: {
                startedBy: 'player',
                approach: approach
            }
        });
        
        this.eventBus.emit('customerService.checkoutStarted', {
            customer: this.currentCustomer,
            items: items,
            approach: approach
        });
        
        console.log(`🤝 Started checkout for ${this.currentCustomer.name}`);
    }

    resolveComplaint(data = {}) {
        if (!this.currentCustomer) return;
        
        const { resolution = 'listen', compensation = null, approach = 'empathetic' } = data;
        
        // Different resolution approaches
        const resolutions = {
            'listen': { relationship: 2, satisfaction: 5, description: 'Listen and acknowledge' },
            'apologize': { relationship: 3, satisfaction: 8, description: 'Sincere apology' },
            'compensate': { relationship: 4, satisfaction: 12, description: 'Offer compensation' },
            'explain': { relationship: 1, satisfaction: 3, description: 'Explain the situation' },
            'dismiss': { relationship: -3, satisfaction: -8, description: 'Dismiss the complaint' }
        };
        
        const resolutionData = resolutions[resolution] || resolutions.listen;
        
        // Apply compensation if offered
        if (compensation) {
            // This would integrate with the checkout system for discounts/refunds
            resolutionData.satisfaction += 5;
            resolutionData.relationship += 2;
        }
        
        // Apply resolution impact
        this.npcSystem.updateRelationship(
            this.currentCustomer.id,
            resolutionData.relationship,
            `Complaint resolution: ${resolution}`
        );
        
        // Update service metrics
        if (resolution !== 'dismiss') {
            this.serviceMetrics.complaintsResolved++;
        }
        
        // Continue conversation with resolution
        this.conversationSystem.handleComplaint({
            npc: this.currentCustomer,
            complaint: `Resolution: ${resolution}`,
            severity: compensation ? 1 : 2
        });
        
        this.eventBus.emit('customerService.complaintResolved', {
            customer: this.currentCustomer,
            resolution: resolution,
            compensation: compensation,
            impact: resolutionData
        });
        
        console.log(`🤝 Resolved complaint for ${this.currentCustomer.name} (${resolution})`);
    }

    ignoreCustomer() {
        if (!this.currentCustomer) return;
        
        // Negative impact for ignoring customer
        this.npcSystem.updateRelationship(
            this.currentCustomer.id,
            -5,
            'Customer ignored'
        );
        
        // Force customer to leave unhappy
        setTimeout(() => {
            this.eventBus.emit('encounter.customerAction', {
                npc: this.currentCustomer,
                action: 'leave_unhappy'
            });
        }, 5000);
        
        this.eventBus.emit('customerService.customerIgnored', {
            customer: this.currentCustomer
        });
        
        console.log(`🤝 Ignored customer: ${this.currentCustomer.name}`);
    }

    // Event Handlers
    handleCustomerAction(data) {
        const { npc, action } = data;
        
        switch (action) {
            case 'browse':
                this.handleBrowsing(npc);
                break;
            case 'ask_question':
                this.serviceMode = 'conversation';
                break;
            case 'ready_to_buy':
                this.handlePurchaseReadiness(npc);
                break;
            case 'complain':
                this.serviceMode = 'resolving_complaint';
                break;
        }
    }

    handleBrowsing(npc) {
        // Customer is browsing - opportunity for proactive service
        this.eventBus.emit('customerService.browsingOpportunity', {
            customer: npc,
            suggestedActions: [
                { action: 'offer_help', text: 'Offer assistance', priority: 'medium' },
                { action: 'give_space', text: 'Give them space', priority: 'low' },
                { action: 'make_recommendation', text: 'Make recommendation', priority: 'high' }
            ]
        });
    }

    handlePurchaseReadiness(npc) {
        // Customer is ready to buy - start checkout or continue conversation
        this.eventBus.emit('customerService.purchaseReady', {
            customer: npc,
            suggestedActions: [
                { action: 'start_checkout', text: 'Start checkout', priority: 'high' },
                { action: 'suggest_additions', text: 'Suggest additional items', priority: 'medium' },
                { action: 'offer_deals', text: 'Offer deals/discounts', priority: 'medium' }
            ]
        });
    }

    handleCustomerQuestion(data) {
        const { npc, question } = data;
        
        // Opportunity to demonstrate knowledge and helpfulness
        this.eventBus.emit('customerService.questionOpportunity', {
            customer: npc,
            question: question,
            suggestedResponses: this.generateQuestionResponses(question, npc)
        });
    }

    handleCustomerComplaint(data) {
        const { npc, complaint, severity } = data;
        
        this.serviceMode = 'resolving_complaint';
        
        this.eventBus.emit('customerService.complaintReceived', {
            customer: npc,
            complaint: complaint,
            severity: severity,
            suggestedResolutions: this.generateComplaintResolutions(complaint, severity, npc)
        });
    }

    handlePurchaseIntent(data) {
        const { npc, items, totalValue } = data;
        
        // Automatic checkout start or give player options
        this.eventBus.emit('customerService.purchaseIntentDetected', {
            customer: npc,
            intendedItems: items,
            estimatedValue: totalValue,
            suggestedActions: [
                { action: 'start_checkout', text: 'Process purchase', priority: 'high' },
                { action: 'suggest_upsell', text: 'Suggest additional items', priority: 'medium' },
                { action: 'offer_deal', text: 'Offer bundle deal', priority: 'medium' }
            ]
        });
    }

    handleConversationEnd(data) {
        const { conversation, reason, finalSatisfaction } = data;
        
        if (reason === 'successful_sale') {
            this.serviceMode = 'checkout';
        } else {
            this.serviceMode = 'idle';
        }
        
        // Update service metrics
        this.updateServiceMetrics(finalSatisfaction);
    }

    handleCheckoutComplete(data) {
        const { transaction, satisfaction } = data;
        
        this.serviceMode = 'idle';
        
        // Update service metrics
        this.serviceMetrics.customersServed++;
        this.serviceMetrics.totalSales += transaction.total;
        this.updateServiceMetrics(satisfaction);
        
        console.log(`🤝 Service completed for ${transaction.npc.name} - Satisfaction: ${satisfaction}`);
    }

    handleCheckoutCancel(data) {
        this.serviceMode = 'conversation';
        
        // Return to conversation or handle disappointed customer
        if (this.currentCustomer) {
            this.conversationSystem.startConversation({
                npc: this.currentCustomer,
                scenario: 'purchase_cancelled',
                context: { reason: 'checkout_cancelled' }
            });
        }
    }

    handleCustomerExit(data) {
        const { npc, reason } = data;
        
        this.serviceMode = 'idle';
        this.currentCustomer = null;
        
        // Clear any timers
        if (this.autoGreetingTimer) {
            clearTimeout(this.autoGreetingTimer);
            this.autoGreetingTimer = null;
        }
        
        console.log(`🤝 Customer service ended: ${npc.name} (${reason})`);
    }

    // Response Generation
    generateQuestionResponses(question, npc) {
        const responses = [
            {
                type: 'helpful',
                text: 'Provide detailed helpful answer',
                impact: { relationship: 2, satisfaction: 4 }
            },
            {
                type: 'quick',
                text: 'Give quick direct answer',
                impact: { relationship: 1, satisfaction: 2 }
            },
            {
                type: 'personal',
                text: 'Give personalized recommendation',
                impact: { relationship: 3, satisfaction: 5 },
                requiresRelationship: 20
            }
        ];
        
        return responses.filter(r => !r.requiresRelationship || npc.relationship >= r.requiresRelationship);
    }

    generateComplaintResolutions(complaint, severity, npc) {
        const resolutions = [
            {
                type: 'listen',
                text: 'Listen and acknowledge their concern',
                cost: 0,
                impact: { relationship: 2, satisfaction: 5 }
            },
            {
                type: 'apologize',
                text: 'Offer sincere apology',
                cost: 0,
                impact: { relationship: 3, satisfaction: 8 }
            },
            {
                type: 'discount',
                text: 'Offer 10% discount on next purchase',
                cost: 'future_revenue',
                impact: { relationship: 4, satisfaction: 10 }
            },
            {
                type: 'refund',
                text: 'Offer partial refund or store credit',
                cost: 'immediate',
                impact: { relationship: 5, satisfaction: 15 }
            }
        ];
        
        // More options available for higher relationship levels
        if (npc.relationshipLevel === 'friend' || npc.relationshipLevel === 'vip') {
            resolutions.push({
                type: 'special',
                text: 'Offer special personal solution',
                cost: 'moderate',
                impact: { relationship: 6, satisfaction: 20 }
            });
        }
        
        return resolutions;
    }

    // Metrics and Analytics
    updateServiceMetrics(satisfaction) {
        const metrics = this.serviceMetrics;
        
        // Update average satisfaction (rolling average)
        if (metrics.customersServed === 0) {
            metrics.averageSatisfaction = satisfaction;
        } else {
            metrics.averageSatisfaction = (
                (metrics.averageSatisfaction * metrics.customersServed + satisfaction) / 
                (metrics.customersServed + 1)
            );
        }
    }

    getServiceMetrics() {
        return {
            ...this.serviceMetrics,
            currentCustomer: this.currentCustomer?.name || null,
            serviceMode: this.serviceMode,
            dailyStats: this.getDailyServiceStats()
        };
    }

    getDailyServiceStats() {
        const today = this.gameState.data.time.currentDay;
        const todayTransactions = this.gameState.data.finances.transactions.filter(
            txn => Math.floor((Date.now() - txn.timestamp) / (1000 * 60 * 60 * 24)) === 0
        );
        
        return {
            customersToday: todayTransactions.length,
            salesToday: todayTransactions.reduce((sum, txn) => sum + txn.amount, 0),
            avgSatisfactionToday: todayTransactions.length > 0 ? 
                todayTransactions.reduce((sum, txn) => sum + (txn.satisfaction || 50), 0) / todayTransactions.length : 0
        };
    }

    // Public Interface
    getCurrentCustomer() {
        return this.currentCustomer;
    }

    getServiceMode() {
        return this.serviceMode;
    }

    isServingCustomer() {
        return this.currentCustomer !== null;
    }

    canStartCheckout() {
        return this.currentCustomer && !this.checkoutSystem.isCheckoutActive();
    }

    getAvailableActions() {
        if (!this.currentCustomer) return [];
        
        const actions = [];
        
        switch (this.serviceMode) {
            case 'greeting':
                actions.push('greet', 'offer_help', 'ignore');
                break;
            case 'conversation':
                actions.push('help', 'start_checkout', 'continue_conversation');
                break;
            case 'checkout':
                actions.push('process_payment', 'add_items', 'apply_discount');
                break;
            case 'resolving_complaint':
                actions.push('apologize', 'compensate', 'explain', 'dismiss');
                break;
        }
        
        return actions;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomerServiceSystem;
} else if (typeof window !== 'undefined') {
    window.CustomerServiceSystem = CustomerServiceSystem;
}
