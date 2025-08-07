/**
 * Dialogue AI Generator - Phase 4C Implementation
 * Generates real-time contextual dialogue for NPCs and customer interactions
 * Provides dynamic conversation flow and personality-driven responses
 */

class DialogueAIGenerator {
    constructor() {
        this.gameState = null;
        this.aiHooks = null;
        this.npcSystem = null;
        this.conversationSystem = null;
        this.dialogueQueue = [];
        this.contextMemory = new Map();
        this.personalityProfiles = new Map();
        this.isGenerating = false;
        this.maxQueueSize = 10;
        this.cacheExpiry = 30000; // 30 seconds
    }

    initialize(gameState, aiHooks, npcSystem, conversationSystem) {
        this.gameState = gameState;
        this.aiHooks = aiHooks;
        this.npcSystem = npcSystem;
        this.conversationSystem = conversationSystem;
        
        this.loadDialogueTemplates();
        this.setupPersonalityProfiles();
        
        console.log('💬 Dialogue AI Generator initialized');
    }

    // Core dialogue generation templates and prompts
    loadDialogueTemplates() {
        this.dialoguePrompts = {
            // Base conversation starters
            greeting: {
                template: `Generate a natural greeting for a {archetype} customer entering a {storeType} store. 
                Customer context: {customerContext}
                Store atmosphere: {storeAtmosphere}
                Time of day: {timeOfDay}
                Weather: {weather}
                
                Personality traits: {personalityTraits}
                Relationship level with store owner: {relationshipLevel}
                Recent history: {recentHistory}
                
                Generate a single greeting line that feels natural and fits the character. Include body language cues in parentheses if appropriate.
                Keep it under 150 characters.`,
                
                examples: [
                    "nervous college student buying energy drinks",
                    "wealthy business executive needing luxury items",
                    "tired parent with crying child looking for quick solutions"
                ]
            },

            // Customer responses to store owner
            response: {
                template: `Generate a customer response for this conversation:
                
                Customer: {customerName} - {archetype}
                Personality: {personalityTraits}
                Mood: {currentMood}
                Relationship with owner: {relationshipLevel}
                
                Previous dialogue: "{previousDialogue}"
                Store owner said: "{ownerStatement}"
                
                Context: {conversationContext}
                Customer's goal: {customerGoal}
                Budget: {customerBudget}
                Time pressure: {timePressure}
                
                Generate a natural response that:
                1. Fits the customer's personality and mood
                2. Advances the conversation toward their goal
                3. Reflects their relationship with the store owner
                4. Includes realistic speech patterns and emotions
                
                Response should be 1-3 sentences, under 200 characters.`,
                
                examples: [
                    "Friendly response to helpful suggestion",
                    "Frustrated reaction to high prices",
                    "Flirty banter with attractive store owner"
                ]
            },

            // Product inquiries and interest
            productInquiry: {
                template: `Generate a product inquiry for a {archetype} customer.
                
                Customer details:
                - Name: {customerName}
                - Personality: {personalityTraits}
                - Budget range: {budgetRange}
                - Shopping style: {shoppingStyle}
                
                Product category of interest: {productCategory}
                Specific need: {specificNeed}
                Urgency level: {urgencyLevel}
                
                Previous store experience: {storeHistory}
                Current store reputation: {storeReputation}
                
                Generate a natural product inquiry that includes:
                1. What they're looking for
                2. Why they need it
                3. Any specific requirements or preferences
                4. Price sensitivity indicators
                
                Make it sound like real customer speech with personality quirks.
                Length: 1-4 sentences, conversational tone.`,
                
                examples: [
                    "Tech-savvy teenager looking for gaming accessories",
                    "Busy professional needing work supplies",
                    "Bargain hunter searching for deals"
                ]
            },

            // Negotiation and pricing discussions
            negotiation: {
                template: `Generate negotiation dialogue for a customer trying to get a better price.
                
                Customer: {customerName} ({archetype})
                Personality: {personalityTraits}
                Negotiation style: {negotiationStyle}
                
                Product: {productName} - Current price: ${productPrice}
                Customer's perceived value: ${perceivedValue}
                Customer's max budget: ${maxBudget}
                
                Store context:
                - Owner's reputation: {storeReputation}
                - Customer relationship: {relationshipLevel}
                - Store financial pressure: {financialPressure}
                - Competition nearby: {competitionLevel}
                
                Previous negotiation moves: {negotiationHistory}
                
                Generate the customer's next negotiation statement:
                1. Reference the price concern
                2. Use their personality-appropriate tactics
                3. Show willingness to walk away or commitment to buy
                4. Include emotional appeals or logical arguments
                
                Style: Natural speech with personality quirks, 1-3 sentences.`,
                
                examples: [
                    "Aggressive negotiator using pressure tactics",
                    "Charming customer using personal connection",
                    "Budget-conscious buyer explaining financial constraints"
                ]
            },

            // Complaint and problem resolution
            complaint: {
                template: `Generate a customer complaint dialogue.
                
                Customer: {customerName} ({archetype})
                Personality: {personalityTraits}
                Anger level: {angerLevel} (1-10)
                Communication style: {communicationStyle}
                
                Problem details:
                - Issue type: {problemType}
                - Product involved: {productName}
                - What went wrong: {problemDescription}
                - Impact on customer: {impactLevel}
                
                Customer's expectation: {customerExpectation}
                Previous resolution attempts: {resolutionHistory}
                Store's past service: {serviceHistory}
                
                Store context:
                - Current store reputation: {storeReputation}
                - Owner's known personality: {ownerPersonality}
                - Store policy flexibility: {policyFlexibility}
                
                Generate a complaint that:
                1. Clearly states the problem
                2. Expresses appropriate emotion for the situation
                3. Indicates what resolution they want
                4. Reflects their personality and communication style
                
                Include realistic frustration, disappointment, or anger.
                Length: 2-5 sentences with emotional undertones.`,
                
                examples: [
                    "Defective product causing major inconvenience",
                    "Poor service experience with staff",
                    "Pricing discrepancy or billing error"
                ]
            },

            // Flirtation and romantic interest
            flirtation: {
                template: `Generate flirtatious dialogue for a customer interested in the store owner.
                
                Customer: {customerName} ({archetype})
                Personality: {personalityTraits}
                Flirtation style: {flirtationStyle}
                Confidence level: {confidenceLevel}
                
                Relationship progression:
                - Current level: {relationshipLevel}
                - Previous interactions: {interactionHistory}
                - Mutual interest signs: {mutualInterest}
                
                Store context:
                - Privacy level: {privacyLevel}
                - Other customers present: {otherCustomers}
                - Store atmosphere: {storeAtmosphere}
                
                Owner characteristics that attract them: {attractiveTraits}
                Recent conversation topic: {conversationTopic}
                
                Generate flirtatious dialogue that:
                1. Shows romantic/sexual interest appropriately
                2. Builds on previous interactions
                3. Respects the store environment
                4. Fits their personality and confidence level
                5. Advances the relationship naturally
                
                Style: Playful, suggestive, or romantic based on their approach.
                Include compliments, innuendo, or direct interest.
                Length: 1-3 sentences, age-appropriate steaminess.`,
                
                examples: [
                    "Confident customer making direct advances",
                    "Shy admirer dropping subtle hints",
                    "Experienced flirt using charm and wit"
                ]
            },

            // Social and personal conversation
            smallTalk: {
                template: `Generate small talk dialogue for a regular customer.
                
                Customer: {customerName} ({archetype})
                Personality: {personalityTraits}
                Relationship level: {relationshipLevel}
                
                Conversation starters:
                - Recent local events: {localEvents}
                - Weather/season: {weatherContext}
                - Personal updates: {personalUpdates}
                - Store changes: {storeChanges}
                
                Customer's interests: {customerInterests}
                Shared experiences: {sharedExperiences}
                Previous conversation topics: {conversationHistory}
                
                Current customer mood: {customerMood}
                Time available: {timeAvailable}
                Store busyness: {storeBusyness}
                
                Generate natural small talk that:
                1. Builds rapport and relationship
                2. Shares personal or local information
                3. Shows genuine interest in the store owner
                4. Fits their personality and current mood
                5. Can transition to business or continue socially
                
                Topics could include: weather, local news, personal life, 
                store business, mutual acquaintances, hobbies, etc.
                
                Style: Conversational and friendly, 1-4 sentences.`,
                
                examples: [
                    "Chatty neighbor sharing local gossip",
                    "Friendly regular asking about store improvements",
                    "Concerned customer checking on owner's wellbeing"
                ]
            }
        };

        // Response style modifiers
        this.styleModifiers = {
            formal: "Use professional language and proper grammar",
            casual: "Use relaxed, informal speech with contractions",
            energetic: "Show enthusiasm and excitement in the tone",
            tired: "Sound weary or low-energy, maybe distracted",
            rushed: "Speak quickly, use shorter sentences, show time pressure",
            nervous: "Include hesitation, self-correction, and uncertainty",
            confident: "Use assertive language and direct statements",
            playful: "Include humor, jokes, or lighthearted comments",
            serious: "Maintain a somber or focused tone",
            emotional: "Show strong feelings - happiness, sadness, anger, etc."
        };
    }

