/**
 * Event AI Generator - Phase 4C Implementation
 * Generates dynamic events, news, scenarios, and random occurrences
 * Creates contextual challenges and opportunities for the store
 */

class EventAIGenerator {
    constructor() {
        this.gameState = null;
        this.aiHooks = null;
        this.timeSystem = null;
        this.npcSystem = null;
        this.eventHistory = [];
        this.scheduledEvents = [];
        this.eventTemplates = new Map();
        this.triggerConditions = new Map();
        this.lastEventTime = 0;
        this.eventCooldown = 300000; // 5 minutes between major events
        this.newsRotation = [];
        this.seasonalEvents = new Map();
    }

    initialize(gameState, aiHooks, timeSystem, npcSystem) {
        this.gameState = gameState;
        this.aiHooks = aiHooks;
        this.timeSystem = timeSystem;
        this.npcSystem = npcSystem;
        
        this.loadEventTemplates();
        this.setupTriggerConditions();
        this.loadSeasonalEvents();
        this.startEventGeneration();
        
        console.log('🎭 Event AI Generator initialized');
    }

    // Load comprehensive event generation templates
    loadEventTemplates() {
        this.eventPrompts = {
            // Random business events
            businessEvent: {
                template: `Generate a realistic business event for a {storeType} store.
                
                Store context:
                - Owner experience level: {ownerLevel}
                - Store reputation: {storeReputation}
                - Financial status: {financialStatus}
                - Staff count: {staffCount}
                - Customer base: {customerBase}
                
                Current challenges:
                - Debt level: {debtLevel}
                - Competition: {competitionLevel}
                - Market conditions: {marketConditions}
                
                Event type preference: {eventType}
                Severity level: {severityLevel}
                Time of year: {season}
                Local context: {localContext}
                
                Generate a business event that:
                1. Fits the store's current situation
                2. Creates meaningful gameplay choices
                3. Has realistic consequences
                4. Can be resolved through player action
                5. Affects store operations or relationships
                
                Include:
                - Event title (2-6 words)
                - Description (2-4 sentences)
                - Immediate effects
                - Required player response
                - Potential outcomes (positive/negative)
                
                Make it feel realistic and engaging. Consider supply issues, 
                staff problems, customer situations, financial opportunities, 
                regulatory issues, or competitor actions.`,
                
                categories: [
                    'supply_chain', 'staff_drama', 'customer_incident', 
                    'financial_opportunity', 'regulatory_issue', 'competition',
                    'equipment_failure', 'weather_impact', 'social_media_crisis'
                ]
            },

            // Local news and community events
            localNews: {
                template: `Generate local news relevant to a small business owner.
                
                Location context:
                - Community type: {communityType}
                - Economic status: {economicStatus}
                - Population: {populationSize}
                - Local culture: {localCulture}
                
                News categories to consider:
                - Local business developments
                - Community events and festivals
                - Economic changes affecting small business
                - New regulations or policies
                - Weather and seasonal impacts
                - Crime and safety issues
                - Infrastructure and development
                
                Current store situation: {storeSituation}
                Player interests: {playerInterests}
                Recent local history: {recentNews}
                
                Generate local news that:
                1. Affects or could affect the store business
                2. Creates opportunities for player engagement
                3. Feels realistic for the community size
                4. Connects to current game state
                5. Provides context for future events
                
                Include:
                - News headline (5-10 words)
                - Brief article (3-5 sentences)
                - Business impact (how it affects the store)
                - Player opportunities (actions they could take)
                
                Make it feel like real local journalism with appropriate scope.`,
                
                types: [
                    'economic_development', 'community_festival', 'infrastructure',
                    'crime_report', 'weather_warning', 'policy_change',
                    'business_opening', 'cultural_event', 'public_safety'
                ]
            },

            // Customer incidents and scenarios
            customerIncident: {
                template: `Generate a customer incident scenario for immediate resolution.
                
                Store context:
                - Current customer count: {customerCount}
                - Store atmosphere: {storeAtmosphere}
                - Staff on duty: {staffOnDuty}
                - Store reputation: {storeReputation}
                - Time of day: {timeOfDay}
                
                Incident type: {incidentType}
                Severity level: {severityLevel}
                
                Customer details:
                - Primary customer archetype: {primaryCustomer}
                - Secondary customers involved: {secondaryCustomers}
                - Customer mood factors: {moodFactors}
                
                Environmental factors:
                - Store busyness: {storeBusyness}
                - Weather conditions: {weatherConditions}
                - Recent store events: {recentEvents}
                
                Generate a customer incident that:
                1. Requires immediate player attention
                2. Has multiple resolution options
                3. Affects store atmosphere and other customers
                4. Has realistic consequences for relationships
                5. Tests the player's customer service skills
                
                Include:
                - Incident description (what's happening)
                - Customer emotions and motivations
                - Immediate impact on store
                - Available response options
                - Potential consequences of each option
                
                Make it feel like a real customer service challenge with personality.`,
                
                types: [
                    'argument_between_customers', 'product_complaint', 'theft_accusation',
                    'payment_dispute', 'inappropriate_behavior', 'emergency_situation',
                    'return_fraud_attempt', 'aggressive_negotiation', 'romantic_drama'
                ]
            },

            // Staff drama and workplace scenarios
            staffDrama: {
                template: `Generate a staff-related drama or workplace issue.
                
                Staff context:
                - Staff member: {staffMember}
                - Role: {staffRole}
                - Personality: {staffPersonality}
                - Employment duration: {employmentDuration}
                - Performance level: {performanceLevel}
                
                Workplace dynamics:
                - Team size: {teamSize}
                - Other staff personalities: {otherStaff}
                - Recent workplace tensions: {recentTensions}
                - Store pressure levels: {storePressure}
                
                Drama type: {dramaType}
                Complexity level: {complexityLevel}
                
                External factors:
                - Staff member's personal situation: {personalSituation}
                - Store financial pressure: {financialPressure}
                - Customer complaints about staff: {customerFeedback}
                
                Generate a staff drama that:
                1. Involves realistic workplace conflicts
                2. Requires manager intervention
                3. Has multiple resolution approaches
                4. Affects store operations if unresolved
                5. Builds character relationships and depth
                
                Include:
                - Situation description
                - Staff emotions and motivations
                - Impact on other employees
                - Management options available
                - Consequences of different approaches
                
                Focus on realistic workplace issues: personality conflicts, 
                performance problems, personal issues affecting work, 
                policy violations, or relationship complications.`,
                
                types: [
                    'personality_conflict', 'performance_issue', 'policy_violation',
                    'personal_problems', 'workplace_romance', 'theft_suspicion',
                    'schedule_conflict', 'customer_complaint', 'promotion_request'
                ]
            },

            // Financial opportunities and challenges
            financialEvent: {
                template: `Generate a financial opportunity or challenge.
                
                Financial context:
                - Current cash flow: {cashFlow}
                - Debt situation: {debtSituation}
                - Monthly expenses: {monthlyExpenses}
                - Revenue trends: {revenueTrends}
                
                Business metrics:
                - Store profitability: {profitability}
                - Growth trajectory: {growthTrajectory}
                - Market position: {marketPosition}
                - Risk tolerance: {riskTolerance}
                
                Event type: {eventType}
                Risk level: {riskLevel}
                Time sensitivity: {timeSensitivity}
                
                External factors:
                - Economic climate: {economicClimate}
                - Local market conditions: {marketConditions}
                - Competitor actions: {competitorActions}
                - Seasonal factors: {seasonalFactors}
                
                Generate a financial event that:
                1. Presents a realistic business decision
                2. Has clear risk/reward trade-offs
                3. Fits the store's current financial situation
                4. Creates meaningful strategic choices
                5. Has long-term consequences for the business
                
                Include:
                - Opportunity/challenge description
                - Financial requirements and potential returns
                - Risk factors and mitigation strategies
                - Decision timeline and consequences
                - Impact on store operations
                
                Consider: investment opportunities, loan offers, supplier deals,
                equipment purchases, expansion opportunities, tax issues,
                insurance claims, or unexpected expenses.`,
                
                types: [
                    'investment_opportunity', 'loan_offer', 'supplier_deal',
                    'equipment_upgrade', 'expansion_opportunity', 'tax_audit',
                    'insurance_claim', 'unexpected_expense', 'revenue_opportunity'
                ]
            },

            // Social media and reputation events
            socialMediaEvent: {
                template: `Generate a social media event affecting the store's reputation.
                
                Store's online presence:
                - Current reputation: {onlineReputation}
                - Social media activity: {socialMediaActivity}
                - Customer review trends: {reviewTrends}
                - Online engagement level: {engagementLevel}
                
                Event trigger:
                - Triggering incident: {triggeringIncident}
                - Platform involved: {platform}
                - Initial poster: {initialPoster}
                - Visibility level: {visibilityLevel}
                
                Content factors:
                - Post tone: {postTone}
                - Accuracy of claims: {accuracy}
                - Viral potential: {viralPotential}
                - Community response pattern: {communityResponse}
                
                Store context:
                - Recent customer interactions: {recentInteractions}
                - Staff behavior patterns: {staffBehavior}
                - Store policies: {storePolicies}
                - Previous online incidents: {previousIncidents}
                
                Generate a social media event that:
                1. Feels authentic to modern social media dynamics
                2. Creates reputation management challenges
                3. Offers multiple response strategies
                4. Has realistic spread and impact patterns
                5. Tests crisis communication skills
                
                Include:
                - Initial post content and platform
                - Community reaction patterns
                - Business impact (immediate and potential)
                - Response options for the store owner
                - Potential outcomes of different strategies
                
                Consider reviews, viral posts, influencer mentions, complaints,
                praise, misinformation, or social movements affecting business.`,
                
                platforms: ['Facebook', 'Twitter', 'Instagram', 'Yelp', 'Google Reviews', 'TikTok'],
                types: [
                    'negative_review', 'viral_complaint', 'positive_mention',
                    'influencer_visit', 'policy_criticism', 'staff_behavior',
                    'pricing_controversy', 'community_support', 'misinformation'
                ]
            },

            // Emergency and crisis scenarios
            emergencyEvent: {
                template: `Generate an emergency situation requiring immediate response.
                
                Emergency context:
                - Emergency type: {emergencyType}
                - Severity level: {severityLevel}
                - Time of occurrence: {timeOfOccurrence}
                - Location: {emergencyLocation}
                
                Store situation:
                - People present: {peoplePresent}
                - Staff available: {staffAvailable}
                - Store layout factors: {storeLayout}
                - Safety equipment available: {safetyEquipment}
                
                Response factors:
                - Emergency services availability: {emergencyServices}
                - Community support: {communitySupport}
                - Insurance coverage: {insuranceCoverage}
                - Legal implications: {legalImplications}
                
                Immediate risks:
                - Physical safety concerns: {safetyRisks}
                - Property damage potential: {damageRisk}
                - Business disruption: {businessRisk}
                - Legal liability: {legalRisk}
                
                Generate an emergency that:
                1. Requires immediate decision-making
                2. Has clear safety priorities
                3. Tests crisis management skills
                4. Has realistic emergency response options
                5. Creates lasting consequences for the business
                
                Include:
                - Emergency description and immediate dangers
                - People and property at risk
                - Available response options
                - Resource requirements for each option
                - Short-term and long-term consequences
                
                Focus on realistic emergencies: medical emergencies, fires,
                flooding, power outages, security threats, accidents,
                or natural disasters affecting the store.`,
                
                types: [
                    'medical_emergency', 'fire_hazard', 'flooding', 'power_outage',
                    'security_threat', 'accident', 'natural_disaster', 'chemical_spill',
                    'structural_damage', 'gas_leak'
                ]
            }
        };

        console.log('📋 Event templates loaded:', Object.keys(this.eventPrompts).length);
    }

