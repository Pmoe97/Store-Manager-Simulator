/**
 * NPC System - Handles NPC generation, management, and interactions
 * Implements hybrid generation: basic traits first, AI enrichment later
 */

class NPCSystem {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.aiHooks = null;
        this.nameData = null;
        this.archetypeData = null;
        this.encounterQueue = [];
        this.enrichmentQueue = [];
        this.isEnriching = false;
        this.maxEncountersPerDay = 8;
        this.npcGenerationBatch = 5;
    }

    initialize(gameState, eventBus, aiHooks) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        this.aiHooks = aiHooks;
        
        // Load name and archetype data
        this.loadNameData();
        this.loadArchetypeData();
        
        // Initialize NPC AI Enhancer if available
        if (typeof npcAIEnhancer !== 'undefined') {
            npcAIEnhancer.initialize(aiHooks);
            this.npcAIEnhancer = npcAIEnhancer;
            console.log('🧠 NPC AI Enhancer connected to NPC System');
        }
        
        // Listen for events
        this.eventBus.on('game.start', () => this.onGameStart());
        this.eventBus.on('time.dayStart', () => this.generateDailyEncounters());
        this.eventBus.on('customer.encounter', (npcId) => this.handleEncounter(npcId));
        this.eventBus.on('npc.requestEnrichment', (npcId) => this.enrichNPC(npcId));
        this.eventBus.on('store.customerEnter', () => this.getNextCustomer());
        this.eventBus.on('npc.enriched', (data) => this.onNPCEnriched(data));
        
        console.log('👥 NPC System initialized');
    }

    loadNameData() {
        // Curated name lists for realistic generation
        this.nameData = {
            first: {
                female: [
                    'Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Charlotte', 'Mia', 'Amelia',
                    'Harper', 'Evelyn', 'Abigail', 'Emily', 'Elizabeth', 'Mila', 'Ella', 'Avery',
                    'Sofia', 'Camila', 'Aria', 'Scarlett', 'Victoria', 'Madison', 'Luna', 'Grace',
                    'Chloe', 'Penelope', 'Layla', 'Riley', 'Zoey', 'Nora', 'Lily', 'Eleanor',
                    'Hannah', 'Lillian', 'Addison', 'Aubrey', 'Ellie', 'Stella', 'Natalie', 'Zoe'
                ],
                male: [
                    'Liam', 'Noah', 'Oliver', 'Elijah', 'William', 'James', 'Benjamin', 'Lucas',
                    'Henry', 'Alexander', 'Mason', 'Michael', 'Ethan', 'Daniel', 'Jacob', 'Logan',
                    'Jackson', 'Sebastian', 'Jack', 'Aiden', 'Owen', 'Samuel', 'Matthew', 'Joseph',
                    'Levi', 'Mateo', 'David', 'John', 'Wyatt', 'Carter', 'Julian', 'Luke',
                    'Grayson', 'Isaac', 'Jayden', 'Theodore', 'Gabriel', 'Anthony', 'Dylan', 'Leo'
                ],
                neutral: [
                    'Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage',
                    'River', 'Rowan', 'Cameron', 'Charlie', 'Parker', 'Hayden', 'Emery', 'Finley',
                    'Dakota', 'Reese', 'Peyton', 'Blake', 'Drew', 'Phoenix', 'Skyler', 'Eden'
                ]
            },
            last: [
                'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
                'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
                'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
                'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
                'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
                'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
                'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker'
            ]
        };
    }

    loadArchetypeData() {
        // Character archetypes with traits and behaviors
        this.archetypeData = {
            // Student archetypes
            'college_student': {
                name: 'College Student',
                ageRange: [18, 22],
                spendingPower: [5, 25],
                frequencyModifier: 0.8,
                traits: ['budget_conscious', 'social', 'tech_savvy'],
                behaviors: ['buys_cheap_food', 'shops_late', 'uses_student_discounts'],
                interests: ['energy_drinks', 'snacks', 'electronics', 'study_supplies'],
                dialogue_style: 'casual',
                relationship_speed: 1.2
            },
            'grad_student': {
                name: 'Graduate Student',
                ageRange: [22, 28],
                spendingPower: [10, 40],
                frequencyModifier: 0.6,
                traits: ['intellectual', 'stressed', 'budget_conscious'],
                behaviors: ['buys_coffee', 'shops_efficiently', 'research_focused'],
                interests: ['coffee', 'healthy_food', 'books', 'office_supplies'],
                dialogue_style: 'thoughtful',
                relationship_speed: 0.9
            },

            // Professional archetypes
            'young_professional': {
                name: 'Young Professional',
                ageRange: [25, 35],
                spendingPower: [30, 80],
                frequencyModifier: 1.0,
                traits: ['ambitious', 'busy', 'image_conscious'],
                behaviors: ['quick_shopping', 'brand_aware', 'convenience_focused'],
                interests: ['fashion', 'electronics', 'quick_meals', 'self_care'],
                dialogue_style: 'professional',
                relationship_speed: 0.8
            },
            'business_executive': {
                name: 'Business Executive',
                ageRange: [35, 55],
                spendingPower: [100, 300],
                frequencyModifier: 0.4,
                traits: ['wealthy', 'demanding', 'time_pressed'],
                behaviors: ['expects_service', 'buys_premium', 'impatient'],
                interests: ['luxury_items', 'premium_brands', 'convenience', 'status_symbols'],
                dialogue_style: 'authoritative',
                relationship_speed: 0.6
            },

            // Family archetypes
            'soccer_mom': {
                name: 'Soccer Mom',
                ageRange: [30, 45],
                spendingPower: [40, 120],
                frequencyModifier: 1.3,
                traits: ['family_focused', 'organized', 'value_conscious'],
                behaviors: ['bulk_shopping', 'compares_prices', 'family_first'],
                interests: ['family_products', 'household_items', 'kids_snacks', 'health_products'],
                dialogue_style: 'friendly',
                relationship_speed: 1.1
            },
            'working_parent': {
                name: 'Working Parent',
                ageRange: [28, 50],
                spendingPower: [35, 100],
                frequencyModifier: 1.1,
                traits: ['stressed', 'efficient', 'practical'],
                behaviors: ['rushed_shopping', 'necessity_focused', 'multitasking'],
                interests: ['quick_meals', 'family_essentials', 'convenience_items'],
                dialogue_style: 'hurried',
                relationship_speed: 0.9
            },

            // Senior archetypes
            'retiree': {
                name: 'Retiree',
                ageRange: [65, 85],
                spendingPower: [20, 60],
                frequencyModifier: 1.5,
                traits: ['traditional', 'social', 'value_conscious'],
                behaviors: ['leisurely_shopping', 'brand_loyal', 'enjoys_conversation'],
                interests: ['traditional_products', 'comfort_items', 'health_products'],
                dialogue_style: 'chatty',
                relationship_speed: 1.3
            },
            'wealthy_senior': {
                name: 'Wealthy Senior',
                ageRange: [60, 80],
                spendingPower: [80, 200],
                frequencyModifier: 0.8,
                traits: ['wealthy', 'particular', 'experienced'],
                behaviors: ['quality_focused', 'expects_respect', 'stories_and_advice'],
                interests: ['premium_products', 'comfort_items', 'luxury_goods'],
                dialogue_style: 'wise',
                relationship_speed: 1.0
            },

            // Unique archetypes
            'local_regular': {
                name: 'Local Regular',
                ageRange: [25, 65],
                spendingPower: [15, 50],
                frequencyModifier: 2.0,
                traits: ['loyal', 'friendly', 'community_minded'],
                behaviors: ['routine_shopping', 'supports_local', 'spreads_word'],
                interests: ['consistent_products', 'local_news', 'community_events'],
                dialogue_style: 'familiar',
                relationship_speed: 1.5
            },
            'tourist': {
                name: 'Tourist',
                ageRange: [20, 60],
                spendingPower: [10, 100],
                frequencyModifier: 0.1,
                traits: ['curious', 'temporary', 'adventurous'],
                behaviors: ['impulse_buying', 'asks_questions', 'one_time_visit'],
                interests: ['local_specialties', 'souvenirs', 'convenience_items'],
                dialogue_style: 'curious',
                relationship_speed: 0.5
            },
            'influencer': {
                name: 'Social Media Influencer',
                ageRange: [18, 35],
                spendingPower: [20, 150],
                frequencyModifier: 0.3,
                traits: ['attention_seeking', 'trend_focused', 'image_obsessed'],
                behaviors: ['photos_everything', 'expects_freebies', 'creates_content'],
                interests: ['trendy_items', 'photogenic_products', 'unique_finds'],
                dialogue_style: 'performative',
                relationship_speed: 0.7
            },
            'night_owl': {
                name: 'Night Owl',
                ageRange: [20, 40],
                spendingPower: [15, 60],
                frequencyModifier: 0.6,
                traits: ['nocturnal', 'alternative', 'independent'],
                behaviors: ['late_night_shopping', 'unconventional', 'privacy_focused'],
                interests: ['energy_drinks', 'snacks', 'convenience_items'],
                dialogue_style: 'minimal',
                relationship_speed: 0.8
            }
        };
    }

    // Core NPC Generation
    generateBasicNPC(archetype = null) {
        if (!archetype) {
            archetype = this.selectRandomArchetype();
        }

        const archetypeData = this.archetypeData[archetype];
        if (!archetypeData) {
            console.error('Unknown archetype:', archetype);
            return null;
        }

        const gender = this.selectGender();
        const age = this.generateAge(archetypeData.ageRange);
        const name = this.generateName(gender);
        const spendingPower = this.generateSpendingPower(archetypeData.spendingPower);

        const npc = {
            id: this.generateId(),
            
            // Basic Information
            name: name,
            age: age,
            gender: gender,
            pronouns: this.getPronouns(gender),
            archetype: archetype,
            
            // Financial
            spendingPower: spendingPower,
            currentCash: Math.floor(spendingPower * (0.5 + Math.random() * 1.5)),
            
            // Behavioral
            traits: [...archetypeData.traits],
            behaviors: [...archetypeData.behaviors],
            interests: [...archetypeData.interests],
            frequencyModifier: archetypeData.frequencyModifier,
            
            // Interaction
            dialogue_style: archetypeData.dialogue_style,
            relationship_speed: archetypeData.relationship_speed,
            mood: this.generateMood(),
            patience: Math.floor(Math.random() * 100) + 1,
            
            // Game State
            relationship: 0,
            relationshipLevel: 'stranger',
            lastVisit: 0,
            visitCount: 0,
            totalSpent: 0,
            
            // AI Enhancement Status
            isEnriched: false,
            enrichmentData: null,
            
            // Avatar
            avatar: null,
            appearance: {
                description: '',
                prompt: ''
            },
            
            // Background (filled during enrichment)
            backstory: '',
            personalityDetails: '',
            secrets: [],
            historyWithPlayer: '',
            
            // Timestamps
            created: Date.now(),
            lastInteraction: 0
        };

        return npc;
    }

    selectRandomArchetype() {
        const archetypes = Object.keys(this.archetypeData);
        return archetypes[Math.floor(Math.random() * archetypes.length)];
    }

    selectGender() {
        const roll = Math.random();
        if (roll < 0.45) return 'female';
        if (roll < 0.90) return 'male';
        return 'non-binary';
    }

    generateAge(ageRange) {
        const [min, max] = ageRange;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateName(gender) {
        let firstNames;
        if (gender === 'non-binary') {
            firstNames = this.nameData.first.neutral;
        } else {
            firstNames = this.nameData.first[gender] || this.nameData.first.neutral;
        }
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = this.nameData.last[Math.floor(Math.random() * this.nameData.last.length)];
        
        return `${firstName} ${lastName}`;
    }

    generateSpendingPower(range) {
        const [min, max] = range;
        // Use weighted random for more realistic distribution
        const roll1 = Math.random();
        const roll2 = Math.random();
        const normalizedRoll = (roll1 + roll2) / 2; // Creates bell curve
        
        return Math.floor(normalizedRoll * (max - min) + min);
    }

    getPronouns(gender) {
        const pronounMap = {
            'female': 'she/her',
            'male': 'he/him',
            'non-binary': 'they/them'
        };
        return pronounMap[gender] || 'they/them';
    }

    generateMood() {
        const moods = ['happy', 'neutral', 'stressed', 'excited', 'tired', 'irritated', 'cheerful'];
        return moods[Math.floor(Math.random() * moods.length)];
    }

    // NPC Encounter System
    onGameStart() {
        // Generate initial NPC pool
        this.generateInitialNPCPool();
        
        // Start background enrichment process
        this.startBackgroundEnrichment();
    }

    generateInitialNPCPool() {
        const poolSize = 30 + Math.floor(Math.random() * 15); // 30-44 NPCs
        
        console.log(`👥 Generating initial NPC pool of ${poolSize} characters...`);
        
        for (let i = 0; i < poolSize; i++) {
            const npc = this.generateBasicNPC();
            if (npc) {
                this.gameState.data.npcs.customers.set(npc.id, npc);
                this.enrichmentQueue.push(npc.id);
            }
        }
        
        console.log(`👥 Generated ${this.gameState.data.npcs.customers.size} NPCs`);
        this.eventBus.emit('npc.poolGenerated', { 
            count: this.gameState.data.npcs.customers.size 
        });
    }

    generateDailyEncounters() {
        // Clear previous day's encounters
        this.encounterQueue = [];
        
        // Determine number of encounters for today
        const baseEncounters = this.maxEncountersPerDay;
        const storeType = this.gameState.data.store.type;
        const environment = this.gameState.data.store.environment;
        
        // Adjust for store type and environment
        let encounterMultiplier = 1.0;
        if (storeType === 'convenience') encounterMultiplier = 1.3;
        if (storeType === 'boutique') encounterMultiplier = 0.7;
        if (environment === 'city') encounterMultiplier *= 1.2;
        if (environment === 'rural') encounterMultiplier *= 0.6;
        
        const todayEncounters = Math.floor(baseEncounters * encounterMultiplier);
        
        // Select NPCs for today
        const availableNPCs = Array.from(this.gameState.data.npcs.customers.values())
            .filter(npc => this.shouldNPCVisitToday(npc));
        
        // Add regulars first
        const regulars = availableNPCs
            .filter(npc => npc.relationshipLevel !== 'stranger')
            .sort((a, b) => b.relationship - a.relationship);
        
        for (let i = 0; i < Math.min(regulars.length, Math.floor(todayEncounters * 0.4)); i++) {
            this.encounterQueue.push(regulars[i].id);
        }
        
        // Fill remaining slots with other NPCs
        const others = availableNPCs.filter(npc => !this.encounterQueue.includes(npc.id));
        const remainingSlots = todayEncounters - this.encounterQueue.length;
        
        for (let i = 0; i < remainingSlots && i < others.length; i++) {
            const randomNPC = others[Math.floor(Math.random() * others.length)];
            if (!this.encounterQueue.includes(randomNPC.id)) {
                this.encounterQueue.push(randomNPC.id);
            }
        }
        
        // Generate new NPCs if pool is getting low
        if (this.gameState.data.npcs.customers.size < 20) {
            this.generateMoreNPCs(10);
        }
        
        this.eventBus.emit('npc.dailyEncountersGenerated', {
            count: this.encounterQueue.length,
            encounters: this.encounterQueue
        });
        
        console.log(`👥 Generated ${this.encounterQueue.length} encounters for today`);
    }

    shouldNPCVisitToday(npc) {
        // Base probability modified by archetype frequency
        let probability = 0.3 * npc.frequencyModifier;
        
        // Relationship modifier
        if (npc.relationshipLevel === 'regular') probability *= 1.5;
        if (npc.relationshipLevel === 'friend') probability *= 2.0;
        if (npc.relationshipLevel === 'vip') probability *= 2.5;
        
        // Recency modifier (less likely if visited recently)
        const daysSinceLastVisit = this.gameState.data.time.currentDay - npc.lastVisit;
        if (daysSinceLastVisit < 2) probability *= 0.3;
        else if (daysSinceLastVisit < 5) probability *= 0.7;
        
        return Math.random() < probability;
    }

    getNextCustomer() {
        if (this.encounterQueue.length === 0) {
            return null;
        }
        
        const npcId = this.encounterQueue.shift();
        const npc = this.gameState.data.npcs.customers.get(npcId);
        
        if (!npc) {
            return this.getNextCustomer(); // Try next in queue
        }
        
        // Update visit statistics
        npc.visitCount++;
        npc.lastVisit = this.gameState.data.time.currentDay;
        npc.lastInteraction = Date.now();
        
        // Trigger enrichment if not already done
        if (!npc.isEnriched) {
            this.enrichNPC(npcId);
        }
        
        this.eventBus.emit('npc.customerEntered', { npc });
        return npc;
    }

    handleEncounter(npcId) {
        const npc = this.gameState.data.npcs.customers.get(npcId);
        if (!npc) return;
        
        // Add to encounter history
        this.gameState.data.npcs.encounterHistory.unshift({
            npcId: npcId,
            timestamp: Date.now(),
            day: this.gameState.data.time.currentDay,
            type: 'customer_visit'
        });
        
        // Keep history manageable
        if (this.gameState.data.npcs.encounterHistory.length > 100) {
            this.gameState.data.npcs.encounterHistory.pop();
        }
        
        this.eventBus.emit('npc.encounterProcessed', { npc });
    }

    // AI Enrichment System
    startBackgroundEnrichment() {
        if (this.isEnriching || this.enrichmentQueue.length === 0) return;
        
        this.isEnriching = true;
        this.processEnrichmentQueue();
    }

    async processEnrichmentQueue() {
        while (this.enrichmentQueue.length > 0) {
            const npcId = this.enrichmentQueue.shift();
            await this.enrichNPCBackground(npcId);
            
            // Add small delay to prevent overwhelming the AI
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        this.isEnriching = false;
    }

    async enrichNPCBackground(npcId) {
        const npc = this.gameState.data.npcs.customers.get(npcId);
        if (!npc || npc.isEnriched) return;
        
        try {
            let enrichmentData;
            
            // Use new AI enhancer if available
            if (this.npcAIEnhancer) {
                enrichmentData = await this.npcAIEnhancer.enrichNPC(npc);
            } else {
                // Fallback to original enrichment
                enrichmentData = await this.generateNPCEnrichment(npc);
            }
            
            this.applyEnrichment(npc, enrichmentData);
            
            console.log(`👥 Enriched NPC: ${npc.name}`);
        } catch (error) {
            console.error('Failed to enrich NPC:', npc.name, error);
        }
    }

    async enrichNPC(npcId) {
        // Immediate enrichment for active encounters
        const npc = this.gameState.data.npcs.customers.get(npcId);
        if (!npc || npc.isEnriched) return npc;
        
        try {
            let enrichmentData;
            
            // Use new AI enhancer if available
            if (this.npcAIEnhancer) {
                enrichmentData = await this.npcAIEnhancer.enrichNPC(npc);
            } else {
                // Fallback to original enrichment
                enrichmentData = await this.generateNPCEnrichment(npc);
            }
            
            this.applyEnrichment(npc, enrichmentData);
            
            this.eventBus.emit('npc.enriched', { npc });
            return npc;
        } catch (error) {
            console.error('Failed to enrich NPC:', npc.name, error);
            return npc;
        }
    }

    async generateNPCEnrichment(npc) {
        const archetype = this.archetypeData[npc.archetype];
        
        const prompt = `Create a detailed character profile for ${npc.name}, a ${npc.age}-year-old ${npc.gender} ${archetype.name}.

Character traits: ${npc.traits.join(', ')}
Interests: ${npc.interests.join(', ')}
Spending power: $${npc.spendingPower}

Generate:
1. A detailed backstory (2-3 sentences)
2. Personality details (quirks, habits, mannerisms)
3. A secret or interesting fact about them
4. Their potential relationship with the store owner
5. Physical appearance description

Keep the tone ${this.gameState.data.meta.adultContentEnabled ? 'mature and potentially flirtatious' : 'friendly and appropriate'}.`;

        const enrichmentText = await this.aiHooks.generateText(prompt);
        
        // Parse AI response (this would need more sophisticated parsing)
        const enrichmentData = this.parseEnrichmentResponse(enrichmentText);
        
        // Generate avatar
        const avatarPrompt = this.buildAvatarPrompt(npc, enrichmentData);
        const avatarUrl = await this.aiHooks.generateImage(avatarPrompt, {
            style: 'portrait',
            quality: 'medium',
            aspectRatio: '1:1'
        });
        
        return {
            ...enrichmentData,
            avatar: avatarUrl
        };
    }

    parseEnrichmentResponse(text) {
        // Simple parsing - in production this would be more sophisticated
        return {
            backstory: "Generated backstory from AI",
            personalityDetails: "Generated personality details",
            secrets: ["Generated secret"],
            historyWithPlayer: "No prior history",
            appearance: {
                description: "Generated appearance description",
                prompt: "Generated avatar prompt"
            }
        };
    }

    buildAvatarPrompt(npc, enrichmentData) {
        const archetype = this.archetypeData[npc.archetype];
        
        let prompt = `${npc.age} year old ${npc.gender} person, ${archetype.name.toLowerCase()}`;
        
        if (enrichmentData.appearance?.description) {
            prompt += `, ${enrichmentData.appearance.description}`;
        }
        
        prompt += ', portrait photo, friendly expression, retail customer, realistic';
        
        return prompt;
    }

    applyEnrichment(npc, enrichmentData) {
        npc.backstory = enrichmentData.backstory || '';
        npc.personalityDetails = enrichmentData.personalityDetails || '';
        npc.secrets = enrichmentData.secrets || [];
        npc.historyWithPlayer = enrichmentData.historyWithPlayer || '';
        npc.avatar = enrichmentData.avatar;
        npc.appearance.description = enrichmentData.appearance?.description || '';
        npc.appearance.prompt = enrichmentData.appearance?.prompt || '';
        npc.enrichmentData = enrichmentData;
        npc.isEnriched = true;
    }

    // NPC Management
    generateMoreNPCs(count) {
        for (let i = 0; i < count; i++) {
            const npc = this.generateBasicNPC();
            if (npc) {
                this.gameState.data.npcs.customers.set(npc.id, npc);
                this.enrichmentQueue.push(npc.id);
            }
        }
        
        // Restart enrichment if needed
        if (!this.isEnriching && this.enrichmentQueue.length > 0) {
            this.startBackgroundEnrichment();
        }
    }

    updateRelationship(npcId, change, reason = '') {
        const npc = this.gameState.data.npcs.customers.get(npcId);
        if (!npc) return;
        
        const oldLevel = npc.relationshipLevel;
        npc.relationship = Math.max(0, Math.min(100, npc.relationship + change));
        
        // Update relationship level
        const newLevel = this.getRelationshipLevel(npc.relationship);
        npc.relationshipLevel = newLevel;
        
        // Track relationship events
        if (oldLevel !== newLevel) {
            this.gameState.data.npcs.relationshipEvents.push({
                npcId: npcId,
                oldLevel: oldLevel,
                newLevel: newLevel,
                timestamp: Date.now(),
                reason: reason
            });
            
            this.eventBus.emit('npc.relationshipLevelChanged', {
                npc: npc,
                oldLevel: oldLevel,
                newLevel: newLevel,
                reason: reason
            });
        }
        
        this.eventBus.emit('npc.relationshipChanged', {
            npc: npc,
            change: change,
            reason: reason
        });
    }

    getRelationshipLevel(points) {
        if (points < 20) return 'stranger';
        if (points < 50) return 'regular';
        if (points < 80) return 'friend';
        return 'vip';
    }

    // Utility Methods
    generateId() {
        return 'npc_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    getNPC(npcId) {
        return this.gameState.data.npcs.customers.get(npcId);
    }

    getAllNPCs() {
        return Array.from(this.gameState.data.npcs.customers.values());
    }

    getEncounteredNPCs() {
        return this.getAllNPCs().filter(npc => npc.visitCount > 0);
    }

    getNPCsByRelationshipLevel(level) {
        return this.getAllNPCs().filter(npc => npc.relationshipLevel === level);
    }

    searchNPCs(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllNPCs().filter(npc => 
            npc.name.toLowerCase().includes(lowerQuery) ||
            npc.archetype.toLowerCase().includes(lowerQuery) ||
            npc.traits.some(trait => trait.toLowerCase().includes(lowerQuery))
        );
    }

    // NPC Registry for Work Computer
    getNPCRegistry() {
        return {
            total: this.gameState.data.npcs.customers.size,
            encountered: this.getEncounteredNPCs().length,
            byLevel: {
                stranger: this.getNPCsByRelationshipLevel('stranger').length,
                regular: this.getNPCsByRelationshipLevel('regular').length,
                friend: this.getNPCsByRelationshipLevel('friend').length,
                vip: this.getNPCsByRelationshipLevel('vip').length
            },
            recentEncounters: this.gameState.data.npcs.encounterHistory.slice(0, 10),
            topRelationships: this.getAllNPCs()
                .sort((a, b) => b.relationship - a.relationship)
                .slice(0, 10)
        };
    }

    // Handle enriched NPC data from AI enhancer
    onNPCEnriched(data) {
        const { npc } = data;
        console.log(`✨ NPC ${npc.name} has been enriched with AI data`);
        
        // Update Customer Relations app if open
        if (typeof customerRelationsApp !== 'undefined' && customerRelationsApp.isOpen) {
            customerRelationsApp.refreshNPCData();
        }
    }

    // Apply enrichment data (handles both old and new format)
    applyEnrichment(npc, enrichmentData) {
        if (!enrichmentData) return;

        // Handle new AI enhancer format
        if (enrichmentData.aiEnriched) {
            npc.backstory = enrichmentData.backstory || npc.backstory;
            npc.personalityTraits = enrichmentData.personalityTraits || {};
            npc.behaviorPatterns = enrichmentData.behaviorPatterns || {};
            npc.secrets = enrichmentData.secrets || [];
            npc.relationshipData = enrichmentData.relationshipData || {};
            npc.profileImagePrompt = enrichmentData.profileImagePrompt || '';
            npc.enrichmentData = enrichmentData;
            npc.isEnriched = true;
            npc.aiEnhanced = true;
        } else {
            // Handle legacy format
            npc.backstory = enrichmentData.backstory || npc.backstory;
            npc.personalityDetails = enrichmentData.personalityDetails || '';
            npc.secrets = enrichmentData.secrets || [];
            npc.historyWithPlayer = enrichmentData.historyWithPlayer || '';
            npc.appearance = enrichmentData.appearance || npc.appearance;
            npc.avatar = enrichmentData.avatar || npc.avatar;
            npc.isEnriched = true;
        }

        // Update timestamps
        npc.lastEnrichment = Date.now();
    }

    // Update NPC data (for external use by AI enhancer)
    updateNPC(updatedNPC) {
        if (!updatedNPC.id) return;
        
        const existingNPC = this.gameState.data.npcs.customers.get(updatedNPC.id);
        if (existingNPC) {
            // Merge the updates
            Object.assign(existingNPC, updatedNPC);
            console.log(`📝 Updated NPC: ${existingNPC.name}`);
        }
    }

    // Queue NPC for background enrichment
    queueNPCForEnrichment(npc) {
        if (this.npcAIEnhancer && !npc.isEnriched) {
            this.npcAIEnhancer.addToEnrichmentQueue(npc);
        } else if (!this.enrichmentQueue.includes(npc.id)) {
            this.enrichmentQueue.push(npc.id);
        }
    }

    // Generate profile image for NPC
    async generateNPCProfileImage(npc) {
        if (!this.aiHooks || npc.avatar) return npc.avatar;

        try {
            const prompt = npc.profileImagePrompt || this.buildAvatarPrompt(npc);
            const imageUrl = await this.aiHooks.generateImage(prompt, {
                style: 'portrait',
                quality: 'medium',
                aspectRatio: '1:1'
            });

            npc.avatar = imageUrl;
            return imageUrl;
        } catch (error) {
            console.error(`❌ Failed to generate profile image for ${npc.name}:`, error);
            return null;
        }
    }

    // Debug and Testing
    debugInfo() {
        return {
            totalNPCs: this.gameState.data.npcs.customers.size,
            enrichmentQueue: this.enrichmentQueue.length,
            encounterQueue: this.encounterQueue.length,
            isEnriching: this.isEnriching,
            archetypes: Object.keys(this.archetypeData)
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPCSystem;
} else if (typeof window !== 'undefined') {
    window.NPCSystem = NPCSystem;
}
