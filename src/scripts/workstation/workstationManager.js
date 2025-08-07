/**
 * Work Computer System - Main interface for business management
 * Provides tabbed interface with various business applications
 */

class WorkComputer {
    constructor() {
        this.eventBus = null;
        this.gameState = null;
        this.container = null;
        this.isBooted = false;
        this.isPoweredOn = false;
        this.currentApp = null;
        this.staffActiveTab = 'management'; // Default to management tab for Phase 5B
        
        this.state = {
            activeWindows: [],
            minimizedWindows: [],
            desktop: {
                wallpaper: 'default',
                icons: []
            },
            taskbar: {
                apps: [],
                notifications: []
            }
        };

        // Available applications
        this.applications = {
            npc_manager: {
                name: 'Customer Relations',
                icon: '👥',
                description: 'Manage customer profiles and relationships',
                component: 'NPCManagerApp',
                isInstalled: true,
                position: { x: 50, y: 50 }
            },
            inventory_manager: {
                name: 'Inventory Management',
                icon: '📦',
                description: 'Track products, stock levels, and orders',
                component: 'InventoryManagerApp',
                isInstalled: true,
                position: { x: 150, y: 50 }
            },
            financial_reports: {
                name: 'Financial Reports',
                icon: '📊',
                description: 'View financial reports and analytics',
                component: 'FinancialReportsApp',
                isInstalled: true,
                position: { x: 250, y: 50 }
            },
            social_media: {
                name: 'Social Hub',
                icon: '📱',
                description: 'Manage social media and online presence',
                component: 'SocialMediaApp',
                isInstalled: true,
                position: { x: 350, y: 50 }
            },
            bank_manager: {
                name: 'Banking',
                icon: '🏦',
                description: 'Manage accounts, loans, and investments',
                component: 'BankManagerApp',
                isInstalled: true,
                position: { x: 50, y: 150 }
            },
            staff_scheduler: {
                name: 'Staff Management',
                icon: '👔',
                description: 'Schedule staff and manage HR',
                component: 'StaffSchedulerApp',
                isInstalled: true,
                position: { x: 150, y: 150 }
            },
            security_monitor: {
                name: 'Security Monitor',
                icon: '🔒',
                description: 'Monitor security cameras and incidents',
                component: 'SecurityMonitorApp',
                isInstalled: false, // Unlocked later
                position: { x: 250, y: 150 }
            },
            settings: {
                name: 'Settings',
                icon: '⚙️',
                description: 'System settings and preferences',
                component: 'SettingsApp',
                isInstalled: true,
                position: { x: 350, y: 150 }
            }
        };
    }

    initialize(eventBus, gameState) {
        this.eventBus = eventBus;
        this.gameState = gameState;

        // Listen for computer events
        this.eventBus.on('computer.powerOn', () => this.powerOn());
        this.eventBus.on('computer.powerOff', () => this.powerOff());
        this.eventBus.on('computer.openApp', (data) => this.openApplication(data.appId));
        this.eventBus.on('computer.closeApp', (data) => this.closeApplication(data.windowId));
        this.eventBus.on('computer.minimizeApp', (data) => this.minimizeApplication(data.windowId));
        this.eventBus.on('computer.maximizeApp', (data) => this.maximizeApplication(data.windowId));
        this.eventBus.on('ui.showWorkComputer', () => this.show());
        this.eventBus.on('ui.hideWorkComputer', () => this.hide());

        // Listen for computer close event from main UI
        if (typeof gameEventBus !== 'undefined') {
            gameEventBus.on(GAME_EVENTS.COMPUTER_CLOSED, () => {
                this.powerOff();
                if (typeof uiManager !== 'undefined') {
                    uiManager.showView('store');
                    gameState.setView(GAME_CONSTANTS.VIEWS.STORE);
                }
            });
        }

        // Setup keyboard shortcuts
        this.setupKeyboardEvents();

        console.log('💻 Work Computer System initialized');
    }

    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // Only handle keyboard events when computer is visible and focused
            const computerView = document.getElementById('computer-view');
            if (!computerView || computerView.classList.contains('hidden')) {
                return;
            }