    // Setup conditions that trigger different types of events
    setupTriggerConditions() {
        // Business events triggered by store conditions
        this.triggerConditions.set('low_cash', {
            condition: () => this.gameState.finance.cash < 1000,
            eventTypes: ['financialEvent'],
            priority: 'high',
            cooldown: 3600000 // 1 hour
        });

        this.triggerConditions.set('high_debt', {
            condition: () => this.gameState.finance.totalDebt > this.gameState.finance.cash * 3,
            eventTypes: ['financialEvent', 'businessEvent'],
            priority: 'high',
            cooldown: 7200000 // 2 hours
        });

        this.triggerConditions.set('staff_overworked', {
            condition: () => this.gameState.staff.some(s => s.morale < 30),
            eventTypes: ['staffDrama'],
            priority: 'medium',
            cooldown: 1800000 // 30 minutes
        });

        this.triggerConditions.set('low_reputation', {
            condition: () => this.gameState.store.reputation < 40,
            eventTypes: ['socialMediaEvent', 'customerIncident'],
            priority: 'medium',
            cooldown: 3600000 // 1 hour
        });

        this.triggerConditions.set('busy_store', {
            condition: () => this.gameState.customers.length > 5,
            eventTypes: ['customerIncident', 'emergencyEvent'],
            priority: 'low',
            cooldown: 1800000 // 30 minutes
        });

        this.triggerConditions.set('new_week', {
            condition: () => this.timeSystem.isNewWeek(),
            eventTypes: ['localNews', 'businessEvent'],
            priority: 'low',
            cooldown: 604800000 // 1 week
        });

        console.log('🎯 Trigger conditions setup:', this.triggerConditions.size);
    }

