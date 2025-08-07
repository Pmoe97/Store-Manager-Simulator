// Game Initialization System
class GameInitialization {
    constructor() {
        this.initializationSteps = [];
        this.currentStep = 0;
        this.completed = false;
    }

    // Initialize game setup process
    async initialize() {
        console.log('🎮 Starting game initialization...');

        // Define initialization steps
        this.initializationSteps = [
            { name: 'Core Systems', fn: this.initializeCoreSystems.bind(this) },
            { name: 'Data Loading', fn: this.loadGameData.bind(this) },
            { name: 'AI Systems', fn: this.initializeAI.bind(this) },
            { name: 'UI Systems', fn: this.initializeUI.bind(this) },
            { name: 'Game World', fn: this.initializeGameWorld.bind(this) }
        ];

        try {
            // Execute each step
            for (let i = 0; i < this.initializationSteps.length; i++) {
                this.currentStep = i;
                const step = this.initializationSteps[i];
                
                console.log(`📋 Step ${i + 1}/${this.initializationSteps.length}: ${step.name}`);
                await step.fn();
                
                // Update loading progress if UI is available
                this.updateLoadingProgress((i + 1) / this.initializationSteps.length);
            }

            this.completed = true;
            console.log('✅ Game initialization completed');
            
            gameEventBus.emit('initialization:completed');

        } catch (error) {
            console.error('❌ Game initialization failed:', error);
            gameEventBus.emit('initialization:failed', { error, step: this.currentStep });
            throw error;
        }
    }

    // Initialize core systems
    async initializeCoreSystems() {
        // Game state is already initialized in main.js
        // Additional core system initialization can go here
        
        await this.delay(100); // Simulate initialization time
        console.log('  ✓ Core systems ready');
    }

    // Load game data files
    async loadGameData() {
        try {
            // Load name lists for NPC generation
            await this.loadNameLists();
            
            // Load archetype data
            await this.loadArchetypes();
            
            // Load product templates
            await this.loadProductTemplates();
            
            // Load configuration files
            await this.loadConfiguration();
            
            console.log('  ✓ Game data loaded');
        } catch (error) {
            console.warn('⚠️ Some game data failed to load, using fallbacks');
            this.loadFallbackData();
        }
    }

    // Initialize AI systems
    async initializeAI() {
        // AI hooks are already initialized
        // Generate initial content queue if needed
        
        await this.delay(200); // Simulate AI initialization
        console.log('  ✓ AI systems ready');
    }

    // Initialize UI systems
    async initializeUI() {
        // UI manager is already initialized
        // Set up additional UI components if needed
        
        await this.delay(100);
        console.log('  ✓ UI systems ready');
    }

    // Initialize game world
    async initializeGameWorld() {
        const gameData = gameState.getData();
        
        // Check if this is a new game or loading existing
        if (this.isNewGame()) {
            await this.setupNewGame();
        } else {
            await this.loadExistingGame();
        }
        
        console.log('  ✓ Game world ready');
    }

    // Check if this is a new game
    isNewGame() {
        const playerData = gameState.getValue('player');
        return !playerData || !playerData.name || playerData.name.trim() === '';
    }

    // Setup new game
    async setupNewGame() {
        console.log('🆕 Setting up new game...');
        
        // Initialize default game state (already done in gameState constructor)
        // Additional new game setup can go here
        
        // Emit new game event
        gameEventBus.emit('game:new_game_setup');
    }

    // Load existing game
    async loadExistingGame() {
        console.log('📂 Loading existing game...');
        
        try {
            // Try to load autosave first, then quicksave
            let loaded = gameState.load('autosave');
            if (!loaded) {
                loaded = gameState.load('quicksave');
            }
            
            if (loaded) {
                console.log('  ✓ Game data loaded successfully');
                gameEventBus.emit('game:loaded');
            } else {
                console.log('  ⚠️ No save data found, starting new game');
                await this.setupNewGame();
            }
        } catch (error) {
            console.error('❌ Failed to load game:', error);
            console.log('  🔄 Starting new game instead');
            await this.setupNewGame();
        }
    }

