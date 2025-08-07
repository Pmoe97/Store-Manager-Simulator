// UI Manager - Controls all UI elements and screen transitions
class UIManager {
    constructor() {
        this.initialized = false;
        this.currentScreen = null;
        this.currentView = null;
        this.screens = new Map();
        this.views = new Map();
        this.modals = new Map();
        this.notifications = [];
        
        // Bind methods
        this.initialize = this.initialize.bind(this);
        this.showScreen = this.showScreen.bind(this);
        this.showView = this.showView.bind(this);
        this.showModal = this.showModal.bind(this);
        this.showNotification = this.showNotification.bind(this);
    }

    // Initialize UI manager
    initialize() {
        if (this.initialized) return;

        console.log('🖥️ Initializing UI Manager...');

        try {
            // Cache screen and view elements
            this.cacheElements();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize notification system
            this.initializeNotifications();
            
            // Set up keyboard shortcuts
            this.setupKeyboardShortcuts();

            this.initialized = true;
            console.log('✅ UI Manager initialized');

        } catch (error) {
            console.error('❌ UI Manager initialization failed:', error);
            throw error;
        }
    }

    // Cache DOM elements
    cacheElements() {
        // Cache screens
        const screenElements = document.querySelectorAll('.screen');
        screenElements.forEach(screen => {
            this.screens.set(screen.id, screen);
        });

        // Cache views
        const viewElements = document.querySelectorAll('.view');
        viewElements.forEach(view => {
            this.views.set(view.id, view);
        });

        // Cache common elements
        this.elements = {
            notificationContainer: document.getElementById('notification-container'),
            modalContainer: document.getElementById('modal-container'),
            loadingScreen: document.getElementById('loading-screen')
        };

        console.log(`📱 Cached ${this.screens.size} screens and ${this.views.size} views`);
    }

    // Set up event listeners
    setupEventListeners() {
        // Listen for game state changes
        gameEventBus.on(GAME_EVENTS.VIEW_CHANGED, this.handleViewChange, this);
        gameEventBus.on('state:changed', this.handleStateChange, this);

        // Set up common button handlers
        this.setupCommonButtons();

        console.log('👂 UI event listeners setup');
    }

