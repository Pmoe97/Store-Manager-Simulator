// Event Bus System for Module Communication
class EventBus {
    constructor() {
        this.events = {};
        this.debugMode = false;
    }

    // Subscribe to an event
    on(eventName, callback, context = null) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }

        this.events[eventName].push({
            callback: callback,
            context: context
        });

        if (this.debugMode) {
            console.log(`📡 EventBus: Subscribed to '${eventName}'`);
        }
    }

    // Subscribe to an event only once
    once(eventName, callback, context = null) {
        const onceWrapper = (...args) => {
            callback.apply(context, args);
            this.off(eventName, onceWrapper);
        };

        this.on(eventName, onceWrapper, context);
    }

    // Unsubscribe from an event
    off(eventName, callback) {
        if (!this.events[eventName]) return;

        this.events[eventName] = this.events[eventName].filter(
            event => event.callback !== callback
        );

        if (this.debugMode) {
            console.log(`📡 EventBus: Unsubscribed from '${eventName}'`);
        }
    }

    // Emit an event
    emit(eventName, ...args) {
        if (!this.events[eventName]) return;

        if (this.debugMode) {
            console.log(`📡 EventBus: Emitting '${eventName}'`, args);
        }

        this.events[eventName].forEach(event => {
            try {
                if (event.context) {
                    event.callback.apply(event.context, args);
                } else {
                    event.callback(...args);
                }
            } catch (error) {
                console.error(`❌ EventBus: Error in '${eventName}' handler:`, error);
            }
        });
    }

    // Remove all listeners for an event
    removeAllListeners(eventName = null) {
        if (eventName) {
            delete this.events[eventName];
        } else {
            this.events = {};
        }
    }

    // Get list of all events
    getEvents() {
        return Object.keys(this.events);
    }

    // Get listener count for an event
    getListenerCount(eventName) {
        return this.events[eventName] ? this.events[eventName].length : 0;
    }

    // Enable/disable debug mode
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`📡 EventBus: Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Create global event bus instance
const gameEventBus = new EventBus();

// Common game events
const GAME_EVENTS = {
    // Game State Events
    GAME_STARTED: 'game:started',
    GAME_PAUSED: 'game:paused',
    GAME_RESUMED: 'game:resumed',
    GAME_SAVED: 'game:saved',
    GAME_LOADED: 'game:loaded',

    // Time Events
    TIME_TICK: 'time:tick',
    TIME_HOUR_CHANGED: 'time:hour_changed',
    TIME_DAY_CHANGED: 'time:day_changed',
    STORE_OPENED: 'time:store_opened',
    STORE_CLOSED: 'time:store_closed',

    // Customer Events
    CUSTOMER_ENTERED: 'customer:entered',
    CUSTOMER_LEFT: 'customer:left',
    CUSTOMER_CHECKOUT: 'customer:checkout',
    CONVERSATION_STARTED: 'conversation:started',
    CONVERSATION_ENDED: 'conversation:ended',

    // Financial Events
    TRANSACTION_COMPLETED: 'finance:transaction_completed',
    DEBT_PAYMENT_DUE: 'finance:debt_payment_due',
    CASH_LOW: 'finance:cash_low',
    PROFIT_MILESTONE: 'finance:profit_milestone',

    // Staff Events
    STAFF_HIRED: 'staff:hired',
    STAFF_FIRED: 'staff:fired',
    STAFF_ISSUE: 'staff:issue',

    // NPC Events
    NPC_CREATED: 'npc:created',
    NPC_RELATIONSHIP_CHANGED: 'npc:relationship_changed',
    NPC_MOOD_CHANGED: 'npc:mood_changed',

    // Product Events
    PRODUCT_ADDED: 'product:added',
    PRODUCT_SOLD: 'product:sold',
    INVENTORY_LOW: 'product:inventory_low',
    RESTOCK_NEEDED: 'product:restock_needed',

    // UI Events
    VIEW_CHANGED: 'ui:view_changed',
    MODAL_OPENED: 'ui:modal_opened',
    MODAL_CLOSED: 'ui:modal_closed',
    NOTIFICATION_SHOWN: 'ui:notification_shown',

    // Computer Events
    COMPUTER_OPENED: 'computer:opened',
    COMPUTER_CLOSED: 'computer:closed',
    APP_OPENED: 'computer:app_opened',
    APP_CLOSED: 'computer:app_closed',

    // Security Events
    THEFT_DETECTED: 'security:theft_detected',
    SECURITY_INCIDENT: 'security:incident',
    ALARM_TRIGGERED: 'security:alarm_triggered'
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventBus, gameEventBus, GAME_EVENTS };
}