    // Setup personality-driven dialogue patterns
    setupPersonalityProfiles() {
        this.personalityProfiles.set('friendly', {
            speechPatterns: ['warm greetings', 'lots of please/thank you', 'personal questions'],
            emotionalRange: ['happy', 'excited', 'concerned', 'sympathetic'],
            negotiationStyle: 'collaborative',
            flirtationStyle: 'sweet and genuine',
            complaintStyle: 'disappointed but understanding'
        });

        this.personalityProfiles.set('aggressive', {
            speechPatterns: ['direct statements', 'demands', 'interruptions'],
            emotionalRange: ['angry', 'frustrated', 'impatient', 'demanding'],
            negotiationStyle: 'pressure tactics',
            flirtationStyle: 'bold and forward',
            complaintStyle: 'loud and accusatory'
        });

        this.personalityProfiles.set('shy', {
            speechPatterns: ['soft speech', 'hesitation', 'apologetic'],
            emotionalRange: ['nervous', 'uncertain', 'grateful', 'anxious'],
            negotiationStyle: 'reluctant and indirect',
            flirtationStyle: 'subtle hints and blushing',
            complaintStyle: 'quiet and apologetic'
        });

        this.personalityProfiles.set('confident', {
            speechPatterns: ['clear statements', 'self-assured', 'leadership'],
            emotionalRange: ['assured', 'content', 'amused', 'determined'],
            negotiationStyle: 'strategic and firm',
            flirtationStyle: 'charming and direct',
            complaintStyle: 'firm but professional'
        });

        this.personalityProfiles.set('quirky', {
            speechPatterns: ['unusual phrases', 'pop culture references', 'random tangents'],
            emotionalRange: ['excited', 'curious', 'distracted', 'enthusiastic'],
            negotiationStyle: 'creative and unpredictable',
            flirtationStyle: 'cute and unconventional',
            complaintStyle: 'confused and rambling'
        });

        console.log('🎭 Personality profiles loaded:', this.personalityProfiles.size);
    }

