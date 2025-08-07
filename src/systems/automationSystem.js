/**
 * Phase 5C: Automation Systems
 * Intelligent automation framework for Store Manager Simulator
 * Reduces manual tasks while maintaining quality and player control
 */

class AutomationSystem {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.staffSystem = null;
        this.customerSystem = null;
        this.inventorySystem = null;
        
        // Automation modules
        this.aiAssistant = new AIAssistantManager();
        this.automatedCashier = new AutomatedCashierSystem();
        this.maintenanceBot = new AutomatedMaintenanceSystem();
        this.inventoryBot = new AutomatedInventorySystem();
        this.securityMonitor = new AutomatedSecuritySystem();
        
        // Automation settings
        this.automationSettings = {
            customerService: {
                enabled: false,
                quality: 'standard',
                personalTouch: 0.3,
                escalationThreshold: 0.7
            },
            inventory: {
                enabled: false,
                autoRestock: true,
                reorderPoint: 0.2,
                overstock: false,
                budgetLimit: 1000
            },
            maintenance: {
                enabled: false,
                schedule: 'daily',
                thoroughness: 'standard',
                emergencyResponse: true
            },
            security: {
                enabled: false,
                surveillance: 'active',
                alertLevel: 'medium',
                autoResponse: false
            },
            aiAssistant: {
                enabled: false,
                autonomy: 'suggestions',
                decisionMaking: 'supervised',
                learningMode: true
            }
        };
        
        // Performance tracking
        this.automationMetrics = {
            efficiency: {
                timesSaved: 0,
                tasksAutomated: 0,
                errorRate: 0.02
            },
            quality: {
                customerSatisfaction: 0.85,
                taskCompletionRate: 0.95,
                qualityScore: 0.88
            },
            costs: {
                operationalSavings: 0,
                automationCosts: 0,
                roi: 0
            }
        };
        
