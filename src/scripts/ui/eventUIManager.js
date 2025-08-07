/**
 * Event UI Manager - Phase 4C Implementation
 * Handles display and interaction with AI-generated events
 * Provides modal interfaces for event resolution
 */

class EventUIManager {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.activeEventModal = null;
        this.eventQueue = [];
        this.isShowingEvent = false;
        this.eventHistory = [];
        this.maxHistorySize = 50;
    }

    initialize(gameState, eventBus) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        
        this.setupEventListeners();
        this.createEventModalTemplate();
        
        console.log('🎭 Event UI Manager initialized');
    }

    setupEventListeners() {
        // Listen for events to display
        this.eventBus.on('ui.showEvent', (event) => this.showEvent(event));
        this.eventBus.on('event.resolved', (data) => this.handleEventResolved(data));
        
        // Listen for UI interactions
        this.eventBus.on('ui.eventResponse', (data) => this.handleEventResponse(data));
        
        console.log('📡 Event UI listeners configured');
    }

    createEventModalTemplate() {
        // Create modal HTML if it doesn't exist
        if (!document.getElementById('event-modal')) {
            const modalHTML = `
                <div id="event-modal" class="modal-overlay hidden">
                    <div class="modal-content event-modal">
                        <div class="modal-header">
                            <span class="event-type-badge"></span>
                            <h2 class="event-title"></h2>
                            <button class="modal-close" onclick="eventUIManager.closeEventModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="event-description"></div>
                            <div class="event-effects hidden">
                                <h4>Immediate Effects:</h4>
                                <ul class="effects-list"></ul>
                            </div>
                            <div class="event-options">
                                <h4>How do you respond?</h4>
                                <div class="options-container"></div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <div class="event-timestamp"></div>
                            <button class="btn btn-secondary" onclick="eventUIManager.postponeEvent()">
                                Deal with Later
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // Add CSS styles
        this.addEventStyles();
        
        console.log('🎨 Event modal template created');
    }

    addEventStyles() {
        const styles = `
            <style id="event-ui-styles">
                .event-modal {
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                }

                .event-type-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.8em;
                    font-weight: bold;
                    text-transform: uppercase;
                    color: white;
                    margin-right: 10px;
                }

                .event-type-badge.emergency { background: #e74c3c; }
                .event-type-badge.business { background: #3498db; }
                .event-type-badge.customer { background: #e67e22; }
                .event-type-badge.staff { background: #9b59b6; }
                .event-type-badge.financial { background: #27ae60; }
                .event-type-badge.social { background: #f39c12; }
                .event-type-badge.news { background: #34495e; }

                .event-title {
                    margin: 0;
                    color: #2c3e50;
                    font-size: 1.4em;
                    line-height: 1.3;
                }

                .event-description {
                    font-size: 1.1em;
                    line-height: 1.5;
                    margin-bottom: 20px;
                    color: #34495e;
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #3498db;
                }

                .event-effects {
                    margin-bottom: 20px;
                }

                .effects-list {
                    list-style: none;
                    padding: 0;
                    margin: 10px 0;
                }

                .effects-list li {
                    padding: 8px 12px;
                    margin: 5px 0;
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 4px;
                    color: #856404;
                }

                .effects-list li.positive {
                    background: #d4edda;
                    border-color: #c3e6cb;
                    color: #155724;
                }

                .effects-list li.negative {
                    background: #f8d7da;
                    border-color: #f5c6cb;
                    color: #721c24;
                }

                .event-options h4 {
                    margin-top: 20px;
                    margin-bottom: 15px;
                    color: #2c3e50;
                }

                .options-container {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .event-option {
                    background: white;
                    border: 2px solid #bdc3c7;
                    border-radius: 8px;
                    padding: 15px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }

                .event-option:hover {
                    border-color: #3498db;
                    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
                    transform: translateY(-1px);
                }

                .event-option.selected {
                    border-color: #3498db;
                    background: #ebf3fd;
                }

                .option-text {
                    font-weight: 500;
                    margin-bottom: 5px;
                    color: #2c3e50;
                }

                .option-consequence {
                    font-size: 0.9em;
                    color: #7f8c8d;
                    font-style: italic;
                }

                .option-consequence.positive { color: #27ae60; }
                .option-consequence.negative { color: #e74c3c; }

                .event-timestamp {
                    font-size: 0.9em;
                    color: #7f8c8d;
                }

                .priority-indicator {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                .priority-indicator.emergency {
                    background: #e74c3c;
                    animation: pulse 1s infinite;
                }

                .priority-indicator.high {
                    background: #f39c12;
                }

                .priority-indicator.medium {
                    background: #3498db;
                }

                .priority-indicator.low {
                    background: #95a5a6;
                }

                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                    100% { opacity: 1; transform: scale(1); }
                }

                .event-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 15px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    max-width: 300px;
                    z-index: 1000;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .event-notification:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
                }

                .event-notification.priority-high {
                    border-left: 4px solid #e74c3c;
                    animation: shake 0.5s ease-in-out;
                }

                .event-notification.priority-medium {
                    border-left: 4px solid #f39c12;
                }

                .event-notification.priority-low {
                    border-left: 4px solid #3498db;
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }

                .notification-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                    color: #2c3e50;
                }

                .notification-preview {
                    font-size: 0.9em;
                    color: #7f8c8d;
                    line-height: 1.3;
                }
            </style>
        `;

        if (!document.getElementById('event-ui-styles')) {
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }

    async showEvent(eventData) {
        console.log('🎭 Showing event to player:', eventData.title);

        // If an emergency event, show immediately
        if (eventData.priority === 'emergency' || eventData.requiresImmediate) {
            await this.showEventModal(eventData);
        } else {
            // Show notification for non-urgent events
            this.showEventNotification(eventData);
            this.eventQueue.push(eventData);
        }
    }

    showEventNotification(eventData) {
        const notification = document.createElement('div');
        notification.className = `event-notification priority-${eventData.priority || 'medium'}`;
        notification.innerHTML = `
            <div class="notification-title">${eventData.title}</div>
            <div class="notification-preview">${this.truncateText(eventData.description, 80)}</div>
        `;

        // Click to open full event
        notification.addEventListener('click', () => {
            this.showEventModal(eventData);
            notification.remove();
        });

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);

        document.body.appendChild(notification);
    }

    async showEventModal(eventData) {
        if (this.isShowingEvent) {
            // Queue the event if one is already showing
            this.eventQueue.unshift(eventData);
            return;
        }

        this.isShowingEvent = true;
        this.activeEventModal = eventData;

        const modal = document.getElementById('event-modal');
        const badge = modal.querySelector('.event-type-badge');
        const title = modal.querySelector('.event-title');
        const description = modal.querySelector('.event-description');
        const effectsSection = modal.querySelector('.event-effects');
        const effectsList = modal.querySelector('.effects-list');
        const optionsContainer = modal.querySelector('.options-container');
        const timestamp = modal.querySelector('.event-timestamp');

        // Set event type badge
        badge.textContent = this.getEventTypeLabel(eventData.type);
        badge.className = `event-type-badge ${this.getEventTypeClass(eventData.type)}`;

        // Set title and description
        title.textContent = eventData.title;
        description.textContent = eventData.description;

        // Show effects if available
        if (eventData.effects && eventData.effects.length > 0) {
            effectsSection.classList.remove('hidden');
            effectsList.innerHTML = '';
            
            eventData.effects.forEach(effect => {
                const li = document.createElement('li');
                li.textContent = effect;
                li.className = this.getEffectClass(effect);
                effectsList.appendChild(li);
            });
        } else {
            effectsSection.classList.add('hidden');
        }

        // Create option buttons
        optionsContainer.innerHTML = '';
        
        if (eventData.options && eventData.options.length > 0) {
            eventData.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'event-option';
                optionDiv.innerHTML = `
                    <div class="option-text">${option}</div>
                    <div class="option-consequence ${this.getConsequenceClass(eventData.consequences, option)}">
                        ${eventData.consequences && eventData.consequences[option] ? eventData.consequences[option] : ''}
                    </div>
                `;

                optionDiv.addEventListener('click', () => {
                    this.selectEventOption(index, option);
                });

                optionsContainer.appendChild(optionDiv);
            });
        } else {
            // Default acknowledge option
            const defaultOption = document.createElement('div');
            defaultOption.className = 'event-option';
            defaultOption.innerHTML = '<div class="option-text">Acknowledge</div>';
            defaultOption.addEventListener('click', () => {
                this.selectEventOption(0, 'acknowledge');
            });
            optionsContainer.appendChild(defaultOption);
        }

        // Set timestamp
        timestamp.textContent = new Date(eventData.timestamp).toLocaleTimeString();

        // Add priority indicator
        if (eventData.priority) {
            const indicator = document.createElement('div');
            indicator.className = `priority-indicator ${eventData.priority}`;
            modal.querySelector('.modal-header').appendChild(indicator);
        }

        // Show modal
        modal.classList.remove('hidden');

        // Pause game for high priority events
        if (eventData.priority === 'emergency' || eventData.priority === 'high') {
            this.gameState.paused = true;
        }
    }

    selectEventOption(optionIndex, optionText) {
        // Highlight selected option
        const options = document.querySelectorAll('.event-option');
        options.forEach(opt => opt.classList.remove('selected'));
        options[optionIndex].classList.add('selected');

        // Wait a moment for visual feedback, then resolve
        setTimeout(() => {
            this.resolveEvent(optionText);
        }, 300);
    }

    resolveEvent(resolution) {
        if (!this.activeEventModal) return;

        const event = this.activeEventModal;
        
        console.log('✅ Player resolved event:', event.title, 'with:', resolution);

        // Add to history
        this.eventHistory.unshift({
            ...event,
            resolution: resolution,
            resolvedAt: Date.now()
        });

        // Limit history size
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory = this.eventHistory.slice(0, this.maxHistorySize);
        }

        // Emit resolution event
        this.eventBus.emit('event.resolved', {
            event: event,
            resolution: resolution
        });

        // Close modal
        this.closeEventModal();

        // Show next event if queued
        this.processEventQueue();
    }

    closeEventModal() {
        const modal = document.getElementById('event-modal');
        modal.classList.add('hidden');
        
        // Clear priority indicator
        const indicator = modal.querySelector('.priority-indicator');
        if (indicator) {
            indicator.remove();
        }

        // Unpause game
        this.gameState.paused = false;
        
        this.isShowingEvent = false;
        this.activeEventModal = null;

        // Process any queued events
        this.processEventQueue();
    }

    postponeEvent() {
        if (this.activeEventModal) {
            // Move to end of queue
            this.eventQueue.push(this.activeEventModal);
            this.closeEventModal();
        }
    }

    async processEventQueue() {
        if (this.isShowingEvent || this.eventQueue.length === 0) {
            return;
        }

        // Wait a moment between events
        setTimeout(async () => {
            const nextEvent = this.eventQueue.shift();
            await this.showEventModal(nextEvent);
        }, 1000);
    }

    handleEventResolved(data) {
        // Update UI based on resolution effects
        this.showResolutionFeedback(data);
    }

    showResolutionFeedback(data) {
        const { event, resolution } = data;
        
        // Show a brief feedback message
        if (typeof uiManager !== 'undefined') {
            const message = `${event.title} resolved: ${resolution}`;
            uiManager.showNotification(message, 'info', 3000);
        }
    }

    // Utility methods
    getEventTypeLabel(type) {
        const labels = {
            'businessEvent': 'Business',
            'customerIncident': 'Customer',
            'staffDrama': 'Staff',
            'financialEvent': 'Financial',
            'socialMediaEvent': 'Social',
            'emergencyEvent': 'Emergency',
            'localNews': 'News'
        };
        return labels[type] || 'Event';
    }

    getEventTypeClass(type) {
        const classes = {
            'businessEvent': 'business',
            'customerIncident': 'customer',
            'staffDrama': 'staff',
            'financialEvent': 'financial',
            'socialMediaEvent': 'social',
            'emergencyEvent': 'emergency',
            'localNews': 'news'
        };
        return classes[type] || 'business';
    }

    getEffectClass(effectText) {
        const text = effectText.toLowerCase();
        if (text.includes('increase') || text.includes('improve') || text.includes('gain')) {
            return 'positive';
        }
        if (text.includes('decrease') || text.includes('lose') || text.includes('damage')) {
            return 'negative';
        }
        return '';
    }

    getConsequenceClass(consequences, option) {
        if (!consequences || !consequences[option]) return '';
        
        const text = consequences[option].toLowerCase();
        if (text.includes('positive') || text.includes('benefit') || text.includes('gain')) {
            return 'positive';
        }
        if (text.includes('negative') || text.includes('cost') || text.includes('lose')) {
            return 'negative';
        }
        return '';
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Public API
    getEventHistory() {
        return this.eventHistory;
    }

    getQueuedEvents() {
        return this.eventQueue;
    }

    hasActiveEvent() {
        return this.isShowingEvent;
    }

    clearEventQueue() {
        this.eventQueue = [];
        console.log('🗑️ Event queue cleared');
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.eventUIManager = new EventUIManager();
}
