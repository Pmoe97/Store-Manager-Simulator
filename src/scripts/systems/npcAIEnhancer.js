// NPC AI Enhancement System - Phase 4A
class NPCAIEnhancer {
    constructor() {
        this.aiHooks = null;
        this.initialized = false;
        this.enrichmentQueue = [];
        this.isProcessing = false;
        this.personalityTags = this.initializePersonalityTags();
        this.archetypes = this.initializeArchetypes();
        this.backstoryTemplates = this.initializeBackstoryTemplates();
    }

    // Initialize the enhancement system
    initialize(aiHooks) {
        this.aiHooks = aiHooks;
        this.initialized = true;
        console.log('🧠 NPC AI Enhancer initialized');
    }

    // Personality tags for NPCs
    initializePersonalityTags() {
        return {
            social: ['outgoing', 'shy', 'charismatic', 'awkward', 'confident', 'insecure', 'friendly', 'aloof'],
            economic: ['frugal', 'spendthrift', 'bargain-hunter', 'luxury-lover', 'practical', 'impulsive', 'careful', 'generous'],
            emotional: ['cheerful', 'grumpy', 'anxious', 'calm', 'dramatic', 'stoic', 'empathetic', 'cold'],
            behavioral: ['punctual', 'chronically-late', 'organized', 'chaotic', 'perfectionist', 'laid-back', 'detail-oriented', 'big-picture'],
            quirks: ['germaphobe', 'tech-savvy', 'old-fashioned', 'environmentalist', 'foodie', 'fitness-enthusiast', 'bookworm', 'gossip'],
            flaws: ['impatient', 'judgmental', 'indecisive', 'stubborn', 'vain', 'pessimistic', 'jealous', 'manipulative']
        };
    }

    // NPC archetypes with enhanced properties
    initializeArchetypes() {
        return {
            'college-student': {
                ageRange: [18, 24],
                spendingPower: 'low',
                commonTags: ['budget-conscious', 'tech-savvy', 'social', 'impulsive'],
                backstoryThemes: ['education', 'part-time-jobs', 'social-life', 'financial-struggles'],
                preferredProducts: ['snacks', 'energy-drinks', 'cheap-meals', 'electronics'],
                relationshipStyle: 'casual'
            },
            'business-professional': {
                ageRange: [25, 55],
                spendingPower: 'high',
                commonTags: ['time-conscious', 'quality-focused', 'organized', 'ambitious'],
                backstoryThemes: ['career', 'networking', 'efficiency', 'stress-management'],
                preferredProducts: ['premium-items', 'convenience-foods', 'office-supplies'],
                relationshipStyle: 'professional'
            },
            'suburban-parent': {
                ageRange: [28, 50],
                spendingPower: 'medium',
                commonTags: ['family-oriented', 'practical', 'budget-conscious', 'caring'],
                backstoryThemes: ['parenting', 'household-management', 'work-life-balance'],
                preferredProducts: ['family-items', 'bulk-purchases', 'healthy-options'],
                relationshipStyle: 'friendly'
            },
            'retiree': {
                ageRange: [60, 85],
                spendingPower: 'variable',
                commonTags: ['traditional', 'experienced', 'particular', 'social'],
                backstoryThemes: ['retirement', 'grandchildren', 'health', 'hobbies'],
                preferredProducts: ['traditional-items', 'health-products', 'comfort-foods'],
                relationshipStyle: 'warm'
            },
            'local-regular': {
                ageRange: [20, 70],
                spendingPower: 'medium',
                commonTags: ['loyal', 'opinionated', 'community-minded', 'familiar'],
                backstoryThemes: ['local-community', 'routine', 'neighborhood-watch'],
                preferredProducts: ['regular-items', 'seasonal-specials'],
                relationshipStyle: 'established'
            },
            'tourist': {
                ageRange: [18, 65],
                spendingPower: 'variable',
                commonTags: ['curious', 'temporary', 'adventurous', 'unfamiliar'],
                backstoryThemes: ['travel', 'exploration', 'temporary-stay'],
                preferredProducts: ['souvenirs', 'travel-essentials', 'local-specialties'],
                relationshipStyle: 'brief'
            }
        };
    }

