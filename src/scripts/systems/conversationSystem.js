/**
 * Conversation System - Handles dialogue trees and customer interactions
 * Manages player responses, AI dialogue generation, and conversation flow
 */

class ConversationSystem {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.aiHooks = null;
        this.npcSystem = null;
        this.dialogueAI = null; // Phase 4C: AI Dialogue Generator
        this.currentConversation = null;
        this.conversationHistory = [];
        this.dialogueOptions = null;
        this.conversationTimeout = null;
        this.isWaitingForResponse = false;
    }

    initialize(gameState, eventBus, aiHooks, npcSystem, dialogueAI = null) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        this.aiHooks = aiHooks;
        this.npcSystem = npcSystem;
        this.dialogueAI = dialogueAI; // Phase 4C: Enhanced AI dialogue
        
        // Listen for conversation events
        this.eventBus.on('conversation.start', (data) => this.startConversation(data));
        this.eventBus.on('conversation.playerResponse', (data) => this.handlePlayerResponse(data));
        this.eventBus.on('conversation.end', () => this.endConversation());
        this.eventBus.on('customer.greet', (data) => this.handleGreeting(data));
        this.eventBus.on('customer.question', (data) => this.handleQuestion(data));
        this.eventBus.on('customer.complaint', (data) => this.handleComplaint(data));
        
        // Load dialogue templates
        this.loadDialogueTemplates();
        
        console.log('💬 Conversation System initialized');
    }

    loadDialogueTemplates() {
        // Pre-defined dialogue patterns for different scenarios
        this.dialogueTemplates = {
            greetings: {
                friendly: [
                    "Welcome to our store! How can I help you today?",
                    "Good [timeOfDay]! What brings you in today?",
                    "Hi there! Let me know if you need anything!",
                    "Welcome! I'm here if you have any questions."
                ],
                professional: [
                    "Good [timeOfDay]. How may I assist you?",
                    "Welcome to [storeName]. What can I help you find?",
                    "Hello. Please let me know if you need assistance.",
                    "Good [timeOfDay]. How can I be of service?"
                ],
                casual: [
                    "Hey! What's up?",
                    "Hi! Looking for anything specific?",
                    "What can I do for ya?",
                    "Hey there! Need any help?"
                ]
            },
            
            responses: {
                helpful: [
                    "I'd be happy to help you with that!",
                    "Let me see what I can do for you.",
                    "Absolutely! I can help you find that.",
                    "No problem at all! Let me assist you."
                ],
                apologetic: [
                    "I'm sorry about that. Let me make it right.",
                    "I apologize for the inconvenience.",
                    "That's my fault. How can I fix this?",
                    "I'm really sorry. Let me help resolve this."
                ],
                dismissive: [
                    "That's just how it is.",
                    "Nothing I can do about that.",
                    "Store policy is store policy.",
                    "Take it or leave it."
                ],
                flirty: [
                    "I'd love to help someone as lovely as you.",
                    "For you? I'll make an exception.",
                    "You have excellent taste... in stores.",
                    "I'll give you special attention."
                ]
            },
            
            questions: {
                product_inquiry: [
                    "What specific product are you looking for?",
                    "Can you tell me more about what you need?",
                    "What features are most important to you?",
                    "What's your budget range for this item?"
                ],
                recommendation: [
                    "Based on what you've told me, I'd recommend...",
                    "I think you'd really like this option...",
                    "This is our most popular item in that category...",
                    "Given your needs, this would be perfect..."
                ],
                upsell: [
                    "Would you be interested in our premium version?",
                    "Have you considered adding this accessory?",
                    "We have a bundle deal that might save you money...",
                    "This pairs really well with what you're buying..."
                ]
            }
        };
        
        // Response options for different personality types
        this.responseOptions = {
            friendly: {
                tone: "warm and helpful",
                relationshipBonus: 2,
                satisfactionBonus: 3
            },
            professional: {
                tone: "courteous and efficient",
                relationshipBonus: 1,
                satisfactionBonus: 2
            },
            casual: {
                tone: "relaxed and informal",
                relationshipBonus: 1,
                satisfactionBonus: 1
            },
            flirty: {
                tone: "charming and suggestive",
                relationshipBonus: 3,
                satisfactionBonus: 1,
                requiresRelationship: 20
            },
            rude: {
                tone: "dismissive and impatient",
                relationshipBonus: -3,
                satisfactionBonus: -5
            },
            apologetic: {
                tone: "sorry and accommodating",
                relationshipBonus: 1,
                satisfactionBonus: 4
            }
        };
    }

    // Conversation Management
    startConversation(data) {
        const { npc, scenario, context } = data;
        
        if (this.currentConversation) {
            this.endConversation();
        }
        
        this.currentConversation = {
            npc: npc,
            scenario: scenario, // greeting, question, complaint, purchase, etc.
            context: context,
            startTime: Date.now(),
            turnCount: 0,
            messages: [],
            playerSatisfaction: 50, // Start neutral
            npcMood: npc.mood,
            lastPlayerResponse: null
        };
        
        // Set conversation timeout based on NPC patience
        const timeoutDuration = this.calculateConversationTimeout(npc);
        this.conversationTimeout = setTimeout(() => {
            this.handleConversationTimeout();
        }, timeoutDuration);
        
        // Generate initial NPC dialogue
        this.generateNPCResponse(scenario, context);
        
        this.eventBus.emit('conversation.started', {
            conversation: this.currentConversation
        });
        
        console.log(`💬 Started conversation with ${npc.name} (${scenario})`);
    }

    async generateNPCResponse(scenario, context = null, playerInput = null) {
        if (!this.currentConversation) return;
        
        const npc = this.currentConversation.npc;
        
        try {
            let npcMessage;
            
            // Phase 4C: Use enhanced AI dialogue generator if available
            if (this.dialogueAI) {
                console.log('🤖 Using AI Dialogue Generator for', scenario);
                
                const dialogueContext = {
                    npc: npc,
                    scenario: scenario,
                    context: context,
                    ownerStatement: playerInput,
                    conversation: this.currentConversation
                };
                
                // Generate dialogue based on scenario type
                switch (scenario) {
                    case 'greeting':
                        npcMessage = await this.dialogueAI.generateGreeting(npc, dialogueContext);
                        break;
                    case 'response':
                        npcMessage = await this.dialogueAI.generateResponse(npc, playerInput, dialogueContext);
                        break;
                    case 'product_inquiry':
                        npcMessage = await this.dialogueAI.generateProductInquiry(npc, context.productCategory, dialogueContext);
                        break;
                    case 'negotiation':
                        npcMessage = await this.dialogueAI.generateNegotiation(npc, context.product, dialogueContext);
                        break;
                    case 'complaint':
                        npcMessage = await this.dialogueAI.generateComplaint(npc, context.problem, dialogueContext);
                        break;
                    case 'flirtation':
                        npcMessage = await this.dialogueAI.generateFlirtation(npc, dialogueContext);
                        break;
                    case 'small_talk':
                        npcMessage = await this.dialogueAI.generateSmallTalk(npc, dialogueContext);
                        break;
                    default:
                        npcMessage = await this.dialogueAI.generateResponse(npc, playerInput, dialogueContext);
                }
                
                // Structure the AI response
                const structuredMessage = {
                    text: npcMessage,
                    emotion: this.inferEmotionFromText(npcMessage, npc),
                    tone: this.inferToneFromText(npcMessage),
                    generatedBy: 'ai'
                };
                
                // Add message to conversation
                this.addMessage('npc', structuredMessage.text, structuredMessage.emotion);
                
            } else {
                // Fallback to original system
                console.log('📝 Using template-based dialogue system');
                
                // Build conversation prompt for AI
                const prompt = this.buildConversationPrompt(npc, scenario, context, playerInput);
                
                // Generate AI response
                const aiResponse = await this.aiHooks.generateText(prompt);
                const structuredMessage = this.parseAIResponse(aiResponse);
                
                // Add message to conversation
                this.addMessage('npc', structuredMessage.text, structuredMessage.emotion);
            }
            
            // Generate player response options
            this.generatePlayerOptions(scenario, context);
            
            this.eventBus.emit('conversation.npcResponse', {
                message: npcMessage,
                options: this.dialogueOptions,
                conversation: this.currentConversation
            });
            
        } catch (error) {
            console.error('Failed to generate NPC response:', error);
            // Fallback to template response
            this.generateTemplateResponse(scenario, context);
        }
    }

    buildConversationPrompt(npc, scenario, context, playerInput) {
        const archetype = npc.archetype;
        const mood = npc.mood;
        const relationship = npc.relationshipLevel;
        const conversationHistory = this.currentConversation.messages.slice(-4); // Last 4 messages
        
        let prompt = `You are ${npc.name}, a ${npc.age}-year-old ${npc.gender} ${archetype.replace('_', ' ')}. `;
        prompt += `You are currently ${mood} and your relationship with the store owner is "${relationship}". `;
        
        // Add personality context
        if (npc.personalityDetails) {
            prompt += `Your personality: ${npc.personalityDetails}. `;
        }
        
        // Add scenario context
        switch (scenario) {
            case 'greeting':
                prompt += `You just entered the store. Respond to the store owner's greeting. `;
                break;
            case 'question':
                prompt += `You have a question about a product or service. ${context || ''} `;
                break;
            case 'complaint':
                prompt += `You have a complaint about something. ${context || ''} `;
                break;
            case 'purchase':
                prompt += `You're ready to buy something and need to discuss it. `;
                break;
            case 'casual':
                prompt += `You're having a casual conversation with the store owner. `;
                break;
        }
        
        // Add conversation history
        if (conversationHistory.length > 0) {
            prompt += `\n\nConversation so far:\n`;
            conversationHistory.forEach(msg => {
                const speaker = msg.sender === 'npc' ? npc.name : 'Store Owner';
                prompt += `${speaker}: ${msg.text}\n`;
            });
        }
        
        // Add player input if provided
        if (playerInput) {
            prompt += `\nStore Owner just said: "${playerInput}"\n`;
        }
        
        prompt += `\nRespond as ${npc.name} in character. Keep your response to 1-2 sentences and match your mood (${mood}). `;
        
        // Add content guidelines
        if (this.gameState.data.meta.adultContentEnabled && relationship !== 'stranger') {
            prompt += `Feel free to be flirtatious if appropriate for your character and relationship level. `;
        } else {
            prompt += `Keep the conversation appropriate and business-focused. `;
        }
        
        return prompt;
    }

    parseAIResponse(aiResponse) {
        // Simple parsing - in production this would be more sophisticated
        let text = aiResponse.trim();
        let emotion = 'neutral';
        
        // Try to detect emotion from text
        if (text.includes('!') || text.toLowerCase().includes('great') || text.toLowerCase().includes('love')) {
            emotion = 'happy';
        } else if (text.includes('?')) {
            emotion = 'curious';
        } else if (text.toLowerCase().includes('sorry') || text.toLowerCase().includes('unfortunately')) {
            emotion = 'apologetic';
        } else if (text.toLowerCase().includes('angry') || text.toLowerCase().includes('frustrated')) {
            emotion = 'angry';
        }
        
        return {
            text: text,
            emotion: emotion
        };
    }

    generatePlayerOptions(npcMessage, scenario) {
        const npc = this.currentConversation.npc;
        const relationship = npc.relationshipLevel;
        
        // Base options available to all scenarios
        const baseOptions = [
            {
                id: 'helpful',
                text: "How can I help you with that?",
                tone: 'helpful',
                requiresRelationship: 0
            },
            {
                id: 'professional',
                text: "Let me assist you professionally.",
                tone: 'professional',
                requiresRelationship: 0
            }
        ];
        
        // Scenario-specific options
        const scenarioOptions = this.getScenarioOptions(scenario, npc);
        
        // Relationship-gated options
        const relationshipOptions = this.getRelationshipOptions(relationship, npc);
        
        // Combine and filter options
        this.dialogueOptions = [...baseOptions, ...scenarioOptions, ...relationshipOptions]
            .filter(option => this.canUseOption(option, npc))
            .slice(0, 4); // Limit to 4 options for UI
    }

    getScenarioOptions(scenario, npc) {
        switch (scenario) {
            case 'greeting':
                return [
                    {
                        id: 'friendly_greeting',
                        text: "Welcome! I'm so glad you're here!",
                        tone: 'friendly',
                        requiresRelationship: 0
                    },
                    {
                        id: 'casual_greeting',
                        text: "Hey! What brings you in today?",
                        tone: 'casual',
                        requiresRelationship: 0
                    }
                ];
                
            case 'question':
                return [
                    {
                        id: 'detailed_help',
                        text: "I'd be happy to explain everything about that.",
                        tone: 'helpful',
                        requiresRelationship: 0
                    },
                    {
                        id: 'quick_answer',
                        text: "Sure, here's what you need to know.",
                        tone: 'efficient',
                        requiresRelationship: 0
                    }
                ];
                
            case 'complaint':
                return [
                    {
                        id: 'apologetic',
                        text: "I'm so sorry about that. Let me make it right.",
                        tone: 'apologetic',
                        requiresRelationship: 0
                    },
                    {
                        id: 'defensive',
                        text: "That's not really how we do things here.",
                        tone: 'defensive',
                        requiresRelationship: 0
                    }
                ];
                
            case 'purchase':
                return [
                    {
                        id: 'upsell',
                        text: "Have you considered our premium option?",
                        tone: 'sales',
                        requiresRelationship: 0
                    },
                    {
                        id: 'discount',
                        text: "I might be able to give you a small discount.",
                        tone: 'generous',
                        requiresRelationship: 10
                    }
                ];
                
            default:
                return [];
        }
    }

    getRelationshipOptions(relationshipLevel, npc) {
        const options = [];
        
        if (relationshipLevel === 'regular' || relationshipLevel === 'friend' || relationshipLevel === 'vip') {
            options.push({
                id: 'personal',
                text: "How have you been? I always enjoy seeing you.",
                tone: 'personal',
                requiresRelationship: 20
            });
        }
        
        if (relationshipLevel === 'friend' || relationshipLevel === 'vip') {
            options.push({
                id: 'insider_info',
                text: "I have something special just for you.",
                tone: 'exclusive',
                requiresRelationship: 40
            });
        }
        
        // Flirty options (if adult content enabled and appropriate relationship)
        if (this.gameState.data.meta.adultContentEnabled && npc.relationship >= 30) {
            options.push({
                id: 'flirty',
                text: "You always brighten my day when you come in.",
                tone: 'flirty',
                requiresRelationship: 30
            });
        }
        
        return options;
    }

    canUseOption(option, npc) {
        // Check relationship requirement
        if (option.requiresRelationship && npc.relationship < option.requiresRelationship) {
            return false;
        }
        
        // Check if flirty options are appropriate
        if (option.tone === 'flirty' && !this.gameState.data.meta.adultContentEnabled) {
            return false;
        }
        
        return true;
    }

    handlePlayerResponse(data) {
        if (!this.currentConversation || this.isWaitingForResponse) return;
        
        const { optionId, customText } = data;
        let responseText, responseTone;
        
        if (customText) {
            // Player typed a custom response
            responseText = customText;
            responseTone = this.analyzeTone(customText);
        } else {
            // Player selected a pre-defined option
            const selectedOption = this.dialogueOptions.find(opt => opt.id === optionId);
            if (!selectedOption) return;
            
            responseText = selectedOption.text;
            responseTone = selectedOption.tone;
        }
        
        // Add player message to conversation
        this.addMessage('player', responseText, responseTone);
        
        // Calculate response impact
        const impact = this.calculateResponseImpact(responseTone, this.currentConversation.npc);
        this.applyResponseImpact(impact);
        
        // Store player response for AI context
        this.currentConversation.lastPlayerResponse = {
            text: responseText,
            tone: responseTone,
            impact: impact
        };
        
        this.isWaitingForResponse = true;
        
        // Generate NPC response to player input
        setTimeout(() => {
            this.generateNPCResponse('response', null, responseText);
            this.isWaitingForResponse = false;
        }, 1000 + Math.random() * 2000); // 1-3 second delay for realism
        
        this.eventBus.emit('conversation.playerResponseProcessed', {
            response: responseText,
            tone: responseTone,
            impact: impact
        });
    }

    analyzeTone(text) {
        const lowerText = text.toLowerCase();
        
        // Simple tone analysis
        if (lowerText.includes('sorry') || lowerText.includes('apologize')) {
            return 'apologetic';
        } else if (lowerText.includes('help') || lowerText.includes('assist')) {
            return 'helpful';
        } else if (lowerText.includes('beautiful') || lowerText.includes('lovely')) {
            return 'flirty';
        } else if (lowerText.includes('no') || lowerText.includes('can\'t')) {
            return 'dismissive';
        } else if (text.includes('!') || lowerText.includes('great')) {
            return 'enthusiastic';
        } else {
            return 'neutral';
        }
    }

    calculateResponseImpact(tone, npc) {
        const baseImpact = this.responseOptions[tone] || { relationshipBonus: 0, satisfactionBonus: 0 };
        
        let relationshipChange = baseImpact.relationshipBonus;
        let satisfactionChange = baseImpact.satisfactionBonus;
        
        // Modify based on NPC mood
        switch (npc.mood) {
            case 'happy':
                satisfactionChange *= 1.2;
                break;
            case 'irritated':
                satisfactionChange *= 0.5;
                relationshipChange *= 0.5;
                break;
            case 'stressed':
                if (tone === 'helpful' || tone === 'apologetic') {
                    satisfactionChange *= 1.5;
                }
                break;
        }
        
        // Modify based on archetype
        if (npc.archetype === 'business_executive' && tone === 'professional') {
            satisfactionChange *= 1.3;
        } else if (npc.archetype === 'retiree' && tone === 'friendly') {
            relationshipChange *= 1.2;
        }
        
        return {
            relationshipChange: Math.round(relationshipChange),
            satisfactionChange: Math.round(satisfactionChange)
        };
    }

    applyResponseImpact(impact) {
        if (!this.currentConversation) return;
        
        const npc = this.currentConversation.npc;
        
        // Apply relationship change
        if (impact.relationshipChange !== 0) {
            this.npcSystem.updateRelationship(
                npc.id,
                impact.relationshipChange,
                'Conversation interaction'
            );
        }
        
        // Apply satisfaction change
        this.currentConversation.playerSatisfaction = Math.max(0, Math.min(100,
            this.currentConversation.playerSatisfaction + impact.satisfactionChange
        ));
        
        this.eventBus.emit('conversation.impactApplied', {
            npc: npc,
            impact: impact,
            newSatisfaction: this.currentConversation.playerSatisfaction
        });
    }

    addMessage(sender, text, emotion = 'neutral') {
        if (!this.currentConversation) return;
        
        const message = {
            sender: sender, // 'player' or 'npc'
            text: text,
            emotion: emotion,
            timestamp: Date.now(),
            turn: this.currentConversation.turnCount
        };
        
        this.currentConversation.messages.push(message);
        this.currentConversation.turnCount++;
        
        this.eventBus.emit('conversation.messageAdded', { message });
    }

    // Specialized conversation handlers
    handleGreeting(data) {
        const { npc, greetingType } = data;
        
        this.startConversation({
            npc: npc,
            scenario: 'greeting',
            context: { greetingType: greetingType || 'neutral' }
        });
    }

    handleQuestion(data) {
        const { npc, question, category } = data;
        
        this.startConversation({
            npc: npc,
            scenario: 'question',
            context: { 
                question: question,
                category: category || 'general'
            }
        });
    }

    handleComplaint(data) {
        const { npc, complaint, severity } = data;
        
        this.startConversation({
            npc: npc,
            scenario: 'complaint',
            context: {
                complaint: complaint,
                severity: severity || 1
            }
        });
    }

    // Conversation flow control
    calculateConversationTimeout(npc) {
        let baseTimeout = 60000; // 1 minute base
        
        // Modify by patience
        baseTimeout = baseTimeout * (npc.patience / 50);
        
        // Modify by relationship
        if (npc.relationshipLevel === 'friend') baseTimeout *= 1.5;
        if (npc.relationshipLevel === 'vip') baseTimeout *= 2.0;
        
        return Math.max(30000, baseTimeout); // Minimum 30 seconds
    }

    handleConversationTimeout() {
        if (!this.currentConversation) return;
        
        console.log('💬 Conversation timed out');
        
        // Apply negative impact for ignoring customer
        this.applyResponseImpact({
            relationshipChange: -3,
            satisfactionChange: -10
        });
        
        this.endConversation('timeout');
    }

    endConversation(reason = 'completed') {
        if (!this.currentConversation) return;
        
        const conversation = this.currentConversation;
        const duration = Date.now() - conversation.startTime;
        
        // Clear timeout
        if (this.conversationTimeout) {
            clearTimeout(this.conversationTimeout);
            this.conversationTimeout = null;
        }
        
        // Calculate final satisfaction score
        const finalSatisfaction = this.calculateFinalSatisfaction(conversation, reason);
        
        // Add to conversation history
        this.conversationHistory.push({
            ...conversation,
            endTime: Date.now(),
            duration: duration,
            endReason: reason,
            finalSatisfaction: finalSatisfaction
        });
        
        // Keep history manageable
        if (this.conversationHistory.length > 50) {
            this.conversationHistory.shift();
        }
        
        console.log(`💬 Conversation ended with ${conversation.npc.name} (${reason}, satisfaction: ${finalSatisfaction})`);
        
        this.eventBus.emit('conversation.ended', {
            conversation: conversation,
            reason: reason,
            duration: duration,
            finalSatisfaction: finalSatisfaction
        });
        
        this.currentConversation = null;
        this.dialogueOptions = null;
        this.isWaitingForResponse = false;
    }

    calculateFinalSatisfaction(conversation, reason) {
        let satisfaction = conversation.playerSatisfaction;
        
        // Modify based on end reason
        switch (reason) {
            case 'completed':
                satisfaction += 5;
                break;
            case 'timeout':
                satisfaction -= 15;
                break;
            case 'dismissed':
                satisfaction -= 10;
                break;
            case 'successful_sale':
                satisfaction += 10;
                break;
            case 'complaint_resolved':
                satisfaction += 15;
                break;
        }
        
        // Modify based on conversation length
        const idealTurns = 4;
        const actualTurns = conversation.turnCount;
        if (actualTurns < idealTurns) {
            satisfaction -= (idealTurns - actualTurns) * 2; // Penalty for too short
        }
        
        return Math.max(0, Math.min(100, satisfaction));
    }

    // Phase 4C: Enhanced helper methods for AI dialogue integration
    inferEmotionFromText(text, npc) {
        const emotionKeywords = {
            happy: ['great', 'awesome', 'wonderful', 'perfect', 'love', 'excellent'],
            excited: ['amazing', 'fantastic', 'incredible', 'wow', '!'],
            angry: ['terrible', 'awful', 'horrible', 'disgusting', 'hate', 'furious'],
            frustrated: ['annoying', 'irritating', 'ridiculous', 'stupid'],
            sad: ['disappointed', 'upset', 'sorry', 'unfortunate'],
            nervous: ['um', 'uh', 'maybe', 'I guess', 'not sure'],
            confident: ['definitely', 'absolutely', 'certainly', 'sure', 'positive'],
            flirty: ['gorgeous', 'handsome', 'attractive', 'cute', 'charming']
        };
        
        const textLower = text.toLowerCase();
        
        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                return emotion;
            }
        }
        
        // Default based on NPC personality
        const personalityEmotions = {
            friendly: 'happy',
            aggressive: 'confident',
            shy: 'nervous',
            confident: 'confident',
            quirky: 'excited'
        };
        
        return personalityEmotions[npc.personality] || 'neutral';
    }

    inferToneFromText(text) {
        if (text.includes('!')) return 'enthusiastic';
        if (text.includes('?')) return 'curious';
        if (text.includes('...')) return 'hesitant';
        if (text.length > 100) return 'talkative';
        if (text.length < 30) return 'brief';
        return 'normal';
    }

    // Enhanced player option generation with AI context
    generatePlayerOptions(scenario, context) {
        const npc = this.currentConversation.npc;
        const relationship = npc.relationshipLevel || 0;
        
        const options = [];
        
        // Base response options
        switch (scenario) {
            case 'greeting':
                options.push(
                    { text: "Welcome! How can I help you today?", tone: "friendly", relationshipChange: 1 },
                    { text: "Hi there. What do you need?", tone: "professional", relationshipChange: 0 },
                    { text: "Hey! Great to see you again!", tone: "enthusiastic", relationshipChange: 2, requiresRelationship: 20 }
                );
                break;
                
            case 'product_inquiry':
                options.push(
                    { text: "I'd be happy to help you find that.", tone: "helpful", relationshipChange: 1 },
                    { text: "Let me show you our options.", tone: "professional", relationshipChange: 0 },
                    { text: "What's your budget for this?", tone: "business", relationshipChange: 0 }
                );
                break;
                
            case 'negotiation':
                options.push(
                    { text: "I can work with you on the price.", tone: "accommodating", relationshipChange: 2 },
                    { text: "The price is firm, but it's worth it.", tone: "confident", relationshipChange: -1 },
                    { text: "Let me see what I can do...", tone: "considering", relationshipChange: 1 }
                );
                break;
                
            case 'complaint':
                options.push(
                    { text: "I'm so sorry about that. Let me fix this.", tone: "apologetic", relationshipChange: 3 },
                    { text: "That's our policy, but I understand your frustration.", tone: "firm", relationshipChange: -1 },
                    { text: "Tell me exactly what happened.", tone: "investigative", relationshipChange: 1 }
                );
                break;
                
            case 'flirtation':
                if (relationship >= 30) {
                    options.push(
                        { text: "You're pretty charming yourself.", tone: "flirty", relationshipChange: 3, requiresRelationship: 30 },
                        { text: "I appreciate the compliment.", tone: "gracious", relationshipChange: 1 },
                        { text: "Let's keep things professional.", tone: "professional", relationshipChange: -2 }
                    );
                } else {
                    options.push(
                        { text: "Thank you, that's very kind.", tone: "polite", relationshipChange: 1 },
                        { text: "I prefer to keep things professional.", tone: "professional", relationshipChange: 0 }
                    );
                }
                break;
                
            default:
                options.push(
                    { text: "I understand.", tone: "neutral", relationshipChange: 0 },
                    { text: "That makes sense.", tone: "agreeable", relationshipChange: 1 },
                    { text: "Interesting...", tone: "thoughtful", relationshipChange: 0 }
                );
        }
        
        // Add context-specific options
        if (context?.product) {
            options.push({ 
                text: `Tell me more about the ${context.product.name}.`, 
                tone: "interested", 
                relationshipChange: 1 
            });
        }
        
        // Filter options by relationship requirements
        this.dialogueOptions = options.filter(option => 
            !option.requiresRelationship || relationship >= option.requiresRelationship
        );
        
        console.log(`💬 Generated ${this.dialogueOptions.length} dialogue options for ${scenario}`);
    }

    // Template fallback responses
    generateTemplateResponse(scenario, context) {
        const templates = this.dialogueTemplates;
        let responses = [];
        
        switch (scenario) {
            case 'greeting':
                responses = templates.greetings.friendly;
                break;
            case 'question':
                responses = templates.responses.helpful;
                break;
            case 'complaint':
                responses = templates.responses.apologetic;
                break;
            default:
                responses = ["I understand. How can I help you?"];
        }
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        this.addMessage('npc', response, 'neutral');
        
        // Generate basic options
        this.dialogueOptions = [
            { id: 'helpful', text: "How can I help you?", tone: 'helpful' },
            { id: 'professional', text: "What do you need?", tone: 'professional' }
        ];
        
        this.eventBus.emit('conversation.npcResponse', {
            message: { text: response, emotion: 'neutral' },
            options: this.dialogueOptions,
            conversation: this.currentConversation
        });
    }

    // Public interface
    getCurrentConversation() {
        return this.currentConversation;
    }

    isInConversation() {
        return this.currentConversation !== null;
    }

    getConversationHistory(npcId = null) {
        if (npcId) {
            return this.conversationHistory.filter(conv => conv.npc.id === npcId);
        }
        return this.conversationHistory;
    }

    getAvailableOptions() {
        return this.dialogueOptions;
    }

    forceEndConversation() {
        this.endConversation('dismissed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConversationSystem;
} else if (typeof window !== 'undefined') {
    window.ConversationSystem = ConversationSystem;
}
