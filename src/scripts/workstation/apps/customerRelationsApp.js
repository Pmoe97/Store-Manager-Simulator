// Customer Relations App - NPC Management System
class CustomerRelationsApp {
    constructor() {
        this.appId = 'customer-relations';
        this.appName = 'Customer Relations';
        this.appIcon = '👥';
        this.windowId = null;
        this.currentView = 'overview'; // overview, profile, search, history
        this.selectedNPC = null;
        this.searchFilters = {
            name: '',
            relationship: 'all',
            lastVisit: 'all',
            archetype: 'all'
        };
        
        // Sample NPC data - in real game this would come from npcSystem
        this.npcs = this.generateSampleNPCs();
    }

    // Initialize the app
    initialize() {
        console.log('📱 Customer Relations App initialized');
    }

    // Open the app window
    open() {
        if (this.windowId && workComputer.openWindows.has(this.windowId)) {
            workComputer.focusWindow(this.windowId);
            return;
        }

        this.windowId = `${this.appId}-${Date.now()}`;
        
        const windowConfig = {
            id: this.windowId,
            title: this.appName,
            icon: this.appIcon,
            width: 800,
            height: 600,
            x: 100,
            y: 100,
            content: this.renderContent(),
            onClose: () => this.close(),
            onMinimize: () => this.minimize(),
            onMaximize: () => this.maximize()
        };

        workComputer.openApplication(windowConfig);
        this.setupEventListeners();
    }

    // Close the app
    close() {
        if (this.windowId) {
            workComputer.closeApplication(this.windowId);
            this.windowId = null;
        }
    }

    // Minimize the app
    minimize() {
        workComputer.minimizeApplication(this.windowId);
    }

    // Maximize the app
    maximize() {
        workComputer.maximizeApplication(this.windowId);
    }

    // Render the main app content
    renderContent() {
        return `
            <div class="customer-relations-app">
                ${this.renderNavigation()}
                ${this.renderMainContent()}
            </div>
        `;
    }

    // Render navigation tabs
    renderNavigation() {
        return `
            <div class="app-navigation">
                <div class="nav-tabs">
                    <button class="nav-tab ${this.currentView === 'overview' ? 'active' : ''}" 
                            data-view="overview">
                        📊 Overview
                    </button>
                    <button class="nav-tab ${this.currentView === 'search' ? 'active' : ''}" 
                            data-view="search">
                        🔍 Search & Filter
                    </button>
                    <button class="nav-tab ${this.currentView === 'history' ? 'active' : ''}" 
                            data-view="history">
                        📚 Interaction History
                    </button>
                </div>
                <div class="nav-actions">
                    <button class="btn btn-primary" id="add-customer-btn">
                        ➕ Add Customer Note
                    </button>
                    <button class="btn btn-secondary" id="export-data-btn">
                        📤 Export Data
                    </button>
                </div>
            </div>
        `;
    }

    // Render main content based on current view
    renderMainContent() {
        switch (this.currentView) {
            case 'overview':
                return this.renderOverview();
            case 'search':
                return this.renderSearch();
            case 'profile':
                return this.renderProfile();
            case 'history':
                return this.renderHistory();
            default:
                return this.renderOverview();
        }
    }

    // Render overview dashboard
    renderOverview() {
        const totalCustomers = this.npcs.length;
        const regulars = this.npcs.filter(npc => npc.relationship >= 21).length;
        const vips = this.npcs.filter(npc => npc.relationship >= 81).length;
        const recentVisitors = this.npcs.filter(npc => 
            Date.now() - npc.lastVisit < 7 * 24 * 60 * 60 * 1000
        ).length;

        return `
            <div class="main-content overview-content">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-info">
                            <div class="stat-number">${totalCustomers}</div>
                            <div class="stat-label">Total Customers</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-info">
                            <div class="stat-number">${regulars}</div>
                            <div class="stat-label">Regular Customers</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💎</div>
                        <div class="stat-info">
                            <div class="stat-number">${vips}</div>
                            <div class="stat-label">VIP Customers</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📅</div>
                        <div class="stat-info">
                            <div class="stat-number">${recentVisitors}</div>
                            <div class="stat-label">Recent Visitors</div>
                        </div>
                    </div>
                </div>

                <div class="customers-section">
                    <div class="section-header">
                        <h3>Customer Profiles</h3>
                        <div class="section-actions">
                            <select id="sort-customers" class="form-select">
                                <option value="name">Sort by Name</option>
                                <option value="relationship">Sort by Relationship</option>
                                <option value="lastVisit">Sort by Last Visit</option>
                                <option value="totalSpent">Sort by Total Spent</option>
                            </select>
                        </div>
                    </div>
                    <div class="customers-grid" id="customers-grid">
                        ${this.renderCustomerCards()}
                    </div>
                </div>
            </div>
        `;
    }

