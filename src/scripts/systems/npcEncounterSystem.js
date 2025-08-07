/**
 * Simple NPC Encounter System
 * Manages basic customer entry, greeting, and interaction flows
 */

class NPCEncounterSystem {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.npcSystem = null;
        this.currentCustomer = null;
        this.isEncounterActive = false;
        this.encounterTimeout = null;
    }

    initialize(gameState, eventBus, npcSystem) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        this.npcSystem = npcSystem;
        
        // Listen for events
        this.eventBus.on('store.openForBusiness', () => this.startDailyEncounters());
        this.eventBus.on('store.customerRequest', () => this.processNextCustomer());
        this.eventBus.on('time.hourChanged', () => this.checkForCustomers());
        this.eventBus.on('customer.greet', (data) => this.handleGreeting(data));
        this.eventBus.on('customer.interact', (data) => this.handleInteraction(data));
        this.eventBus.on('customer.leave', (data) => this.handleCustomerLeaving(data));
        
        console.log('🤝 NPC Encounter System initialized');
    }

    startDailyEncounters() {
        // Reset daily state
        this.currentCustomer = null;
        this.isEncounterActive = false;
        
        console.log('🤝 Daily encounters started');
        this.eventBus.emit('encounter.dailyStarted');
    }

    checkForCustomers() {
        // Don't spawn customers if one is already active or store is closed
        if (this.isEncounterActive || !this.gameState.data.store.isOpen) {
            return;
        }

        const hour = this.gameState.data.time.currentHour;
        
        // Customer arrival probability based on time of day
        let arrivalChance = this.getArrivalProbability(hour);
        
        // Modify based on store factors
        arrivalChance *= this.getStoreFactorMultiplier();
        
        if (Math.random() < arrivalChance) {
            this.processNextCustomer();
        }
    }

    getArrivalProbability(hour) {
        // Realistic customer traffic patterns
        const patterns = {
            6: 0.1,   // Early morning
            7: 0.15,
            8: 0.25,  // Morning rush
            9: 0.2,
            10: 0.15,
            11: 0.2,
            12: 0.35, // Lunch rush
            13: 0.3,
            14: 0.2,
            15: 0.15,
            16: 0.2,
            17: 0.35, // Evening rush
            18: 0.4,
            19: 0.25,
            20: 0.15,
            21: 0.1,
            22: 0.05  // Late evening
        };
        
        return patterns[hour] || 0.05;
    }

    getStoreFactorMultiplier() {
        let multiplier = 1.0;
        
        // Store type affects traffic
        const storeType = this.gameState.data.store.type;
        if (storeType === 'convenience') multiplier *= 1.3;
        if (storeType === 'boutique') multiplier *= 0.7;
        if (storeType === 'electronics') multiplier *= 0.8;
        
        // Environment affects traffic
        const environment = this.gameState.data.store.environment;
        if (environment === 'city') multiplier *= 1.2;
        if (environment === 'rural') multiplier *= 0.6;
        
        // Store reputation affects traffic (placeholder)
        // multiplier *= (this.gameState.data.store.reputation / 50);
        
        return Math.max(0.1, multiplier);
    }

    processNextCustomer() {
        if (this.isEncounterActive) return;
        
        const nextCustomer = this.npcSystem.getNextCustomer();
        if (!nextCustomer) {
            console.log('🤝 No more customers available today');
            return;
        }
        
        this.startEncounter(nextCustomer);
    }

    startEncounter(npc) {
        this.currentCustomer = npc;
        this.isEncounterActive = true;
        
        console.log(`🤝 Customer entered: ${npc.name} (${npc.archetype})`);
        
        // Determine customer behavior
        const behavior = this.determineCustomerBehavior(npc);
        
        // Set encounter timeout (customers won't wait forever)
        const maxWaitTime = this.getCustomerPatience(npc) * 1000; // Convert to milliseconds
        this.encounterTimeout = setTimeout(() => {
            this.handleCustomerTimeout();
        }, maxWaitTime);
        
        // Notify UI
        this.eventBus.emit('encounter.customerEntered', {
            npc: npc,
            behavior: behavior,
            estimatedWaitTime: maxWaitTime
        });
        
        // Auto-trigger greeting after a short delay
        setTimeout(() => {
            if (this.isEncounterActive && this.currentCustomer === npc) {
                this.triggerCustomerAction('browse');
            }
        }, 2000);
    }

    determineCustomerBehavior(npc) {
        const archetype = npc.archetype;
        const mood = npc.mood;
        const relationship = npc.relationshipLevel;
        
        let behavior = {
            action: 'browse', // browse, immediate_purchase, ask_question, complain
            mood: mood,
            patience: npc.patience,
            interestedProducts: [],
            needsHelp: false,
            rushingToDeparture: false
        };
        
        // Modify behavior based on archetype
        if (archetype === 'business_executive') {
            behavior.action = 'immediate_purchase';
            behavior.patience *= 0.5;
        } else if (archetype === 'college_student') {
            behavior.needsHelp = Math.random() < 0.3;
        } else if (archetype === 'retiree') {
            behavior.patience *= 1.5;
            behavior.needsHelp = Math.random() < 0.4;
        }
        
        // Modify based on relationship
        if (relationship !== 'stranger') {
            behavior.patience *= 1.2;
            if (relationship === 'friend' || relationship === 'vip') {
                behavior.needsHelp = Math.random() < 0.6; // More likely to engage
            }
        }
        
        // Determine interested products based on NPC interests
        behavior.interestedProducts = npc.interests.slice(0, 2 + Math.floor(Math.random() * 2));
        
        return behavior;
    }

    getCustomerPatience(npc) {
        let basePatience = npc.patience; // 1-100
        
        // Convert to seconds (30-120 seconds base)
        let waitTime = 30 + (basePatience / 100) * 90;
        
        // Modify by mood
        if (npc.mood === 'irritated') waitTime *= 0.6;
        if (npc.mood === 'happy') waitTime *= 1.3;
        if (npc.mood === 'stressed') waitTime *= 0.7;
        
        // Modify by archetype
        const archetype = npc.archetype;
        if (archetype === 'business_executive') waitTime *= 0.5;
        if (archetype === 'retiree') waitTime *= 1.5;
        if (archetype === 'young_professional') waitTime *= 0.8;
        
        return Math.max(15, Math.floor(waitTime)); // Minimum 15 seconds
    }

    triggerCustomerAction(action) {
        if (!this.currentCustomer || !this.isEncounterActive) return;
        
        const actionData = {
            npc: this.currentCustomer,
            action: action,
            timestamp: Date.now()
        };
        
        switch (action) {
            case 'browse':
                this.handleBrowsing(actionData);
                break;
            case 'ask_question':
                this.handleQuestion(actionData);
                break;
            case 'ready_to_buy':
                this.handlePurchaseIntent(actionData);
                break;
            case 'complain':
                this.handleComplaint(actionData);
                break;
            case 'leave_happy':
                this.endEncounter('satisfied');
                break;
            case 'leave_unhappy':
                this.endEncounter('dissatisfied');
                break;
        }
        
        this.eventBus.emit('encounter.customerAction', actionData);
    }

    handleBrowsing(actionData) {
        const npc = actionData.npc;
        const browseTime = 5000 + Math.random() * 10000; // 5-15 seconds
        
        this.eventBus.emit('encounter.customerBrowsing', {
            npc: npc,
            duration: browseTime,
            interestedItems: npc.interests
        });
        
        // After browsing, decide next action
        setTimeout(() => {
            if (this.currentCustomer === npc && this.isEncounterActive) {
                const nextAction = this.decideBrowsingOutcome(npc);
                this.triggerCustomerAction(nextAction);
            }
        }, browseTime);
    }

    decideBrowsingOutcome(npc) {
        const random = Math.random();
        const relationship = npc.relationshipLevel;
        
        // Higher relationship = more likely to buy or ask for help
        let buyChance = 0.4;
        let questionChance = 0.2;
        
        if (relationship === 'regular') {
            buyChance = 0.6;
            questionChance = 0.3;
        } else if (relationship === 'friend') {
            buyChance = 0.7;
            questionChance = 0.4;
        } else if (relationship === 'vip') {
            buyChance = 0.8;
            questionChance = 0.5;
        }
        
        if (random < buyChance) {
            return 'ready_to_buy';
        } else if (random < buyChance + questionChance) {
            return 'ask_question';
        } else if (random < 0.9) {
            return 'leave_unhappy'; // Didn't find what they wanted
        } else {
            return 'complain'; // Something's wrong
        }
    }

    handleQuestion(actionData) {
        const npc = actionData.npc;
        
        // Generate a question based on their interests and archetype
        const question = this.generateCustomerQuestion(npc);
        
        this.eventBus.emit('encounter.customerQuestion', {
            npc: npc,
            question: question,
            requiresResponse: true
        });
        
        // Wait for player response or timeout
        this.awaitPlayerResponse('question', 30000); // 30 seconds to respond
    }

    generateCustomerQuestion(npc) {
        const questions = {
            general: [
                "Excuse me, do you have any recommendations?",
                "Hi, I'm looking for something specific. Can you help?",
                "Is this item on sale?",
                "Do you have this in a different size/color?"
            ],
            college_student: [
                "Do you offer any student discounts?",
                "What's the cheapest option you have?",
                "Is this product any good for the price?"
            ],
            business_executive: [
                "I need this quickly, can you help me find it?",
                "Do you have anything premium quality?",
                "Can someone assist me immediately?"
            ],
            retiree: [
                "Can you explain how this product works?",
                "Do you remember me? I was here last week.",
                "Is this a good brand? I've never heard of it."
            ]
        };
        
        const archetypeQuestions = questions[npc.archetype] || questions.general;
        return archetypeQuestions[Math.floor(Math.random() * archetypeQuestions.length)];
    }

    handlePurchaseIntent(actionData) {
        const npc = actionData.npc;
        
        // Determine what they want to buy
        const intendedPurchase = this.determineIntendedPurchase(npc);
        
        this.eventBus.emit('encounter.purchaseIntent', {
            npc: npc,
            items: intendedPurchase,
            totalValue: intendedPurchase.reduce((sum, item) => sum + item.price, 0)
        });
        
        // Wait for checkout process
        this.awaitPlayerResponse('checkout', 60000); // 1 minute for checkout
    }

    determineIntendedPurchase(npc) {
        // Simplified - in full system this would check actual inventory
        const items = [];
        const itemCount = 1 + Math.floor(Math.random() * 3); // 1-3 items
        
        for (let i = 0; i < itemCount; i++) {
            const interest = npc.interests[Math.floor(Math.random() * npc.interests.length)];
            items.push({
                name: `${interest} item`,
                category: interest,
                price: Math.floor(Math.random() * npc.spendingPower * 0.3) + 5
            });
        }
        
        return items;
    }

    handleComplaint(actionData) {
        const npc = actionData.npc;
        
        const complaint = this.generateComplaint(npc);
        
        this.eventBus.emit('encounter.customerComplaint', {
            npc: npc,
            complaint: complaint,
            severity: Math.floor(Math.random() * 3) + 1, // 1-3
            requiresResponse: true
        });
        
        this.awaitPlayerResponse('complaint', 45000); // 45 seconds to resolve
    }

    generateComplaint(npc) {
        const complaints = [
            "The prices here are too high!",
            "I can't find what I'm looking for.",
            "The store seems disorganized.",
            "I've been waiting too long for service.",
            "This product looks expired/damaged."
        ];
        
        return complaints[Math.floor(Math.random() * complaints.length)];
    }

    awaitPlayerResponse(type, timeout) {
        this.responseTimeout = setTimeout(() => {
            this.handleResponseTimeout(type);
        }, timeout);
    }

    handleResponseTimeout(type) {
        if (!this.currentCustomer || !this.isEncounterActive) return;
        
        console.log(`🤝 Player response timeout for ${type}`);
        
        // Negative relationship impact for ignored customers
        this.npcSystem.updateRelationship(
            this.currentCustomer.id, 
            -5, 
            `Ignored ${type}`
        );
        
        this.endEncounter('ignored');
    }

    handleGreeting(data) {
        if (!this.currentCustomer) return;
        
        const greetingQuality = data.quality || 'neutral'; // friendly, neutral, rude
        let relationshipChange = 0;
        
        switch (greetingQuality) {
            case 'friendly':
                relationshipChange = 2;
                break;
            case 'professional':
                relationshipChange = 1;
                break;
            case 'neutral':
                relationshipChange = 0;
                break;
            case 'rude':
                relationshipChange = -3;
                break;
        }
        
        if (relationshipChange !== 0) {
            this.npcSystem.updateRelationship(
                this.currentCustomer.id,
                relationshipChange,
                `Greeting: ${greetingQuality}`
            );
        }
        
        this.eventBus.emit('encounter.greetingProcessed', {
            npc: this.currentCustomer,
            quality: greetingQuality,
            relationshipChange: relationshipChange
        });
    }

    handleInteraction(data) {
        if (!this.currentCustomer) return;
        
        const interactionType = data.type; // help, sale, conversation, etc.
        const quality = data.quality || 'adequate';
        
        let relationshipChange = 0;
        let satisfactionChange = 0;
        
        // Process interaction based on type and quality
        switch (interactionType) {
            case 'help':
                relationshipChange = quality === 'excellent' ? 3 : quality === 'good' ? 1 : 0;
                break;
            case 'sale':
                relationshipChange = quality === 'excellent' ? 2 : quality === 'pressured' ? -1 : 0;
                break;
            case 'conversation':
                relationshipChange = quality === 'engaging' ? 2 : quality === 'boring' ? -1 : 0;
                break;
        }
        
        if (relationshipChange !== 0) {
            this.npcSystem.updateRelationship(
                this.currentCustomer.id,
                relationshipChange,
                `${interactionType}: ${quality}`
            );
        }
        
        this.eventBus.emit('encounter.interactionProcessed', {
            npc: this.currentCustomer,
            type: interactionType,
            quality: quality,
            relationshipChange: relationshipChange
        });
    }

    handleCustomerLeaving(data) {
        const reason = data.reason || 'completed';
        this.endEncounter(reason);
    }

    handleCustomerTimeout() {
        console.log(`🤝 Customer ${this.currentCustomer?.name} left due to timeout`);
        this.endEncounter('timeout');
    }

    endEncounter(reason) {
        if (!this.currentCustomer || !this.isEncounterActive) return;
        
        const npc = this.currentCustomer;
        
        // Clear timeouts
        if (this.encounterTimeout) {
            clearTimeout(this.encounterTimeout);
            this.encounterTimeout = null;
        }
        if (this.responseTimeout) {
            clearTimeout(this.responseTimeout);
            this.responseTimeout = null;
        }
        
        // Apply final relationship changes based on reason
        let finalRelationshipChange = 0;
        switch (reason) {
            case 'satisfied':
                finalRelationshipChange = 3;
                break;
            case 'completed':
                finalRelationshipChange = 1;
                break;
            case 'dissatisfied':
                finalRelationshipChange = -2;
                break;
            case 'timeout':
            case 'ignored':
                finalRelationshipChange = -5;
                break;
        }
        
        if (finalRelationshipChange !== 0) {
            this.npcSystem.updateRelationship(
                npc.id,
                finalRelationshipChange,
                `Encounter ended: ${reason}`
            );
        }
        
        // Record encounter
        this.npcSystem.handleEncounter(npc.id);
        
        console.log(`🤝 Encounter ended: ${npc.name} (${reason})`);
        
        this.eventBus.emit('encounter.ended', {
            npc: npc,
            reason: reason,
            duration: Date.now() - npc.lastInteraction,
            relationshipChange: finalRelationshipChange
        });
        
        // Reset state
        this.currentCustomer = null;
        this.isEncounterActive = false;
        
        // Schedule next customer
        const nextCustomerDelay = 10000 + Math.random() * 20000; // 10-30 seconds
        setTimeout(() => {
            if (this.gameState.data.store.isOpen && !this.isEncounterActive) {
                const shouldSpawnNext = Math.random() < 0.4; // 40% chance
                if (shouldSpawnNext) {
                    this.processNextCustomer();
                }
            }
        }, nextCustomerDelay);
    }

    // Public interface methods
    getCurrentCustomer() {
        return this.currentCustomer;
    }

    isCustomerPresent() {
        return this.isEncounterActive && this.currentCustomer !== null;
    }

    greetCustomer(quality = 'neutral') {
        this.handleGreeting({ quality });
    }

    helpCustomer(quality = 'good') {
        this.handleInteraction({ type: 'help', quality });
    }

    processCheckout(items, quality = 'professional') {
        if (!this.currentCustomer) return false;
        
        // Process the sale
        const totalValue = items.reduce((sum, item) => sum + item.price, 0);
        this.currentCustomer.totalSpent += totalValue;
        
        this.handleInteraction({ type: 'sale', quality });
        
        // End encounter successfully
        this.endEncounter('satisfied');
        
        return true;
    }

    dismissCustomer() {
        if (this.currentCustomer) {
            this.endEncounter('dismissed');
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPCEncounterSystem;
} else if (typeof window !== 'undefined') {
    window.NPCEncounterSystem = NPCEncounterSystem;
}