    // Generate contextual dialogue for any scenario
    async generateDialogue(scenario, context) {
        try {
            console.log('💬 Generating dialogue for scenario:', scenario);
            
            // Get the appropriate prompt template
            const promptTemplate = this.dialoguePrompts[scenario];
            if (!promptTemplate) {
                console.warn('⚠️ No prompt template for scenario:', scenario);
                return this.getFallbackDialogue(scenario, context);
            }

            // Build the context for AI generation
            const enrichedContext = await this.buildDialogueContext(context);
            
            // Fill in the prompt template
            const prompt = this.fillPromptTemplate(promptTemplate.template, enrichedContext);
            
            // Generate dialogue using AI
            const generatedDialogue = await this.aiHooks.generateText(prompt, {
                maxLength: 200,
                temperature: 0.8,
                topP: 0.9
            });

            // Post-process and validate the dialogue
            const processedDialogue = this.processGeneratedDialogue(generatedDialogue, context);
            
            // Store in context memory for conversation continuity
            this.updateContextMemory(context.npc.id, processedDialogue, scenario);
            
            return processedDialogue;
            
        } catch (error) {
            console.error('❌ Dialogue generation failed:', error);
            return this.getFallbackDialogue(scenario, context);
        }
    }

    // Build comprehensive context for dialogue generation
    async buildDialogueContext(context) {
        const npc = context.npc;
        const gameState = this.gameState;
        
        // Get NPC personality profile
        const personality = this.personalityProfiles.get(npc.personality) || 
                          this.personalityProfiles.get('friendly');
        
        // Get conversation history
        const conversationHistory = this.getConversationHistory(npc.id);
        
        // Get store context
        const storeContext = this.getStoreContext();
        
        // Get relationship context
        const relationshipContext = this.getRelationshipContext(npc.id);
        
        return {
            // Customer details
            customerName: npc.name,
            archetype: npc.archetype,
            personalityTraits: npc.personalityTraits.join(', '),
            currentMood: npc.currentMood || 'neutral',
            budgetRange: npc.spendingPower,
            shoppingStyle: npc.shoppingStyle || 'normal',
            
            // Conversation context
            conversationContext: context.scenario || 'general_shopping',
            customerGoal: context.goal || 'browse_products',
            previousDialogue: conversationHistory.slice(-3).join(' '),
            ownerStatement: context.ownerStatement || '',
            
            // Store context
            storeType: gameState.store.type,
            storeAtmosphere: storeContext.atmosphere,
            storeReputation: storeContext.reputation,
            storeBusyness: storeContext.busyness,
            
            // Environmental context
            timeOfDay: this.getTimeOfDay(),
            weather: this.getWeather(),
            otherCustomers: storeContext.customerCount,
            privacyLevel: storeContext.privacy,
            
            // Relationship context
            relationshipLevel: relationshipContext.level,
            interactionHistory: relationshipContext.history,
            mutualInterest: relationshipContext.romance,
            recentHistory: relationshipContext.recent,
            
            // Business context
            productCategory: context.productCategory || 'general',
            productName: context.productName || '',
            productPrice: context.productPrice || 0,
            financialPressure: this.getFinancialPressure(),
            
            // Style modifiers
            communicationStyle: personality.speechPatterns[0],
            negotiationStyle: personality.negotiationStyle,
            flirtationStyle: personality.flirtationStyle,
            confidenceLevel: npc.confidence || 'medium',
            angerLevel: context.angerLevel || 1
        };
    }

