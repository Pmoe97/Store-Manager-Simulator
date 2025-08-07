// Main Application Entry Point
class StoreManagerSimulator {
    constructor() {
        this.initialized = false;
        this.version = '1.0.0';
        
        // Bind methods
        this.init = this.init.bind(this);
        this.start = this.start.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    // Initialize the application
    async init() {
        if (this.initialized) return;

        console.log('🏪 Store Manager Simulator v' + this.version);
        console.log('🚀 Initializing application...');

        try {
            // Set up global error handling
            this.setupErrorHandling();

            // Show loading screen
            this.showLoadingScreen();

            // Initialize core systems in order
            await this.initializeCoreystems();

            // Hide loading screen
            this.hideLoadingScreen();

            // Start the game
            await this.start();

            this.initialized = true;
            console.log('✅ Application initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.handleError(error, 'initialization');
        }
    }

    // Initialize core systems
    async initializeCoreystems() {
        console.log('⚙️ Initializing core systems...');

        // Initialize AI hooks first
        aiHooks.initialize();

        // Initialize game state
        gameState.initialize();

        // Initialize UI manager
        if (typeof uiManager !== 'undefined') {
            uiManager.initialize();
        }

        // Phase 4C: Initialize Event UI Manager
        if (typeof eventUIManager !== 'undefined') {
            eventUIManager.initialize(gameState, gameEventBus);
            console.log('🎭 Event UI Manager initialized');
        }

        // Initialize event bus for system communication
        if (typeof gameEventBus !== 'undefined') {
            console.log('📡 Event bus ready');
        }

        // Initialize time system early (needed by other systems)
        if (typeof timeSystem !== 'undefined') {
            timeSystem.initialize();
            console.log('⏰ Time system initialized');
        }

        // Initialize NPC system
        if (typeof npcSystem !== 'undefined') {
            npcSystem.initialize(gameState, gameEventBus, aiHooks);
            console.log('👥 NPC system initialized');
        }

        // Initialize conversation system
        if (typeof conversationSystem !== 'undefined') {
            conversationSystem.initialize(gameState, gameEventBus, aiHooks, npcSystem);
            console.log('💬 Conversation system initialized');
        }

        // Phase 4C: Initialize AI Content Manager with all systems
        if (typeof AIContentManager !== 'undefined') {
            window.aiContentManager = new AIContentManager();
            
            const aiSystems = {
                // Phase 4A: NPC AI Enhancement
                npcAIEnhancer: typeof npcAIEnhancer !== 'undefined' ? npcAIEnhancer : null,
                
                // Phase 4B: Product AI Generation
                productAIGenerator: typeof productAIGenerator !== 'undefined' ? productAIGenerator : null,
                
                // Core systems needed by AI
                npcSystem: npcSystem,
                conversationSystem: conversationSystem,
                timeSystem: timeSystem
            };
            
            await window.aiContentManager.initialize(gameState, gameEventBus, aiHooks, aiSystems);
            
            // Enhance existing systems with AI capabilities
            if (conversationSystem && window.aiContentManager.dialogueAI) {
                await window.aiContentManager.enhanceConversationSystem(conversationSystem);
            }
            
            if (npcSystem && window.aiContentManager.npcAIEnhancer) {
                await window.aiContentManager.enhanceNPCSystem(npcSystem);
            }
            
            console.log('🤖 AI Content Manager initialized with all Phase 4 systems');
        }

        // Initialize work computer system
        if (typeof WorkComputer !== 'undefined') {
            window.workComputer = new WorkComputer();
            console.log('💻 Work computer system initialized');
        }

        // Check for existing save data
        const hasExistingSave = this.checkForExistingSave();
        
        if (hasExistingSave) {
            console.log('💾 Found existing save data');
            // Will handle save loading in game initialization
        } else {
            console.log('🆕 No existing save found - new game');
        }

        console.log('✅ Core systems initialized with Phase 4C AI enhancement');
    }

    // Start the game
    async start() {
        console.log('🎮 Starting game...');

        // Check if player has completed setup
        const playerData = gameState.getValue('player');
        const isSetupComplete = playerData && playerData.name && playerData.name.trim() !== '';

        if (isSetupComplete) {
            // Go directly to game
            this.startMainGame();
        } else {
            // Show setup screen
            this.startSetup();
        }
    }

    // Start setup process
    startSetup() {
        console.log('📝 Starting setup process...');
        
        gameState.setState(GAME_CONSTANTS.GAME_STATES.SETUP);
        
        if (typeof uiManager !== 'undefined') {
            uiManager.showScreen('setup');
        }

        // Emit setup started event
        gameEventBus.emit('setup:started');
    }

    // Start main game
    async startMainGame() {
        console.log('🏪 Starting main game...');
        
        gameState.setState(GAME_CONSTANTS.GAME_STATES.PLAYING);
        gameState.setView(GAME_CONSTANTS.VIEWS.STORE);
        
        if (typeof uiManager !== 'undefined') {
            uiManager.showScreen('game');
            uiManager.showView('store');
        }

        // Start time system if available
        if (typeof timeSystem !== 'undefined') {
            timeSystem.start();
        }

        // Phase 4C: Test AI systems and start content generation
        if (window.aiContentManager) {
            console.log('🧪 Testing AI systems...');
            
            try {
                const testResults = await window.aiContentManager.testAllSystems();
                console.log('🎯 AI System Test Results:', testResults);
                
                // Display AI system status to player
                if (typeof uiManager !== 'undefined') {
                    const systemStatus = window.aiContentManager.getSystemStatus();
                    uiManager.showNotification(`AI Systems Online: ${Object.values(systemStatus.systems).filter(Boolean).length}/5 systems active`, 'success');
                }
                
            } catch (error) {
                console.warn('⚠️ AI system testing failed:', error);
                if (typeof uiManager !== 'undefined') {
                    uiManager.showNotification('AI systems running with limited functionality', 'warning');
                }
            }
        }

        // Emit game started event
        gameEventBus.emit(GAME_EVENTS.GAME_STARTED);
        
        console.log('🎮 Main game started with AI enhancement');
    }

    // Show loading screen
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    // Hide loading screen
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    // Check for existing save data
    checkForExistingSave() {
        try {
            const quicksave = localStorage.getItem('storeManager_quicksave');
            const autosave = localStorage.getItem('storeManager_autosave');
            return !!(quicksave || autosave);
        } catch (error) {
            console.warn('⚠️ Could not check for existing saves:', error);
            return false;
        }
    }

    // Setup global error handling
    setupErrorHandling() {
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'runtime', event);
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'promise', event);
        });

        console.log('🛡️ Error handling setup complete');
    }

    // Handle application errors
    handleError(error, context = 'unknown', event = null) {
        console.error(`❌ Error in ${context}:`, error);

        // Log additional event info if available
        if (event) {
            console.error('Event details:', {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        }

        // Show user-friendly error message
        this.showErrorMessage(error, context);

        // Try to save game state if error occurs during gameplay
        if (context === 'runtime' && gameState.getState() === GAME_CONSTANTS.GAME_STATES.PLAYING) {
            try {
                gameState.save('emergency_save');
                console.log('💾 Emergency save completed');
            } catch (saveError) {
                console.error('❌ Emergency save failed:', saveError);
            }
        }
    }

    // Show error message to user
    showErrorMessage(error, context) {
        // Create error notification if UI manager is available
        if (typeof uiManager !== 'undefined' && uiManager.initialized) {
            uiManager.showNotification(`An error occurred in ${context}. The game has been saved.`, 'error');
        } else {
            // Fallback alert
            alert(`An error occurred: ${error.message || error}. Please refresh the page.`);
        }
    }

    // Pause the game
    pause() {
        if (gameState.getState() === GAME_CONSTANTS.GAME_STATES.PLAYING) {
            gameState.setState(GAME_CONSTANTS.GAME_STATES.PAUSED);
            gameEventBus.emit(GAME_EVENTS.GAME_PAUSED);
            console.log('⏸️ Game paused');
        }
    }

    // Resume the game
    resume() {
        if (gameState.getState() === GAME_CONSTANTS.GAME_STATES.PAUSED) {
            gameState.setState(GAME_CONSTANTS.GAME_STATES.PLAYING);
            gameEventBus.emit(GAME_EVENTS.GAME_RESUMED);
            console.log('▶️ Game resumed');
        }
    }

    // Save and quit
    saveAndQuit() {
        try {
            gameState.save('manual_save');
            console.log('💾 Game saved before quit');
            
            // Reset to loading state
            gameState.setState(GAME_CONSTANTS.GAME_STATES.LOADING);
            
            // Reload page to fully reset
            window.location.reload();
        } catch (error) {
            console.error('❌ Save and quit failed:', error);
            this.handleError(error, 'save-quit');
        }
    }

    // Get application info
    getInfo() {
        return {
            version: this.version,
            initialized: this.initialized,
            gameState: gameState.getState(),
            currentView: gameState.getView(),
            systemsStatus: {
                aiHooks: aiHooks.initialized,
                gameState: gameState.initialized,
                uiManager: typeof uiManager !== 'undefined' ? uiManager.initialized : false
            }
        };
    }
}

// Create global application instance
const app = new StoreManagerSimulator();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing application...');
    app.init();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - auto-save if playing
        if (gameState.getState() === GAME_CONSTANTS.GAME_STATES.PLAYING) {
            gameState.autoSave();
        }
    }
});

// Handle before page unload
window.addEventListener('beforeunload', (event) => {
    // Auto-save before leaving
    if (gameState.getState() === GAME_CONSTANTS.GAME_STATES.PLAYING) {
        gameState.autoSave();
        
        // Show confirmation dialog for unsaved changes
        event.preventDefault();
        event.returnValue = 'Are you sure you want to leave? Your game has been auto-saved.';
        return event.returnValue;
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StoreManagerSimulator, app };
}
