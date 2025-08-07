// Central Game State Management
class GameState {
    constructor() {
        this.initialized = false;
        this.currentState = GAME_CONSTANTS.GAME_STATES.LOADING;
        this.currentView = GAME_CONSTANTS.VIEWS.STORE;
        
        // Initialize core game data
        this.data = this.getDefaultGameData();
        
        // Bind methods
        this.save = this.save.bind(this);
        this.load = this.load.bind(this);
        this.reset = this.reset.bind(this);
    }

    // Get default game data structure
    getDefaultGameData() {
        return {
            // Game Meta
            version: '1.0.0',
            created: new Date().toISOString(),
            lastSaved: new Date().toISOString(),
            
            // Player Data
            player: {
                name: '',
                age: 25,
                gender: 'other',
                appearance: '',
                profilePicture: null,
                experience: 0,
                level: 1
            },

            // Store Data
            store: {
                name: 'Your Store',
                type: 'general',
                environment: 'city',
                backgroundImage: null,
                reputation: 50,
                cleanliness: 100,
                security: {
                    cameras: false,
                    alarms: false,
                    guard: false
                }
            },

            // Financial Data
            finances: {
                cash: GAME_CONSTANTS.FINANCE.STARTING_CASH,
                totalRevenue: 0,
                totalExpenses: 0,
                debts: {
                    bank: {
                        amount: GAME_CONSTANTS.FINANCE.STARTING_DEBT_BANK,
                        interestRate: GAME_CONSTANTS.FINANCE.BANK_INTEREST_RATE,
                        monthlyPayment: 1500,
                        missedPayments: 0
                    },
                    mob: {
                        amount: GAME_CONSTANTS.FINANCE.STARTING_DEBT_MOB,
                        weeklyPayment: 500,
                        missedPayments: 0
                    },
                    supplier: {
                        amount: GAME_CONSTANTS.FINANCE.STARTING_DEBT_SUPPLIER,
                        monthlyPayment: 300,
                        missedPayments: 0
                    }
                },
                investments: {
                    techCorp: { shares: 0, value: 0 },
                    retailChain: { shares: 0, value: 0 },
                    cryptoCoin: { amount: 0, value: 0 },
                    localBonds: { amount: 0, value: 0 },
                    commodityFund: { shares: 0, value: 0 }
                },
                transactions: []
            },

            // Time Data
            time: {
                currentDay: 1,
                currentHour: 8,
                currentMinute: 0,
                totalMinutes: 0,
                isStoreOpen: true,
                gameSpeed: 1,
                paused: false
            },

            // Inventory Data
            inventory: {
                products: [],
                categories: {},
                lowStockThreshold: 5,
                totalValue: 0
            },

            // NPCs Data
            npcs: {
                registry: {},
                queue: [],
                currentCustomers: [],
                staff: [],
                totalGenerated: 0
            },

            // Relationships Data
            relationships: {},

            // Staff Data
            staff: {
                employees: [],
                schedule: {},
                hireable: []
            },

            // Events Data
            events: {
                history: [],
                pending: [],
                triggers: {}
            },

            // Progression Data
            progression: {
                currentTier: 1,
                achievements: [],
                milestones: {},
                unlockedFeatures: []
            },

            // Settings Data
            settings: {
                adultContent: false,
                difficulty: 'normal',
                notifications: true,
                autoSave: true,
                soundEnabled: false
            }
        };
    }