    // Backstory templates for AI generation
    initializeBackstoryTemplates() {
        return {
            basic: "Create a detailed backstory for {name}, a {age}-year-old {archetype}. Include their background, current situation, personality traits, and what brings them to this store. Make them feel like a real person with genuine motivations and quirks.",
            
            relationship: "Develop the relationship history between {name} and the store owner. How did they first meet? What interactions have they had? What is their current relationship status and how might it evolve?",
            
            lifestyle: "Describe {name}'s daily life, living situation, work/education, hobbies, and social circle. What are their routines, challenges, and aspirations? How does this affect their shopping habits?",
            
            personality: "Detail {name}'s personality, including their communication style, emotional patterns, decision-making process, and social preferences. What makes them unique? What are their strengths and flaws?",
            
            secrets: "What secrets, hidden motivations, or unexpected aspects does {name} have? This could include past experiences, current struggles, secret talents, or surprising connections."
        };
    }

    // Enrich an existing NPC with AI-generated content
    async enrichNPC(npcData) {
        if (!this.initialized || !this.aiHooks) {
            console.warn('⚠️ NPC AI Enhancer not initialized');
            return npcData;
        }

        console.log(`🧠 Enriching NPC: ${npcData.name}`);

        try {
            // Generate enhanced backstory
            const backstory = await this.generateBackstory(npcData);
            
            // Generate personality traits
            const personality = await this.generatePersonalityTraits(npcData);
            
            // Generate behavioral patterns
            const behaviorPatterns = await this.generateBehaviorPatterns(npcData);
            
            // Generate secrets and hidden motivations
            const secrets = await this.generateSecrets(npcData);
            
            // Generate relationship potential
            const relationshipData = await this.generateRelationshipData(npcData);
            
            // Generate profile picture prompt
            const profileImagePrompt = await this.generateProfileImagePrompt(npcData);

            // Merge all enhancements
            const enrichedNPC = {
                ...npcData,
                backstory: backstory,
                personalityTraits: personality,
                behaviorPatterns: behaviorPatterns,
                secrets: secrets,
                relationshipData: relationshipData,
                profileImagePrompt: profileImagePrompt,
                aiEnriched: true,
                enrichmentDate: new Date().toISOString()
            };

            console.log(`✅ Successfully enriched NPC: ${npcData.name}`);
            return enrichedNPC;

        } catch (error) {
            console.error(`❌ Failed to enrich NPC ${npcData.name}:`, error);
            return npcData; // Return original data if enrichment fails
        }
    }

    // Generate detailed backstory
    async generateBackstory(npcData) {
        const archetype = this.archetypes[npcData.archetype] || this.archetypes['local-regular'];
        
        const prompt = `Create a detailed, realistic backstory for ${npcData.name}, a ${npcData.age}-year-old ${npcData.archetype}.

Character Details:
- Gender: ${npcData.gender}
- Age: ${npcData.age}
- Archetype: ${npcData.archetype}
- Spending Power: ${archetype.spendingPower}

Include:
1. Background & upbringing
2. Current life situation (work, living, relationships)
3. What brings them to this particular store
4. Key life experiences that shaped them
5. Current goals and motivations

Make this person feel real and relatable. Write 3-4 paragraphs in a conversational tone.`;

        try {
            const response = await this.aiHooks.generateText(prompt, {
                maxLength: 800,
                temperature: 0.8
            });

            return response || this.getFallbackBackstory(npcData);
        } catch (error) {
            console.error('❌ Backstory generation failed:', error);
            return this.getFallbackBackstory(npcData);
        }
    }