    // Load seasonal and time-based events
    loadSeasonalEvents() {
        this.seasonalEvents.set('spring', [
            'Spring cleaning supply rush',
            'Easter shopping season',
            'Spring break preparations',
            'Gardening season begins'
        ]);

        this.seasonalEvents.set('summer', [
            'Summer vacation shopping',
            'Back-to-school preparation',
            'Heat wave product demand',
            'Summer festival preparations'
        ]);

        this.seasonalEvents.set('fall', [
            'Halloween season rush',
            'Back-to-school supplies',
            'Thanksgiving preparations',
            'Winter preparation shopping'
        ]);

        this.seasonalEvents.set('winter', [
            'Holiday shopping season',
            'New Year preparation',
            'Winter weather emergency supplies',
            'Post-holiday returns surge'
        ]);

        console.log('🗓️ Seasonal events loaded');
    }

    // Main event generation method
    async generateEvent(eventType, context = {}) {
        try {
            console.log('🎭 Generating event type:', eventType);
            
            // Get the appropriate prompt template
            const promptTemplate = this.eventPrompts[eventType];
            if (!promptTemplate) {
                console.warn('⚠️ No prompt template for event type:', eventType);
                return this.getFallbackEvent(eventType);
            }

            // Build comprehensive context
            const enrichedContext = await this.buildEventContext(eventType, context);
            
            // Fill in the prompt template
            const prompt = this.fillPromptTemplate(promptTemplate.template, enrichedContext);
            
            // Generate event using AI
            const generatedEvent = await this.aiHooks.generateText(prompt, {
                maxLength: 500,
                temperature: 0.7,
                topP: 0.9
            });

            // Process and structure the generated event
            const processedEvent = this.processGeneratedEvent(generatedEvent, eventType, context);
            
            // Add to event history
            this.addToEventHistory(processedEvent);
            
            return processedEvent;
            
        } catch (error) {
            console.error('❌ Event generation failed:', error);
            return this.getFallbackEvent(eventType);
        }
    }

