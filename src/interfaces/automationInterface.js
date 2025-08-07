/**
 * Automation Interface
 * Control panel for all automation systems
 */

class AutomationInterface {
    constructor() {
        this.automationSystem = null;
        this.gameState = null;
        this.eventBus = null;
        
        // UI state
        this.activeView = 'overview';
        this.selectedSystem = null;
        
        // Real-time data
        this.systemStatus = {};
        this.performanceData = {};
        this.alerts = [];
        
        this.initialized = false;
    }
    
    async initialize(automationSystem, gameState, eventBus) {
        console.log('🤖 Initializing Automation Interface...');
        
        this.automationSystem = automationSystem;
        this.gameState = gameState;
        this.eventBus = eventBus;
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize real-time data
        this.refreshSystemData();
        
        this.initialized = true;
        console.log('✅ Automation Interface initialized!');
    }
    
    setupEventListeners() {
        // System status updates
        this.eventBus.on('automation:enabled', (data) => {
            this.handleSystemStatusChange(data.system, 'enabled');
        });
        
        this.eventBus.on('automation:disabled', (data) => {
            this.handleSystemStatusChange(data.system, 'disabled');
        });
        
        // Performance updates
        this.eventBus.on('automation:metricsUpdated', (metrics) => {
            this.performanceData = metrics;
            this.refreshPerformanceDisplay();
        });
        
        // AI Assistant updates
        this.eventBus.on('aiAssistant:recommendation', (recommendation) => {
            this.addAlert({
                type: 'recommendation',
                message: `AI suggests: ${recommendation.recommendations[0]?.action}`,
                data: recommendation,
                priority: 'medium'
            });
        });
        
        // Cashier updates
        this.eventBus.on('cashier:transactionCompleted', (transaction) => {
            this.updateSystemPerformance('customerService', {
                transactionsProcessed: 1,
                averageTime: transaction.duration / 1000
            });
        });
        
        // Inventory updates
        this.eventBus.on('inventory:restockOrdered', (orders) => {
            this.addAlert({
                type: 'info',
                message: `Automated restock: ${orders.orders.length} orders placed`,
                data: orders,
                priority: 'low'
            });
        });
    }
    
    render() {
        if (!this.initialized) {
            return '<div class="automation-loading">Initializing Automation Systems...</div>';
        }
        
        return `
            <div class="automation-interface">
                <div class="automation-header">
                    <h2>🤖 Automation Control Center</h2>
                    <div class="automation-status">
                        <span class="status-indicator ${this.getOverallStatus()}"></span>
                        <span>${this.getSystemCount()} Systems Active</span>
                    </div>
                </div>
                
                <div class="automation-nav">
                    ${this.renderNavigationTabs()}
                </div>
                
                <div class="automation-content">
                    ${this.renderActiveView()}
                </div>
                
                <div class="automation-alerts">
                    ${this.renderAlerts()}
                </div>
            </div>
        `;
    }
    
    renderNavigationTabs() {
        const tabs = [
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'systems', name: 'Systems', icon: '⚙️' },
            { id: 'performance', name: 'Performance', icon: '📈' },
            { id: 'ai-assistant', name: 'AI Assistant', icon: '🧠' },
            { id: 'settings', name: 'Settings', icon: '🔧' }
        ];
        