    // Generate personality traits
    async generatePersonalityTraits(npcData) {
        const archetype = this.archetypes[npcData.archetype] || this.archetypes['local-regular'];
        
        const prompt = `Analyze ${npcData.name} and assign specific personality traits from these categories:

Social: ${this.personalityTags.social.join(', ')}
Economic: ${this.personalityTags.economic.join(', ')}
Emotional: ${this.personalityTags.emotional.join(', ')}
Behavioral: ${this.personalityTags.behavioral.join(', ')}
Quirks: ${this.personalityTags.quirks.join(', ')}
Flaws: ${this.personalityTags.flaws.join(', ')}

For ${npcData.name} (${npcData.archetype}, age ${npcData.age}):
1. Select 2-3 traits from each category that fit their archetype
2. Explain why each trait fits their character
3. Describe how these traits affect their behavior in the store

Format as JSON: {"social": ["trait1", "trait2"], "economic": ["trait1"], ...}`;

        try {
            const response = await this.aiHooks.generateText(prompt, {
                maxLength: 600,
                temperature: 0.7
            });

            // Try to parse JSON response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback: extract traits from text
            return this.parseTraitsFromText(response, npcData);
        } catch (error) {
            console.error('❌ Personality traits generation failed:', error);
            return this.getFallbackPersonalityTraits(npcData);
        }
    }

    // Generate behavior patterns
    async generateBehaviorPatterns(npcData) {
        const prompt = `Describe the behavioral patterns for ${npcData.name} when they visit the store:

1. Shopping Habits:
   - How often do they visit?
   - What time of day do they prefer?
   - How do they navigate the store?
   - Do they have a shopping list or browse?

2. Social Behavior:
   - How do they interact with store staff?
   - Are they chatty or prefer quick transactions?
   - How do they handle waiting in lines?
   - Do they engage with other customers?

3. Decision Making:
   - How quickly do they make purchases?
   - Do they compare prices or brands?
   - Are they influenced by recommendations?
   - How do they handle new products?

4. Payment & Checkout:
   - Preferred payment method
   - Do they check receipts carefully?
   - How do they handle pricing errors?

Keep responses realistic for a ${npcData.age}-year-old ${npcData.archetype}.`;

        try {
            const response = await this.aiHooks.generateText(prompt, {
                maxLength: 700,
                temperature: 0.7
            });

            return this.parseBehaviorPatterns(response);
        } catch (error) {
            console.error('❌ Behavior patterns generation failed:', error);
            return this.getFallbackBehaviorPatterns(npcData);
        }
    }

    // Generate secrets and hidden motivations
    async generateSecrets(npcData) {
        const prompt = `Create 2-3 interesting secrets or hidden aspects for ${npcData.name}:

These should be:
- Realistic and believable for their archetype (${npcData.archetype})
- Not overly dramatic unless it fits their character
- Something that could potentially come up in conversations
- Could affect their relationship with the store owner

Examples:
- Hidden talents or skills
- Past experiences they don't talk about
- Current struggles or challenges
- Surprising connections or relationships
- Secret hobbies or interests
- Financial situations different from what they appear

Make each secret 1-2 sentences. Focus on depth over drama.`;

        try {
            const response = await this.aiHooks.generateText(prompt, {
                maxLength: 400,
                temperature: 0.8
            });

            return this.parseSecrets(response);
        } catch (error) {
            console.error('❌ Secrets generation failed:', error);
            return this.getFallbackSecrets(npcData);
        }
    }

    // Generate relationship data
    async generateRelationshipData(npcData) {
        const prompt = `Define the relationship potential between ${npcData.name} and the store owner:

1. Initial Relationship:
   - How they first met or might meet
   - First impressions (both ways)
   - Initial relationship level (stranger, acquaintance, etc.)

2. Relationship Trajectory:
   - How the relationship could develop
   - What factors would improve the relationship
   - What could damage the relationship
   - Potential romantic interest (if appropriate)

3. Relationship Milestones:
   - Key events that could strengthen bonds
   - Conversation topics they'd enjoy
   - Favors or help they might exchange
   - Conflict resolution style

4. Long-term Potential:
   - Could they become a close friend?
   - Business partnership possibilities?
   - Romantic relationship potential?
   - How they'd support the store owner

Consider their archetype (${npcData.archetype}) and age (${npcData.age}).`;

        try {
            const response = await this.aiHooks.generateText(prompt, {
                maxLength: 600,
                temperature: 0.7
            });

            return this.parseRelationshipData(response);
        } catch (error) {
            console.error('❌ Relationship data generation failed:', error);
            return this.getFallbackRelationshipData(npcData);
        }
    }