    // Build comprehensive context for event generation
    async buildEventContext(eventType, customContext) {
        const gameState = this.gameState;
        
        // Base store context
        const storeContext = {
            storeType: gameState.store.type,
            storeName: gameState.store.name,
            storeReputation: gameState.store.reputation || 50,
            storeAtmosphere: this.calculateStoreAtmosphere(),
            customerCount: gameState.customers?.length || 0,
            staffCount: gameState.staff?.length || 0,
            staffOnDuty: gameState.staff?.filter(s => s.onDuty).length || 0
        };

        // Financial context
        const financialContext = {
            cashFlow: this.calculateCashFlow(),
            debtSituation: this.getDebtSituation(),
            financialStatus: this.getFinancialStatus(),
            profitability: this.calculateProfitability(),
            monthlyExpenses: gameState.finance.monthlyExpenses || 0,
            revenueTrends: this.getRevenueTrends()
        };

        // Time and seasonal context
        const temporalContext = {
            timeOfDay: this.getTimeOfDay(),
            season: this.getCurrentSeason(),
            dayOfWeek: this.getDayOfWeek(),
            weatherConditions: gameState.weather?.condition || 'clear'
        };

        // Community context
        const communityContext = {
            communityType: gameState.location?.type || 'urban',
            economicStatus: gameState.location?.economicStatus || 'middle_class',
            populationSize: gameState.location?.population || 'medium',
            localCulture: gameState.location?.culture || 'diverse'
        };

        // Recent events context
        const historyContext = {
            recentEvents: this.getRecentEvents(),
            recentNews: this.getRecentNews(),
            previousIncidents: this.getPreviousIncidents()
        };

        // Event-specific context
        const eventSpecificContext = this.getEventSpecificContext(eventType, customContext);

        return {
            ...storeContext,
            ...financialContext,
            ...temporalContext,
            ...communityContext,
            ...historyContext,
            ...eventSpecificContext,
            ...customContext
        };
    }

