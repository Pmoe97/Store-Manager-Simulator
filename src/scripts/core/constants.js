// Game Constants and Enums
const GAME_CONSTANTS = {
    // Game States
    GAME_STATES: {
        LOADING: 'loading',
        SETUP: 'setup', 
        PLAYING: 'playing',
        PAUSED: 'paused',
        COMPUTER: 'computer',
        CONVERSATION: 'conversation'
    },

    // Views
    VIEWS: {
        STORE: 'store-view',
        COMPUTER: 'computer-view', 
        CONVERSATION: 'conversation-view'
    },

    // Time Constants
    TIME: {
        GAME_SPEED: 1000, // 1 second = 1 game minute
        MINUTES_PER_HOUR: 60,
        HOURS_PER_DAY: 24,
        STORE_OPEN_HOUR: 8,
        STORE_CLOSE_HOUR: 22
    },

    // Financial Constants
    FINANCE: {
        STARTING_CASH: 500,
        STARTING_DEBT_BANK: 50000,
        STARTING_DEBT_MOB: 25000,
        STARTING_DEBT_SUPPLIER: 10000,
        BANK_INTEREST_RATE: 0.03, // 3% monthly
        RENT_WEEKLY: 1200
    },

    // Relationship Levels
    RELATIONSHIP_LEVELS: {
        STRANGER: { min: 0, max: 20, name: 'Stranger' },
        REGULAR: { min: 21, max: 50, name: 'Regular' },
        FRIEND: { min: 51, max: 80, name: 'Friend' },
        VIP: { min: 81, max: 100, name: 'VIP' }
    },

    // Romance Levels
    ROMANCE_LEVELS: {
        NONE: { min: 0, max: 29, name: 'None' },
        INTERESTED: { min: 30, max: 60, name: 'Interested' },
        DATING: { min: 61, max: 80, name: 'Dating' },
        PARTNER: { min: 81, max: 100, name: 'Partner' }
    },

    // Staff Roles
    STAFF_ROLES: {
        CASHIER: { wage: 40, name: 'Cashier' },
        JANITOR: { wage: 30, name: 'Janitor' },
        STOCKER: { wage: 35, name: 'Stocker' },
        SECURITY: { wage: 50, name: 'Security Guard' },
        ASSISTANT_MANAGER: { wage: 60, name: 'Assistant Manager' }
    },

    // Product Categories
    PRODUCT_CATEGORIES: [
        'Food & Beverages',
        'Personal Care',
        'Electronics',
        'Clothing',
        'Home & Garden',
        'Books & Media',
        'Toys & Games',
        'Automotive',
        'Health & Wellness',
        'Adult Products'
    ],

    // NPC Archetypes
    NPC_ARCHETYPES: [
        'college_student',
        'business_professional', 
        'retiree',
        'young_parent',
        'teenager',
        'tradesperson',
        'artist',
        'fitness_enthusiast',
        'tech_worker',
        'service_worker'
    ],

    // Event Types
    EVENT_TYPES: {
        CUSTOMER: 'customer',
        STAFF: 'staff',
        FINANCIAL: 'financial',
        SECURITY: 'security',
        RANDOM: 'random',
        DEBT_COLLECTION: 'debt_collection'
    },

    // Security System Types
    SECURITY_SYSTEMS: {
        CAMERAS: { cost: 2000, effectiveness: 0.6 },
        ALARMS: { cost: 3000, effectiveness: 0.8 },
        GUARD: { dailyCost: 50, effectiveness: 0.9 }
    },

    // Progression Tiers
    PROGRESSION_TIERS: {
        TIER_1: { revenue: 0, name: 'Starting Out' },
        TIER_2: { revenue: 25000, name: 'Getting Established' },
        TIER_3: { revenue: 75000, name: 'Growing Business' },
        TIER_4: { revenue: 150000, name: 'Major Enterprise' }
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GAME_CONSTANTS;
}
