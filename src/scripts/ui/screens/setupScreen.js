/**
 * Setup Screen UI Controller - Handles the game setup flow interface
 */

class SetupScreenController {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.characterCreation = null;
        this.storeSetup = null;
        this.currentPhase = 'welcome'; // welcome, character, store, complete
        this.elements = {};
    }

    initialize(gameState, eventBus, characterCreation, storeSetup) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        this.characterCreation = characterCreation;
        this.storeSetup = storeSetup;
        
        this.bindElements();
        this.bindEvents();
        
        console.log('🎮 Setup Screen Controller initialized');
    }

    bindElements() {
        // Main setup container
        this.elements.setupContainer = document.getElementById('setupContainer');
        this.elements.setupContent = document.getElementById('setupContent');
        this.elements.setupProgress = document.getElementById('setupProgress');
        
        // Navigation
        this.elements.prevButton = document.getElementById('setupPrevButton');
        this.elements.nextButton = document.getElementById('setupNextButton');
        this.elements.skipButton = document.getElementById('setupSkipButton');
        
        // Phase containers
        this.elements.welcomePhase = document.getElementById('welcomePhase');
        this.elements.characterPhase = document.getElementById('characterPhase');
        this.elements.storePhase = document.getElementById('storePhase');
        this.elements.completePhase = document.getElementById('completePhase');
        
        // Welcome screen elements
        this.elements.newGameButton = document.getElementById('newGameButton');
        this.elements.loadGameButton = document.getElementById('loadGameButton');
        this.elements.adultContentToggle = document.getElementById('adultContentToggle');
        this.elements.difficultySelect = document.getElementById('difficultySelect');
        
        // Character creation elements
        this.elements.characterForm = document.getElementById('characterForm');
        this.elements.characterPreview = document.getElementById('characterPreview');
        this.elements.characterSteps = document.getElementById('characterSteps');
        
        // Store setup elements
        this.elements.storeForm = document.getElementById('storeForm');
        this.elements.storePreview = document.getElementById('storePreview');
        this.elements.storeSteps = document.getElementById('storeSteps');
        
        // Completion elements
        this.elements.gameStartButton = document.getElementById('gameStartButton');
        this.elements.setupSummary = document.getElementById('setupSummary');
    }

    bindEvents() {
        // Navigation events
        if (this.elements.prevButton) {
            this.elements.prevButton.addEventListener('click', () => this.previousStep());
        }
        
        if (this.elements.nextButton) {
            this.elements.nextButton.addEventListener('click', () => this.nextStep());
        }
        
        if (this.elements.skipButton) {
            this.elements.skipButton.addEventListener('click', () => this.skipPhase());
        }
        
        // Welcome screen events
        if (this.elements.newGameButton) {
            this.elements.newGameButton.addEventListener('click', () => this.startNewGame());
        }
        
        if (this.elements.loadGameButton) {
            this.elements.loadGameButton.addEventListener('click', () => this.loadGame());
        }
        
        if (this.elements.adultContentToggle) {
            this.elements.adultContentToggle.addEventListener('change', (e) => {
                this.toggleAdultContent(e.target.checked);
            });
        }
        
        if (this.elements.difficultySelect) {
            this.elements.difficultySelect.addEventListener('change', (e) => {
                this.setDifficulty(e.target.value);
            });
        }
        
        // Final start button
        if (this.elements.gameStartButton) {
            this.elements.gameStartButton.addEventListener('click', () => this.startGame());
        }
        
        // Listen for system events
        this.eventBus.on('setup.characterComplete', () => this.characterCompleted());
        this.eventBus.on('setup.storeComplete', () => this.storeCompleted());
        this.eventBus.on('character.stepChanged', (data) => this.updateCharacterStep(data));
        this.eventBus.on('store.stepChanged', (data) => this.updateStoreStep(data));
        this.eventBus.on('ui.showSetup', (phase) => this.show(phase));
        this.eventBus.on('ui.hideSetup', () => this.hide());
    }

    show(phase = 'welcome') {
        this.currentPhase = phase;
        
        if (this.elements.setupContainer) {
            this.elements.setupContainer.style.display = 'flex';
            this.elements.setupContainer.classList.add('active');
        }
        
        this.updatePhase();
        this.updateProgress();
        this.updateNavigation();
        
        console.log('🎮 Setup screen shown, phase:', phase);
    }

    hide() {
        if (this.elements.setupContainer) {
            this.elements.setupContainer.style.display = 'none';
            this.elements.setupContainer.classList.remove('active');
        }
        
        console.log('🎮 Setup screen hidden');
    }

    updatePhase() {
        // Hide all phases
        const phases = [this.elements.welcomePhase, this.elements.characterPhase, 
                       this.elements.storePhase, this.elements.completePhase];
        
        phases.forEach(phase => {
            if (phase) {
                phase.style.display = 'none';
                phase.classList.remove('active');
            }
        });
        
        // Show current phase
        let currentElement = null;
        switch (this.currentPhase) {
            case 'welcome':
                currentElement = this.elements.welcomePhase;
                break;
            case 'character':
                currentElement = this.elements.characterPhase;
                break;
            case 'store':
                currentElement = this.elements.storePhase;
                break;
            case 'complete':
                currentElement = this.elements.completePhase;
                break;
        }
        
        if (currentElement) {
            currentElement.style.display = 'block';
            currentElement.classList.add('active');
        }
    }

    updateProgress() {
        if (!this.elements.setupProgress) return;
        
        const phases = ['welcome', 'character', 'store', 'complete'];
        const currentIndex = phases.indexOf(this.currentPhase);
        const progress = ((currentIndex + 1) / phases.length) * 100;
        
        this.elements.setupProgress.style.width = `${progress}%`;
        this.elements.setupProgress.setAttribute('aria-valuenow', progress);
    }

    updateNavigation() {
        // Update navigation buttons based on current phase
        const isFirst = this.currentPhase === 'welcome';
        const isLast = this.currentPhase === 'complete';
        
        if (this.elements.prevButton) {
            this.elements.prevButton.style.display = isFirst ? 'none' : 'inline-block';
            this.elements.prevButton.disabled = isFirst;
        }
        
        if (this.elements.nextButton) {
            this.elements.nextButton.style.display = isLast ? 'none' : 'inline-block';
            this.elements.nextButton.disabled = isLast;
            
            // Update button text based on phase
            let buttonText = 'Next';
            if (this.currentPhase === 'character') {
                buttonText = 'Continue to Store Setup';
            } else if (this.currentPhase === 'store') {
                buttonText = 'Review & Complete';
            }
            this.elements.nextButton.textContent = buttonText;
        }
        
        if (this.elements.skipButton) {
            this.elements.skipButton.style.display = 
                (this.currentPhase === 'character' || this.currentPhase === 'store') ? 'inline-block' : 'none';
        }
    }

    startNewGame() {
        // Initialize new game data
        this.gameState.initializeNewGame();
        
        // Set up initial game settings
        const adultContent = this.elements.adultContentToggle?.checked || false;
        const difficulty = this.elements.difficultySelect?.value || 'normal';
        
        this.gameState.data.meta.adultContentEnabled = adultContent;
        this.gameState.data.meta.difficulty = difficulty;
        
        // Move to character creation
        this.currentPhase = 'character';
        this.updatePhase();
        this.updateProgress();
        this.updateNavigation();
        
        // Start character creation system
        this.characterCreation.startCharacterCreation();
        
        this.eventBus.emit('setup.newGameStarted', { adultContent, difficulty });
        console.log('🎮 New game started');
    }

    loadGame() {
        // Trigger file input for save file
        this.eventBus.emit('save.requestLoad');
        console.log('🎮 Load game requested');
    }

    toggleAdultContent(enabled) {
        if (enabled) {
            // Show confirmation dialog for adult content
            this.showAdultContentWarning();
        } else {
            this.gameState.data.meta.adultContentEnabled = false;
            this.eventBus.emit('settings.adultContentChanged', false);
        }
    }

    showAdultContentWarning() {
        const warning = `
            <div class="adult-content-warning">
                <h3>Adult Content Warning</h3>
                <p>This game may contain mature themes and adult content including:</p>
                <ul>
                    <li>Romantic and sexual scenarios</li>
                    <li>Mature dialogue and situations</li>
                    <li>Adult-oriented products and businesses</li>
                </ul>
                <p>By enabling this option, you confirm that you are 18+ years old and consent to viewing such content.</p>
                <p><strong>You can disable this at any time in the settings.</strong></p>
            </div>
        `;
        
        this.eventBus.emit('ui.showModal', {
            title: 'Adult Content Warning',
            content: warning,
            buttons: [
                {
                    text: 'I am 18+ and Agree',
                    class: 'btn-primary',
                    action: () => {
                        this.gameState.data.meta.adultContentEnabled = true;
                        this.eventBus.emit('settings.adultContentChanged', true);
                        this.eventBus.emit('ui.hideModal');
                    }
                },
                {
                    text: 'Cancel',
                    class: 'btn-secondary',
                    action: () => {
                        this.elements.adultContentToggle.checked = false;
                        this.eventBus.emit('ui.hideModal');
                    }
                }
            ]
        });
    }

    setDifficulty(difficulty) {
        this.gameState.data.meta.difficulty = difficulty;
        
        // Adjust starting conditions based on difficulty
        const difficultySettings = {
            easy: {
                cashMultiplier: 1.5,
                debtReduction: 0.5,
                customerPatience: 1.3
            },
            normal: {
                cashMultiplier: 1.0,
                debtReduction: 1.0,
                customerPatience: 1.0
            },
            hard: {
                cashMultiplier: 0.7,
                debtReduction: 1.3,
                customerPatience: 0.8
            }
        };
        
        const settings = difficultySettings[difficulty] || difficultySettings.normal;
        this.gameState.data.meta.difficultySettings = settings;
        
        this.eventBus.emit('settings.difficultyChanged', { difficulty, settings });
        console.log('🎮 Difficulty set to:', difficulty);
    }

    nextStep() {
        const phases = ['welcome', 'character', 'store', 'complete'];
        const currentIndex = phases.indexOf(this.currentPhase);
        
        if (currentIndex < phases.length - 1) {
            // Validate current phase before moving
            if (this.validateCurrentPhase()) {
                const nextPhase = phases[currentIndex + 1];
                this.moveToPhase(nextPhase);
            }
        }
    }

    previousStep() {
        const phases = ['welcome', 'character', 'store', 'complete'];
        const currentIndex = phases.indexOf(this.currentPhase);
        
        if (currentIndex > 0) {
            const prevPhase = phases[currentIndex - 1];
            this.moveToPhase(prevPhase);
        }
    }

    moveToPhase(phase) {
        this.currentPhase = phase;
        this.updatePhase();
        this.updateProgress();
        this.updateNavigation();
        
        // Start appropriate system for the phase
        if (phase === 'character') {
            this.characterCreation.startCharacterCreation();
        } else if (phase === 'store') {
            this.storeSetup.startStoreSetup();
        } else if (phase === 'complete') {
            this.showCompletionSummary();
        }
        
        this.eventBus.emit('setup.phaseChanged', { phase });
    }

    validateCurrentPhase() {
        switch (this.currentPhase) {
            case 'welcome':
                return true; // Welcome phase has no validation
            case 'character':
                return this.characterCreation.validateComplete();
            case 'store':
                return this.storeSetup.validateComplete();
            case 'complete':
                return true;
            default:
                return false;
        }
    }

    skipPhase() {
        if (this.currentPhase === 'character') {
            // Use default character
            this.characterCreation.usePreset('friendly');
            this.characterCreation.finishCharacterCreation();
        } else if (this.currentPhase === 'store') {
            // Use default store setup
            this.storeSetup.selectStoreType('general');
            this.storeSetup.selectEnvironment('suburban');
            this.storeSetup.updateBasicInfo({
                name: 'My Store',
                description: 'A friendly neighborhood store serving the local community.'
            });
            this.storeSetup.finishStoreSetup();
        }
    }

    characterCompleted() {
        console.log('✅ Character creation completed');
        this.moveToPhase('store');
    }

    storeCompleted() {
        console.log('✅ Store setup completed');
        this.moveToPhase('complete');
    }

    updateCharacterStep(data) {
        // Update character creation step indicator
        if (this.elements.characterSteps) {
            this.updateStepIndicator(this.elements.characterSteps, data.step, 
                ['basic', 'appearance', 'personality', 'review']);
        }
    }

    updateStoreStep(data) {
        // Update store setup step indicator
        if (this.elements.storeSteps) {
            this.updateStepIndicator(this.elements.storeSteps, data.step, 
                ['type', 'environment', 'basic', 'products', 'review']);
        }
    }

    updateStepIndicator(container, currentStep, steps) {
        const stepElements = container.querySelectorAll('.step-indicator');
        const currentIndex = steps.indexOf(currentStep);
        
        stepElements.forEach((element, index) => {
            element.classList.remove('active', 'completed');
            
            if (index < currentIndex) {
                element.classList.add('completed');
            } else if (index === currentIndex) {
                element.classList.add('active');
            }
        });
    }

    showCompletionSummary() {
        if (!this.elements.setupSummary) return;
        
        const character = this.gameState.data.player;
        const store = this.gameState.data.store;
        const finances = this.gameState.data.finances;
        
        const summary = `
            <div class="setup-summary">
                <div class="summary-section">
                    <h3>Your Character</h3>
                    <div class="character-summary">
                        ${character.appearance.avatar ? 
                            `<img src="${character.appearance.avatar}" alt="Character Avatar" class="summary-avatar">` : 
                            '<div class="summary-avatar-placeholder">No Avatar</div>'}
                        <div class="character-details">
                            <h4>${character.name}</h4>
                            <p>${character.age} years old • ${character.pronouns}</p>
                            <p class="character-traits">${character.personality.traits.join(', ')}</p>
                        </div>
                    </div>
                </div>
                
                <div class="summary-section">
                    <h3>Your Store</h3>
                    <div class="store-summary">
                        ${store.background.image ? 
                            `<img src="${store.background.image}" alt="Store Background" class="summary-store-bg">` : 
                            '<div class="summary-store-placeholder">No Background</div>'}
                        <div class="store-details">
                            <h4>${store.name}</h4>
                            <p>${this.storeSetup.storeTypes[store.type].name} in ${this.storeSetup.environments[store.environment].name}</p>
                            <p class="store-products">${store.productCategories?.join(', ') || 'Various products'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="summary-section">
                    <h3>Starting Finances</h3>
                    <div class="finance-summary">
                        <div class="finance-item">
                            <span class="label">Starting Cash:</span>
                            <span class="value positive">$${finances.cash.toLocaleString()}</span>
                        </div>
                        <div class="finance-item">
                            <span class="label">Total Debt:</span>
                            <span class="value negative">$${(finances.debt.bank.amount + finances.debt.mob.amount + finances.debt.supplier.amount).toLocaleString()}</span>
                        </div>
                        <div class="finance-item">
                            <span class="label">Daily Rent:</span>
                            <span class="value">$${finances.dailyExpenses.rent}</span>
                        </div>
                        <div class="finance-item">
                            <span class="label">Inventory Value:</span>
                            <span class="value">$${this.gameState.data.inventory.totalValue?.toLocaleString() || '0'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="summary-section">
                    <h3>Ready to Begin!</h3>
                    <p class="setup-complete-message">
                        Your store is ready to open! You'll start on Day 1 with your character ${character.name} 
                        managing ${store.name}. Good luck building your retail empire!
                    </p>
                </div>
            </div>
        `;
        
        this.elements.setupSummary.innerHTML = summary;
    }

    startGame() {
        // Final validation
        if (!this.gameState.data.player.name || !this.gameState.data.store.name) {
            this.eventBus.emit('ui.showNotification', {
                message: 'Setup incomplete. Please finish character and store creation.',
                type: 'error'
            });
            return;
        }
        
        // Save the initial game state
        this.eventBus.emit('save.autoSave');
        
        // Hide setup screen
        this.hide();
        
        // Start the main game
        this.eventBus.emit('game.start');
        this.eventBus.emit('ui.showScreen', 'mainGame');
        
        console.log('🎮 Game started!');
    }

    // Reset setup to beginning
    reset() {
        this.currentPhase = 'welcome';
        this.characterCreation.reset();
        this.storeSetup.reset();
        this.updatePhase();
        this.updateProgress();
        this.updateNavigation();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SetupScreenController;
} else if (typeof window !== 'undefined') {
    window.SetupScreenController = SetupScreenController;
}