    // Get event-specific context based on event type
    getEventSpecificContext(eventType, context) {
        switch (eventType) {
            case 'customerIncident':
                return {
                    primaryCustomer: this.getRandomCustomerArchetype(),
                    incidentType: context.incidentType || this.getRandomIncidentType(),
                    severityLevel: context.severityLevel || this.getRandomSeverity(),
                    storeBusyness: this.calculateStoreBusyness()
                };

            case 'staffDrama':
                const staff = this.gameState.staff[0] || { name: 'Employee', role: 'Cashier' };
                return {
                    staffMember: staff.name,
                    staffRole: staff.role,
                    staffPersonality: staff.personality || 'professional',
                    dramaType: context.dramaType || this.getRandomDramaType(),
                    complexityLevel: context.complexityLevel || 'medium'
                };

            case 'financialEvent':
                return {
                    eventType: context.eventType || this.getRandomFinancialEventType(),
                    riskLevel: context.riskLevel || this.getRandomRiskLevel(),
                    timeSensitivity: context.timeSensitivity || 'medium'
                };

            case 'socialMediaEvent':
                return {
                    platform: context.platform || this.getRandomSocialPlatform(),
                    triggeringIncident: context.incident || 'recent customer interaction',
                    viralPotential: context.viralPotential || 'medium',
                    postTone: context.tone || 'neutral'
                };

            case 'emergencyEvent':
                return {
                    emergencyType: context.emergencyType || this.getRandomEmergencyType(),
                    severityLevel: context.severityLevel || 'medium',
                    emergencyLocation: context.location || 'store interior'
                };

            default:
                return {};
        }
    }

    // Process generated event into structured format
    processGeneratedEvent(rawEvent, eventType, context) {
        if (!rawEvent || typeof rawEvent !== 'string') {
            return this.getFallbackEvent(eventType);
        }

        // Parse the AI-generated event
        const lines = rawEvent.split('\n').filter(line => line.trim());
        
        const event = {
            id: this.generateEventId(),
            type: eventType,
            timestamp: Date.now(),
            title: this.extractEventTitle(lines),
            description: this.extractEventDescription(lines),
            effects: this.extractEventEffects(lines),
            options: this.extractEventOptions(lines),
            consequences: this.extractEventConsequences(lines),
            priority: context.priority || 'medium',
            duration: this.calculateEventDuration(eventType),
            status: 'active'
        };

        return event;
    }

    // Extract event components from AI response
    extractEventTitle(lines) {
        // Look for title indicators
        for (const line of lines) {
            if (line.includes('Title:') || line.includes('Event:')) {
                return line.replace(/^(Title:|Event:)\s*/i, '').trim();
            }
        }
        
        // Use first line if no explicit title
        return lines[0]?.substring(0, 50) || 'Store Event';
    }

    extractEventDescription(lines) {
        const description = [];
        let inDescription = false;
        
        for (const line of lines) {
            if (line.includes('Description:') || inDescription) {
                inDescription = true;
                if (!line.includes('Description:')) {
                    description.push(line);
                } else {
                    description.push(line.replace(/^Description:\s*/i, ''));
                }
                
                if (line.includes('Effects:') || line.includes('Options:')) {
                    break;
                }
            }
        }
        
        return description.join(' ').trim() || 'An event has occurred at your store.';
    }

    extractEventEffects(lines) {
        const effects = [];
        let inEffects = false;
        
        for (const line of lines) {
            if (line.includes('Effects:') || line.includes('Impact:')) {
                inEffects = true;
                continue;
            }
            
            if (inEffects) {
                if (line.includes('Options:') || line.includes('Response:')) {
                    break;
                }
                effects.push(line.trim());
            }
        }
        
        return effects;
    }

    extractEventOptions(lines) {
        const options = [];
        let inOptions = false;
        
        for (const line of lines) {
            if (line.includes('Options:') || line.includes('Response:')) {
                inOptions = true;
                continue;
            }
            
            if (inOptions) {
                if (line.includes('Consequences:') || line.includes('Outcomes:')) {
                    break;
                }
                if (line.trim()) {
                    options.push(line.trim());
                }
            }
        }
        
        return options;
    }