    // Load name lists
    async loadNameLists() {
        // For now, use hardcoded name lists
        // In later phases, these will be loaded from JSON files
        const nameData = {
            first: {
                male: ['Alex', 'Brian', 'Chris', 'David', 'Eric', 'Frank', 'George', 'Henry', 'Ian', 'Jack'],
                female: ['Alice', 'Beth', 'Carol', 'Diana', 'Emma', 'Fiona', 'Grace', 'Hannah', 'Ivy', 'Jane'],
                unisex: ['Taylor', 'Jordan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Sky', 'Phoenix']
            },
            last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
        };
        
        // Store in game data
        gameState.updateData('nameData', nameData);
    }

    // Load archetype data
    async loadArchetypes() {
        const archetypeData = {
            college_student: {
                name: 'College Student',
                spendingPowerRange: [10, 50],
                traits: ['budget_conscious', 'trendy', 'social'],
                preferredProducts: ['snacks', 'drinks', 'cheap_meals']
            },
            business_professional: {
                name: 'Business Professional',
                spendingPowerRange: [50, 200],
                traits: ['time_conscious', 'quality_focused', 'practical'],
                preferredProducts: ['coffee', 'lunch', 'office_supplies']
            },
            retiree: {
                name: 'Retiree',
                spendingPowerRange: [30, 100],
                traits: ['price_conscious', 'traditional', 'patient'],
                preferredProducts: ['newspapers', 'basic_groceries', 'medications']
            }
            // More archetypes will be added in later phases
        };
        
        gameState.updateData('archetypeData', archetypeData);
    }

    // Load product templates
    async loadProductTemplates() {
        const productData = {
            categories: GAME_CONSTANTS.PRODUCT_CATEGORIES,
            templates: {
                'Food & Beverages': [
                    { name: 'Soda', basePrice: 1.50, baseCost: 0.75 },
                    { name: 'Chips', basePrice: 2.00, baseCost: 1.00 },
                    { name: 'Sandwich', basePrice: 6.00, baseCost: 3.00 }
                ],
                'Personal Care': [
                    { name: 'Toothpaste', basePrice: 4.00, baseCost: 2.00 },
                    { name: 'Shampoo', basePrice: 8.00, baseCost: 4.00 }
                ]
                // More product templates will be added
            }
        };
        
        gameState.updateData('productData', productData);
    }

    // Load configuration
    async loadConfiguration() {
        // For now, use default configuration
        // In later phases, these will be loaded from JSON files
        const config = {
            balance: {
                baseCustomerSpawnRate: 0.3,
                priceFlexibility: 0.2,
                relationshipEffects: {
                    regular: 1.15,
                    friend: 1.3,
                    vip: 1.5
                }
            },
            progression: {
                tiers: GAME_CONSTANTS.PROGRESSION_TIERS
            },
            difficulty: {
                normal: {
                    customerPatience: 1.0,
                    priceTolerancee: 1.0,
                    competitionEffect: 1.0
                }
            }
        };
        
        gameState.updateData('config', config);
    }

    // Load fallback data when files can't be loaded
    loadFallbackData() {
        console.log('📦 Loading fallback data...');
        
        // Use minimal hardcoded data as fallback
        gameState.updateData('nameData', {
            first: { male: ['John'], female: ['Jane'], unisex: ['Alex'] },
            last: ['Doe']
        });
        
        gameState.updateData('archetypeData', {
            default: {
                name: 'Customer',
                spendingPowerRange: [20, 80],
                traits: ['neutral'],
                preferredProducts: []
            }
        });
    }

    // Update loading progress
    updateLoadingProgress(progress) {
        const percentage = Math.round(progress * 100);
        
        // Update loading screen if it exists
        const loadingText = document.querySelector('.loading-screen p');
        if (loadingText) {
            loadingText.textContent = `Loading... ${percentage}%`;
        }
        
        // Emit progress event
        gameEventBus.emit('initialization:progress', { progress, percentage });
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get initialization status
    getStatus() {
        return {
            completed: this.completed,
            currentStep: this.currentStep,
            totalSteps: this.initializationSteps.length,
            currentStepName: this.initializationSteps[this.currentStep]?.name || 'Unknown'
        };
    }
}

// Create global initialization instance
const gameInitialization = new GameInitialization();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameInitialization, gameInitialization };
}