        this.initialized = false;
    }
    
    async initialize(gameState, eventBus, staffSystem, customerSystem, inventorySystem) {
        console.log('🤖 Initializing Automation Systems...');
        
        this.gameState = gameState;
        this.eventBus = eventBus;
        this.staffSystem = staffSystem;
        this.customerSystem = customerSystem;
        this.inventorySystem = inventorySystem;
        
        // Initialize automation modules
        await this.aiAssistant.initialize(this);
        await this.automatedCashier.initialize(this);
        await this.maintenanceBot.initialize(this);
        await this.inventoryBot.initialize(this);
        await this.securityMonitor.initialize(this);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start automation loops
        this.startAutomationLoops();
        
        this.initialized = true;
        console.log('✅ Automation Systems initialized successfully!');
        
        this.eventBus.emit('automation:initialized', {
            systems: this.getAvailableSystems(),
            settings: this.automationSettings
        });
    }
    
    setupEventListeners() {
        // Customer service automation triggers
        this.eventBus.on('customer:arrived', (customer) => {
            if (this.automationSettings.customerService.enabled) {
                this.automatedCashier.handleCustomer(customer);
            }
        });
        
        // Inventory automation triggers
        this.eventBus.on('inventory:lowStock', (product) => {
            if (this.automationSettings.inventory.enabled) {
                this.inventoryBot.handleLowStock(product);
            }
        });
        
        // Maintenance automation triggers
        this.eventBus.on('store:opened', () => {
            if (this.automationSettings.maintenance.enabled) {
                this.maintenanceBot.performDailyMaintenance();
            }
        });
        
        // Security automation triggers
        this.eventBus.on('security:incident', (incident) => {
            if (this.automationSettings.security.enabled) {
                this.securityMonitor.handleIncident(incident);
            }
        });
        
        // AI Assistant decision points
        this.eventBus.on('decision:required', (decision) => {
            if (this.automationSettings.aiAssistant.enabled) {
                this.aiAssistant.analyzeDecision(decision);
            }
        });
    }
    
    startAutomationLoops() {
        // AI Assistant monitoring (every 30 seconds)
        setInterval(() => {
            if (this.automationSettings.aiAssistant.enabled) {
                this.aiAssistant.performPeriodicAnalysis();
            }
        }, 30000);
        
        // Inventory monitoring (every 2 minutes)
        setInterval(() => {
            if (this.automationSettings.inventory.enabled) {
                this.inventoryBot.performInventoryCheck();
            }
        }, 120000);
        
        // Security monitoring (every 15 seconds)
        setInterval(() => {
            if (this.automationSettings.security.enabled) {
                this.securityMonitor.performSecuritySweep();
            }
        }, 15000);
        
        // Performance metrics update (every 5 minutes)
        setInterval(() => {
            this.updateAutomationMetrics();
        }, 300000);
    }
    
    // Automation Control Methods
    enableAutomation(systemType, settings = {}) {
        if (!this.automationSettings[systemType]) {
            throw new Error(`Unknown automation system: ${systemType}`);
        }
        
        this.automationSettings[systemType].enabled = true;
        Object.assign(this.automationSettings[systemType], settings);
        
        console.log(`🤖 ${systemType} automation enabled`);
        this.eventBus.emit('automation:enabled', { system: systemType, settings });
        
        return {
            success: true,
            system: systemType,
            message: `${systemType} automation is now active`
        };
    }
    
    disableAutomation(systemType) {
        if (!this.automationSettings[systemType]) {
            throw new Error(`Unknown automation system: ${systemType}`);
        }
        
        this.automationSettings[systemType].enabled = false;
        
        console.log(`🛑 ${systemType} automation disabled`);
        this.eventBus.emit('automation:disabled', { system: systemType });
        
        return {
            success: true,
            system: systemType,
            message: `${systemType} automation is now inactive`
        };
    }
    
    configureAutomation(systemType, settings) {
        if (!this.automationSettings[systemType]) {
            throw new Error(`Unknown automation system: ${systemType}`);
        }
        
        Object.assign(this.automationSettings[systemType], settings);
        
        console.log(`⚙️ ${systemType} automation configured:`, settings);
        this.eventBus.emit('automation:configured', { system: systemType, settings });
        
        return {
            success: true,
            system: systemType,
            settings: this.automationSettings[systemType]
        };
    }
    
    getAutomationStatus() {
        const activeAutomations = [];
        const inactiveAutomations = [];
        
        for (const [system, config] of Object.entries(this.automationSettings)) {
            if (config.enabled) {
                activeAutomations.push(system);
            } else {
                inactiveAutomations.push(system);
            }
        }
        
        return {
            active: activeAutomations,
            inactive: inactiveAutomations,
            totalSystems: Object.keys(this.automationSettings).length,
            efficiency: this.automationMetrics.efficiency,
            quality: this.automationMetrics.quality,
            costs: this.automationMetrics.costs
        };
    }
    
    getAvailableSystems() {
        return [
            {
                id: 'customerService',
                name: 'Automated Customer Service',
                description: 'AI-powered cashier handles routine transactions',
                icon: '🤖',
                category: 'customer',
                cost: 200,
                requirements: ['cashier_hired']
            },
            {
                id: 'inventory',
                name: 'Automated Inventory Management',
                description: 'Smart restocking and inventory optimization',
                icon: '📦',
                category: 'operations',
                cost: 300,
                requirements: ['stocker_hired']
            },
            {
                id: 'maintenance',
                name: 'Automated Maintenance',
                description: 'Scheduled cleaning and equipment maintenance',
                icon: '🔧',
                category: 'operations',
                cost: 150,
                requirements: ['janitor_hired']
            },
            {
                id: 'security',
                name: 'Automated Security Monitoring',
                description: 'AI surveillance and threat detection',
                icon: '🛡️',
                category: 'security',
                cost: 500,
                requirements: ['security_hired']
            },
            {
                id: 'aiAssistant',
                name: 'AI Assistant Manager',
                description: 'Strategic decision support and analysis',
                icon: '🧠',
                category: 'management',
                cost: 1000,
                requirements: ['manager_hired']
            }
        ];
    }
    
    updateAutomationMetrics() {
        // Calculate efficiency gains
        const automatedSystems = Object.values(this.automationSettings)
            .filter(config => config.enabled).length;
        
        this.automationMetrics.efficiency.tasksAutomated = automatedSystems * 10;
        this.automationMetrics.efficiency.timesSaved = automatedSystems * 2.5;
        
        // Calculate quality impact
        let qualitySum = 0;
        let enabledCount = 0;
        
        for (const [system, config] of Object.entries(this.automationSettings)) {
            if (config.enabled) {
                // Different systems have different quality impacts
                const qualityMap = {
                    customerService: 0.85,
                    inventory: 0.90,
                    maintenance: 0.88,
                    security: 0.92,
                    aiAssistant: 0.95
                };
                qualitySum += qualityMap[system] || 0.80;
                enabledCount++;
            }
        }
        
        this.automationMetrics.quality.qualityScore = enabledCount > 0 
            ? qualitySum / enabledCount 
            : 0.75;
        
        // Calculate cost impact
        const totalCosts = this.getAvailableSystems()
            .filter(system => this.automationSettings[system.id]?.enabled)
            .reduce((sum, system) => sum + system.cost, 0);
        
        this.automationMetrics.costs.automationCosts = totalCosts;
        this.automationMetrics.costs.operationalSavings = automatedSystems * 50;
        this.automationMetrics.costs.roi = totalCosts > 0 
            ? (this.automationMetrics.costs.operationalSavings / totalCosts) * 100 
            : 0;
        
        this.eventBus.emit('automation:metricsUpdated', this.automationMetrics);
    }
    
    // Emergency automation control
    emergencyShutdown(reason = 'Manual override') {
        console.log('🚨 Emergency automation shutdown initiated:', reason);
        
        for (const systemType of Object.keys(this.automationSettings)) {
            this.automationSettings[systemType].enabled = false;
        }
        
        this.eventBus.emit('automation:emergencyShutdown', { reason });
        
        return {
            success: true,
            message: 'All automation systems have been shut down',
            reason
        };
    }
    
    getRecommendations() {
        const recommendations = [];
        const status = this.getAutomationStatus();
        
        // Recommend based on current state
        if (status.active.length === 0) {
            recommendations.push({
                type: 'enable',
                system: 'customerService',
                reason: 'Start with customer service automation for immediate efficiency gains',
                priority: 'high'
            });
        }
        
        if (status.efficiency.timesSaved < 10 && status.inactive.includes('inventory')) {
            recommendations.push({
                type: 'enable',
                system: 'inventory',
                reason: 'Inventory automation will reduce manual restocking time',
                priority: 'medium'
            });
        }
        
        if (this.automationMetrics.quality.qualityScore < 0.8) {
            recommendations.push({
                type: 'configure',
                system: 'all',
                reason: 'Consider adjusting automation quality settings for better performance',
                priority: 'medium'
            });
        }
        
        return recommendations;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AutomationSystem = AutomationSystem;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutomationSystem;
}