    extractEventConsequences(lines) {
        const consequences = {};
        let inConsequences = false;
        
        for (const line of lines) {
            if (line.includes('Consequences:') || line.includes('Outcomes:')) {
                inConsequences = true;
                continue;
            }
            
            if (inConsequences && line.trim()) {
                consequences[line.split(':')[0]] = line.split(':')[1]?.trim() || '';
            }
        }
        
        return consequences;
    }

    // Event monitoring and triggering
    checkEventTriggers() {
        const currentTime = Date.now();
        
        for (const [conditionName, trigger] of this.triggerConditions.entries()) {
            // Check cooldown
            const lastTriggered = this.getLastTriggerTime(conditionName);
            if (currentTime - lastTriggered < trigger.cooldown) {
                continue;
            }
            
            // Check condition
            if (trigger.condition()) {
                console.log('🎯 Trigger condition met:', conditionName);
                this.triggerEvent(trigger.eventTypes, trigger.priority);
                this.setLastTriggerTime(conditionName, currentTime);
            }
        }
    }

    // Trigger specific event types
    async triggerEvent(eventTypes, priority = 'medium') {
        if (this.isOnCooldown()) {
            console.log('⏰ Event generation on cooldown');
            return null;
        }
        
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const event = await this.generateEvent(eventType, { priority });
        
        if (event) {
            this.eventBus?.emit('event.triggered', event);
            this.lastEventTime = Date.now();
        }
        
        return event;
    }

    // Periodic event generation
    startEventGeneration() {
        // Check for triggered events every 30 seconds
        setInterval(() => this.checkEventTriggers(), 30000);
        
        // Generate random events periodically
        setInterval(() => this.generateRandomEvent(), 600000); // Every 10 minutes
        
        console.log('⏰ Event generation started');
    }

    async generateRandomEvent() {
        if (this.isOnCooldown()) return null;
        
        const eventTypes = Object.keys(this.eventPrompts);
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        // Lower chance for emergencies and high-impact events
        const weights = {
            'emergencyEvent': 0.1,
            'financialEvent': 0.15,
            'socialMediaEvent': 0.2,
            'customerIncident': 0.25,
            'staffDrama': 0.15,
            'businessEvent': 0.1,
            'localNews': 0.05
        };
        
        const weight = weights[randomType] || 0.2;
        if (Math.random() > weight) return null;
        
        return await this.triggerEvent([randomType], 'low');
    }

    // Utility methods
    isOnCooldown() {
        return Date.now() - this.lastEventTime < this.eventCooldown;
    }

    generateEventId() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    calculateEventDuration(eventType) {
        const durations = {
            'emergencyEvent': 1800000, // 30 minutes
            'customerIncident': 600000, // 10 minutes
            'staffDrama': 3600000, // 1 hour
            'socialMediaEvent': 7200000, // 2 hours
            'financialEvent': 86400000, // 24 hours
            'businessEvent': 3600000, // 1 hour
            'localNews': 604800000 // 1 week
        };
        
        return durations[eventType] || 3600000; // Default 1 hour
    }

    // Context calculation methods
    calculateStoreAtmosphere() {
        const reputation = this.gameState.store?.reputation || 50;
        const cleanliness = this.gameState.store?.cleanliness || 50;
        const staffMorale = this.gameState.staff?.reduce((avg, s) => avg + (s.morale || 50), 0) / 
                          Math.max(this.gameState.staff?.length || 1, 1);
        
        const atmosphere = (reputation + cleanliness + staffMorale) / 3;
        
        if (atmosphere > 70) return 'positive';
        if (atmosphere < 40) return 'tense';
        return 'neutral';
    }

    calculateCashFlow() {
        const finance = this.gameState.finance || {};
        const dailyRevenue = finance.dailyRevenue || 0;
        const dailyExpenses = finance.dailyExpenses || 0;
        
        return dailyRevenue - dailyExpenses;
    }

    getFinancialStatus() {
        const cash = this.gameState.finance?.cash || 0;
        const debt = this.gameState.finance?.totalDebt || 0;
        
        if (cash > debt * 2) return 'excellent';
        if (cash > debt) return 'good';
        if (cash > debt * 0.5) return 'struggling';
        return 'critical';
    }