    // Generate profile image prompt for AI image generation
    async generateProfileImagePrompt(npcData) {
        const archetype = this.archetypes[npcData.archetype] || this.archetypes['local-regular'];
        
        const prompt = `Create a detailed image generation prompt for ${npcData.name}'s profile picture:

Character: ${npcData.age}-year-old ${npcData.gender} ${npcData.archetype}

Include:
- Physical appearance appropriate for their age and archetype
- Clothing style that fits their lifestyle
- Facial expression that reflects their personality
- Setting/background that suits their character
- Professional headshot style for a customer database

Make it specific enough for consistent AI image generation, but natural and realistic.
Focus on: age-appropriate appearance, archetype-fitting style, approachable expression.

Format: "Portrait of [detailed description], professional headshot style, good lighting, [background]"`;

        try {
            const response = await this.aiHooks.generateText(prompt, {
                maxLength: 300,
                temperature: 0.6
            });

            return response.trim() || this.getFallbackImagePrompt(npcData);
        } catch (error) {
            console.error('❌ Image prompt generation failed:', error);
            return this.getFallbackImagePrompt(npcData);
        }
    }

    // Parse behavior patterns from text response
    parseBehaviorPatterns(text) {
        const patterns = {
            shopping: {},
            social: {},
            decisionMaking: {},
            payment: {}
        };

        // Extract information using regex patterns
        const sections = {
            shopping: /Shopping Habits?:?\s*([\s\S]*?)(?=Social Behavior|$)/i,
            social: /Social Behavior:?\s*([\s\S]*?)(?=Decision Making|$)/i,
            decisionMaking: /Decision Making:?\s*([\s\S]*?)(?=Payment|$)/i,
            payment: /Payment.*?:?\s*([\s\S]*?)$/i
        };

        for (const [key, regex] of Object.entries(sections)) {
            const match = text.match(regex);
            if (match) {
                patterns[key].description = match[1].trim();
            }
        }

        return patterns;
    }

    // Parse secrets from text response
    parseSecrets(text) {
        const secrets = [];
        const lines = text.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            if (line.includes('-') || line.match(/^\d+\./)) {
                const secret = line.replace(/^[-\d.\s]*/, '').trim();
                if (secret.length > 10) {
                    secrets.push(secret);
                }
            }
        }