    // Fill prompt template with context variables
    fillPromptTemplate(template, context) {
        let filledTemplate = template;
        
        for (const [key, value] of Object.entries(context)) {
            const placeholder = `{${key}}`;
            filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), value || 'unknown');
        }
        
        return filledTemplate;
    }

    // Process and clean up generated dialogue
    processGeneratedDialogue(rawDialogue, context) {
        if (!rawDialogue || typeof rawDialogue !== 'string') {
            return this.getFallbackDialogue(context.scenario, context);
        }
        
        // Clean up the dialogue
        let processedDialogue = rawDialogue.trim();
        
        // Remove quotes if AI added them
        if (processedDialogue.startsWith('"') && processedDialogue.endsWith('"')) {
            processedDialogue = processedDialogue.slice(1, -1);
        }
        
        // Remove "Customer:" prefix if AI added it
        processedDialogue = processedDialogue.replace(/^(Customer:|NPC:|Character:)\s*/i, '');
        
        // Ensure appropriate length
        if (processedDialogue.length > 250) {
            processedDialogue = processedDialogue.substring(0, 247) + '...';
        }
        
        // Add personality quirks if missing
        processedDialogue = this.addPersonalityQuirks(processedDialogue, context.npc);
        
        return processedDialogue;
    }

    // Add personality-specific speech patterns
    addPersonalityQuirks(dialogue, npc) {
        const personality = npc.personality;
        
        // Add personality-specific modifications
        switch (personality) {
            case 'nervous':
                if (!dialogue.includes('um') && !dialogue.includes('uh')) {
                    dialogue = dialogue.replace(/\./g, '... um.');
                }
                break;
                
            case 'aggressive':
                if (!dialogue.includes('!')) {
                    dialogue = dialogue.replace(/\.$/, '!');
                }
                break;
                
            case 'quirky':
                // Add random interjections
                const quirks = ['like', 'you know', 'totally', 'actually'];
                const randomQuirk = quirks[Math.floor(Math.random() * quirks.length)];
                if (!dialogue.includes(randomQuirk)) {
                    dialogue = dialogue.replace(/,/, `, ${randomQuirk},`);
                }
                break;
        }
        
        return dialogue;
    }

    // Get conversation history for continuity
    getConversationHistory(npcId) {
        const memory = this.contextMemory.get(npcId);
        if (!memory) return [];
        
        return memory.dialogue.slice(-5); // Last 5 exchanges
    }

    // Update context memory for conversation continuity
    updateContextMemory(npcId, dialogue, scenario) {
        if (!this.contextMemory.has(npcId)) {
            this.contextMemory.set(npcId, {
                dialogue: [],
                scenarios: [],
                lastUpdate: Date.now()
            });
        }
        
        const memory = this.contextMemory.get(npcId);
        memory.dialogue.push(dialogue);
        memory.scenarios.push(scenario);
        memory.lastUpdate = Date.now();
        
        // Limit memory size
        if (memory.dialogue.length > 10) {
            memory.dialogue = memory.dialogue.slice(-10);
            memory.scenarios = memory.scenarios.slice(-10);
        }
    }

    // Get current store context
    getStoreContext() {
        const gameState = this.gameState;
        
        return {
            atmosphere: this.calculateStoreAtmosphere(),
            reputation: gameState.store.reputation || 50,
            busyness: this.calculateStoreBusyness(),
            customerCount: gameState.customers?.length || 0,
            privacy: gameState.customers?.length <= 1 ? 'private' : 'public'
        };
    }

    // Get relationship context for the NPC
    getRelationshipContext(npcId) {
        const relationships = this.gameState.relationships || {};
        const relationship = relationships[npcId] || { level: 0 };
        
        return {
            level: relationship.level,
            history: relationship.interactionHistory || [],
            romance: relationship.romance || 0,
            recent: relationship.recentEvents || []
        };
    }

    // Helper methods for context building
    getTimeOfDay() {
        const hour = this.gameState.time?.hour || 12;
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        return 'evening';
    }

    getWeather() {
        return this.gameState.weather?.condition || 'clear';
    }

    getFinancialPressure() {
        const money = this.gameState.finance?.cash || 1000;
        const debt = this.gameState.finance?.totalDebt || 0;
        
        if (debt > money * 2) return 'high';
        if (debt > money) return 'medium';
        return 'low';
    }

    calculateStoreAtmosphere() {
        const cleanliness = this.gameState.store?.cleanliness || 50;
        const reputation = this.gameState.store?.reputation || 50;
        const staff = this.gameState.staff?.length || 0;
        
        const score = (cleanliness + reputation + staff * 10) / 3;
        
        if (score > 70) return 'welcoming';
        if (score > 40) return 'neutral';
        return 'tense';
    }

    calculateStoreBusyness() {
        const customers = this.gameState.customers?.length || 0;
        const hour = this.gameState.time?.hour || 12;
        
        // Peak hours are busier
        let busynessMultiplier = 1;
        if (hour >= 12 && hour <= 14) busynessMultiplier = 1.5; // Lunch rush
        if (hour >= 17 && hour <= 19) busynessMultiplier = 1.3; // Evening rush
        
        const adjustedBusyness = customers * busynessMultiplier;
        
        if (adjustedBusyness > 5) return 'very_busy';
        if (adjustedBusyness > 3) return 'busy';
        if (adjustedBusyness > 1) return 'moderate';
        return 'quiet';
    }

    // Fallback dialogue for when AI generation fails
    getFallbackDialogue(scenario, context) {
        const fallbacks = {
            greeting: [
                "Hi there! Welcome to the store.",
                "Good to see you again!",
                "What can I help you find today?"
            ],
            response: [
                "That sounds good to me.",
                "I see what you mean.",
                "Let me think about that."
            ],
            productInquiry: [
                "Do you have anything like this?",
                "I'm looking for something specific.",
                "What would you recommend?"
            ],
            negotiation: [
                "Is that the best price you can do?",
                "That seems a bit high...",
                "Can we work something out?"
            ],
            complaint: [
                "I'm not happy with this purchase.",
                "This isn't what I expected.",
                "There seems to be a problem."
            ],
            flirtation: [
                "You're really helpful, you know that?",
                "I love shopping here... the service is amazing.",
                "Do you give personal shopping advice?"
            ],
            smallTalk: [
                "How's business been?",
                "Nice weather we're having.",
                "Anything new happening around here?"
            ]
        };
        
        const options = fallbacks[scenario] || fallbacks.response;
        return options[Math.floor(Math.random() * options.length)];
    }

    // Public API methods
    async generateGreeting(npc, context = {}) {
        return await this.generateDialogue('greeting', { npc, ...context });
    }

    async generateResponse(npc, ownerStatement, context = {}) {
        return await this.generateDialogue('response', { 
            npc, 
            ownerStatement, 
            ...context 
        });
    }

    async generateProductInquiry(npc, productCategory, context = {}) {
        return await this.generateDialogue('productInquiry', { 
            npc, 
            productCategory, 
            ...context 
        });
    }

    async generateNegotiation(npc, product, context = {}) {
        return await this.generateDialogue('negotiation', { 
            npc, 
            productName: product.name,
            productPrice: product.price,
            ...context 
        });
    }

    async generateComplaint(npc, problem, context = {}) {
        return await this.generateDialogue('complaint', { 
            npc, 
            problemType: problem.type,
            problemDescription: problem.description,
            ...context 
        });
    }

    async generateFlirtation(npc, context = {}) {
        return await this.generateDialogue('flirtation', { npc, ...context });
    }

    async generateSmallTalk(npc, context = {}) {
        return await this.generateDialogue('smallTalk', { npc, ...context });
    }

    // Queue management for performance
    addToQueue(generationRequest) {
        if (this.dialogueQueue.length >= this.maxQueueSize) {
            this.dialogueQueue.shift(); // Remove oldest request
        }
        
        this.dialogueQueue.push({
            ...generationRequest,
            timestamp: Date.now()
        });
        
        this.processQueue();
    }

    async processQueue() {
        if (this.isGenerating || this.dialogueQueue.length === 0) {
            return;
        }
        
        this.isGenerating = true;
        
        try {
            const request = this.dialogueQueue.shift();
            await this.generateDialogue(request.scenario, request.context);
        } catch (error) {
            console.error('❌ Queue processing error:', error);
        } finally {
            this.isGenerating = false;
            
            // Process next item if queue has more
            if (this.dialogueQueue.length > 0) {
                setTimeout(() => this.processQueue(), 100);
            }
        }
    }

    // Clean up expired context memory
    cleanupMemory() {
        const now = Date.now();
        const expiredEntries = [];
        
        for (const [npcId, memory] of this.contextMemory.entries()) {
            if (now - memory.lastUpdate > this.cacheExpiry) {
                expiredEntries.push(npcId);
            }
        }
        
        expiredEntries.forEach(npcId => {
            this.contextMemory.delete(npcId);
        });
        
        if (expiredEntries.length > 0) {
            console.log('🧹 Cleaned up dialogue memory for', expiredEntries.length, 'NPCs');
        }
    }

    // Start periodic cleanup
    startMemoryCleanup() {
        setInterval(() => this.cleanupMemory(), 60000); // Every minute
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DialogueAIGenerator;
} else if (typeof window !== 'undefined') {
    window.DialogueAIGenerator = DialogueAIGenerator;
}