    // Random selection helpers
    getRandomCustomerArchetype() {
        const archetypes = [
            'college_student', 'business_professional', 'retiree', 
            'parent', 'teenager', 'tourist', 'local_regular'
        ];
        return archetypes[Math.floor(Math.random() * archetypes.length)];
    }

    getRandomIncidentType() {
        const types = this.eventPrompts.customerIncident.types;
        return types[Math.floor(Math.random() * types.length)];
    }

    getRandomSocialPlatform() {
        const platforms = this.eventPrompts.socialMediaEvent.platforms;
        return platforms[Math.floor(Math.random() * platforms.length)];
    }

    // Fallback events when AI generation fails
    getFallbackEvent(eventType) {
        const fallbacks = {
            'businessEvent': {
                title: 'Supply Delivery',
                description: 'A regular supply delivery has arrived and needs to be processed.',
                effects: ['Inventory restocking opportunity'],
                options: ['Accept delivery', 'Reject delivery', 'Negotiate price'],
                consequences: { accept: 'Stock increases', reject: 'No change' }
            },
            'customerIncident': {
                title: 'Customer Complaint',
                description: 'A customer is unhappy with a recent purchase.',
                effects: ['Potential reputation impact'],
                options: ['Offer refund', 'Offer exchange', 'Explain policy'],
                consequences: { refund: 'Customer satisfied, money lost' }
            },
            'localNews': {
                title: 'Local Development',
                description: 'New businesses are opening in the area.',
                effects: ['Increased foot traffic potential'],
                options: ['Monitor situation', 'Advertise more', 'Improve service'],
                consequences: { advertise: 'Costs money but attracts customers' }
            }
        };
        
        return {
            id: this.generateEventId(),
            type: eventType,
            timestamp: Date.now(),
            status: 'active',
            priority: 'low',
            duration: 3600000, // 1 hour
            ...fallbacks[eventType] || fallbacks.businessEvent
        };
    }

    // Event history and tracking
    addToEventHistory(event) {
        this.eventHistory.unshift(event);
        
        // Limit history size
        if (this.eventHistory.length > 50) {
            this.eventHistory = this.eventHistory.slice(0, 50);
        }
    }

    getRecentEvents(count = 5) {
        return this.eventHistory.slice(0, count).map(e => e.title);
    }

    getLastTriggerTime(conditionName) {
        return this.gameState.eventSystem?.lastTriggers?.[conditionName] || 0;
    }

    setLastTriggerTime(conditionName, time) {
        if (!this.gameState.eventSystem) {
            this.gameState.eventSystem = { lastTriggers: {} };
        }
        this.gameState.eventSystem.lastTriggers[conditionName] = time;
    }

    // Template utility methods
    fillPromptTemplate(template, context) {
        let filledTemplate = template;
        
        for (const [key, value] of Object.entries(context)) {
            const placeholder = `{${key}}`;
            filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), value || 'unknown');
        }
        
        return filledTemplate;
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    }

    getTimeOfDay() {
        const hour = this.gameState.time?.hour || new Date().getHours();
        if (hour < 6) return 'early_morning';
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        if (hour < 21) return 'evening';
        return 'night';
    }

    getDayOfWeek() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[new Date().getDay()];
    }

    // Public API
    async generateBusinessEvent(context = {}) {
        return await this.generateEvent('businessEvent', context);
    }

    async generateCustomerIncident(context = {}) {
        return await this.generateEvent('customerIncident', context);
    }

    async generateStaffDrama(context = {}) {
        return await this.generateEvent('staffDrama', context);
    }

    async generateLocalNews(context = {}) {
        return await this.generateEvent('localNews', context);
    }

    async generateSocialMediaEvent(context = {}) {
        return await this.generateEvent('socialMediaEvent', context);
    }

    async generateEmergency(context = {}) {
        return await this.generateEvent('emergencyEvent', context);
    }

    getActiveEvents() {
        return this.eventHistory.filter(e => e.status === 'active');
    }

    resolveEvent(eventId, resolution) {
        const event = this.eventHistory.find(e => e.id === eventId);
        if (event) {
            event.status = 'resolved';
            event.resolution = resolution;
            event.resolvedAt = Date.now();
            
            this.eventBus?.emit('event.resolved', { event, resolution });
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventAIGenerator;
} else if (typeof window !== 'undefined') {
    window.EventAIGenerator = EventAIGenerator;
}