    // Render customer cards
    renderCustomerCards(filteredNPCs = null) {
        const npcsToShow = filteredNPCs || this.npcs;
        
        return npcsToShow.map(npc => `
            <div class="customer-card" data-npc-id="${npc.id}">
                <div class="customer-avatar">
                    <img src="${npc.avatar}" alt="${npc.name}" onerror="this.style.display='none'">
                    <div class="avatar-fallback">${npc.name.charAt(0)}</div>
                </div>
                <div class="customer-info">
                    <div class="customer-name">${npc.name}</div>
                    <div class="customer-archetype">${npc.archetype}</div>
                    <div class="relationship-meter">
                        <div class="relationship-bar">
                            <div class="relationship-fill" 
                                 style="width: ${npc.relationship}%; background: ${this.getRelationshipColor(npc.relationship)}">
                            </div>
                        </div>
                        <div class="relationship-label">${this.getRelationshipLabel(npc.relationship)}</div>
                    </div>
                    <div class="customer-stats">
                        <span class="stat">💰 $${npc.totalSpent}</span>
                        <span class="stat">📅 ${this.formatLastVisit(npc.lastVisit)}</span>
                        <span class="stat">🛒 ${npc.visitCount} visits</span>
                    </div>
                </div>
                <div class="customer-actions">
                    <button class="btn btn-sm btn-primary" data-action="view-profile" data-npc-id="${npc.id}">
                        View Profile
                    </button>
                    <button class="btn btn-sm btn-secondary" data-action="add-note" data-npc-id="${npc.id}">
                        Add Note
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Render search and filter interface
    renderSearch() {
        return `
            <div class="main-content search-content">
                <div class="search-panel">
                    <div class="search-section">
                        <h3>Search Customers</h3>
                        <div class="search-grid">
                            <div class="search-field">
                                <label for="search-name">Name</label>
                                <input type="text" id="search-name" class="form-input" 
                                       placeholder="Enter customer name..." 
                                       value="${this.searchFilters.name}">
                            </div>
                            <div class="search-field">
                                <label for="filter-relationship">Relationship Level</label>
                                <select id="filter-relationship" class="form-select">
                                    <option value="all">All Levels</option>
                                    <option value="stranger">Stranger (0-20)</option>
                                    <option value="regular">Regular (21-50)</option>
                                    <option value="friend">Friend (51-80)</option>
                                    <option value="vip">VIP (81-100)</option>
                                </select>
                            </div>
                            <div class="search-field">
                                <label for="filter-archetype">Customer Type</label>
                                <select id="filter-archetype" class="form-select">
                                    <option value="all">All Types</option>
                                    <option value="student">College Student</option>
                                    <option value="professional">Professional</option>
                                    <option value="retiree">Retiree</option>
                                    <option value="parent">Parent</option>
                                    <option value="teenager">Teenager</option>
                                </select>
                            </div>
                            <div class="search-field">
                                <label for="filter-last-visit">Last Visit</label>
                                <select id="filter-last-visit" class="form-select">
                                    <option value="all">Any Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="older">Older</option>
                                </select>
                            </div>
                        </div>
                        <div class="search-actions">
                            <button id="apply-filters-btn" class="btn btn-primary">Apply Filters</button>
                            <button id="clear-filters-btn" class="btn btn-secondary">Clear All</button>
                        </div>
                    </div>
                </div>
                
                <div class="search-results">
                    <div class="results-header">
                        <h3>Search Results</h3>
                        <div class="results-count" id="results-count">
                            ${this.npcs.length} customers found
                        </div>
                    </div>
                    <div class="results-grid" id="search-results-grid">
                        ${this.renderCustomerCards()}
                    </div>
                </div>
            </div>
        `;
    }

    // Render individual customer profile
    renderProfile() {
        if (!this.selectedNPC) {
            return '<div class="main-content">No customer selected</div>';
        }

        const npc = this.selectedNPC;
        return `
            <div class="main-content profile-content">
                <div class="profile-header">
                    <button class="btn btn-back" id="back-to-overview">← Back to Overview</button>
                    <div class="profile-actions">
                        <button class="btn btn-primary" id="edit-profile-btn">Edit Profile</button>
                        <button class="btn btn-secondary" id="message-customer-btn">Send Message</button>
                    </div>
                </div>

                <div class="profile-main">
                    <div class="profile-card">
                        <div class="profile-avatar">
                            <img src="${npc.avatar}" alt="${npc.name}" onerror="this.style.display='none'">
                            <div class="avatar-fallback large">${npc.name.charAt(0)}</div>
                        </div>
                        <div class="profile-info">
                            <h2 class="profile-name">${npc.name}</h2>
                            <div class="profile-archetype">${npc.archetype}</div>
                            <div class="profile-relationship">
                                <div class="relationship-meter large">
                                    <div class="relationship-bar">
                                        <div class="relationship-fill" 
                                             style="width: ${npc.relationship}%; background: ${this.getRelationshipColor(npc.relationship)}">
                                        </div>
                                    </div>
                                    <div class="relationship-details">
                                        <span class="relationship-level">${this.getRelationshipLabel(npc.relationship)}</span>
                                        <span class="relationship-score">${npc.relationship}/100</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="profile-sections">
                        <div class="profile-section">
                            <h3>📊 Statistics</h3>
                            <div class="stats-list">
                                <div class="stat-item">
                                    <span class="stat-label">Total Spent:</span>
                                    <span class="stat-value">$${npc.totalSpent}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Visit Count:</span>
                                    <span class="stat-value">${npc.visitCount}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Average Purchase:</span>
                                    <span class="stat-value">$${(npc.totalSpent / Math.max(npc.visitCount, 1)).toFixed(2)}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Last Visit:</span>
                                    <span class="stat-value">${this.formatLastVisit(npc.lastVisit)}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Customer Since:</span>
                                    <span class="stat-value">${this.formatDate(npc.firstVisit)}</span>
                                </div>
                            </div>
                        </div>

                        <div class="profile-section">
                            <h3>🏷️ Preferences & Notes</h3>
                            <div class="preferences-list">
                                <div class="preference-item">
                                    <span class="preference-label">Favorite Products:</span>
                                    <span class="preference-value">${npc.favoriteProducts.join(', ')}</span>
                                </div>
                                <div class="preference-item">
                                    <span class="preference-label">Shopping Times:</span>
                                    <span class="preference-value">${npc.preferredTimes.join(', ')}</span>
                                </div>
                                <div class="preference-item">
                                    <span class="preference-label">Payment Method:</span>
                                    <span class="preference-value">${npc.preferredPayment}</span>
                                </div>
                            </div>
                            <div class="notes-section">
                                <h4>Personal Notes</h4>
                                <div class="notes-content" contenteditable="true" id="customer-notes">
                                    ${npc.notes || 'Click to add notes about this customer...'}
                                </div>
                                <button class="btn btn-sm btn-primary" id="save-notes-btn">Save Notes</button>
                            </div>
                        </div>

                        ${this.renderAIEnhancedSections(npc)}

                        <div class="profile-section">
                            <h3>💬 Recent Interactions</h3>
                            <div class="interactions-list" id="interactions-list">
                                ${this.renderInteractionHistory(npc)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render interaction history
    renderInteractionHistory(npc) {
        const interactions = npc.interactions || [];
        
        if (interactions.length === 0) {
            return '<div class="no-interactions">No interactions recorded yet.</div>';
        }

        return interactions.map(interaction => `
            <div class="interaction-item">
                <div class="interaction-header">
                    <div class="interaction-type ${interaction.type}">
                        ${this.getInteractionIcon(interaction.type)} ${interaction.type}
                    </div>
                    <div class="interaction-date">${this.formatDate(interaction.date)}</div>
                </div>
                <div class="interaction-content">
                    ${interaction.description}
                </div>
                ${interaction.relationshipChange ? `
                    <div class="relationship-change ${interaction.relationshipChange > 0 ? 'positive' : 'negative'}">
                        ${interaction.relationshipChange > 0 ? '+' : ''}${interaction.relationshipChange} relationship
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // Render full interaction history view
    renderHistory() {
        const allInteractions = [];
        this.npcs.forEach(npc => {
            if (npc.interactions) {
                npc.interactions.forEach(interaction => {
                    allInteractions.push({
                        ...interaction,
                        customerName: npc.name,
                        customerId: npc.id
                    });
                });
            }
        });

        // Sort by date, most recent first
        allInteractions.sort((a, b) => new Date(b.date) - new Date(a.date));

        return `
            <div class="main-content history-content">
                <div class="history-header">
                    <h3>📚 Complete Interaction History</h3>
                    <div class="history-filters">
                        <select id="history-filter-type" class="form-select">
                            <option value="all">All Interactions</option>
                            <option value="purchase">Purchases</option>
                            <option value="conversation">Conversations</option>
                            <option value="complaint">Complaints</option>
                            <option value="compliment">Compliments</option>
                        </select>
                        <select id="history-filter-period" class="form-select">
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>
                
                <div class="history-timeline" id="history-timeline">
                    ${allInteractions.map(interaction => `
                        <div class="timeline-item">
                            <div class="timeline-marker ${interaction.type}"></div>
                            <div class="timeline-content">
                                <div class="timeline-header">
                                    <span class="customer-name" data-customer-id="${interaction.customerId}">
                                        ${interaction.customerName}
                                    </span>
                                    <span class="interaction-type">${interaction.type}</span>
                                    <span class="timeline-date">${this.formatDate(interaction.date)}</span>
                                </div>
                                <div class="timeline-description">
                                    ${interaction.description}
                                </div>
                                ${interaction.relationshipChange ? `
                                    <div class="timeline-relationship ${interaction.relationshipChange > 0 ? 'positive' : 'negative'}">
                                        Relationship ${interaction.relationshipChange > 0 ? '+' : ''}${interaction.relationshipChange}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Render AI-enhanced sections for NPC profiles
    renderAIEnhancedSections(npc) {
        if (!npc.aiEnhanced && !npc.isEnriched) {
            return `
                <div class="profile-section ai-enhancement">
                    <h3>🧠 AI Enhancement</h3>
                    <div class="enhancement-status">
                        <p>This customer profile can be enhanced with AI-generated details.</p>
                        <button class="btn btn-primary" onclick="customerRelationsApp.requestNPCEnrichment('${npc.id}')">
                            Enhance Profile
                        </button>
                    </div>
                </div>
            `;
        }

        let sections = '';

        // Backstory section
        if (npc.backstory) {
            sections += `
                <div class="profile-section">
                    <h3>📖 Background Story</h3>
                    <div class="backstory-content">
                        ${npc.backstory}
                    </div>
                </div>
            `;
        }

        // Personality traits (new format)
        if (npc.personalityTraits && Object.keys(npc.personalityTraits).length > 0) {
            sections += `
                <div class="profile-section">
                    <h3>🎭 Personality Profile</h3>
                    <div class="personality-traits">
                        ${Object.entries(npc.personalityTraits).map(([category, traits]) => `
                            <div class="trait-category">
                                <div class="trait-category-name">${this.formatCategoryName(category)}</div>
                                <div class="trait-tags">
                                    ${traits.map(trait => `<span class="trait-tag">${trait}</span>`).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Behavior patterns
        if (npc.behaviorPatterns && Object.keys(npc.behaviorPatterns).length > 0) {
            sections += `
                <div class="profile-section">
                    <h3>🛍️ Shopping Behavior</h3>
                    <div class="behavior-patterns">
                        ${Object.entries(npc.behaviorPatterns).map(([type, data]) => `
                            <div class="behavior-item">
                                <div class="behavior-type">${this.formatBehaviorType(type)}</div>
                                <div class="behavior-description">${data.description || data}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Secrets and interesting facts
        if (npc.secrets && npc.secrets.length > 0) {
            sections += `
                <div class="profile-section">
                    <h3>🔍 Insights & Secrets</h3>
                    <div class="secrets-list">
                        ${npc.secrets.map(secret => `
                            <div class="secret-item">
                                <span class="secret-icon">🤫</span>
                                <span class="secret-text">${secret}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Relationship insights (new format)
        if (npc.relationshipData && npc.relationshipData.trajectory) {
            sections += `
                <div class="profile-section">
                    <h3>💝 Relationship Insights</h3>
                    <div class="relationship-insights">
                        <div class="insight-item">
                            <div class="insight-label">Initial Meeting:</div>
                            <div class="insight-content">${npc.relationshipData.initialMeeting}</div>
                        </div>
                        <div class="insight-item">
                            <div class="insight-label">Relationship Development:</div>
                            <div class="insight-content">${npc.relationshipData.trajectory}</div>
                        </div>
                        <div class="insight-item">
                            <div class="insight-label">Long-term Potential:</div>
                            <div class="insight-content">${npc.relationshipData.longTermPotential}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        return sections;
    }

    // Helper methods for AI-enhanced data formatting
    formatCategoryName(category) {
        const categoryNames = {
            'social': '👥 Social',
            'economic': '💰 Economic',
            'emotional': '😊 Emotional',
            'behavioral': '🔄 Behavioral',
            'quirks': '🎲 Quirks',
            'flaws': '⚠️ Flaws'
        };
        return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }

    formatBehaviorType(type) {
        const typeNames = {
            'shopping': '🛒 Shopping Habits',
            'social': '👋 Social Behavior',
            'decisionMaking': '🤔 Decision Making',
            'payment': '💳 Payment & Checkout'
        };
        return typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1);
    }

    // Request NPC enrichment
    async requestNPCEnrichment(npcId) {
        if (typeof npcSystem !== 'undefined') {
            try {
                const button = event.target;
                button.disabled = true;
                button.textContent = 'Enhancing...';
                
                await npcSystem.enrichNPC(npcId);
                
                // Refresh the view
                this.refreshNPCData();
                this.switchView('profile');
            } catch (error) {
                console.error('Failed to enhance NPC:', error);
                button.disabled = false;
                button.textContent = 'Enhance Profile';
            }
        }
    }

    // Refresh NPC data
    refreshNPCData() {
        this.loadNPCs();
        if (this.currentView === 'profile' && this.selectedNPC) {
            // Find updated NPC
            this.selectedNPC = this.npcs.find(npc => npc.id === this.selectedNPC.id) || this.selectedNPC;
        }
        this.render();
    }

    // Setup event listeners for the app
    setupEventListeners() {
        const window = document.getElementById(this.windowId);
        if (!window) return;

        // Navigation tabs
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-tab')) {
                const view = e.target.dataset.view;
                this.switchView(view);
            }

            // Customer card actions
            if (e.target.dataset.action === 'view-profile') {
                const npcId = e.target.dataset.npcId;
                this.viewProfile(npcId);
            }

            if (e.target.dataset.action === 'add-note') {
                const npcId = e.target.dataset.npcId;
                this.addNote(npcId);
            }

            // Back to overview
            if (e.target.id === 'back-to-overview') {
                this.switchView('overview');
            }

            // Apply filters
            if (e.target.id === 'apply-filters-btn') {
                this.applyFilters();
            }

            // Clear filters
            if (e.target.id === 'clear-filters-btn') {
                this.clearFilters();
            }

            // Save notes
            if (e.target.id === 'save-notes-btn') {
                this.saveNotes();
            }

            // Customer name click in history
            if (e.target.classList.contains('customer-name')) {
                const customerId = e.target.dataset.customerId;
                this.viewProfile(customerId);
            }
        });

        // Search input
        const searchInput = window.querySelector('#search-name');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchFilters.name = e.target.value;
                this.debounceSearch();
            });
        }

        // Sort dropdown
        const sortSelect = window.querySelector('#sort-customers');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortCustomers(e.target.value);
            });
        }
    }

    // Switch between different views
    switchView(view) {
        this.currentView = view;
        this.updateContent();
    }

    // Update the window content
    updateContent() {
        const window = document.getElementById(this.windowId);
        if (!window) return;

        const content = window.querySelector('.window-content');
        if (content) {
            content.innerHTML = this.renderContent();
            this.setupEventListeners();
        }
    }

    // View a specific customer profile
    viewProfile(npcId) {
        this.selectedNPC = this.npcs.find(npc => npc.id === npcId);
        if (this.selectedNPC) {
            this.switchView('profile');
        }
    }

    // Add a note for a customer
    addNote(npcId) {
        const npc = this.npcs.find(npc => npc.id === npcId);
        if (npc) {
            const note = prompt(`Add a note for ${npc.name}:`);
            if (note && note.trim()) {
                if (!npc.interactions) npc.interactions = [];
                npc.interactions.unshift({
                    type: 'note',
                    date: new Date().toISOString(),
                    description: `Note: ${note.trim()}`,
                    relationshipChange: 0
                });
                this.updateContent();
            }
        }
    }

    // Apply search filters
    applyFilters() {
        const window = document.getElementById(this.windowId);
        if (!window) return;

        // Get filter values
        this.searchFilters.name = window.querySelector('#search-name')?.value || '';
        this.searchFilters.relationship = window.querySelector('#filter-relationship')?.value || 'all';
        this.searchFilters.archetype = window.querySelector('#filter-archetype')?.value || 'all';
        this.searchFilters.lastVisit = window.querySelector('#filter-last-visit')?.value || 'all';

        // Filter NPCs
        const filtered = this.filterNPCs();
        
        // Update results
        const resultsGrid = window.querySelector('#search-results-grid');
        const resultsCount = window.querySelector('#results-count');
        
        if (resultsGrid) {
            resultsGrid.innerHTML = this.renderCustomerCards(filtered);
        }
        
        if (resultsCount) {
            resultsCount.textContent = `${filtered.length} customers found`;
        }
    }

    // Clear all filters
    clearFilters() {
        this.searchFilters = {
            name: '',
            relationship: 'all',
            lastVisit: 'all',
            archetype: 'all'
        };
        this.switchView('search');
    }

    // Filter NPCs based on current filters
    filterNPCs() {
        return this.npcs.filter(npc => {
            // Name filter
            if (this.searchFilters.name && 
                !npc.name.toLowerCase().includes(this.searchFilters.name.toLowerCase())) {
                return false;
            }

            // Relationship filter
            if (this.searchFilters.relationship !== 'all') {
                const relationship = npc.relationship;
                switch (this.searchFilters.relationship) {
                    case 'stranger':
                        if (relationship > 20) return false;
                        break;
                    case 'regular':
                        if (relationship < 21 || relationship > 50) return false;
                        break;
                    case 'friend':
                        if (relationship < 51 || relationship > 80) return false;
                        break;
                    case 'vip':
                        if (relationship < 81) return false;
                        break;
                }
            }

            // Archetype filter
            if (this.searchFilters.archetype !== 'all' && 
                !npc.archetype.toLowerCase().includes(this.searchFilters.archetype.toLowerCase())) {
                return false;
            }

            // Last visit filter
            if (this.searchFilters.lastVisit !== 'all') {
                const daysSinceVisit = (Date.now() - npc.lastVisit) / (24 * 60 * 60 * 1000);
                switch (this.searchFilters.lastVisit) {
                    case 'today':
                        if (daysSinceVisit > 1) return false;
                        break;
                    case 'week':
                        if (daysSinceVisit > 7) return false;
                        break;
                    case 'month':
                        if (daysSinceVisit > 30) return false;
                        break;
                    case 'older':
                        if (daysSinceVisit <= 30) return false;
                        break;
                }
            }

            return true;
        });
    }

    // Sort customers by various criteria
    sortCustomers(criteria) {
        const sortedNPCs = [...this.npcs];
        
        switch (criteria) {
            case 'name':
                sortedNPCs.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'relationship':
                sortedNPCs.sort((a, b) => b.relationship - a.relationship);
                break;
            case 'lastVisit':
                sortedNPCs.sort((a, b) => b.lastVisit - a.lastVisit);
                break;
            case 'totalSpent':
                sortedNPCs.sort((a, b) => b.totalSpent - a.totalSpent);
                break;
        }

        const window = document.getElementById(this.windowId);
        const grid = window?.querySelector('#customers-grid');
        if (grid) {
            grid.innerHTML = this.renderCustomerCards(sortedNPCs);
        }
    }

    // Save customer notes
    saveNotes() {
        if (!this.selectedNPC) return;

        const window = document.getElementById(this.windowId);
        const notesElement = window?.querySelector('#customer-notes');
        
        if (notesElement) {
            this.selectedNPC.notes = notesElement.textContent;
            // Show saved notification
            workComputer.showNotification('Notes saved successfully', 'success');
        }
    }

    // Debounced search function
    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.applyFilters();
        }, 300);
    }

    // Utility functions
    getRelationshipColor(relationship) {
        if (relationship >= 81) return '#28a745'; // VIP - Green
        if (relationship >= 51) return '#17a2b8'; // Friend - Blue
        if (relationship >= 21) return '#ffc107'; // Regular - Yellow
        return '#6c757d'; // Stranger - Gray
    }

    getRelationshipLabel(relationship) {
        if (relationship >= 81) return 'VIP Customer';
        if (relationship >= 51) return 'Friend';
        if (relationship >= 21) return 'Regular';
        return 'Stranger';
    }

    formatLastVisit(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return `${Math.floor(days / 30)} months ago`;
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString();
    }

    getInteractionIcon(type) {
        const icons = {
            purchase: '🛒',
            conversation: '💬',
            complaint: '😠',
            compliment: '😊',
            note: '📝',
            return: '↩️'
        };
        return icons[type] || '📋';
    }

    // Generate sample NPC data for testing
    generateSampleNPCs() {
        const archetypes = ['College Student', 'Business Professional', 'Retiree', 'Parent', 'Teenager'];
        const names = [
            'Alex Johnson', 'Sarah Miller', 'Mike Wilson', 'Emma Davis', 'John Smith',
            'Lisa Brown', 'David Garcia', 'Amy Taylor', 'Chris Anderson', 'Jessica White'
        ];
        
        return names.map((name, index) => ({
            id: `npc-${index + 1}`,
            name,
            archetype: archetypes[index % archetypes.length],
            relationship: Math.floor(Math.random() * 100),
            totalSpent: Math.floor(Math.random() * 2000) + 50,
            visitCount: Math.floor(Math.random() * 50) + 1,
            lastVisit: Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
            firstVisit: Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(' ', '')}`,
            favoriteProducts: ['Snacks', 'Beverages', 'Magazines'],
            preferredTimes: ['Morning', 'Evening'],
            preferredPayment: 'Credit Card',
            notes: index % 3 === 0 ? 'Prefers organic products. Very friendly.' : '',
            interactions: this.generateSampleInteractions()
        }));
    }

    generateSampleInteractions() {
        const interactions = [];
        const types = ['purchase', 'conversation', 'complaint', 'compliment'];
        const descriptions = {
            purchase: ['Bought daily essentials', 'Purchased gift items', 'Large grocery shopping'],
            conversation: ['Asked about new products', 'Chatted about weather', 'Discussed store hours'],
            complaint: ['Item was expired', 'Long wait time', 'Price too high'],
            compliment: ['Great customer service', 'Clean store', 'Helpful staff']
        };

        for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const descOptions = descriptions[type];
            
            interactions.push({
                type,
                date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
                description: descOptions[Math.floor(Math.random() * descOptions.length)],
                relationshipChange: type === 'complaint' ? -Math.floor(Math.random() * 5) - 1 : 
                                  type === 'compliment' ? Math.floor(Math.random() * 5) + 1 : 0
            });
        }

        return interactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
}

// Create global instance
window.customerRelationsApp = new CustomerRelationsApp();
