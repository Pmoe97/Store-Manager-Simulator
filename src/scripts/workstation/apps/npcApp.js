/**
 * NPC Registry App - Work Computer Application for managing NPCs
 * Displays all encountered NPCs, their profiles, and relationship tracking
 */

class NPCApp {
    constructor(appWindow) {
        this.appWindow = appWindow;
        this.gameState = null;
        this.eventBus = null;
        this.npcSystem = null;
        this.currentView = 'overview';
        this.selectedNPC = null;
        this.searchQuery = '';
        this.filterLevel = 'all';
        this.sortBy = 'relationship';
    }

    initialize(gameState, eventBus, npcSystem) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        this.npcSystem = npcSystem;
        
        // Listen for NPC events
        this.eventBus.on('npc.relationshipChanged', () => this.refreshCurrentView());
        this.eventBus.on('npc.enriched', () => this.refreshCurrentView());
        this.eventBus.on('npc.encounterProcessed', () => this.refreshCurrentView());
        
        this.initializeInterface();
    }

    initializeInterface() {
        this.appWindow.setTitle('NPC Registry');
        this.appWindow.setIcon('👥');
        this.appWindow.setContent(this.renderMainInterface());
        
        // Set up event listeners
        this.setupEventListeners();
    }

    renderMainInterface() {
        return `
            <div class="npc-app">
                <div class="npc-app-header">
                    <div class="npc-app-nav">
                        <button class="nav-btn ${this.currentView === 'overview' ? 'active' : ''}" 
                                data-view="overview">Overview</button>
                        <button class="nav-btn ${this.currentView === 'directory' ? 'active' : ''}" 
                                data-view="directory">Directory</button>
                        <button class="nav-btn ${this.currentView === 'relationships' ? 'active' : ''}" 
                                data-view="relationships">Relationships</button>
                        <button class="nav-btn ${this.currentView === 'analytics' ? 'active' : ''}" 
                                data-view="analytics">Analytics</button>
                    </div>
                    
                    <div class="npc-app-tools">
                        <div class="search-box">
                            <input type="text" id="npc-search" placeholder="Search NPCs..." 
                                   value="${this.searchQuery}">
                            <button id="search-btn">🔍</button>
                        </div>
                        
                        <select id="filter-level" value="${this.filterLevel}">
                            <option value="all">All Levels</option>
                            <option value="stranger">Strangers</option>
                            <option value="regular">Regulars</option>
                            <option value="friend">Friends</option>
                            <option value="vip">VIPs</option>
                        </select>
                    </div>
                </div>
                
                <div class="npc-app-content">
                    ${this.renderCurrentView()}
                </div>
            </div>
        `;
    }

    renderCurrentView() {
        switch (this.currentView) {
            case 'overview':
                return this.renderOverview();
            case 'directory':
                return this.renderDirectory();
            case 'relationships':
                return this.renderRelationships();
            case 'analytics':
                return this.renderAnalytics();
            default:
                return this.renderOverview();
        }
    }

    renderOverview() {
        const registry = this.npcSystem.getNPCRegistry();
        const recentCustomers = this.getRecentCustomers(5);
        const topCustomers = this.getTopCustomers(5);
        
        return `
            <div class="overview-content">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${registry.total}</div>
                        <div class="stat-label">Total NPCs</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${registry.encountered}</div>
                        <div class="stat-label">Encountered</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${registry.byLevel.friend + registry.byLevel.vip}</div>
                        <div class="stat-label">Friends & VIPs</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${registry.byLevel.regular}</div>
                        <div class="stat-label">Regulars</div>
                    </div>
                </div>
                
                <div class="overview-sections">
                    <div class="section">
                        <h3>📅 Recent Customers</h3>
                        <div class="customer-list">
                            ${recentCustomers.map(npc => this.renderNPCCard(npc, 'compact')).join('')}
                        </div>
                    </div>
                    
                    <div class="section">
                        <h3>⭐ Top Relationships</h3>
                        <div class="customer-list">
                            ${topCustomers.map(npc => this.renderNPCCard(npc, 'compact')).join('')}
                        </div>
                    </div>
                    
                    <div class="section">
                        <h3>📊 Relationship Breakdown</h3>
                        <div class="relationship-chart">
                            ${this.renderRelationshipChart(registry.byLevel)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderDirectory() {
        const filteredNPCs = this.getFilteredNPCs();
        const sortedNPCs = this.sortNPCs(filteredNPCs);
        
        return `
            <div class="directory-content">
                <div class="directory-header">
                    <div class="directory-controls">
                        <span class="result-count">${sortedNPCs.length} NPCs</span>
                        
                        <select id="sort-by" value="${this.sortBy}">
                            <option value="relationship">By Relationship</option>
                            <option value="name">By Name</option>
                            <option value="lastVisit">By Last Visit</option>
                            <option value="totalSpent">By Total Spent</option>
                            <option value="visitCount">By Visit Count</option>
                        </select>
                    </div>
                </div>
                
                <div class="directory-grid">
                    ${sortedNPCs.map(npc => this.renderNPCCard(npc, 'full')).join('')}
                </div>
            </div>
        `;
    }

    renderRelationships() {
        const relationships = this.npcSystem.getAllNPCs()
            .filter(npc => npc.visitCount > 0)
            .sort((a, b) => b.relationship - a.relationship);
        
        return `
            <div class="relationships-content">
                <div class="relationship-levels">
                    ${this.renderRelationshipLevel('VIP', relationships.filter(npc => npc.relationshipLevel === 'vip'))}
                    ${this.renderRelationshipLevel('Friends', relationships.filter(npc => npc.relationshipLevel === 'friend'))}
                    ${this.renderRelationshipLevel('Regulars', relationships.filter(npc => npc.relationshipLevel === 'regular'))}
                    ${this.renderRelationshipLevel('Strangers', relationships.filter(npc => npc.relationshipLevel === 'stranger'))}
                </div>
            </div>
        `;
    }

    renderAnalytics() {
        const analytics = this.calculateAnalytics();
        
        return `
            <div class="analytics-content">
                <div class="analytics-sections">
                    <div class="section">
                        <h3>📈 Customer Trends</h3>
                        <div class="trend-stats">
                            <div class="trend-item">
                                <span class="trend-label">Average Relationship Score:</span>
                                <span class="trend-value">${analytics.avgRelationship.toFixed(1)}</span>
                            </div>
                            <div class="trend-item">
                                <span class="trend-label">Average Spending per Customer:</span>
                                <span class="trend-value">$${analytics.avgSpending.toFixed(2)}</span>
                            </div>
                            <div class="trend-item">
                                <span class="trend-label">Most Common Archetype:</span>
                                <span class="trend-value">${analytics.topArchetype}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h3>🎯 Relationship Goals</h3>
                        <div class="goals-list">
                            ${this.renderRelationshipGoals(analytics)}
                        </div>
                    </div>
                    
                    <div class="section">
                        <h3>📊 Archetype Distribution</h3>
                        <div class="archetype-chart">
                            ${this.renderArchetypeChart(analytics.archetypeDistribution)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderNPCCard(npc, style = 'full') {
        const relationshipColor = this.getRelationshipColor(npc.relationshipLevel);
        const isCompact = style === 'compact';
        
        return `
            <div class="npc-card ${isCompact ? 'compact' : 'full'}" 
                 data-npc-id="${npc.id}" 
                 onclick="npcApp.selectNPC('${npc.id}')">
                
                <div class="npc-avatar">
                    ${npc.avatar ? 
                        `<img src="${npc.avatar}" alt="${npc.name}" class="avatar-img">` :
                        `<div class="avatar-placeholder">${npc.name.charAt(0)}</div>`
                    }
                    <div class="relationship-badge" style="background: ${relationshipColor}">
                        ${npc.relationship}
                    </div>
                </div>
                
                <div class="npc-info">
                    <div class="npc-name">${npc.name}</div>
                    <div class="npc-details">
                        <span class="npc-archetype">${this.formatArchetype(npc.archetype)}</span>
                        <span class="npc-age">${npc.age}${npc.gender ? ', ' + npc.gender : ''}</span>
                    </div>
                    
                    ${!isCompact ? `
                        <div class="npc-stats">
                            <div class="stat">
                                <span class="stat-label">Visits:</span>
                                <span class="stat-value">${npc.visitCount}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Spent:</span>
                                <span class="stat-value">$${npc.totalSpent.toFixed(2)}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Level:</span>
                                <span class="stat-value">${this.formatRelationshipLevel(npc.relationshipLevel)}</span>
                            </div>
                        </div>
                        
                        <div class="npc-traits">
                            ${npc.traits.slice(0, 3).map(trait => 
                                `<span class="trait-tag">${this.formatTrait(trait)}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
                
                ${npc.visitCount > 0 ? `
                    <div class="npc-status">
                        <div class="last-visit">
                            Last visit: ${this.formatDaysAgo(npc.lastVisit)}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderRelationshipLevel(levelName, npcs) {
        if (npcs.length === 0) return '';
        
        return `
            <div class="relationship-level-section">
                <h3>${levelName} (${npcs.length})</h3>
                <div class="relationship-list">
                    ${npcs.map(npc => `
                        <div class="relationship-item" onclick="npcApp.selectNPC('${npc.id}')">
                            <div class="relationship-avatar">
                                ${npc.avatar ? 
                                    `<img src="${npc.avatar}" alt="${npc.name}">` :
                                    `<div class="avatar-placeholder">${npc.name.charAt(0)}</div>`
                                }
                            </div>
                            <div class="relationship-info">
                                <div class="relationship-name">${npc.name}</div>
                                <div class="relationship-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${npc.relationship}%"></div>
                                    </div>
                                    <span class="progress-text">${npc.relationship}/100</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderRelationshipChart(levels) {
        const total = Object.values(levels).reduce((sum, count) => sum + count, 0);
        if (total === 0) return '<div class="no-data">No customer data yet</div>';
        
        return `
            <div class="chart-bars">
                ${Object.entries(levels).map(([level, count]) => {
                    const percentage = (count / total) * 100;
                    const color = this.getRelationshipColor(level);
                    return `
                        <div class="chart-bar">
                            <div class="bar-label">${this.formatRelationshipLevel(level)}</div>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${percentage}%; background: ${color}"></div>
                            </div>
                            <div class="bar-value">${count}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderArchetypeChart(distribution) {
        const sortedArchetypes = Object.entries(distribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
        
        return `
            <div class="archetype-bars">
                ${sortedArchetypes.map(([archetype, count]) => `
                    <div class="archetype-bar">
                        <div class="archetype-label">${this.formatArchetype(archetype)}</div>
                        <div class="archetype-count">${count}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderRelationshipGoals(analytics) {
        const goals = [
            {
                title: 'Convert Strangers to Regulars',
                current: analytics.strangers,
                target: Math.max(0, analytics.strangers - 5),
                type: 'decrease'
            },
            {
                title: 'Build Friend Relationships',
                current: analytics.friends,
                target: analytics.friends + 3,
                type: 'increase'
            },
            {
                title: 'Create VIP Customers',
                current: analytics.vips,
                target: Math.max(5, analytics.vips + 2),
                type: 'increase'
            }
        ];
        
        return goals.map(goal => `
            <div class="goal-item">
                <div class="goal-title">${goal.title}</div>
                <div class="goal-progress">
                    <span class="goal-current">${goal.current}</span>
                    <span class="goal-arrow">${goal.type === 'increase' ? '→' : '↓'}</span>
                    <span class="goal-target">${goal.target}</span>
                </div>
            </div>
        `).join('');
    }

    // Data Processing Methods
    getFilteredNPCs() {
        let npcs = this.npcSystem.getAllNPCs();
        
        // Apply search filter
        if (this.searchQuery) {
            npcs = this.npcSystem.searchNPCs(this.searchQuery);
        }
        
        // Apply level filter
        if (this.filterLevel !== 'all') {
            npcs = npcs.filter(npc => npc.relationshipLevel === this.filterLevel);
        }
        
        return npcs;
    }

    sortNPCs(npcs) {
        return npcs.sort((a, b) => {
            switch (this.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'lastVisit':
                    return b.lastVisit - a.lastVisit;
                case 'totalSpent':
                    return b.totalSpent - a.totalSpent;
                case 'visitCount':
                    return b.visitCount - a.visitCount;
                case 'relationship':
                default:
                    return b.relationship - a.relationship;
            }
        });
    }

    getRecentCustomers(limit) {
        return this.npcSystem.getAllNPCs()
            .filter(npc => npc.visitCount > 0)
            .sort((a, b) => b.lastInteraction - a.lastInteraction)
            .slice(0, limit);
    }

    getTopCustomers(limit) {
        return this.npcSystem.getAllNPCs()
            .filter(npc => npc.visitCount > 0)
            .sort((a, b) => b.relationship - a.relationship)
            .slice(0, limit);
    }

    calculateAnalytics() {
        const allNPCs = this.npcSystem.getAllNPCs();
        const encounteredNPCs = allNPCs.filter(npc => npc.visitCount > 0);
        
        if (encounteredNPCs.length === 0) {
            return {
                avgRelationship: 0,
                avgSpending: 0,
                topArchetype: 'None',
                archetypeDistribution: {},
                strangers: 0,
                regulars: 0,
                friends: 0,
                vips: 0
            };
        }
        
        const avgRelationship = encounteredNPCs.reduce((sum, npc) => sum + npc.relationship, 0) / encounteredNPCs.length;
        const avgSpending = encounteredNPCs.reduce((sum, npc) => sum + npc.totalSpent, 0) / encounteredNPCs.length;
        
        const archetypeDistribution = {};
        encounteredNPCs.forEach(npc => {
            archetypeDistribution[npc.archetype] = (archetypeDistribution[npc.archetype] || 0) + 1;
        });
        
        const topArchetype = Object.entries(archetypeDistribution)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
        
        const levels = {
            strangers: encounteredNPCs.filter(npc => npc.relationshipLevel === 'stranger').length,
            regulars: encounteredNPCs.filter(npc => npc.relationshipLevel === 'regular').length,
            friends: encounteredNPCs.filter(npc => npc.relationshipLevel === 'friend').length,
            vips: encounteredNPCs.filter(npc => npc.relationshipLevel === 'vip').length
        };
        
        return {
            avgRelationship,
            avgSpending,
            topArchetype,
            archetypeDistribution,
            ...levels
        };
    }

    // Event Handlers
    setupEventListeners() {
        this.appWindow.getElement().addEventListener('click', (e) => {
            if (e.target.matches('.nav-btn')) {
                this.switchView(e.target.dataset.view);
            }
        });
        
        this.appWindow.getElement().addEventListener('change', (e) => {
            if (e.target.id === 'filter-level') {
                this.filterLevel = e.target.value;
                this.refreshCurrentView();
            } else if (e.target.id === 'sort-by') {
                this.sortBy = e.target.value;
                this.refreshCurrentView();
            }
        });
        
        this.appWindow.getElement().addEventListener('input', (e) => {
            if (e.target.id === 'npc-search') {
                this.searchQuery = e.target.value;
                this.debounceSearch();
            }
        });
    }

    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.refreshCurrentView();
        }, 300);
    }

    switchView(view) {
        this.currentView = view;
        this.refreshInterface();
    }

    selectNPC(npcId) {
        this.selectedNPC = npcId;
        this.showNPCDetails(npcId);
    }

    showNPCDetails(npcId) {
        const npc = this.npcSystem.getNPC(npcId);
        if (!npc) return;
        
        // Open detailed NPC view (this would be a modal or separate view)
        this.eventBus.emit('ui.showModal', {
            type: 'npcDetails',
            npc: npc
        });
    }

    refreshInterface() {
        this.appWindow.setContent(this.renderMainInterface());
        this.setupEventListeners();
    }

    refreshCurrentView() {
        const contentElement = this.appWindow.getElement().querySelector('.npc-app-content');
        if (contentElement) {
            contentElement.innerHTML = this.renderCurrentView();
        }
    }

    // Utility Methods
    getRelationshipColor(level) {
        const colors = {
            'stranger': '#6b7280',
            'regular': '#3b82f6',
            'friend': '#10b981',
            'vip': '#f59e0b'
        };
        return colors[level] || colors.stranger;
    }

    formatArchetype(archetype) {
        return archetype.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatRelationshipLevel(level) {
        return level.charAt(0).toUpperCase() + level.slice(1);
    }

    formatTrait(trait) {
        return trait.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatDaysAgo(dayNumber) {
        const currentDay = this.gameState.data.time.currentDay;
        const daysAgo = currentDay - dayNumber;
        
        if (daysAgo === 0) return 'Today';
        if (daysAgo === 1) return 'Yesterday';
        return `${daysAgo} days ago`;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPCApp;
} else if (typeof window !== 'undefined') {
    window.NPCApp = NPCApp;
}