    // Set up common button handlers
    setupCommonButtons() {
        // Computer button
        const computerBtn = document.getElementById('computer-btn');
        if (computerBtn) {
            computerBtn.addEventListener('click', () => {
                this.showView('computer');
                gameState.setView(GAME_CONSTANTS.VIEWS.COMPUTER);
                gameEventBus.emit(GAME_EVENTS.COMPUTER_OPENED);
                
                // Initialize work computer if not already done
                if (typeof workComputer !== 'undefined' && !workComputer.initialized) {
                    workComputer.initialize();
                }
            });
        }

        // Note: Close computer is now handled by work computer system
        // Work computer handles its own close/exit functionality

        // Pause button
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (typeof app !== 'undefined') {
                    if (gameState.getState() === GAME_CONSTANTS.GAME_STATES.PLAYING) {
                        app.pause();
                    } else if (gameState.getState() === GAME_CONSTANTS.GAME_STATES.PAUSED) {
                        app.resume();
                    }
                }
            });
        }

        // End conversation button
        const endConversationBtn = document.getElementById('end-conversation');
        if (endConversationBtn) {
            endConversationBtn.addEventListener('click', () => {
                this.showView('store');
                gameState.setView(GAME_CONSTANTS.VIEWS.STORE);
                gameEventBus.emit(GAME_EVENTS.CONVERSATION_ENDED);
            });
        }
    }

    // Show a screen
    showScreen(screenId) {
        // Hide all screens first
        this.screens.forEach(screen => {
            screen.classList.add('hidden');
        });

        // Show target screen
        const targetScreen = this.screens.get(screenId) || this.screens.get(`${screenId}-screen`);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.currentScreen = screenId;
            console.log(`📱 Showing screen: ${screenId}`);
        } else {
            console.warn(`⚠️ Screen not found: ${screenId}`);
        }
    }

    // Show a view within the game interface
    showView(viewId) {
        // Remove active class from all views
        this.views.forEach(view => {
            view.classList.remove('active');
        });

        // Show target view
        const targetView = this.views.get(viewId) || this.views.get(`${viewId}-view`);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewId;
            console.log(`👁️ Showing view: ${viewId}`);
        } else {
            console.warn(`⚠️ View not found: ${viewId}`);
        }
    }

    // Show a modal
    showModal(modalConfig) {
        if (!this.elements.modalContainer) {
            console.warn('⚠️ Modal container not found');
            return null;
        }

        const modalId = modalConfig.id || `modal_${Date.now()}`;
        
        // Create modal element
        const modal = this.createModal(modalConfig);
        modal.id = modalId;

        // Add to container
        this.elements.modalContainer.appendChild(modal);
        this.modals.set(modalId, modal);

        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        // Emit event
        gameEventBus.emit(GAME_EVENTS.MODAL_OPENED, { id: modalId, config: modalConfig });

        console.log(`🪟 Modal shown: ${modalId}`);
        return modalId;
    }

    // Create modal element
    createModal(config) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${config.title || 'Modal'}</h3>
                    <button class="modal-close" aria-label="Close">&times;</button>
                </div>
                <div class="modal-body">
                    ${config.content || ''}
                </div>
                <div class="modal-footer">
                    ${config.buttons ? this.createModalButtons(config.buttons) : ''}
                </div>
            </div>
        `;

        // Set up close functionality
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal;

        const closeModal = () => this.closeModal(modal.id);

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        return modal;
    }

    // Create modal buttons
    createModalButtons(buttons) {
        return buttons.map(button => 
            `<button class="btn ${button.class || 'btn-primary'}" 
                     onclick="${button.action || ''}">${button.text}</button>`
        ).join('');
    }

    // Close modal
    closeModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.classList.remove('active');
            
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
                this.modals.delete(modalId);
            }, 300);

            gameEventBus.emit(GAME_EVENTS.MODAL_CLOSED, { id: modalId });
            console.log(`🪟 Modal closed: ${modalId}`);
        }
    }

    // Show notification
    showNotification(message, type = 'info', duration = 3000) {
        if (!this.elements.notificationContainer) {
            console.warn('⚠️ Notification container not found');
            return;
        }

        const notificationId = `notification_${Date.now()}`;
        const notification = this.createNotification(message, type, notificationId);

        // Add to container
        this.elements.notificationContainer.appendChild(notification);
        this.notifications.push({ id: notificationId, element: notification });

        // Show notification
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notificationId);
            }, duration);
        }

        // Emit event
        gameEventBus.emit(GAME_EVENTS.NOTIFICATION_SHOWN, { 
            id: notificationId, 
            message, 
            type 
        });

        console.log(`🔔 Notification shown: ${message}`);
        return notificationId;
    }

    // Create notification element
    createNotification(message, type, id) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.id = id;

        const icon = this.getNotificationIcon(type);
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icon}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close">&times;</button>
            </div>
        `;

        // Set up close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(id);
        });

        return notification;
    }

    // Get notification icon based on type
    getNotificationIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            money: '💰',
            customer: '👤',
            time: '🕐'
        };
        return icons[type] || icons.info;
    }

    // Remove notification
    removeNotification(notificationId) {
        const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
        if (notificationIndex >= 0) {
            const notification = this.notifications[notificationIndex];
            
            notification.element.classList.remove('active');
            
            setTimeout(() => {
                if (notification.element.parentNode) {
                    notification.element.parentNode.removeChild(notification.element);
                }
                this.notifications.splice(notificationIndex, 1);
            }, 300);
        }
    }

    // Initialize notification system
    initializeNotifications() {
        // Listen for common game events and show notifications
        gameEventBus.on(GAME_EVENTS.TRANSACTION_COMPLETED, (data) => {
            this.showNotification(`Sale completed: +$${data.amount}`, 'money');
        });

        gameEventBus.on(GAME_EVENTS.CUSTOMER_ENTERED, (data) => {
            this.showNotification(`${data.name} entered your store`, 'customer');
        });

        gameEventBus.on(GAME_EVENTS.CASH_LOW, () => {
            this.showNotification('Warning: Cash is running low!', 'warning');
        });

        console.log('🔔 Notification system initialized');
    }

    // Set up keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key) {
                case 'Escape':
                    // Close modals or return to store view
                    if (this.modals.size > 0) {
                        const lastModal = Array.from(this.modals.keys()).pop();
                        this.closeModal(lastModal);
                    } else if (this.currentView !== 'store') {
                        this.showView('store');
                        gameState.setView(GAME_CONSTANTS.VIEWS.STORE);
                    }
                    break;
                
                case 'c':
                case 'C':
                    // Open computer
                    if (this.currentView === 'store') {
                        this.showView('computer');
                        gameState.setView(GAME_CONSTANTS.VIEWS.COMPUTER);
                    }
                    break;
                
                case 'p':
                case 'P':
                    // Pause/unpause
                    if (typeof app !== 'undefined') {
                        if (gameState.getState() === GAME_CONSTANTS.GAME_STATES.PLAYING) {
                            app.pause();
                        } else if (gameState.getState() === GAME_CONSTANTS.GAME_STATES.PAUSED) {
                            app.resume();
                        }
                    }
                    break;
            }
        });

        console.log('⌨️ Keyboard shortcuts setup');
    }

    // Handle view changes
    handleViewChange(data) {
        this.showView(data.newView);
    }

    // Handle state changes
    handleStateChange(data) {
        const { newState } = data;
        
        // Update UI based on state
        switch (newState) {
            case GAME_CONSTANTS.GAME_STATES.SETUP:
                this.showScreen('setup');
                break;
            case GAME_CONSTANTS.GAME_STATES.PLAYING:
                this.showScreen('game');
                break;
            case GAME_CONSTANTS.GAME_STATES.PAUSED:
                this.showNotification('Game Paused', 'info', 0);
                break;
        }
    }

    // Update game UI elements
    updateUI(data) {
        // Update cash display
        const cashElement = document.getElementById('current-cash');
        if (cashElement && data.cash !== undefined) {
            cashElement.textContent = `$${data.cash.toLocaleString()}`;
        }

        // Update time display
        const timeElement = document.getElementById('current-time');
        if (timeElement && data.time) {
            timeElement.textContent = data.time;
        }

        // Update store name
        const storeNameElement = document.getElementById('store-name');
        if (storeNameElement && data.storeName) {
            storeNameElement.textContent = data.storeName;
        }
    }

    // Get current UI state
    getState() {
        return {
            currentScreen: this.currentScreen,
            currentView: this.currentView,
            activeModals: Array.from(this.modals.keys()),
            notificationCount: this.notifications.length
        };
    }

    // Clean up
    destroy() {
        // Remove event listeners
        gameEventBus.removeAllListeners();
        
        // Clear modals and notifications
        this.modals.clear();
        this.notifications = [];
        
        this.initialized = false;
        console.log('🧹 UI Manager destroyed');
    }
}

// Create global UI manager instance
const uiManager = new UIManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIManager, uiManager };
}