            // Escape key to exit computer
            if (e.key === 'Escape') {
                e.preventDefault();
                gameEventBus.emit(GAME_EVENTS.COMPUTER_CLOSED);
            }

            // Alt+Tab to switch between open applications
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault();
                this.switchToNextApplication();
            }
        });
    }

    switchToNextApplication() {
        const runningApps = Array.from(this.openWindows.keys());
        if (runningApps.length <= 1) return;

        const currentFocused = this.focusedWindow;
        const currentIndex = runningApps.indexOf(currentFocused);
        const nextIndex = (currentIndex + 1) % runningApps.length;
        const nextApp = runningApps[nextIndex];

        this.focusWindow(nextApp);
    }

    render() {
        if (!this.isPoweredOn) {
            return this.renderPoweredOff();
        }

        if (!this.isBooted) {
            return this.renderBootSequence();
        }

        return this.renderDesktop();
    }

    renderPoweredOff() {
        return `
            <div id="work-computer" class="work-computer powered-off">
                <div class="computer-screen off">
                    <div class="power-button-container">
                        <button class="power-button" onclick="workComputer.powerOn()">
                            <div class="power-icon">⚡</div>
                            <span>Power On</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderBootSequence() {
        return `
            <div id="work-computer" class="work-computer booting">
                <div class="computer-screen">
                    <div class="boot-sequence">
                        <div class="boot-logo">
                            <div class="logo-icon">💻</div>
                            <h2>StoreOS</h2>
                            <div class="version">Business Management Suite v2.1</div>
                        </div>
                        
                        <div class="boot-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" id="boot-progress"></div>
                            </div>
                            <div class="boot-status" id="boot-status">Initializing system...</div>
                        </div>

                        <div class="boot-messages" id="boot-messages">
                            <div class="boot-message">Loading drivers...</div>
                            <div class="boot-message">Checking network connection...</div>
                            <div class="boot-message">Starting business applications...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderDesktop() {
        return `
            <div id="work-computer" class="work-computer desktop">
                <div class="computer-screen">
                    <!-- Desktop Wallpaper -->
                    <div class="desktop-wallpaper ${this.state.desktop.wallpaper}">
                        
                        <!-- Desktop Icons -->
                        <div class="desktop-icons">
                            ${this.renderDesktopIcons()}
                        </div>

                        <!-- Active Windows -->
                        <div class="window-container">
                            ${this.state.activeWindows.map(window => this.renderWindow(window)).join('')}
                        </div>

                        <!-- Taskbar -->
                        <div class="taskbar">
                            <div class="taskbar-start">
                                <button class="start-button" onclick="workComputer.toggleStartMenu()">
                                    <span class="start-icon">🏪</span>
                                    <span class="start-text">Start</span>
                                </button>
                            </div>

                            <div class="taskbar-apps">
                                ${this.renderTaskbarApps()}
                            </div>

                            <div class="taskbar-system">
                                <div class="system-notifications">
                                    ${this.renderNotifications()}
                                </div>
                                <div class="system-clock">
                                    ${this.renderSystemClock()}
                                </div>
                                <button class="power-menu-btn" onclick="workComputer.showPowerMenu()">
                                    ⚡
                                </button>
                            </div>
                        </div>

                        <!-- Start Menu -->
                        <div class="start-menu hidden" id="start-menu">
                            ${this.renderStartMenu()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderDesktopIcons() {
        return Object.entries(this.applications)
            .filter(([id, app]) => app.isInstalled)
            .map(([id, app]) => `
                <div class="desktop-icon" 
                     style="left: ${app.position.x}px; top: ${app.position.y}px;"
                     ondblclick="workComputer.openApplication('${id}')"
                     data-app-id="${id}">
                    <div class="icon-image">${app.icon}</div>
                    <div class="icon-label">${app.name}</div>
                </div>
            `).join('');
    }

    renderWindow(window) {
        return `
            <div class="app-window ${window.state}" 
                 id="window-${window.id}"
                 style="left: ${window.x}px; top: ${window.y}px; width: ${window.width}px; height: ${window.height}px; z-index: ${window.zIndex};"
                 onclick="workComputer.focusWindow('${window.id}')">
                
                <div class="window-titlebar" onmousedown="workComputer.startDrag(event, '${window.id}')">
                    <div class="window-title">
                        <span class="window-icon">${window.icon}</span>
                        <span class="window-name">${window.title}</span>
                    </div>
                    <div class="window-controls">
                        <button class="window-btn minimize" onclick="workComputer.minimizeApplication('${window.id}')">−</button>
                        <button class="window-btn maximize" onclick="workComputer.toggleMaximize('${window.id}')">□</button>
                        <button class="window-btn close" onclick="workComputer.closeApplication('${window.id}')">×</button>
                    </div>
                </div>

                <div class="window-content">
                    <div id="app-content-${window.id}" class="app-content">
                        ${this.renderApplicationContent(window.appId, window.id)}
                    </div>
                </div>
            </div>
        `;
    }

    renderApplicationContent(appId, windowId) {
        // This will be populated by specific application components
        switch (appId) {
            case 'npc_manager':
                // Launch Customer Relations App
                if (typeof customerRelationsApp !== 'undefined') {
                    setTimeout(() => customerRelationsApp.open(), 100);
                    return '<div class="app-loading">Launching Customer Relations...</div>';
                }
                return '<div class="app-placeholder">Customer Relations Manager<br/>Loading...</div>';
            case 'inventory_manager':
                // Launch Inventory Management App
                if (typeof inventoryManagementApp !== 'undefined') {
                    setTimeout(() => inventoryManagementApp.open(), 100);
                    return '<div class="app-loading">Launching Inventory Management...</div>';
                }
                return '<div class="app-placeholder">Inventory Management System<br/>Loading...</div>';
            case 'financial_reports':
                return '<div class="app-placeholder">Financial Reports Dashboard<br/>Loading...</div>';
            case 'social_media':
                return '<div class="app-placeholder">Social Media Hub<br/>Loading...</div>';
            case 'bank_manager':
                return '<div class="app-placeholder">Banking & Investments<br/>Loading...</div>';
            case 'staff_scheduler':
                return this.renderStaffHiringApp();
            case 'security_monitor':
                return '<div class="app-placeholder">Security Monitor<br/>Loading...</div>';
            case 'settings':
                return '<div class="app-placeholder">System Settings<br/>Loading...</div>';
            default:
                return '<div class="app-placeholder">Unknown Application</div>';
        }
    }

    renderStaffHiringApp() {
        // Initialize Staff Hiring System if not already done
        if (!this.staffHiringSystem) {
            this.staffHiringSystem = new StaffHiringSystem();
            this.staffHiringInterface = new StaffHiringInterface();
            
            // Initialize with dependencies
            this.staffHiringSystem.initialize(
                this.gameState, 
                this.eventBus, 
                this.gameState.npcSystem, 
                this.gameState.aiContentManager
            );
            
            this.staffHiringInterface.initialize(
                this.staffHiringSystem,
                this.gameState,
                this.eventBus
            );
        }

        // Initialize Staff Management System (Phase 5B)
        if (!this.staffManagementSystem) {
            this.staffManagementSystem = new StaffManagementSystem();
            this.staffManagementInterface = new StaffManagementInterface();
            
            // Initialize with dependencies
            this.staffManagementSystem.initialize(
                this.gameState,
                this.eventBus,
                this.staffHiringSystem,
                this.gameState.timeSystem
            );
            
            this.staffManagementInterface.initialize(
                this.staffManagementSystem,
                this.staffHiringSystem,
                this.gameState,
                this.eventBus
            );
        }

        // Initialize Automation System (Phase 5C)
        if (!this.automationSystem) {
            this.automationSystem = new AutomationSystem();
            this.automationInterface = new AutomationInterface();
            
            // Initialize automation with all required systems
            this.automationSystem.initialize(
                this.gameState,
                this.eventBus,
                this.staffManagementSystem,
                this.gameState.customerSystem,
                this.gameState.inventorySystem
            );
            
            this.automationInterface.initialize(
                this.automationSystem,
                this.gameState,
                this.eventBus
            );
        }
        
        // Check if we have hired staff - show management interface, otherwise show hiring
        const hasStaff = this.gameState.staff?.employees?.length > 0;
        
        if (hasStaff) {
            return `
                <div class="staff-app-container">
                    <div class="staff-app-tabs">
                        <button class="staff-tab ${this.staffActiveTab === 'management' ? 'active' : ''}" 
                                onclick="workComputer.switchStaffTab('management')">
                            📊 Management
                        </button>
                        <button class="staff-tab ${this.staffActiveTab === 'hiring' ? 'active' : ''}" 
                                onclick="workComputer.switchStaffTab('hiring')">
                            👔 Hiring
                        </button>
                        <button class="staff-tab ${this.staffActiveTab === 'automation' ? 'active' : ''}" 
                                onclick="workComputer.switchStaffTab('automation')">
                            🤖 Automation
                        </button>
                    </div>
                    <div class="staff-app-content">
                        ${this.staffActiveTab === 'management' ? 
                            this.staffManagementInterface.render() : 
                            this.staffActiveTab === 'automation' ?
                            this.automationInterface.render() :
                            this.staffHiringInterface.render()
                        }
                    </div>
                </div>
            `;
        } else {
            // No staff yet - show hiring interface only
            return this.staffHiringInterface.render();
        }
    }

    switchStaffTab(tab) {
        this.staffActiveTab = tab;
        const contentElement = document.querySelector('.staff-app-content');
        if (contentElement) {
            if (tab === 'management') {
                contentElement.innerHTML = this.staffManagementInterface.render();
            } else if (tab === 'automation') {
                contentElement.innerHTML = this.automationInterface.render();
            } else {
                contentElement.innerHTML = this.staffHiringInterface.render();
            }
        }
    }

    renderTaskbarApps() {
        return this.state.activeWindows.map(window => `
            <button class="taskbar-app ${window.state === 'minimized' ? 'minimized' : 'active'}"
                    onclick="workComputer.restoreWindow('${window.id}')"
                    title="${window.title}">
                <span class="app-icon">${window.icon}</span>
                <span class="app-title">${window.title}</span>
            </button>
        `).join('');
    }

    renderNotifications() {
        return this.state.taskbar.notifications.map(notification => `
            <div class="notification-icon ${notification.type}" title="${notification.message}">
                ${notification.icon}
            </div>
        `).join('');
    }

    renderSystemClock() {
        const now = new Date();
        return `
            <div class="clock">
                <div class="time">${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div class="date">${now.toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
            </div>
        `;
    }

    renderStartMenu() {
        return `
            <div class="start-menu-content">
                <div class="start-menu-header">
                    <h3>Business Applications</h3>
                </div>
                
                <div class="start-menu-apps">
                    ${Object.entries(this.applications)
                        .filter(([id, app]) => app.isInstalled)
                        .map(([id, app]) => `
                            <div class="start-menu-item" onclick="workComputer.openApplication('${id}')">
                                <span class="start-item-icon">${app.icon}</span>
                                <div class="start-item-content">
                                    <div class="start-item-name">${app.name}</div>
                                    <div class="start-item-description">${app.description}</div>
                                </div>
                            </div>
                        `).join('')}
                </div>

                <div class="start-menu-footer">
                    <button class="start-footer-btn" onclick="workComputer.showSettings()">
                        <span>⚙️</span> Settings
                    </button>
                    <button class="start-footer-btn" onclick="workComputer.powerOff()">
                        <span>⚡</span> Shutdown
                    </button>
                </div>
            </div>
        `;
    }

    // Core functionality methods
    powerOn() {
        if (this.isPoweredOn) return;

        this.isPoweredOn = true;
        this.isBooted = false;
        this.updateDisplay();

        // Simulate boot sequence
        this.startBootSequence();
    }

    powerOff() {
        // Close all applications
        this.state.activeWindows.forEach(window => {
            this.eventBus.emit(`app.${window.appId}.close`, { windowId: window.id });
        });

        this.state.activeWindows = [];
        this.state.minimizedWindows = [];
        this.isPoweredOn = false;
        this.isBooted = false;
        this.currentApp = null;

        this.updateDisplay();
        this.eventBus.emit('computer.powerOff', {});
    }

    startBootSequence() {
        const bootMessages = [
            'Loading system drivers...',
            'Checking network connectivity...',
            'Initializing business applications...',
            'Loading customer database...',
            'Connecting to financial systems...',
            'Starting inventory management...',
            'System ready!'
        ];

        let currentMessage = 0;
        let progress = 0;

        const bootInterval = setInterval(() => {
            progress += 15 + Math.random() * 10;
            
            if (currentMessage < bootMessages.length) {
                const bootMessagesEl = document.getElementById('boot-messages');
                if (bootMessagesEl) {
                    bootMessagesEl.innerHTML += `<div class="boot-message">${bootMessages[currentMessage]}</div>`;
                }
                currentMessage++;
            }

            const progressEl = document.getElementById('boot-progress');
            const statusEl = document.getElementById('boot-status');
            
            if (progressEl) {
                progressEl.style.width = Math.min(progress, 100) + '%';
            }
            
            if (statusEl && currentMessage < bootMessages.length) {
                statusEl.textContent = bootMessages[currentMessage] || 'Starting system...';
            }

            if (progress >= 100) {
                clearInterval(bootInterval);
                setTimeout(() => {
                    this.isBooted = true;
                    this.updateDisplay();
                    this.eventBus.emit('computer.booted', {});
                }, 1000);
            }
        }, 500);
    }

    openApplication(appId) {
        const app = this.applications[appId];
        if (!app || !app.isInstalled) return;

        // Check if app is already open
        const existingWindow = this.state.activeWindows.find(w => w.appId === appId);
        if (existingWindow) {
            this.focusWindow(existingWindow.id);
            return;
        }

        // Create new window
        const window = {
            id: this.generateWindowId(),
            appId: appId,
            title: app.name,
            icon: app.icon,
            x: 100 + (this.state.activeWindows.length * 30),
            y: 50 + (this.state.activeWindows.length * 30),
            width: 800,
            height: 600,
            state: 'normal', // normal, minimized, maximized
            zIndex: 1000 + this.state.activeWindows.length
        };

        this.state.activeWindows.push(window);
        this.currentApp = appId;
        this.updateDisplay();

        // Notify the application that it's being opened
        this.eventBus.emit(`app.${appId}.open`, { windowId: window.id });
        this.eventBus.emit('computer.appOpened', { appId, windowId: window.id });
    }

    closeApplication(windowId) {
        const windowIndex = this.state.activeWindows.findIndex(w => w.id === windowId);
        if (windowIndex === -1) return;

        const window = this.state.activeWindows[windowIndex];
        
        // Notify the application that it's being closed
        this.eventBus.emit(`app.${window.appId}.close`, { windowId });
        
        // Remove from active windows
        this.state.activeWindows.splice(windowIndex, 1);
        
        // Also remove from minimized if it was there
        const minIndex = this.state.minimizedWindows.findIndex(w => w.id === windowId);
        if (minIndex !== -1) {
            this.state.minimizedWindows.splice(minIndex, 1);
        }

        this.updateDisplay();
        this.eventBus.emit('computer.appClosed', { windowId, appId: window.appId });
    }

    minimizeApplication(windowId) {
        const window = this.state.activeWindows.find(w => w.id === windowId);
        if (!window) return;

        window.state = 'minimized';
        this.updateDisplay();
    }

    maximizeApplication(windowId) {
        const window = this.state.activeWindows.find(w => w.id === windowId);
        if (!window) return;

        if (window.state === 'maximized') {
            window.state = 'normal';
            window.x = 100;
            window.y = 50;
            window.width = 800;
            window.height = 600;
        } else {
            window.state = 'maximized';
            window.x = 0;
            window.y = 0;
            window.width = window.parentWidth || 1200;
            window.height = (window.parentHeight || 800) - 40; // Account for taskbar
        }

        this.updateDisplay();
    }

    focusWindow(windowId) {
        const window = this.state.activeWindows.find(w => w.id === windowId);
        if (!window) return;

        // Bring window to front
        const maxZ = Math.max(...this.state.activeWindows.map(w => w.zIndex));
        window.zIndex = maxZ + 1;
        
        if (window.state === 'minimized') {
            window.state = 'normal';
        }

        this.updateDisplay();
    }

    restoreWindow(windowId) {
        const window = this.state.activeWindows.find(w => w.id === windowId);
        if (!window) return;

        if (window.state === 'minimized') {
            window.state = 'normal';
            this.focusWindow(windowId);
        } else {
            this.minimizeApplication(windowId);
        }
    }

    toggleStartMenu() {
        const startMenu = document.getElementById('start-menu');
        if (startMenu) {
            startMenu.classList.toggle('hidden');
        }
    }

    showPowerMenu() {
        this.eventBus.emit('ui.showModal', {
            type: 'power-menu',
            title: 'Power Options',
            content: `
                <div class="power-menu">
                    <button class="power-option" onclick="workComputer.powerOff(); ui.closeModal();">
                        <span class="power-icon">⚡</span>
                        <span class="power-text">Shutdown Computer</span>
                    </button>
                    <button class="power-option" onclick="workComputer.restart(); ui.closeModal();">
                        <span class="power-icon">🔄</span>
                        <span class="power-text">Restart System</span>
                    </button>
                    <button class="power-option" onclick="workComputer.standby(); ui.closeModal();">
                        <span class="power-icon">⏸️</span>
                        <span class="power-text">Standby Mode</span>
                    </button>
                </div>
            `,
            buttons: [
                { text: 'Cancel', action: () => this.eventBus.emit('ui.closeModal') }
            ]
        });
    }

    addNotification(notification) {
        this.state.taskbar.notifications.push({
            id: Date.now(),
            icon: notification.icon,
            message: notification.message,
            type: notification.type || 'info',
            timestamp: new Date()
        });

        // Remove old notifications (keep last 5)
        if (this.state.taskbar.notifications.length > 5) {
            this.state.taskbar.notifications = this.state.taskbar.notifications.slice(-5);
        }

        this.updateDisplay();
    }

    // Utility methods
    generateWindowId() {
        return 'win_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    startDrag(event, windowId) {
        // Window dragging functionality would be implemented here
        event.preventDefault();
        console.log('Starting drag for window:', windowId);
    }

    toggleMaximize(windowId) {
        this.maximizeApplication(windowId);
    }

    show() {
        if (this.container) {
            this.container.classList.remove('hidden');
        }
    }

    hide() {
        if (this.container) {
            this.container.classList.add('hidden');
        }
    }

    updateDisplay() {
        if (this.container) {
            this.container.innerHTML = this.render();
        }

        // Update system clock every minute
        if (this.isBooted && this.isPoweredOn) {
            setTimeout(() => {
                const clockEl = document.querySelector('.system-clock .clock');
                if (clockEl) {
                    clockEl.innerHTML = this.renderSystemClock();
                }
            }, 1000);
        }
    }

    // Public API for external components
    getActiveWindows() {
        return [...this.state.activeWindows];
    }

    getApplications() {
        return { ...this.applications };
    }

    installApplication(appId, appConfig) {
        this.applications[appId] = {
            ...appConfig,
            isInstalled: true
        };
        this.updateDisplay();
    }

    uninstallApplication(appId) {
        if (this.applications[appId]) {
            // Close the app if it's open
            const window = this.state.activeWindows.find(w => w.appId === appId);
            if (window) {
                this.closeApplication(window.id);
            }
            
            this.applications[appId].isInstalled = false;
            this.updateDisplay();
        }
    }
}

// Initialize global work computer instance
let workComputer = null;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkComputer;
}
