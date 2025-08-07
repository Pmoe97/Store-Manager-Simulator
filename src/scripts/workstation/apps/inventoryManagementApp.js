// Inventory Management App - Product Management System
class InventoryManagementApp {
    constructor() {
        this.appId = 'inventory-management';
        this.appName = 'Inventory Management';
        this.appIcon = '📦';
        this.windowId = null;
        this.currentView = 'dashboard'; // dashboard, products, analytics, reorder, categories
        this.selectedProduct = null;
        this.searchFilters = {
            name: '',
            category: 'all',
            stockStatus: 'all',
            supplier: 'all'
        };
        
        // Sample product data - in real game this would come from productSystem
        this.products = this.generateSampleProducts();
        this.categories = this.extractCategories();
        this.suppliers = this.extractSuppliers();
        
        // Analytics data
        this.salesData = this.generateSalesData();
        this.trendData = this.generateTrendData();
    }

    // Initialize the app
    initialize() {
        console.log('📦 Inventory Management App initialized');
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
            width: 900,
            height: 650,
            x: 120,
            y: 80,
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
            <div class="inventory-management-app">
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
                    <button class="nav-tab ${this.currentView === 'dashboard' ? 'active' : ''}" 
                            data-view="dashboard">
                        📊 Dashboard
                    </button>
                    <button class="nav-tab ${this.currentView === 'products' ? 'active' : ''}" 
                            data-view="products">
                        📦 Products
                    </button>
                    <button class="nav-tab ${this.currentView === 'analytics' ? 'active' : ''}" 
                            data-view="analytics">
                        📈 Analytics
                    </button>
                    <button class="nav-tab ${this.currentView === 'reorder' ? 'active' : ''}" 
                            data-view="reorder">
                        🛒 Reorder
                    </button>
                    <button class="nav-tab ${this.currentView === 'categories' ? 'active' : ''}" 
                            data-view="categories">
                        🏷️ Categories
                    </button>
                </div>
                <div class="nav-actions">
                    <button class="btn btn-primary" id="add-product-btn">
                        ➕ Add Product
                    </button>
                    <button class="btn btn-secondary" id="bulk-reorder-btn">
                        📋 Bulk Reorder
                    </button>
                </div>
            </div>
        `;
    }

    // Render main content based on current view
    renderMainContent() {
        switch (this.currentView) {
            case 'dashboard':
                return this.renderDashboard();
            case 'products':
                return this.renderProducts();
            case 'analytics':
                return this.renderAnalytics();
            case 'reorder':
                return this.renderReorder();
            case 'categories':
                return this.renderCategories();
            case 'product-detail':
                return this.renderProductDetail();
            default:
                return this.renderDashboard();
        }
    }

    // Render inventory dashboard
    renderDashboard() {
        const totalProducts = this.products.length;
        const lowStockItems = this.products.filter(p => p.currentStock <= p.lowStockThreshold).length;
        const outOfStockItems = this.products.filter(p => p.currentStock === 0).length;
        const totalValue = this.products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);
        const recentlyAdded = this.products.filter(p => 
            Date.now() - p.dateAdded < 7 * 24 * 60 * 60 * 1000
        ).length;

        return `
            <div class="main-content dashboard-content">
                <!-- Key Metrics -->
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-icon">📦</div>
                        <div class="metric-info">
                            <div class="metric-number">${totalProducts}</div>
                            <div class="metric-label">Total Products</div>
                        </div>
                    </div>
                    <div class="metric-card alert">
                        <div class="metric-icon">⚠️</div>
                        <div class="metric-info">
                            <div class="metric-number">${lowStockItems}</div>
                            <div class="metric-label">Low Stock Items</div>
                        </div>
                    </div>
                    <div class="metric-card danger">
                        <div class="metric-icon">🚫</div>
                        <div class="metric-info">
                            <div class="metric-number">${outOfStockItems}</div>
                            <div class="metric-label">Out of Stock</div>
                        </div>
                    </div>
                    <div class="metric-card success">
                        <div class="metric-icon">💰</div>
                        <div class="metric-info">
                            <div class="metric-number">$${totalValue.toFixed(0)}</div>
                            <div class="metric-label">Inventory Value</div>
                        </div>
                    </div>
                </div>

                <div class="dashboard-sections">
                    <!-- Alerts & Notifications -->
                    <div class="dashboard-section">
                        <div class="section-header">
                            <h3>🚨 Alerts & Notifications</h3>
                            <button class="btn btn-sm btn-secondary" id="mark-all-read">Mark All Read</button>
                        </div>
                        <div class="alerts-container">
                            ${this.renderAlerts()}
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="dashboard-section">
                        <div class="section-header">
                            <h3>📊 Recent Activity</h3>
                            <select class="form-select" id="activity-filter">
                                <option value="all">All Activities</option>
                                <option value="sales">Sales Only</option>
                                <option value="restocks">Restocks Only</option>
                                <option value="adjustments">Adjustments Only</option>
                            </select>
                        </div>
                        <div class="activity-feed">
                            ${this.renderRecentActivity()}
                        </div>
                    </div>

                    <!-- Top Performers -->
                    <div class="dashboard-section">
                        <div class="section-header">
                            <h3>🏆 Top Performing Products</h3>
                            <div class="section-controls">
                                <select class="form-select" id="performance-period">
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="quarter">This Quarter</option>
                                </select>
                            </div>
                        </div>
                        <div class="top-products-list">
                            ${this.renderTopProducts()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render products list view
    renderProducts() {
        return `
            <div class="main-content products-content">
                <!-- Search and Filters -->
                <div class="products-toolbar">
                    <div class="search-section">
                        <div class="search-field">
                            <input type="text" id="product-search" class="form-input" 
                                   placeholder="Search products..." 
                                   value="${this.searchFilters.name}">
                        </div>
                        <div class="filter-fields">
                            <select id="category-filter" class="form-select">
                                <option value="all">All Categories</option>
                                ${this.categories.map(cat => 
                                    `<option value="${cat}" ${this.searchFilters.category === cat ? 'selected' : ''}>${cat}</option>`
                                ).join('')}
                            </select>
                            <select id="stock-filter" class="form-select">
                                <option value="all">All Stock Levels</option>
                                <option value="in-stock">In Stock</option>
                                <option value="low-stock">Low Stock</option>
                                <option value="out-of-stock">Out of Stock</option>
                            </select>
                            <select id="supplier-filter" class="form-select">
                                <option value="all">All Suppliers</option>
                                ${this.suppliers.map(supplier => 
                                    `<option value="${supplier}" ${this.searchFilters.supplier === supplier ? 'selected' : ''}>${supplier}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="toolbar-actions">
                        <button class="btn btn-secondary" id="export-products">📤 Export</button>
                        <button class="btn btn-secondary" id="import-products">📥 Import</button>
                        <button class="btn btn-primary" id="bulk-edit">✏️ Bulk Edit</button>
                    </div>
                </div>

                <!-- Products Table -->
                <div class="products-table-container">
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" id="select-all-products"></th>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Stock</th>
                                <th>Price</th>
                                <th>Margin</th>
                                <th>Supplier</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderProductRows()}
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="pagination-container">
                    <div class="pagination-info">
                        Showing 1-${Math.min(20, this.products.length)} of ${this.products.length} products
                    </div>
                    <div class="pagination-controls">
                        <button class="btn btn-sm btn-secondary" disabled>← Previous</button>
                        <span class="page-numbers">
                            <button class="btn btn-sm btn-primary">1</button>
                            <button class="btn btn-sm btn-secondary">2</button>
                            <button class="btn btn-sm btn-secondary">3</button>
                        </span>
                        <button class="btn btn-sm btn-secondary">Next →</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Render analytics view
    renderAnalytics() {
        return `
            <div class="main-content analytics-content">
                <!-- Analytics Header -->
                <div class="analytics-header">
                    <h3>📈 Sales & Inventory Analytics</h3>
                    <div class="analytics-controls">
                        <select class="form-select" id="analytics-period">
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                            <option value="365">Last Year</option>
                        </select>
                        <button class="btn btn-secondary" id="refresh-analytics">🔄 Refresh</button>
                    </div>
                </div>

                <!-- Analytics Grid -->
                <div class="analytics-grid">
                    <!-- Sales Trends Chart -->
                    <div class="analytics-card">
                        <div class="card-header">
                            <h4>💹 Sales Trends</h4>
                            <select class="form-select-sm" id="sales-chart-type">
                                <option value="revenue">Revenue</option>
                                <option value="units">Units Sold</option>
                                <option value="profit">Profit</option>
                            </select>
                        </div>
                        <div class="chart-container">
                            ${this.renderSalesChart()}
                        </div>
                    </div>

                    <!-- Category Performance -->
                    <div class="analytics-card">
                        <div class="card-header">
                            <h4>🏷️ Category Performance</h4>
                        </div>
                        <div class="category-chart">
                            ${this.renderCategoryChart()}
                        </div>
                    </div>

                    <!-- Inventory Turnover -->
                    <div class="analytics-card">
                        <div class="card-header">
                            <h4>🔄 Inventory Turnover</h4>
                        </div>
                        <div class="turnover-metrics">
                            ${this.renderTurnoverMetrics()}
                        </div>
                    </div>

                    <!-- Profit Margins -->
                    <div class="analytics-card">
                        <div class="card-header">
                            <h4>💰 Profit Margins</h4>
                        </div>
                        <div class="margin-analysis">
                            ${this.renderMarginAnalysis()}
                        </div>
                    </div>
                </div>

                <!-- Detailed Reports -->
                <div class="reports-section">
                    <div class="section-header">
                        <h3>📋 Detailed Reports</h3>
                        <button class="btn btn-primary" id="generate-report">Generate Report</button>
                    </div>
                    <div class="reports-grid">
                        <div class="report-card">
                            <h4>🏆 Best Sellers Report</h4>
                            <p>Top 20 products by sales volume and revenue</p>
                            <button class="btn btn-secondary">Generate</button>
                        </div>
                        <div class="report-card">
                            <h4>🐌 Slow Moving Inventory</h4>
                            <p>Products with low turnover rates</p>
                            <button class="btn btn-secondary">Generate</button>
                        </div>
                        <div class="report-card">
                            <h4>💸 Profit Analysis</h4>
                            <p>Detailed profit margins by category and product</p>
                            <button class="btn btn-secondary">Generate</button>
                        </div>
                        <div class="report-card">
                            <h4>📊 ABC Analysis</h4>
                            <p>Product classification by sales contribution</p>
                            <button class="btn btn-secondary">Generate</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render reorder interface
    renderReorder() {
        const lowStockProducts = this.products.filter(p => p.currentStock <= p.lowStockThreshold);
        const suggestedOrders = this.generateReorderSuggestions();

        return `
            <div class="main-content reorder-content">
                <!-- Reorder Header -->
                <div class="reorder-header">
                    <h3>🛒 Product Reordering</h3>
                    <div class="reorder-actions">
                        <button class="btn btn-primary" id="ai-suggest-products">🤖 AI Suggest New Products</button>
                        <button class="btn btn-secondary" id="manual-order">➕ Manual Order</button>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="reorder-stats">
                    <div class="stat-item">
                        <span class="stat-label">Items Needing Reorder:</span>
                        <span class="stat-value">${lowStockProducts.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Estimated Order Value:</span>
                        <span class="stat-value">$${this.calculateEstimatedOrderValue(suggestedOrders)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Suppliers Involved:</span>
                        <span class="stat-value">${new Set(lowStockProducts.map(p => p.supplier)).size}</span>
                    </div>
                </div>

                <!-- Reorder Suggestions -->
                <div class="reorder-sections">
                    <div class="reorder-section">
                        <div class="section-header">
                            <h4>⚠️ Low Stock Alerts</h4>
                            <button class="btn btn-sm btn-primary" id="add-all-to-order">Add All to Order</button>
                        </div>
                        <div class="low-stock-list">
                            ${this.renderLowStockItems(lowStockProducts)}
                        </div>
                    </div>

                    <div class="reorder-section">
                        <div class="section-header">
                            <h4>💡 AI Suggestions</h4>
                            <button class="btn btn-sm btn-secondary" id="refresh-suggestions">🔄 Refresh</button>
                        </div>
                        <div class="ai-suggestions">
                            ${this.renderAISuggestions()}
                        </div>
                    </div>

                    <div class="reorder-section">
                        <div class="section-header">
                            <h4>📋 Current Order</h4>
                            <div class="order-actions">
                                <button class="btn btn-sm btn-success" id="submit-order">Submit Order</button>
                                <button class="btn btn-sm btn-secondary" id="save-draft">Save Draft</button>
                                <button class="btn btn-sm btn-danger" id="clear-order">Clear All</button>
                            </div>
                        </div>
                        <div class="current-order">
                            ${this.renderCurrentOrder()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render categories management
    renderCategories() {
        return `
            <div class="main-content categories-content">
                <!-- Categories Header -->
                <div class="categories-header">
                    <h3>🏷️ Category Management</h3>
                    <button class="btn btn-primary" id="add-category">➕ Add Category</button>
                </div>

                <!-- Categories Overview -->
                <div class="categories-overview">
                    <div class="overview-stats">
                        <div class="stat-card">
                            <div class="stat-number">${this.categories.length}</div>
                            <div class="stat-label">Total Categories</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${this.getMostPopularCategory().count}</div>
                            <div class="stat-label">Largest Category</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${this.getAverageProductsPerCategory()}</div>
                            <div class="stat-label">Avg Products/Category</div>
                        </div>
                    </div>
                </div>

                <!-- Categories Grid -->
                <div class="categories-grid">
                    ${this.categories.map(category => this.renderCategoryCard(category)).join('')}
                </div>

                <!-- Category Rules -->
                <div class="category-rules-section">
                    <div class="section-header">
                        <h4>⚙️ Category Rules & Automation</h4>
                        <button class="btn btn-secondary" id="add-rule">➕ Add Rule</button>
                    </div>
                    <div class="rules-list">
                        ${this.renderCategoryRules()}
                    </div>
                </div>
            </div>
        `;
    }

    // Render individual product detail view
    renderProductDetail() {
        if (!this.selectedProduct) {
            return '<div class="main-content">No product selected</div>';
        }

        const product = this.selectedProduct;
        return `
            <div class="main-content product-detail-content">
                <div class="product-detail-header">
                    <button class="btn btn-back" id="back-to-products">← Back to Products</button>
                    <div class="product-actions">
                        <button class="btn btn-primary" id="edit-product">✏️ Edit Product</button>
                        <button class="btn btn-secondary" id="duplicate-product">📋 Duplicate</button>
                        <button class="btn btn-danger" id="delete-product">🗑️ Delete</button>
                    </div>
                </div>

                <div class="product-detail-main">
                    <div class="product-info-card">
                        <div class="product-image">
                            <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'">
                            <div class="image-fallback">📦</div>
                        </div>
                        <div class="product-basic-info">
                            <h2>${product.name}</h2>
                            <div class="product-sku">SKU: ${product.sku}</div>
                            <div class="product-category">${product.category}</div>
                            <div class="stock-status ${this.getStockStatusClass(product)}">
                                ${this.getStockStatusText(product)}
                            </div>
                        </div>
                    </div>

                    <div class="product-details-sections">
                        <div class="details-section">
                            <h4>📊 Stock Information</h4>
                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="info-label">Current Stock:</span>
                                    <span class="info-value">${product.currentStock} units</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Low Stock Threshold:</span>
                                    <span class="info-value">${product.lowStockThreshold} units</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Reorder Point:</span>
                                    <span class="info-value">${product.reorderPoint} units</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Last Restocked:</span>
                                    <span class="info-value">${this.formatDate(product.lastRestocked)}</span>
                                </div>
                            </div>
                        </div>

                        <div class="details-section">
                            <h4>💰 Pricing Information</h4>
                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="info-label">Cost Price:</span>
                                    <span class="info-value">$${product.costPrice.toFixed(2)}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Sell Price:</span>
                                    <span class="info-value">$${product.sellPrice.toFixed(2)}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Profit Margin:</span>
                                    <span class="info-value">${this.calculateMargin(product)}%</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Profit per Unit:</span>
                                    <span class="info-value">$${(product.sellPrice - product.costPrice).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div class="details-section">
                            <h4>📈 Sales Performance</h4>
                            <div class="performance-chart">
                                ${this.renderProductPerformanceChart(product)}
                            </div>
                        </div>

                        <div class="details-section">
                            <h4>📋 Product History</h4>
                            <div class="history-timeline">
                                ${this.renderProductHistory(product)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
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

            // Product actions
            if (e.target.dataset.action === 'view-product') {
                const productId = e.target.dataset.productId;
                this.viewProduct(productId);
            }

            if (e.target.dataset.action === 'reorder-product') {
                const productId = e.target.dataset.productId;
                this.addToReorder(productId);
            }

            if (e.target.dataset.action === 'quick-restock') {
                const productId = e.target.dataset.productId;
                this.quickRestock(productId);
            }

            // Back navigation
            if (e.target.id === 'back-to-products') {
                this.switchView('products');
            }

            // Filter and search actions
            if (e.target.id === 'apply-filters') {
                this.applyFilters();
            }

            if (e.target.id === 'clear-filters') {
                this.clearFilters();
            }

            // AI suggestions
            if (e.target.id === 'ai-suggest-products') {
                this.generateAIProductSuggestions();
            }

            // Reorder actions
            if (e.target.id === 'add-all-to-order') {
                this.addAllLowStockToOrder();
            }

            if (e.target.id === 'submit-order') {
                this.submitOrder();
            }

            // Category management
            if (e.target.id === 'add-category') {
                this.addCategory();
            }
        });

        // Search input
        const searchInput = window.querySelector('#product-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchFilters.name = e.target.value;
                this.debounceSearch();
            });
        }

        // Filter dropdowns
        const categoryFilter = window.querySelector('#category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.searchFilters.category = e.target.value;
                this.applyFilters();
            });
        }

        const stockFilter = window.querySelector('#stock-filter');
        if (stockFilter) {
            stockFilter.addEventListener('change', (e) => {
                this.searchFilters.stockStatus = e.target.value;
                this.applyFilters();
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

    // View a specific product
    viewProduct(productId) {
        this.selectedProduct = this.products.find(p => p.id === productId);
        if (this.selectedProduct) {
            this.switchView('product-detail');
        }
    }

    // Apply search and filters
    applyFilters() {
        // This would filter the products list and update the display
        console.log('Applying filters:', this.searchFilters);
        this.updateContent();
    }

    // Clear all filters
    clearFilters() {
        this.searchFilters = {
            name: '',
            category: 'all',
            stockStatus: 'all',
            supplier: 'all'
        };
        this.switchView('products');
    }

    // Add product to reorder list
    addToReorder(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            workComputer.showNotification(`${product.name} added to reorder list`, 'success');
        }
    }

    // Quick restock functionality
    quickRestock(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            const quantity = prompt(`How many units of ${product.name} to restock?`, '50');
            if (quantity && !isNaN(quantity)) {
                product.currentStock += parseInt(quantity);
                product.lastRestocked = Date.now();
                workComputer.showNotification(`Restocked ${quantity} units of ${product.name}`, 'success');
                this.updateContent();
            }
        }
    }

    // Generate AI product suggestions
    async generateAIProductSuggestions() {
        if (typeof productSystem === 'undefined' || !productSystem.productAIGenerator) {
            workComputer.showNotification('AI product generation not available', 'warning');
            return;
        }

        workComputer.showNotification('Generating AI product suggestions...', 'info');
        
        try {
            // Generate 3-5 AI product suggestions
            const suggestionCount = 3 + Math.floor(Math.random() * 3); // 3-5 suggestions
            const suggestions = [];
            
            for (let i = 0; i < suggestionCount; i++) {
                // Generate products with different options for variety
                const options = {
                    category: this.selectSuggestionCategory(),
                    rarity: this.selectSuggestionRarity(),
                    seasonal: Math.random() > 0.5,
                    trending: Math.random() > 0.7
                };
                
                const product = await productSystem.productAIGenerator.generateProduct(options);
                if (product) {
                    suggestions.push(product);
                }
                
                // Brief pause between generations
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            this.aiSuggestions = suggestions;
            workComputer.showNotification(`Generated ${suggestions.length} AI product suggestions!`, 'success');
            this.updateContent();
            
        } catch (error) {
            console.error('Failed to generate AI suggestions:', error);
            workComputer.showNotification('Failed to generate AI suggestions', 'error');
        }
    }

    // Select category for AI suggestions based on current inventory
    selectSuggestionCategory() {
        const categories = ['clothing', 'toys', 'media', 'wellness', 'gifts'];
        
        // Analyze current inventory to suggest categories with low stock
        const categoryStocks = {};
        this.products.forEach(product => {
            const category = product.category || 'gifts';
            categoryStocks[category] = (categoryStocks[category] || 0) + product.currentStock;
        });
        
        // Prefer categories with lower stock
        const sortedCategories = categories.sort((a, b) => 
            (categoryStocks[a] || 0) - (categoryStocks[b] || 0)
        );
        
        // 70% chance to pick from top 2 low-stock categories, 30% random
        return Math.random() > 0.3 ? 
            sortedCategories[Math.floor(Math.random() * Math.min(2, sortedCategories.length))] :
            categories[Math.floor(Math.random() * categories.length)];
    }

    // Select rarity for AI suggestions
    selectSuggestionRarity() {
        const rarities = ['common', 'uncommon', 'rare', 'legendary'];
        const weights = [50, 30, 15, 5]; // Weighted selection
        
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (let i = 0; i < rarities.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return rarities[i];
            }
        }
        return 'common';
    }

    // Add AI-suggested product to inventory
    async addAISuggestedProduct(suggestionIndex) {
        if (!this.aiSuggestions || !this.aiSuggestions[suggestionIndex]) {
            workComputer.showNotification('Invalid AI suggestion', 'error');
            return;
        }

        const aiProduct = this.aiSuggestions[suggestionIndex];
        
        try {
            // Add the AI product to the actual product system
            const addedProduct = await productSystem.generateAIProduct(aiProduct);
            
            if (addedProduct) {
                // Add to our local product list for immediate display
                this.products.push({
                    id: addedProduct.id,
                    name: addedProduct.name,
                    category: addedProduct.categoryId,
                    currentStock: 0,
                    lowStockThreshold: 5,
                    price: addedProduct.basePrice,
                    cost: addedProduct.cost,
                    profit: addedProduct.basePrice - addedProduct.cost,
                    margin: addedProduct.margin,
                    aiGenerated: true,
                    rarity: addedProduct.metadata?.rarity
                });
                
                // Remove from suggestions
                this.aiSuggestions.splice(suggestionIndex, 1);
                
                workComputer.showNotification(`Added "${addedProduct.name}" to inventory!`, 'success');
                this.updateContent();
            }
        } catch (error) {
            console.error('Failed to add AI product:', error);
            workComputer.showNotification('Failed to add AI product to inventory', 'error');
        }
    }

    // View AI suggestion details in a modal
    viewAISuggestionDetails(suggestionIndex) {
        if (!this.aiSuggestions || !this.aiSuggestions[suggestionIndex]) {
            workComputer.showNotification('Invalid AI suggestion', 'error');
            return;
        }

        const suggestion = this.aiSuggestions[suggestionIndex];
        
        const detailsHTML = `
            <div class="ai-suggestion-details">
                <h3>${suggestion.name}</h3>
                <div class="suggestion-full-details">
                    <div class="detail-section">
                        <h4>Description</h4>
                        <p>${suggestion.description}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Product Information</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">Category:</span>
                                <span class="detail-value">${suggestion.category}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Rarity:</span>
                                <span class="detail-value">${suggestion.rarity}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Price:</span>
                                <span class="detail-value">$${suggestion.price}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Cost:</span>
                                <span class="detail-value">$${suggestion.cost}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Profit Margin:</span>
                                <span class="detail-value">${suggestion.margin}%</span>
                            </div>
                        </div>
                    </div>

                    ${suggestion.features && suggestion.features.length > 0 ? `
                    <div class="detail-section">
                        <h4>Features</h4>
                        <ul class="feature-list">
                            ${suggestion.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    ${suggestion.materials && suggestion.materials.length > 0 ? `
                    <div class="detail-section">
                        <h4>Materials</h4>
                        <div class="materials-list">
                            ${suggestion.materials.map(material => `<span class="material-tag">${material}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <div class="detail-section">
                        <h4>Tags</h4>
                        <div class="tags-list">
                            ${suggestion.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>

                    <div class="detail-actions">
                        <button class="btn btn-primary" onclick="inventoryManagementApp.addAISuggestedProduct(${suggestionIndex}); workComputer.hideModal();">
                            Add to Inventory
                        </button>
                        <button class="btn btn-secondary" onclick="workComputer.hideModal();">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        workComputer.showModal('AI Product Suggestion Details', detailsHTML);
    }

    // Add all low stock items to order
    addAllLowStockToOrder() {
        const lowStockItems = this.products.filter(p => p.currentStock <= p.lowStockThreshold);
        workComputer.showNotification(`Added ${lowStockItems.length} items to reorder list`, 'success');
    }

    // Submit reorder
    submitOrder() {
        workComputer.showNotification('Order submitted successfully!', 'success');
        this.switchView('dashboard');
    }

    // Add new category
    addCategory() {
        const categoryName = prompt('Enter new category name:');
        if (categoryName && categoryName.trim()) {
            this.categories.push(categoryName.trim());
            workComputer.showNotification(`Category "${categoryName}" added successfully`, 'success');
            this.updateContent();
        }
    }

    // Debounced search function
    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.applyFilters();
        }, 300);
    }

    // Render helper functions
    renderAlerts() {
        const alerts = [
            { type: 'danger', message: '5 products are out of stock', action: 'View Products' },
            { type: 'warning', message: '12 products are low on stock', action: 'Reorder Now' },
            { type: 'info', message: 'Weekly inventory report is ready', action: 'View Report' },
            { type: 'success', message: 'Last order delivered successfully', action: 'View Details' }
        ];

        return alerts.map(alert => `
            <div class="alert alert-${alert.type}">
                <div class="alert-message">${alert.message}</div>
                <button class="btn btn-sm btn-secondary">${alert.action}</button>
            </div>
        `).join('');
    }

    renderRecentActivity() {
        const activities = [
            { type: 'sale', message: 'Sold 3x Energy Drinks', time: '2 minutes ago' },
            { type: 'restock', message: 'Restocked Milk Chocolate (50 units)', time: '1 hour ago' },
            { type: 'adjustment', message: 'Price adjusted for Potato Chips', time: '3 hours ago' },
            { type: 'sale', message: 'Sold 1x Premium Coffee', time: '4 hours ago' }
        ];

        return activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}"></div>
                <div class="activity-content">
                    <div class="activity-message">${activity.message}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    renderTopProducts() {
        const topProducts = this.products
            .sort((a, b) => (b.salesThisWeek || 0) - (a.salesThisWeek || 0))
            .slice(0, 5);

        return topProducts.map((product, index) => `
            <div class="top-product-item">
                <div class="product-rank">#${index + 1}</div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-sales">${product.salesThisWeek || 0} units sold</div>
                </div>
                <div class="product-revenue">$${((product.salesThisWeek || 0) * product.sellPrice).toFixed(0)}</div>
            </div>
        `).join('');
    }

    renderProductRows() {
        return this.products.slice(0, 20).map(product => `
            <tr class="product-row">
                <td><input type="checkbox" data-product-id="${product.id}"></td>
                <td>
                    <div class="product-cell">
                        <div class="product-name">${product.name}</div>
                        <div class="product-sku">SKU: ${product.sku}</div>
                    </div>
                </td>
                <td>${product.category}</td>
                <td>
                    <div class="stock-cell ${this.getStockStatusClass(product)}">
                        <span class="stock-number">${product.currentStock}</span>
                        <span class="stock-status">${this.getStockStatusText(product)}</span>
                    </div>
                </td>
                <td>$${product.sellPrice.toFixed(2)}</td>
                <td>${this.calculateMargin(product)}%</td>
                <td>${product.supplier}</td>
                <td>${this.formatDate(product.lastUpdated)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" data-action="view-product" data-product-id="${product.id}">View</button>
                        <button class="btn btn-sm btn-secondary" data-action="reorder-product" data-product-id="${product.id}">Reorder</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderSalesChart() {
        // Simplified chart representation
        return `
            <div class="simple-chart">
                <div class="chart-bars">
                    <div class="chart-bar" style="height: 60%"></div>
                    <div class="chart-bar" style="height: 80%"></div>
                    <div class="chart-bar" style="height: 45%"></div>
                    <div class="chart-bar" style="height: 90%"></div>
                    <div class="chart-bar" style="height: 75%"></div>
                    <div class="chart-bar" style="height: 95%"></div>
                    <div class="chart-bar" style="height: 85%"></div>
                </div>
                <div class="chart-labels">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
            </div>
        `;
    }

    renderCategoryChart() {
        return this.categories.map(category => {
            const count = this.products.filter(p => p.category === category).length;
            const percentage = (count / this.products.length) * 100;
            
            return `
                <div class="category-item">
                    <div class="category-name">${category}</div>
                    <div class="category-bar">
                        <div class="category-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="category-count">${count}</div>
                </div>
            `;
        }).join('');
    }

    renderTurnoverMetrics() {
        return `
            <div class="turnover-list">
                <div class="turnover-item">
                    <span class="turnover-label">Average Turnover Rate:</span>
                    <span class="turnover-value">4.2x per month</span>
                </div>
                <div class="turnover-item">
                    <span class="turnover-label">Fastest Moving Category:</span>
                    <span class="turnover-value">Beverages (8.1x)</span>
                </div>
                <div class="turnover-item">
                    <span class="turnover-label">Slowest Moving Category:</span>
                    <span class="turnover-value">Electronics (1.2x)</span>
                </div>
            </div>
        `;
    }

    renderMarginAnalysis() {
        return `
            <div class="margin-list">
                <div class="margin-item high">
                    <span class="margin-category">Premium Products</span>
                    <span class="margin-value">45-60%</span>
                </div>
                <div class="margin-item medium">
                    <span class="margin-category">Standard Items</span>
                    <span class="margin-value">25-35%</span>
                </div>
                <div class="margin-item low">
                    <span class="margin-category">Basic Necessities</span>
                    <span class="margin-value">10-20%</span>
                </div>
            </div>
        `;
    }

    renderLowStockItems(items) {
        return items.map(product => `
            <div class="low-stock-item">
                <div class="item-info">
                    <div class="item-name">${product.name}</div>
                    <div class="item-stock">Current: ${product.currentStock} | Threshold: ${product.lowStockThreshold}</div>
                </div>
                <div class="item-actions">
                    <input type="number" class="form-input" placeholder="Qty" min="1" value="${product.reorderQuantity || 50}">
                    <button class="btn btn-sm btn-primary" data-action="add-to-order" data-product-id="${product.id}">Add to Order</button>
                </div>
            </div>
        `).join('');
    }

    renderAISuggestions() {
        // Initialize AI suggestions if not present
        if (!this.aiSuggestions) {
            this.aiSuggestions = [];
        }

        if (this.aiSuggestions.length === 0) {
            return `
                <div class="ai-suggestions-empty">
                    <p>No AI suggestions available.</p>
                    <button class="btn btn-primary" onclick="inventoryManagementApp.generateAIProductSuggestions()">
                        Generate AI Suggestions
                    </button>
                </div>
            `;
        }

        return this.aiSuggestions.map((suggestion, index) => `
            <div class="ai-suggestion">
                <div class="suggestion-info">
                    <div class="suggestion-name">${suggestion.name}</div>
                    <div class="suggestion-description">${suggestion.description.substring(0, 100)}...</div>
                    <div class="suggestion-details">
                        <div class="suggestion-category">Category: ${suggestion.category}</div>
                        <div class="suggestion-price">Price: $${suggestion.price}</div>
                        <div class="suggestion-rarity">Rarity: ${suggestion.rarity}</div>
                        ${suggestion.seasonal ? `<div class="suggestion-seasonal">🍂 Seasonal</div>` : ''}
                        ${suggestion.trending ? `<div class="suggestion-trending">📈 Trending</div>` : ''}
                    </div>
                    <div class="suggestion-tags">
                        ${suggestion.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="suggestion-actions">
                    <button class="btn btn-sm btn-primary" onclick="inventoryManagementApp.addAISuggestedProduct(${index})">
                        Add to Inventory
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="inventoryManagementApp.viewAISuggestionDetails(${index})">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderCurrentOrder() {
        return `
            <div class="order-summary">
                <div class="order-empty">
                    <p>No items in current order</p>
                    <p>Add products from the low stock alerts or search for specific items.</p>
                </div>
            </div>
        `;
    }

    renderCategoryCard(category) {
        const productCount = this.products.filter(p => p.category === category).length;
        const totalValue = this.products
            .filter(p => p.category === category)
            .reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);

        return `
            <div class="category-card">
                <div class="category-header">
                    <h4>${category}</h4>
                    <div class="category-actions">
                        <button class="btn btn-sm btn-secondary">Edit</button>
                        <button class="btn btn-sm btn-danger">Delete</button>
                    </div>
                </div>
                <div class="category-stats">
                    <div class="stat">
                        <span class="stat-label">Products:</span>
                        <span class="stat-value">${productCount}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Total Value:</span>
                        <span class="stat-value">$${totalValue.toFixed(0)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderCategoryRules() {
        const rules = [
            { condition: 'Stock < 10', action: 'Auto-reorder 50 units', category: 'Beverages' },
            { condition: 'Margin < 20%', action: 'Send pricing alert', category: 'All' },
            { condition: 'No sales in 30 days', action: 'Mark as slow-moving', category: 'Electronics' }
        ];

        return rules.map(rule => `
            <div class="rule-item">
                <div class="rule-info">
                    <div class="rule-condition">IF ${rule.condition}</div>
                    <div class="rule-action">THEN ${rule.action}</div>
                    <div class="rule-category">Category: ${rule.category}</div>
                </div>
                <div class="rule-actions">
                    <button class="btn btn-sm btn-secondary">Edit</button>
                    <button class="btn btn-sm btn-danger">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Utility functions
    getStockStatusClass(product) {
        if (product.currentStock === 0) return 'out-of-stock';
        if (product.currentStock <= product.lowStockThreshold) return 'low-stock';
        return 'in-stock';
    }

    getStockStatusText(product) {
        if (product.currentStock === 0) return 'Out of Stock';
        if (product.currentStock <= product.lowStockThreshold) return 'Low Stock';
        return 'In Stock';
    }

    calculateMargin(product) {
        return (((product.sellPrice - product.costPrice) / product.sellPrice) * 100).toFixed(1);
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString();
    }

    extractCategories() {
        return [...new Set(this.products.map(p => p.category))];
    }

    extractSuppliers() {
        return [...new Set(this.products.map(p => p.supplier))];
    }

    getMostPopularCategory() {
        const counts = {};
        this.products.forEach(p => {
            counts[p.category] = (counts[p.category] || 0) + 1;
        });
        const max = Math.max(...Object.values(counts));
        return { category: Object.keys(counts).find(k => counts[k] === max), count: max };
    }

    getAverageProductsPerCategory() {
        return Math.round(this.products.length / this.categories.length);
    }

    generateReorderSuggestions() {
        return this.products.filter(p => p.currentStock <= p.lowStockThreshold);
    }

    calculateEstimatedOrderValue(suggestions) {
        return suggestions.reduce((sum, p) => sum + (p.reorderQuantity || 50) * p.costPrice, 0).toFixed(0);
    }

    // Generate sample data
    generateSampleProducts() {
        const categories = ['Beverages', 'Snacks', 'Household', 'Personal Care', 'Electronics'];
        const suppliers = ['ABC Wholesale', 'Global Supply Co', 'Local Distributors', 'Premium Goods Inc'];
        const products = [];

        const sampleProducts = [
            'Coca Cola 12oz', 'Pepsi 12oz', 'Energy Drink', 'Coffee Beans', 'Green Tea',
            'Potato Chips', 'Chocolate Bar', 'Cookies', 'Trail Mix', 'Granola Bars',
            'Toilet Paper', 'Paper Towels', 'Laundry Detergent', 'Dish Soap', 'Trash Bags',
            'Toothpaste', 'Shampoo', 'Soap Bar', 'Deodorant', 'Hand Sanitizer',
            'Phone Charger', 'Batteries AA', 'Bluetooth Speaker', 'Memory Card', 'USB Cable'
        ];

        sampleProducts.forEach((name, index) => {
            const category = categories[Math.floor(index / 5)];
            const costPrice = Math.random() * 20 + 5;
            const sellPrice = costPrice * (1.2 + Math.random() * 0.8);
            const currentStock = Math.floor(Math.random() * 100);
            
            products.push({
                id: `product-${index + 1}`,
                sku: `SKU${(index + 1).toString().padStart(3, '0')}`,
                name,
                category,
                supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
                costPrice: parseFloat(costPrice.toFixed(2)),
                sellPrice: parseFloat(sellPrice.toFixed(2)),
                currentStock,
                lowStockThreshold: Math.floor(Math.random() * 20) + 5,
                reorderPoint: Math.floor(Math.random() * 30) + 10,
                reorderQuantity: Math.floor(Math.random() * 50) + 25,
                image: `https://api.dicebear.com/7.x/shapes/svg?seed=${name.replace(' ', '')}`,
                dateAdded: Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000,
                lastRestocked: Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
                lastUpdated: Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000,
                salesThisWeek: Math.floor(Math.random() * 50),
                salesHistory: []
            });
        });

        return products;
    }

    generateSalesData() {
        // Generate sample sales data for charts
        return {
            daily: Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000) + 500),
            weekly: Array.from({ length: 4 }, () => Math.floor(Math.random() * 5000) + 2000),
            monthly: Array.from({ length: 12 }, () => Math.floor(Math.random() * 20000) + 10000)
        };
    }

    generateTrendData() {
        // Generate sample trend data
        return {
            categories: this.categories.map(cat => ({
                name: cat,
                growth: (Math.random() - 0.5) * 50 // -25% to +25%
            }))
        };
    }

    renderProductPerformanceChart(product) {
        return `
            <div class="performance-summary">
                <div class="performance-metric">
                    <span class="metric-label">Sales This Week:</span>
                    <span class="metric-value">${product.salesThisWeek || 0} units</span>
                </div>
                <div class="performance-metric">
                    <span class="metric-label">Revenue This Week:</span>
                    <span class="metric-value">$${((product.salesThisWeek || 0) * product.sellPrice).toFixed(2)}</span>
                </div>
                <div class="performance-metric">
                    <span class="metric-label">Turnover Rate:</span>
                    <span class="metric-value">${(Math.random() * 10 + 1).toFixed(1)}x per month</span>
                </div>
            </div>
        `;
    }

    renderProductHistory(product) {
        const history = [
            { action: 'Stock Added', quantity: '50 units', date: Date.now() - 5 * 24 * 60 * 60 * 1000 },
            { action: 'Price Updated', quantity: `$${product.sellPrice}`, date: Date.now() - 10 * 24 * 60 * 60 * 1000 },
            { action: 'Product Created', quantity: 'Initial stock: 100 units', date: product.dateAdded }
        ];

        return history.map(item => `
            <div class="history-item">
                <div class="history-action">${item.action}</div>
                <div class="history-details">${item.quantity}</div>
                <div class="history-date">${this.formatDate(item.date)}</div>
            </div>
        `).join('');
    }
}

// Create global instance
window.inventoryManagementApp = new InventoryManagementApp();