    // Initialize game state
    initialize() {
        if (this.initialized) return;

        console.log('🎮 Initializing Game State...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Mark as initialized
        this.initialized = true;
        
        gameEventBus.emit(GAME_EVENTS.GAME_STARTED);
        console.log('✅ Game State initialized');
    }

    // Set up event listeners
    setupEventListeners() {
        // Auto-save on important events
        gameEventBus.on(GAME_EVENTS.TRANSACTION_COMPLETED, () => {
            if (this.data.settings.autoSave) {
                this.autoSave();
            }
        });

        gameEventBus.on(GAME_EVENTS.TIME_DAY_CHANGED, () => {
            if (this.data.settings.autoSave) {
                this.autoSave();
            }
        });
    }

    // Get current game state
    getState() {
        return this.currentState;
    }

    // Set game state
    setState(newState) {
        const oldState = this.currentState;
        this.currentState = newState;
        
        console.log(`🎮 State changed: ${oldState} → ${newState}`);
        gameEventBus.emit('state:changed', { oldState, newState });
    }

    // Get current view
    getView() {
        return this.currentView;
    }

    // Set current view
    setView(newView) {
        const oldView = this.currentView;
        this.currentView = newView;
        
        console.log(`👁️ View changed: ${oldView} → ${newView}`);
        gameEventBus.emit(GAME_EVENTS.VIEW_CHANGED, { oldView, newView });
    }

    // Get game data
    getData() {
        return this.data;
    }

    // Update game data
    updateData(path, value) {
        const pathArray = path.split('.');
        let current = this.data;
        
        // Navigate to the parent object
        for (let i = 0; i < pathArray.length - 1; i++) {
            if (!current[pathArray[i]]) {
                current[pathArray[i]] = {};
            }
            current = current[pathArray[i]];
        }
        
        // Set the value
        current[pathArray[pathArray.length - 1]] = value;
        
        // Update last saved time
        this.data.lastSaved = new Date().toISOString();
    }

    // Get nested data value
    getValue(path) {
        const pathArray = path.split('.');
        let current = this.data;
        
        for (const key of pathArray) {
            if (current && current.hasOwnProperty(key)) {
                current = current[key];
            } else {
                return undefined;
            }
        }
        
        return current;
    }

    // Save game state
    save(slot = 'quicksave') {
        try {
            const saveData = {
                ...this.data,
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem(`storeManager_${slot}`, JSON.stringify(saveData));
            console.log(`💾 Game saved to slot: ${slot}`);
            
            gameEventBus.emit(GAME_EVENTS.GAME_SAVED, { slot, data: saveData });
            return true;
        } catch (error) {
            console.error('❌ Failed to save game:', error);
            return false;
        }
    }

    // Load game state
    load(slot = 'quicksave') {
        try {
            const saveData = localStorage.getItem(`storeManager_${slot}`);
            if (!saveData) {
                console.warn(`⚠️ No save data found in slot: ${slot}`);
                return false;
            }
            
            this.data = JSON.parse(saveData);
            console.log(`📂 Game loaded from slot: ${slot}`);
            
            gameEventBus.emit(GAME_EVENTS.GAME_LOADED, { slot, data: this.data });
            return true;
        } catch (error) {
            console.error('❌ Failed to load game:', error);
            return false;
        }
    }

    // Auto-save
    autoSave() {
        this.save('autosave');
    }

    // Reset game to default state
    reset() {
        console.log('🔄 Resetting game state...');
        this.data = this.getDefaultGameData();
        gameEventBus.emit('state:reset');
    }

    // Export game data
    export() {
        return JSON.stringify(this.data, null, 2);
    }

    // Import game data
    import(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            this.data = { ...this.getDefaultGameData(), ...importedData };
            console.log('📥 Game data imported successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to import game data:', error);
            return false;
        }
    }

    // Get save slots
    getSaveSlots() {
        const slots = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('storeManager_')) {
                const slotName = key.replace('storeManager_', '');
                const data = JSON.parse(localStorage.getItem(key));
                slots.push({
                    name: slotName,
                    lastSaved: data.lastSaved,
                    playerName: data.player.name,
                    storeName: data.store.name,
                    day: data.time.currentDay,
                    cash: data.finances.cash
                });
            }
        }
        return slots.sort((a, b) => new Date(b.lastSaved) - new Date(a.lastSaved));
    }

    // Delete save slot
    deleteSave(slot) {
        try {
            localStorage.removeItem(`storeManager_${slot}`);
            console.log(`🗑️ Save slot deleted: ${slot}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to delete save:', error);
            return false;
        }
    }
}

// Create global game state instance
const gameState = new GameState();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameState, gameState };
}