        return secrets.slice(0, 3); // Limit to 3 secrets
    }

    // Parse relationship data from text response
    parseRelationshipData(text) {
        return {
            initialMeeting: this.extractSection(text, 'Initial Relationship'),
            trajectory: this.extractSection(text, 'Relationship Trajectory'),
            milestones: this.extractSection(text, 'Relationship Milestones'),
            longTermPotential: this.extractSection(text, 'Long-term Potential'),
            rawData: text
        };
    }

    // Extract specific sections from text
    extractSection(text, sectionName) {
        const regex = new RegExp(`${sectionName}:?\\s*([\\s\\S]*?)(?=\\d+\\.|$)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : '';
    }

    // Parse personality traits from text when JSON parsing fails
    parseTraitsFromText(text, npcData) {
        const traits = {
            social: [],
            economic: [],
            emotional: [],
            behavioral: [],
            quirks: [],
            flaws: []
        };

        // Extract traits mentioned in the text
        for (const [category, tagList] of Object.entries(this.personalityTags)) {
            for (const tag of tagList) {
                if (text.toLowerCase().includes(tag.toLowerCase())) {
                    traits[category].push(tag);
                }
            }
        }

        // Ensure each category has at least one trait
        for (const [category, tagList] of Object.entries(this.personalityTags)) {
            if (traits[category].length === 0) {
                const archetype = this.archetypes[npcData.archetype];
                if (archetype && archetype.commonTags) {
                    const matching = tagList.filter(tag => 
                        archetype.commonTags.some(common => common.includes(tag))
                    );
                    if (matching.length > 0) {
                        traits[category].push(matching[0]);
                    } else {
                        traits[category].push(tagList[Math.floor(Math.random() * tagList.length)]);
                    }
                }
            }
        }

        return traits;
    }

    // Fallback methods for when AI generation fails
    getFallbackBackstory(npcData) {
        const archetype = this.archetypes[npcData.archetype] || this.archetypes['local-regular'];
        
        return `${npcData.name} is a ${npcData.age}-year-old ${npcData.archetype} who has become a familiar face around the neighborhood. They have a ${archetype.spendingPower} income and tend to shop for ${archetype.preferredProducts.join(', ')}. While their full story remains to be discovered, they seem like someone who values ${archetype.relationshipStyle} relationships and brings their own unique perspective to every interaction.`;
    }

    getFallbackPersonalityTraits(npcData) {
        const archetype = this.archetypes[npcData.archetype] || this.archetypes['local-regular'];
        
        return {
            social: [archetype.commonTags[0] || 'friendly'],
            economic: [archetype.commonTags[1] || 'practical'],
            emotional: ['calm'],
            behavioral: ['organized'],
            quirks: ['observant'],
            flaws: ['impatient']
        };
    }

    getFallbackBehaviorPatterns(npcData) {
        return {
            shopping: { description: 'Regular shopping patterns, prefers familiar routines' },
            social: { description: 'Polite and courteous interactions with staff' },
            decisionMaking: { description: 'Takes time to consider purchases carefully' },
            payment: { description: 'Prefers traditional payment methods' }
        };
    }

    getFallbackSecrets(npcData) {
        return [
            `Has a hidden talent that surprises people when they discover it`,
            `Struggling with a personal challenge they don't discuss openly`
        ];
    }

    getFallbackRelationshipData(npcData) {
        return {
            initialMeeting: 'Met as a regular customer, polite first interaction',
            trajectory: 'Could develop into a friendly acquaintance with time',
            milestones: 'Building trust through consistent positive interactions',
            longTermPotential: 'Potential for lasting friendship based on mutual respect'
        };
    }

    getFallbackImagePrompt(npcData) {
        return `Portrait of a ${npcData.age}-year-old ${npcData.gender}, professional headshot style, friendly expression, good lighting, neutral background`;
    }

    // Queue management for background enrichment
    addToEnrichmentQueue(npcData) {
        if (!this.enrichmentQueue.find(npc => npc.id === npcData.id)) {
            this.enrichmentQueue.push(npcData);
            console.log(`📋 Added ${npcData.name} to enrichment queue`);
        }
    }

    // Process enrichment queue in background
    async processEnrichmentQueue() {
        if (this.isProcessing || this.enrichmentQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        console.log(`🔄 Processing ${this.enrichmentQueue.length} NPCs in enrichment queue`);

        while (this.enrichmentQueue.length > 0) {
            const npc = this.enrichmentQueue.shift();
            try {
                const enrichedNPC = await this.enrichNPC(npc);
                
                // Update NPC in the system
                if (typeof npcSystem !== 'undefined') {
                    npcSystem.updateNPC(enrichedNPC);
                }

                // Notify other systems
                if (typeof gameEventBus !== 'undefined') {
                    gameEventBus.emit('npc.enriched', { npc: enrichedNPC });
                }

                // Brief pause between enrichments to avoid overwhelming the AI
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`❌ Failed to process ${npc.name}:`, error);
            }
        }

        this.isProcessing = false;
        console.log('✅ Enrichment queue processing complete');
    }

    // Start background enrichment process
    startBackgroundEnrichment() {
        setInterval(() => {
            this.processEnrichmentQueue();
        }, 30000); // Process queue every 30 seconds

        console.log('🔄 Background NPC enrichment started');
    }
}

// Initialize global instance
const npcAIEnhancer = new NPCAIEnhancer();

// Auto-initialize when AI hooks are available
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof aiHooks !== 'undefined') {
            npcAIEnhancer.initialize(aiHooks);
            npcAIEnhancer.startBackgroundEnrichment();
        }
    }, 1000);
});
