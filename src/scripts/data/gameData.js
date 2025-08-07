/**
 * Game Data Structure - Defines the complete save state format
 * This is the central data schema for the Store Manager Simulator
 */

class GameData {
    constructor() {
        this.initializeDefaultData();
    }

    initializeDefaultData() {
        // Game Meta Information
        this.meta = {
            version: "1.0.0",
            created: new Date().toISOString(),
            lastSaved: new Date().toISOString(),
            playtime: 0, // seconds
            difficulty: "normal", // easy, normal, hard
            adultContentEnabled: false
        };

        // Player Character
        this.player = {
            name: "",
            age: 25,
            gender: "non-binary",
            pronouns: "they/them",
            appearance: {
                description: "",
                avatar: null, // AI-generated image URL
                customPrompt: ""
            },
            personality: {
                traits: [],
                backstory: "",
                motivation: ""
            },
            stats: {
                charisma: 50,
                business: 50,
                energy: 100,
                stress: 0,
                reputation: 50
            },
            relationships: {}, // NPCId -> relationship level
            romance: {
                currentPartner: null,
                history: []
            }
        };

        // Store Information
        this.store = {
            name: "",
            type: "general", // general, convenience, boutique, electronics, adult
            description: "",
            environment: "city", // city, suburban, rural
            address: "",
            phone: "",
            hours: {
                monday: { open: "09:00", close: "21:00", closed: false },
                tuesday: { open: "09:00", close: "21:00", closed: false },
                wednesday: { open: "09:00", close: "21:00", closed: false },
                thursday: { open: "09:00", close: "21:00", closed: false },
                friday: { open: "09:00", close: "21:00", closed: false },
                saturday: { open: "10:00", close: "22:00", closed: false },
                sunday: { open: "11:00", close: "20:00", closed: false }
            },
            layout: {
                size: "small", // small, medium, large
                sections: ["entrance", "checkout", "shelves"],
                upgrades: []
            },
            reputation: {
                overall: 50,
                cleanliness: 50,
                service: 50,
                prices: 50,
                selection: 50
            },
            background: {
                image: null, // AI-generated store image
                prompt: ""
            }
        };

        // Time System
        this.time = {
            currentDay: 1,
            currentWeek: 1,
            currentMonth: 1,
            dayOfWeek: 1, // 1=Monday, 7=Sunday
            currentTime: "09:00", // 24-hour format
            isOpen: false,
            speed: 1, // time multiplier
            lastUpdate: Date.now()
        };

        // Financial System
        this.finances = {
            cash: 5000, // Starting cash
            bank: 0,
            debt: {
                bank: {
                    amount: 50000,
                    interest: 0.03, // 3% monthly
                    nextPayment: 2500,
                    dueDate: 7 // days from start
                },
                mob: {
                    amount: 25000,
                    nextPayment: 5000,
                    dueDate: 14,
                    missedPayments: 0
                },
                supplier: {
                    amount: 10000,
                    nextPayment: 1000,
                    dueDate: 30
                }
            },
            dailyExpenses: {
                rent: 200,
                utilities: 50,
                insurance: 25,
                supplies: 30
            },
            transactions: [], // Transaction history
            investments: {
                techCorp: { shares: 0, avgPrice: 0 },
                retailChain: { shares: 0, avgPrice: 0 },
                cryptoCoin: { amount: 0, avgPrice: 0 },
                localBank: { bonds: 0, avgPrice: 0 },
                commodityFund: { shares: 0, avgPrice: 0 }
            }
        };

        // Inventory System
        this.inventory = {
            products: new Map(), // ProductId -> Product data
            categories: ["food", "drinks", "snacks", "household", "electronics"],
            lowStockThreshold: 10,
            lastRestockDate: 0,
            totalValue: 0,
            suppliers: []
        };

        // Staff System
        this.staff = {
            employees: new Map(), // StaffId -> Staff data
            schedule: {}, // Day -> [StaffId assignments]
            applications: [],
            payroll: {
                totalWeekly: 0,
                lastPayDate: 0
            },
            maxEmployees: 2 // Increases with store upgrades
        };

        // NPC System
        this.npcs = {
            customers: new Map(), // All customer NPCs
            staff: new Map(),     // All staff NPCs
            special: new Map(),   // Special characters (suppliers, inspectors, etc.)
            
            // Encounter tracking
            encounterHistory: [],     // Recent customer visits
            dailyEncounters: [],     // Today's scheduled encounters
            encounterQueue: [],      // Queue of NPCs to encounter today
            
            // Relationship events
            relationshipEvents: [],  // History of relationship changes
            
            // Background processing
            enrichmentQueue: [],     // NPCs waiting for AI enrichment
            isEnriching: false,      // Background enrichment status
            
            // Registry data for work computer
            registry: {
                totalGenerated: 0,
                totalEncountered: 0,
                lastUpdated: 0
            },
            
            // NPC generation settings
            generationSettings: {
                poolSize: 35,
                enrichmentBatchSize: 5,
                maxDailyEncounters: 8,
                archetypeWeights: {
                    'college_student': 1.2,
                    'young_professional': 1.0,
                    'local_regular': 1.5,
                    'soccer_mom': 1.1,
                    'retiree': 0.8,
                    'business_executive': 0.5,
                    'tourist': 0.3,
                    'influencer': 0.2
                }
            }
        };

        // Security System
        this.security = {
            cameras: false,
            alarms: false,
            securityGuard: false,
            incidents: [], // Theft, robbery, etc.
            suspiciousActivity: 0,
            lastIncident: 0
        };

        // Events & Scenarios
        this.events = {
            active: [], // Current ongoing events
            history: [], // Completed events
            randomEventCooldown: 0,
            seasonalEvents: [],
            newsEvents: []
        };

        // Progression System
        this.progression = {
            level: 1,
            experience: 0,
            tier: 1, // Business tier (1-4)
            milestones: {
                firstSale: false,
                firstProfit: false,
                firstEmployee: false,
                debtFree: false,
                firstRomance: false
            },
            unlocks: {
                socialMedia: false,
                investments: false,
                multipleLevels: false,
                adultProducts: false
            }
        };

        // Settings & Preferences
        this.settings = {
            autoSave: true,
            notifications: true,
            soundEffects: true,
            theme: "default",
            language: "en",
            aiContentSettings: {
                npcGeneration: true,
                productGeneration: true,
                eventGeneration: true,
                adultContent: false
            },
            accessibility: {
                highContrast: false,
                largeText: false,
                reducedMotion: false
            }
        };

        // Analytics & Statistics
        this.stats = {
            totalSales: 0,
            totalCustomers: 0,
            averageTransaction: 0,
            bestSellingProducts: [],
            customerSatisfaction: 0,
            hoursPlayed: 0,
            achievementsUnlocked: 0,
            relationshipsFormed: 0,
            eventsSurvived: 0
        };
    }

