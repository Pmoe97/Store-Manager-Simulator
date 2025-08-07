/**
 * AI Content Manager - Phase 4C Integration
 * Coordinates all AI content generation systems
 * Manages dialogue, events, and dynamic content creation
 */

class AIContentManager {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.aiHooks = null;
        
        // Phase 4A: NPC AI Enhancement
        this.npcAIEnhancer = null;
        
        // Phase 4B: Product AI Generation
        this.productAIGenerator = null;
        
        // Phase 4C: Dialogue & Event AI
        this.dialogueAI = null;
        this.eventAI = null;
        this.eventSystem = null;
        
        // Content coordination
        this.contentQueue = [];
        this.isGenerating = false;
        this.lastGenerationTime = new Map();
        this.generationCooldowns = new Map();
        this.contentMetrics = {
            dialogueGenerated: 0,
            eventsGenerated: 0,
            npcEnhanced: 0,
            productsGenerated: 0
        };
    }

    async initialize(gameState, eventBus, aiHooks, systems = {}) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        this.aiHooks = aiHooks;
        
        console.log('🤖 Initializing AI Content Manager...');
        
        // Initialize all AI systems
        await this.initializeAISystems(systems);
        
        // Setup content coordination
        this.setupContentCoordination();
        
        // Setup generation cooldowns
        this.setupGenerationCooldowns();
        
        // Start content management
        this.startContentManagement();
        
        console.log('✅ AI Content Manager initialized successfully');
        console.log('📊 Available AI systems:', this.getAvailableSystems());
    }

    async initializeAISystems(systems) {
        try {
            // Phase 4A: NPC AI Enhancement
            if (systems.npcAIEnhancer) {
                this.npcAIEnhancer = systems.npcAIEnhancer;
                console.log('✅ NPC AI Enhancer connected');
            }
            
            // Phase 4B: Product AI Generation
            if (systems.productAIGenerator) {
                this.productAIGenerator = systems.productAIGenerator;
                console.log('✅ Product AI Generator connected');
            }
            
            // Phase 4C: Dialogue AI Generator
            if (typeof DialogueAIGenerator !== 'undefined') {
                this.dialogueAI = new DialogueAIGenerator();
                await this.dialogueAI.initialize(
                    this.gameState, 
                    this.aiHooks, 
                    systems.npcSystem, 
                    systems.conversationSystem
                );
                console.log('✅ Dialogue AI Generator initialized');
            }
            
            // Phase 4C: Event AI Generator
            if (typeof EventAIGenerator !== 'undefined') {
                this.eventAI = new EventAIGenerator();
                await this.eventAI.initialize(
                    this.gameState,
                    this.aiHooks,
                    systems.timeSystem,
                    systems.npcSystem
                );
                console.log('✅ Event AI Generator initialized');
            }
            
            // Phase 4C: Event System
            if (typeof EventSystem !== 'undefined') {
                this.eventSystem = new EventSystem();
                await this.eventSystem.initialize(
                    this.gameState,
                    this.eventBus,
                    this.eventAI,
                    systems.timeSystem
                );
                console.log('✅ Event System initialized');
            }
            
        } catch (error) {
            console.error('❌ Error initializing AI systems:', error);
        }
    }

    setupContentCoordination() {
        // Listen for content generation requests
        this.eventBus.on('ai.generateDialogue', (data) => this.requestDialogueGeneration(data));
        this.eventBus.on('ai.generateEvent', (data) => this.requestEventGeneration(data));
        this.eventBus.on('ai.enhanceNPC', (data) => this.requestNPCEnhancement(data));
        this.eventBus.on('ai.generateProduct', (data) => this.requestProductGeneration(data));
        
        // Listen for content generation completion
        this.eventBus.on('ai.dialogueComplete', (data) => this.handleDialogueComplete(data));
        this.eventBus.on('ai.eventComplete', (data) => this.handleEventComplete(data));
        
        // Listen for game state changes that might trigger content generation
        this.eventBus.on('customer.enter', (customer) => this.handleCustomerEnter(customer));
        this.eventBus.on('conversation.start', (data) => this.handleConversationStart(data));
        this.eventBus.on('time.newHour', () => this.checkHourlyContent());
        this.eventBus.on('time.newDay', () => this.checkDailyContent());
        
        console.log('🔗 Content coordination setup complete');
    }

    setupGenerationCooldowns() {
        // Set cooldowns to prevent over-generation
        this.generationCooldowns.set('dialogue', 1000); // 1 second
        this.generationCooldowns.set('event', 30000); // 30 seconds
        this.generationCooldowns.set('npc_enhancement', 10000); // 10 seconds
        this.generationCooldowns.set('product', 5000); // 5 seconds
        
        console.log('⏰ Generation cooldowns configured');
    }

    // Content generation request handlers
    async requestDialogueGeneration(data) {
        if (!this.dialogueAI || !this.canGenerate('dialogue')) {
            return null;
        }
        
        try {
            console.log('💬 Generating dialogue for scenario:', data.scenario);
            
            const dialogue = await this.dialogueAI.generateDialogue(data.scenario, data.context);
            
            this.updateGenerationTime('dialogue');
            this.contentMetrics.dialogueGenerated++;
            
            this.eventBus.emit('ai.dialogueComplete', {
                scenario: data.scenario,
                dialogue: dialogue,
                requestId: data.requestId
            });
            
            return dialogue;
            
        } catch (error) {
            console.error('❌ Dialogue generation failed:', error);
            return null;
        }
    }

    async requestEventGeneration(data) {
        if (!this.eventAI || !this.canGenerate('event')) {
            return null;
        }
        
        try {
            console.log('🎭 Generating event of type:', data.eventType);
            
            const event = await this.eventAI.generateEvent(data.eventType, data.context);
            
            this.updateGenerationTime('event');
            this.contentMetrics.eventsGenerated++;
            
            this.eventBus.emit('ai.eventComplete', {
                eventType: data.eventType,
                event: event,
                requestId: data.requestId
            });
            
            return event;
            
        } catch (error) {
            console.error('❌ Event generation failed:', error);
            return null;
        }
    }

    async requestNPCEnhancement(data) {
        if (!this.npcAIEnhancer || !this.canGenerate('npc_enhancement')) {
            return null;
        }
        
        try {
            console.log('👤 Enhancing NPC:', data.npc.name);
            
            const enhancement = await this.npcAIEnhancer.enhanceNPC(data.npc, data.context);
            
            this.updateGenerationTime('npc_enhancement');
            this.contentMetrics.npcEnhanced++;
            
            this.eventBus.emit('ai.npcEnhanced', {
                npc: data.npc,
                enhancement: enhancement,
                requestId: data.requestId
            });
            
            return enhancement;
            
        } catch (error) {
            console.error('❌ NPC enhancement failed:', error);
            return null;
        }
    }

    async requestProductGeneration(data) {
        if (!this.productAIGenerator || !this.canGenerate('product')) {
            return null;
        }
        
        try {
            console.log('📦 Generating product for category:', data.category);
            
            const product = await this.productAIGenerator.generateProduct(data.category, data.context);
            
            this.updateGenerationTime('product');
            this.contentMetrics.productsGenerated++;
            
            this.eventBus.emit('ai.productGenerated', {
                category: data.category,
                product: product,
                requestId: data.requestId
            });
            
            return product;
            
        } catch (error) {
            console.error('❌ Product generation failed:', error);
            return null;
        }
    }

    // Game event handlers that trigger AI content
    async handleCustomerEnter(customer) {
        // Enhance NPC if not already enhanced
        if (!customer.enhanced && this.npcAIEnhancer) {
            await this.requestNPCEnhancement({
                npc: customer,
                context: { trigger: 'customer_enter' }
            });
        }
        
        // Generate potential dialogue scenarios
        if (this.dialogueAI && Math.random() < 0.3) {
            this.queueDialogueGeneration({
                scenario: 'greeting',
                context: { npc: customer, preGenerate: true }
            });
        }
    }

    async handleConversationStart(data) {
        // Pre-generate some dialogue options for common scenarios
        if (this.dialogueAI) {
            const scenarios = ['response', 'small_talk', 'product_inquiry'];
            
            scenarios.forEach(scenario => {
                this.queueDialogueGeneration({
                    scenario: scenario,
                    context: { 
                        npc: data.npc, 
                        preGenerate: true,
                        conversation: data.conversation 
                    }
                });
            });
        }
    }

    async checkHourlyContent() {
        // Generate random events periodically
        if (this.eventAI && Math.random() < 0.2) { // 20% chance per hour
            const eventTypes = ['businessEvent', 'localNews', 'customerIncident'];
            const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            
            await this.requestEventGeneration({
                eventType: randomType,
                context: { trigger: 'hourly_check' }
            });
        }
    }

    async checkDailyContent() {
        // Generate daily news and events
        if (this.eventAI) {
            await this.requestEventGeneration({
                eventType: 'localNews',
                context: { 
                    trigger: 'daily_news',
                    scope: 'daily'
                }
            });
        }
    }

    // Content queue management
    queueDialogueGeneration(request) {
        this.contentQueue.push({
            type: 'dialogue',
            request: request,
            priority: request.priority || 'normal',
            timestamp: Date.now()
        });
        
        this.processContentQueue();
    }

    queueEventGeneration(request) {
        this.contentQueue.push({
            type: 'event',
            request: request,
            priority: request.priority || 'normal',
            timestamp: Date.now()
        });
        
        this.processContentQueue();
    }

    async processContentQueue() {
        if (this.isGenerating || this.contentQueue.length === 0) {
            return;
        }
        
        this.isGenerating = true;
        
        try {
            // Sort by priority and timestamp
            this.contentQueue.sort((a, b) => {
                const priorityOrder = { high: 3, normal: 2, low: 1 };
                const priorityDiff = (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
                
                if (priorityDiff !== 0) return priorityDiff;
                return a.timestamp - b.timestamp; // Earlier requests first
            });
            
            const queueItem = this.contentQueue.shift();
            
            // Process the request
            switch (queueItem.type) {
                case 'dialogue':
                    await this.requestDialogueGeneration(queueItem.request);
                    break;
                case 'event':
                    await this.requestEventGeneration(queueItem.request);
                    break;
            }
            
        } catch (error) {
            console.error('❌ Error processing content queue:', error);
        } finally {
            this.isGenerating = false;
            
            // Process next item if queue has more
            if (this.contentQueue.length > 0) {
                setTimeout(() => this.processContentQueue(), 100);
            }
        }
    }

    // Cooldown management
    canGenerate(contentType) {
        const lastTime = this.lastGenerationTime.get(contentType) || 0;
        const cooldown = this.generationCooldowns.get(contentType) || 1000;
        
        return Date.now() - lastTime >= cooldown;
    }

    updateGenerationTime(contentType) {
        this.lastGenerationTime.set(contentType, Date.now());
    }

    // Content management
    startContentManagement() {
        // Process content queue every 2 seconds
        setInterval(() => this.processContentQueue(), 2000);
        
        // Clean up old queue items every minute
        setInterval(() => this.cleanupContentQueue(), 60000);
        
        console.log('🎛️ Content management started');
    }

    cleanupContentQueue() {
        const maxAge = 300000; // 5 minutes
        const now = Date.now();
        
        const beforeLength = this.contentQueue.length;
        this.contentQueue = this.contentQueue.filter(item => 
            now - item.timestamp < maxAge
        );
        
        if (this.contentQueue.length < beforeLength) {
            console.log('🧹 Cleaned up', beforeLength - this.contentQueue.length, 'old queue items');
        }
    }

    // Integration helpers for conversation system
    async enhanceConversationSystem(conversationSystem) {
        if (this.dialogueAI && conversationSystem) {
            // Add AI dialogue generator to conversation system
            conversationSystem.dialogueAI = this.dialogueAI;
            console.log('🔗 Conversation system enhanced with AI dialogue');
        }
    }

    // Integration helpers for NPC system
    async enhanceNPCSystem(npcSystem) {
        if (this.npcAIEnhancer && npcSystem) {
            // Add background enhancement process
            npcSystem.aiEnhancer = this.npcAIEnhancer;
            console.log('🔗 NPC system enhanced with AI enhancement');
        }
    }

    // Public API methods
    async generateContextualDialogue(scenario, npc, context = {}) {
        return await this.requestDialogueGeneration({
            scenario: scenario,
            context: { npc: npc, ...context }
        });
    }

    async generateContextualEvent(eventType, context = {}) {
        return await this.requestEventGeneration({
            eventType: eventType,
            context: context
        });
    }

    async triggerEmergencyEvent(emergencyType, context = {}) {
        if (this.eventSystem) {
            return await this.eventSystem.triggerEmergency(emergencyType, context);
        }
        return null;
    }

    // System status and metrics
    getAvailableSystems() {
        return {
            npcAIEnhancer: !!this.npcAIEnhancer,
            productAIGenerator: !!this.productAIGenerator,
            dialogueAI: !!this.dialogueAI,
            eventAI: !!this.eventAI,
            eventSystem: !!this.eventSystem
        };
    }

    getContentMetrics() {
        return {
            ...this.contentMetrics,
            queueLength: this.contentQueue.length,
            isGenerating: this.isGenerating,
            lastGenerationTimes: Object.fromEntries(this.lastGenerationTime)
        };
    }

    getSystemStatus() {
        return {
            systems: this.getAvailableSystems(),
            metrics: this.getContentMetrics(),
            activeEvents: this.eventSystem?.getActiveEvents()?.length || 0,
            queuedContent: this.contentQueue.length
        };
    }

    // Emergency controls
    pauseContentGeneration() {
        this.isGenerating = true;
        console.log('⏸️ Content generation paused');
    }

    resumeContentGeneration() {
        this.isGenerating = false;
        this.processContentQueue();
        console.log('▶️ Content generation resumed');
    }

    clearContentQueue() {
        this.contentQueue = [];
        console.log('🗑️ Content queue cleared');
    }

    // Debug and testing methods
    async testAllSystems() {
        console.log('🧪 Testing all AI systems...');
        
        const testResults = {};
        
        // Test dialogue generation
        if (this.dialogueAI) {
            try {
                const testNPC = { 
                    name: 'Test Customer', 
                    personality: 'friendly',
                    archetype: 'college_student' 
                };
                const dialogue = await this.dialogueAI.generateGreeting(testNPC);
                testResults.dialogue = dialogue ? 'PASS' : 'FAIL';
            } catch (error) {
                testResults.dialogue = 'ERROR: ' + error.message;
            }
        }
        
        // Test event generation
        if (this.eventAI) {
            try {
                const event = await this.eventAI.generateBusinessEvent();
                testResults.event = event ? 'PASS' : 'FAIL';
            } catch (error) {
                testResults.event = 'ERROR: ' + error.message;
            }
        }
        
        console.log('🧪 Test results:', testResults);
        return testResults;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIContentManager;
} else if (typeof window !== 'undefined') {
    window.AIContentManager = AIContentManager;
}