        return tabs.map(tab => `
            <button class="automation-tab ${this.activeView === tab.id ? 'active' : ''}"
                    onclick="automationInterface.switchView('${tab.id}')">
                ${tab.icon} ${tab.name}
            </button>
        `).join('');
    }
    
    renderActiveView() {
        switch (this.activeView) {
            case 'overview':
                return this.renderOverviewView();
            case 'systems':
                return this.renderSystemsView();
            case 'performance':
                return this.renderPerformanceView();
            case 'ai-assistant':
                return this.renderAIAssistantView();
            case 'settings':
                return this.renderSettingsView();
            default:
                return this.renderOverviewView();
        }
    }
    
    renderOverviewView() {
        const status = this.automationSystem.getAutomationStatus();
        const recommendations = this.automationSystem.getRecommendations();
        
        return `
            <div class="overview-content">
                <div class="overview-grid">
                    <div class="overview-card">
                        <h3>🎯 System Status</h3>
                        <div class="status-grid">
                            <div class="status-item">
                                <span class="status-label">Active Systems</span>
                                <span class="status-value">${status.active.length}</span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">Efficiency</span>
                                <span class="status-value">${Math.round(status.efficiency.timesSaved * 10)}%</span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">Quality Score</span>
                                <span class="status-value">${Math.round(status.quality.qualityScore * 100)}%</span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">ROI</span>
                                <span class="status-value">${Math.round(status.costs.roi)}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <h3>🔄 Active Automations</h3>
                        <div class="active-systems">
                            ${status.active.length > 0 ? 
                                status.active.map(system => `
                                    <div class="system-item active">
                                        <span class="system-icon">${this.getSystemIcon(system)}</span>
                                        <span class="system-name">${this.getSystemName(system)}</span>
                                        <span class="system-status online">Online</span>
                                    </div>
                                `).join('') :
                                '<div class="no-systems">No automation systems active</div>'
                            }
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <h3>💡 Recommendations</h3>
                        <div class="recommendations">
                            ${recommendations.length > 0 ?
                                recommendations.slice(0, 3).map(rec => `
                                    <div class="recommendation-item ${rec.priority}">
                                        <span class="rec-type">${rec.type.toUpperCase()}</span>
                                        <span class="rec-message">${rec.reason}</span>
                                        <button class="rec-action" onclick="automationInterface.handleRecommendation('${rec.system}', '${rec.type}')">
                                            Apply
                                        </button>
                                    </div>
                                `).join('') :
                                '<div class="no-recommendations">All systems optimized</div>'
                            }
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <h3>📊 Performance Summary</h3>
                        <div class="performance-summary">
                            <div class="perf-metric">
                                <span class="metric-label">Tasks Automated</span>
                                <span class="metric-value">${status.efficiency.tasksAutomated}</span>
                            </div>
                            <div class="perf-metric">
                                <span class="metric-label">Time Saved</span>
                                <span class="metric-value">${status.efficiency.timesSaved.toFixed(1)}h</span>
                            </div>
                            <div class="perf-metric">
                                <span class="metric-label">Cost Savings</span>
                                <span class="metric-value">$${status.costs.operationalSavings}</span>
                            </div>
                            <div class="perf-metric">
                                <span class="metric-label">Error Rate</span>
                                <span class="metric-value">${(status.efficiency.errorRate * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderSystemsView() {
        const availableSystems = this.automationSystem.getAvailableSystems();
        const status = this.automationSystem.getAutomationStatus();
        
        return `
            <div class="systems-content">
                <div class="systems-header">
                    <h3>⚙️ Automation Systems</h3>
                    <button class="btn-emergency" onclick="automationInterface.emergencyShutdown()">
                        🚨 Emergency Shutdown
                    </button>
                </div>
                
                <div class="systems-grid">
                    ${availableSystems.map(system => {
                        const isActive = status.active.includes(system.id);
                        const settings = this.automationSystem.automationSettings[system.id];
                        
                        return `
                            <div class="system-card ${isActive ? 'active' : 'inactive'}">
                                <div class="system-header">
                                    <span class="system-icon">${system.icon}</span>
                                    <h4>${system.name}</h4>
                                    <div class="system-toggle">
                                        <label class="toggle-switch">
                                            <input type="checkbox" ${isActive ? 'checked' : ''} 
                                                   onchange="automationInterface.toggleSystem('${system.id}')">
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="system-description">
                                    ${system.description}
                                </div>
                                
                                <div class="system-details">
                                    <div class="detail-item">
                                        <span class="detail-label">Cost:</span>
                                        <span class="detail-value">$${system.cost}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Category:</span>
                                        <span class="detail-value">${system.category}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Status:</span>
                                        <span class="detail-value ${isActive ? 'online' : 'offline'}">
                                            ${isActive ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                </div>
                                
                                ${isActive ? `
                                    <div class="system-settings">
                                        <button class="btn-configure" 
                                                onclick="automationInterface.configureSystem('${system.id}')">
                                            Configure
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    renderPerformanceView() {
        const status = this.automationSystem.getAutomationStatus();
        
        return `
            <div class="performance-content">
                <h3>📈 Performance Analytics</h3>
                
                <div class="performance-grid">
                    <div class="perf-card">
                        <h4>⚡ Efficiency Metrics</h4>
                        <div class="metric-chart">
                            <div class="chart-bar">
                                <div class="bar-fill" style="width: ${status.efficiency.timesSaved * 10}%"></div>
                                <span class="bar-label">Time Saved: ${status.efficiency.timesSaved.toFixed(1)}h</span>
                            </div>
                            <div class="chart-bar">
                                <div class="bar-fill" style="width: ${status.efficiency.tasksAutomated * 2}%"></div>
                                <span class="bar-label">Tasks Automated: ${status.efficiency.tasksAutomated}</span>
                            </div>
                            <div class="chart-bar">
                                <div class="bar-fill error" style="width: ${status.efficiency.errorRate * 100}%"></div>
                                <span class="bar-label">Error Rate: ${(status.efficiency.errorRate * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="perf-card">
                        <h4>🎯 Quality Metrics</h4>
                        <div class="quality-display">
                            <div class="quality-circle">
                                <div class="circle-progress" style="--progress: ${status.quality.qualityScore * 100}%">
                                    <span class="quality-score">${Math.round(status.quality.qualityScore * 100)}%</span>
                                </div>
                            </div>
                            <div class="quality-details">
                                <div class="quality-item">
                                    <span>Customer Satisfaction:</span>
                                    <span>${Math.round(status.quality.customerSatisfaction * 100)}%</span>
                                </div>
                                <div class="quality-item">
                                    <span>Task Completion:</span>
                                    <span>${Math.round(status.quality.taskCompletionRate * 100)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="perf-card">
                        <h4>💰 Cost Analysis</h4>
                        <div class="cost-breakdown">
                            <div class="cost-item positive">
                                <span class="cost-label">Operational Savings</span>
                                <span class="cost-value">+$${status.costs.operationalSavings}</span>
                            </div>
                            <div class="cost-item negative">
                                <span class="cost-label">Automation Costs</span>
                                <span class="cost-value">-$${status.costs.automationCosts}</span>
                            </div>
                            <div class="cost-item ${status.costs.roi >= 0 ? 'positive' : 'negative'}">
                                <span class="cost-label">Return on Investment</span>
                                <span class="cost-value">${status.costs.roi.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="performance-history">
                    <h4>📊 Performance History</h4>
                    <div class="history-chart">
                        ${this.renderPerformanceChart()}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderAIAssistantView() {
        const aiReport = this.automationSystem.aiAssistant.getPerformanceReport();
        
        return `
            <div class="ai-assistant-content">
                <h3>🧠 AI Assistant Manager</h3>
                
                <div class="ai-status-grid">
                    <div class="ai-card">
                        <h4>🎯 Decision Making</h4>
                        <div class="ai-metrics">
                            <div class="ai-metric">
                                <span class="metric-label">Decisions Made</span>
                                <span class="metric-value">${aiReport.decisionsMade}</span>
                            </div>
                            <div class="ai-metric">
                                <span class="metric-label">Success Rate</span>
                                <span class="metric-value">${Math.round(aiReport.successRate * 100)}%</span>
                            </div>
                            <div class="ai-metric">
                                <span class="metric-label">Confidence</span>
                                <span class="metric-value">${Math.round(aiReport.intelligence.confidence * 100)}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ai-card">
                        <h4>🧠 Intelligence Profile</h4>
                        <div class="intelligence-bars">
                            <div class="intel-bar">
                                <span class="intel-label">Learning Rate</span>
                                <div class="intel-progress">
                                    <div class="intel-fill" style="width: ${aiReport.intelligence.learningRate * 100}%"></div>
                                </div>
                            </div>
                            <div class="intel-bar">
                                <span class="intel-label">Risk Tolerance</span>
                                <div class="intel-progress">
                                    <div class="intel-fill" style="width: ${aiReport.intelligence.riskTolerance * 100}%"></div>
                                </div>
                            </div>
                            <div class="intel-bar">
                                <span class="intel-label">Creativity</span>
                                <div class="intel-progress">
                                    <div class="intel-fill" style="width: ${aiReport.intelligence.creativityLevel * 100}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ai-card full-width">
                        <h4>📋 Recent Decisions</h4>
                        <div class="recent-decisions">
                            ${aiReport.recentDecisions.length > 0 ?
                                aiReport.recentDecisions.map(decision => `
                                    <div class="decision-item">
                                        <span class="decision-type">${decision.decision.type}</span>
                                        <span class="decision-context">${decision.decision.context?.description || 'Strategic decision'}</span>
                                        <span class="decision-confidence">${Math.round(decision.analysis.confidence * 100)}%</span>
                                    </div>
                                `).join('') :
                                '<div class="no-decisions">No recent decisions</div>'
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderSettingsView() {
        const settings = this.automationSystem.automationSettings;
        
        return `
            <div class="settings-content">
                <h3>🔧 Automation Settings</h3>
                
                <div class="settings-sections">
                    ${Object.entries(settings).map(([systemId, systemSettings]) => `
                        <div class="settings-section">
                            <h4>${this.getSystemIcon(systemId)} ${this.getSystemName(systemId)}</h4>
                            <div class="settings-form">
                                ${this.renderSystemSettings(systemId, systemSettings)}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="settings-actions">
                    <button class="btn-save" onclick="automationInterface.saveSettings()">
                        💾 Save Settings
                    </button>
                    <button class="btn-reset" onclick="automationInterface.resetSettings()">
                        🔄 Reset to Defaults
                    </button>
                </div>
            </div>
        `;
    }
    
    renderSystemSettings(systemId, settings) {
        // Different settings for different systems
        switch (systemId) {
            case 'customerService':
                return `
                    <div class="setting-item">
                        <label>Quality Level:</label>
                        <select onchange="automationInterface.updateSetting('${systemId}', 'quality', this.value)">
                            <option value="basic" ${settings.quality === 'basic' ? 'selected' : ''}>Basic</option>
                            <option value="standard" ${settings.quality === 'standard' ? 'selected' : ''}>Standard</option>
                            <option value="premium" ${settings.quality === 'premium' ? 'selected' : ''}>Premium</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Personal Touch:</label>
                        <input type="range" min="0" max="1" step="0.1" value="${settings.personalTouch}"
                               onchange="automationInterface.updateSetting('${systemId}', 'personalTouch', this.value)">
                        <span>${Math.round(settings.personalTouch * 100)}%</span>
                    </div>
                `;
            case 'inventory':
                return `
                    <div class="setting-item">
                        <label>Auto Restock:</label>
                        <input type="checkbox" ${settings.autoRestock ? 'checked' : ''}
                               onchange="automationInterface.updateSetting('${systemId}', 'autoRestock', this.checked)">
                    </div>
                    <div class="setting-item">
                        <label>Reorder Point:</label>
                        <input type="range" min="0.1" max="0.5" step="0.05" value="${settings.reorderPoint}"
                               onchange="automationInterface.updateSetting('${systemId}', 'reorderPoint', this.value)">
                        <span>${Math.round(settings.reorderPoint * 100)}%</span>
                    </div>
                    <div class="setting-item">
                        <label>Budget Limit:</label>
                        <input type="number" min="100" max="5000" step="100" value="${settings.budgetLimit}"
                               onchange="automationInterface.updateSetting('${systemId}', 'budgetLimit', this.value)">
                    </div>
                `;
            default:
                return `<div class="no-settings">No configurable settings for this system</div>`;
        }
    }
    
    renderAlerts() {
        if (this.alerts.length === 0) {
            return '<div class="no-alerts">No active alerts</div>';
        }
        
        return `
            <div class="alerts-container">
                <h4>🔔 System Alerts</h4>
                <div class="alerts-list">
                    ${this.alerts.slice(0, 5).map((alert, index) => `
                        <div class="alert-item ${alert.type} ${alert.priority}">
                            <span class="alert-icon">${this.getAlertIcon(alert.type)}</span>
                            <span class="alert-message">${alert.message}</span>
                            <span class="alert-time">${this.getTimeAgo(alert.timestamp)}</span>
                            <button class="alert-dismiss" onclick="automationInterface.dismissAlert(${index})">×</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // UI Event Handlers
    switchView(viewId) {
        this.activeView = viewId;
        this.refreshUI();
    }
    
    async toggleSystem(systemId) {
        const status = this.automationSystem.getAutomationStatus();
        
        if (status.active.includes(systemId)) {
            await this.automationSystem.disableAutomation(systemId);
        } else {
            await this.automationSystem.enableAutomation(systemId);
        }
        
        this.refreshUI();
    }
    
    configureSystem(systemId) {
        this.selectedSystem = systemId;
        this.switchView('settings');
    }
    
    async handleRecommendation(systemId, action) {
        if (action === 'enable') {
            await this.automationSystem.enableAutomation(systemId);
        }
        this.refreshUI();
    }
    
    emergencyShutdown() {
        if (confirm('Are you sure you want to shut down all automation systems?')) {
            this.automationSystem.emergencyShutdown('User initiated emergency shutdown');
            this.addAlert({
                type: 'warning',
                message: 'All automation systems have been shut down',
                priority: 'high'
            });
            this.refreshUI();
        }
    }
    
    updateSetting(systemId, settingName, value) {
        const numericValue = !isNaN(value) ? parseFloat(value) : value;
        this.automationSystem.configureAutomation(systemId, { [settingName]: numericValue });
    }
    
    saveSettings() {
        this.addAlert({
            type: 'success',
            message: 'Settings saved successfully',
            priority: 'low'
        });
    }
    
    resetSettings() {
        if (confirm('Reset all settings to defaults?')) {
            // Implementation would reset all settings
            this.addAlert({
                type: 'info',
                message: 'Settings reset to defaults',
                priority: 'low'
            });
        }
    }
    
    dismissAlert(index) {
        this.alerts.splice(index, 1);
        this.refreshUI();
    }
    
    // Helper Methods
    getSystemIcon(systemId) {
        const icons = {
            customerService: '🤖',
            inventory: '📦',
            maintenance: '🔧',
            security: '🛡️',
            aiAssistant: '🧠'
        };
        return icons[systemId] || '⚙️';
    }
    
    getSystemName(systemId) {
        const names = {
            customerService: 'Customer Service',
            inventory: 'Inventory Management',
            maintenance: 'Maintenance',
            security: 'Security Monitoring',
            aiAssistant: 'AI Assistant'
        };
        return names[systemId] || systemId;
    }
    
    getAlertIcon(type) {
        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️',
            recommendation: '💡'
        };
        return icons[type] || 'ℹ️';
    }
    
    getOverallStatus() {
        const status = this.automationSystem.getAutomationStatus();
        if (status.active.length === 0) return 'offline';
        if (status.quality.qualityScore > 0.8) return 'optimal';
        if (status.quality.qualityScore > 0.6) return 'good';
        return 'warning';
    }
    
    getSystemCount() {
        return this.automationSystem.getAutomationStatus().active.length;
    }
    
    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    }
    
    renderPerformanceChart() {
        // Simplified chart representation
        return `
            <div class="chart-placeholder">
                <div class="chart-line">📈 Performance trending upward</div>
                <div class="chart-data">
                    <span>Efficiency: +15% this week</span>
                    <span>Quality: Stable at 88%</span>
                    <span>Costs: -$200 savings</span>
                </div>
            </div>
        `;
    }
    
    // Data Management
    refreshSystemData() {
        this.systemStatus = this.automationSystem.getAutomationStatus();
        this.performanceData = this.automationSystem.automationMetrics;
    }
    
    refreshPerformanceDisplay() {
        // Update performance displays without full refresh
        const perfElements = document.querySelectorAll('.metric-value, .status-value');
        // Implementation would update specific elements
    }
    
    handleSystemStatusChange(systemId, status) {
        this.addAlert({
            type: status === 'enabled' ? 'success' : 'info',
            message: `${this.getSystemName(systemId)} automation ${status}`,
            priority: 'medium'
        });
        this.refreshSystemData();
        this.refreshUI();
    }
    
    updateSystemPerformance(systemId, metrics) {
        // Update performance tracking for specific system
        if (!this.performanceData[systemId]) {
            this.performanceData[systemId] = {};
        }
        Object.assign(this.performanceData[systemId], metrics);
    }
    
    addAlert(alert) {
        alert.timestamp = Date.now();
        this.alerts.unshift(alert);
        // Keep only last 20 alerts
        if (this.alerts.length > 20) {
            this.alerts = this.alerts.slice(0, 20);
        }
    }
    
    refreshUI() {
        if (this.initialized) {
            const container = document.querySelector('.automation-interface');
            if (container) {
                container.outerHTML = this.render();
            }
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AutomationInterface = AutomationInterface;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutomationInterface;
}