    // Data Validation Methods
    validateSaveData(data) {
        const requiredSections = ['meta', 'player', 'store', 'time', 'finances'];
        return requiredSections.every(section => data.hasOwnProperty(section));
    }

    // Data Migration for Version Updates
    migrateData(data, fromVersion, toVersion) {
        // Handle data structure changes between versions
        if (fromVersion === "0.9.0" && toVersion === "1.0.0") {
            // Example migration logic
            data.progression = data.progression || this.progression;
        }
        return data;
    }

    // Export/Import Methods
    exportData() {
        const exportData = {
            ...this,
            exportDate: new Date().toISOString(),
            exportVersion: this.meta.version
        };
        
        // Convert Maps to Objects for JSON serialization
        exportData.inventory.products = Object.fromEntries(this.inventory.products);
        exportData.staff.employees = Object.fromEntries(this.staff.employees);
        exportData.npcs.customers = Object.fromEntries(this.npcs.customers);
        
        return exportData;
    }

    importData(importedData) {
        // Validate and merge imported data
        if (!this.validateSaveData(importedData)) {
            throw new Error("Invalid save data format");
        }

        // Convert Objects back to Maps
        if (importedData.inventory && importedData.inventory.products) {
            importedData.inventory.products = new Map(Object.entries(importedData.inventory.products));
        }
        if (importedData.staff && importedData.staff.employees) {
            importedData.staff.employees = new Map(Object.entries(importedData.staff.employees));
        }
        if (importedData.npcs && importedData.npcs.customers) {
            importedData.npcs.customers = new Map(Object.entries(importedData.npcs.customers));
        }

        // Merge data with current structure
        Object.assign(this, importedData);
        this.meta.lastSaved = new Date().toISOString();
    }

    // Quick Access Methods
    getCurrentCash() {
        return this.finances.cash;
    }

    getCurrentTime() {
        return this.time.currentTime;
    }

    getCurrentDay() {
        return this.time.currentDay;
    }

    getStoreReputation() {
        return this.store.reputation.overall;
    }

    getPlayerEnergy() {
        return this.player.stats.energy;
    }

    getTotalDebt() {
        return this.finances.debt.bank.amount + 
               this.finances.debt.mob.amount + 
               this.finances.debt.supplier.amount;
    }

    getEmployeeCount() {
        return this.staff.employees.size;
    }

    getCustomerCount() {
        return this.npcs.customers.size;
    }

    // Utility Methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatTime(time24) {
        const [hours, minutes] = time24.split(':');
        const hour12 = hours % 12 || 12;
        const ampm = hours < 12 ? 'AM' : 'PM';
        return `${hour12}:${minutes} ${ampm}`;
    }

    getDayName(dayNumber) {
        const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return days[dayNumber] || 'Unknown';
    }

    // Save State Summary for UI
    getSaveInfo() {
        return {
            storeName: this.store.name,
            playerName: this.player.name,
            day: this.time.currentDay,
            week: this.time.currentWeek,
            cash: this.formatCurrency(this.finances.cash),
            debt: this.formatCurrency(this.getTotalDebt()),
            employees: this.getEmployeeCount(),
            customers: this.getCustomerCount(),
            playtime: Math.floor(this.meta.playtime / 3600) + ' hours',
            lastSaved: new Date(this.meta.lastSaved).toLocaleDateString()
        };
    }

    // Deep Clone for State Management
    clone() {
        const cloned = new GameData();
        const exported = this.exportData();
        cloned.importData(exported);
        return cloned;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameData;
} else if (typeof window !== 'undefined') {
    window.GameData = GameData;
}
