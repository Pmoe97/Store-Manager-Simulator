/**
 * Inventory Management Interface - Main interface for managing inventory and stock
 * Coordinates between product display, inventory system, and user interactions
 */

class InventoryManagementInterface {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.productSystem = null;
        this.inventorySystem = null;
        this.productDisplay = null;
        this.currentTab = 'overview';
        this.refreshInterval = null;
    }

    initialize() {
        // In a real implementation, these would be injected or imported
        // For now, we'll assume they're available globally or through a module system
        this.setupEventListeners();
        this.initializeTabs();
        this.startAutoRefresh();
        
        console.log('📋 Inventory Management Interface initialized');
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Header actions
        document.getElementById('stock-check-btn')?.addEventListener('click', () => {
            this.runStockCheck();
        });

        document.getElementById('export-btn')?.addEventListener('click', () => {
            this.exportInventoryReport();
        });

        // Quick actions
        document.getElementById('bulk-restock')?.addEventListener('click', () => {
            this.showBulkRestockModal();
        });

        document.getElementById('create-order')?.addEventListener('click', () => {
            this.showCreateOrderModal();
        });

        document.getElementById('adjust-prices')?.addEventListener('click', () => {
            this.showPriceAdjustmentInterface();
        });

        document.getElementById('export-inventory')?.addEventListener('click', () => {
            this.exportInventoryData();
        });

        // Order status tabs
        document.querySelectorAll('.status-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const status = e.target.dataset.status;
                this.filterOrdersByStatus(status);
            });
        });

        // Modal handlers
        this.setupModalEventListeners();

        // Alert filters
        this.setupAlertFilters();

        // Report generation
        document.getElementById('generate-report')?.addEventListener('click', () => {
            this.generateReport();
        });
    }

    setupModalEventListeners() {
        // Close modal buttons
        document.querySelectorAll('.close-btn, .modal-overlay').forEach(element => {
            element.addEventListener('click', (e) => {
                if (e.target.classList.contains('close-btn') || e.target.classList.contains('modal-overlay')) {
                    this.closeModals();
                }
            });
        });

        // Bulk restock modal
        document.getElementById('cancel-restock')?.addEventListener('click', () => {
            this.closeModals();
        });

        document.getElementById('confirm-restock')?.addEventListener('click', () => {
            this.processBulkRestock();
        });

        // Create order modal
        document.getElementById('cancel-order')?.addEventListener('click', () => {
            this.closeModals();
        });

        document.getElementById('submit-order')?.addEventListener('click', () => {
            this.submitManualOrder();
        });

        // Supplier modal
        document.getElementById('close-supplier')?.addEventListener('click', () => {
            this.closeModals();
        });

        document.getElementById('edit-supplier')?.addEventListener('click', () => {
            this.editSupplier();
        });

        // Restock type radio buttons
        document.querySelectorAll('input[name="restock-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateRestockDetails(e.target.value);
            });
        });
    }

    setupAlertFilters() {
        document.getElementById('alert-type-filter')?.addEventListener('change', () => {
            this.filterAlerts();
        });

        document.getElementById('alert-priority-filter')?.addEventListener('change', () => {
            this.filterAlerts();
        });

        document.getElementById('clear-resolved')?.addEventListener('click', () => {
            this.clearResolvedAlerts();
        });
    }

    initializeTabs() {
        this.switchTab('overview');
        this.loadOverviewData();
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`)?.classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data
        switch (tabName) {
            case 'overview':
                this.loadOverviewData();
                break;
            case 'products':
                this.loadProductsTab();
                break;
            case 'alerts':
                this.loadAlertsData();
                break;
            case 'orders':
                this.loadOrdersData();
                break;
            case 'suppliers':
                this.loadSuppliersData();
                break;
            case 'reports':
                this.loadReportsTab();
                break;
        }
    }

    loadOverviewData() {
        // This would connect to the actual inventory system
        // For now, we'll use mock data
        const mockData = this.getMockInventoryData();
        
        // Update header stats
        document.getElementById('total-products').textContent = mockData.totalProducts;
        document.getElementById('total-value').textContent = `$${mockData.totalValue.toFixed(2)}`;
        document.getElementById('low-stock-count').textContent = mockData.lowStockCount;
        document.getElementById('out-of-stock-count').textContent = mockData.outOfStockCount;

        // Update overview cards
        this.updateStockStatusChart(mockData.stockStatus);
        this.updateRecentActivity(mockData.recentActivity);
        this.updateTopProducts(mockData.topProducts);
        this.updateCategoryBreakdown(mockData.categoryBreakdown);
        this.updatePendingOrders(mockData.pendingOrders);
    }

    updateStockStatusChart(stockStatus) {
        document.getElementById('in-stock-overview').textContent = stockStatus.in_stock;
        document.getElementById('low-stock-overview').textContent = stockStatus.low_stock;
        document.getElementById('out-stock-overview').textContent = stockStatus.out_of_stock;
    }

    updateRecentActivity(activities) {
        const container = document.getElementById('recent-activity');
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-details">
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
                <div class="activity-amount ${activity.type}">${activity.amount}</div>
            </div>
        `).join('');
    }

    updateTopProducts(products) {
        const container = document.getElementById('top-products');
        container.innerHTML = products.map(product => `
            <div class="product-item">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-stock">${product.stock} units</div>
                </div>
                <div class="product-value">$${product.value.toFixed(2)}</div>
            </div>
        `).join('');
    }

    updateCategoryBreakdown(categories) {
        const container = document.getElementById('category-breakdown');
        container.innerHTML = categories.map(category => `
            <div class="category-item">
                <div class="category-header">
                    <span class="category-name">${category.name}</span>
                    <span class="category-count">${category.count} items</span>
                </div>
                <div class="category-bar">
                    <div class="category-fill" style="width: ${category.percentage}%"></div>
                </div>
                <div class="category-value">$${category.value.toFixed(2)}</div>
            </div>
        `).join('');
    }

    updatePendingOrders(orders) {
        const container = document.getElementById('pending-orders');
        if (orders.length === 0) {
            container.innerHTML = '<div class="no-orders">No pending orders</div>';
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-info">
                    <div class="order-id">#${order.id}</div>
                    <div class="order-supplier">${order.supplier}</div>
                </div>
                <div class="order-details">
                    <div class="order-items">${order.itemCount} items</div>
                    <div class="order-value">$${order.value.toFixed(2)}</div>
                </div>
                <div class="order-status ${order.status}">${order.status}</div>
            </div>
        `).join('');
    }

    loadProductsTab() {
        // Initialize product display component if not already done
        if (!this.productDisplay) {
            const container = document.getElementById('product-display-container');
            // This would initialize the ProductDisplayComponent
            // this.productDisplay = new ProductDisplayComponent();
            // this.productDisplay.initialize(container, gameState, eventBus, productSystem, inventorySystem);
            
            // For now, show a placeholder
            container.innerHTML = `
                <div class="products-placeholder">
                    <h3>Product Management</h3>
                    <p>Product display component would be mounted here</p>
                    <div class="sample-products">
                        ${this.renderSampleProducts()}
                    </div>
                </div>
            `;
        }
    }

    renderSampleProducts() {
        const sampleProducts = [
            { id: 1, name: 'Silk Night Set', category: 'Lingerie', stock: 15, price: 89.99, status: 'in_stock' },
            { id: 2, name: 'Romantic Lace Bodysuit', category: 'Lingerie', stock: 3, price: 65.99, status: 'low_stock' },
            { id: 3, name: 'Premium Personal Lubricant', category: 'Wellness', stock: 0, price: 24.99, status: 'out_of_stock' },
            { id: 4, name: 'Beginner-Friendly Massager', category: 'Adult Toys', stock: 8, price: 79.99, status: 'in_stock' }
        ];

        return sampleProducts.map(product => `
            <div class="sample-product-card ${product.status}">
                <div class="product-header">
                    <h4>${product.name}</h4>
                    <span class="product-category">${product.category}</span>
                </div>
                <div class="product-details">
                    <div class="product-stock">
                        <span class="stock-label">Stock:</span>
                        <span class="stock-value">${product.stock}</span>
                    </div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                </div>
                <div class="product-status ${product.status}">
                    ${product.status.replace('_', ' ').toUpperCase()}
                </div>
            </div>
        `).join('');
    }

    loadAlertsData() {
        const mockAlerts = this.getMockAlerts();
        this.displayAlerts(mockAlerts);
    }

    displayAlerts(alerts) {
        const container = document.getElementById('alerts-list');
        
        if (alerts.length === 0) {
            container.innerHTML = '<div class="no-alerts">No active alerts</div>';
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.priority} ${alert.type}">
                <div class="alert-icon">${this.getAlertIcon(alert.type)}</div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-meta">
                        <span class="alert-time">${alert.time}</span>
                        <span class="alert-product">${alert.productName}</span>
                    </div>
                </div>
                <div class="alert-actions">
                    <button class="btn btn-sm btn-primary" onclick="this.resolveAlert('${alert.id}')">
                        Resolve
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="this.viewProduct('${alert.productId}')">
                        View Product
                    </button>
                </div>
            </div>
        `).join('');
    }

    getAlertIcon(type) {
        const icons = {
            'out_of_stock': '🚫',
            'critical_low': '🔴',
            'low_stock': '🟡',
            'overstocked': '📦'
        };
        return icons[type] || '⚠️';
    }

    loadOrdersData() {
        const mockOrders = this.getMockOrders();
        this.displayOrders(mockOrders);
    }

    displayOrders(orders) {
        const container = document.getElementById('orders-list');
        
        if (orders.length === 0) {
            container.innerHTML = '<div class="no-orders">No orders found</div>';
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-card ${order.status}">
                <div class="order-header">
                    <div class="order-id">#${order.id}</div>
                    <div class="order-status ${order.status}">${order.status.toUpperCase()}</div>
                </div>
                <div class="order-details">
                    <div class="order-supplier">
                        <strong>Supplier:</strong> ${order.supplier}
                    </div>
                    <div class="order-items">
                        <strong>Items:</strong> ${order.items.length}
                    </div>
                    <div class="order-value">
                        <strong>Total:</strong> $${order.totalValue.toFixed(2)}
                    </div>
                    <div class="order-dates">
                        <div><strong>Created:</strong> ${order.createdAt}</div>
                        ${order.estimatedDelivery ? `<div><strong>ETA:</strong> ${order.estimatedDelivery}</div>` : ''}
                    </div>
                </div>
                <div class="order-items-list">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span class="item-name">${item.productName}</span>
                            <span class="item-quantity">×${item.quantity}</span>
                            <span class="item-cost">$${item.totalCost.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-actions">
                    ${order.status === 'pending' ? `
                        <button class="btn btn-primary" onclick="this.approveOrder('${order.id}')">
                            Approve
                        </button>
                        <button class="btn btn-secondary" onclick="this.editOrder('${order.id}')">
                            Edit
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary" onclick="this.viewOrderDetails('${order.id}')">
                        Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadSuppliersData() {
        const mockSuppliers = this.getMockSuppliers();
        this.displaySuppliers(mockSuppliers);
    }

    displaySuppliers(suppliers) {
        const container = document.getElementById('suppliers-grid');
        
        container.innerHTML = suppliers.map(supplier => `
            <div class="supplier-card ${supplier.isActive ? 'active' : 'inactive'}">
                <div class="supplier-header">
                    <h4>${supplier.name}</h4>
                    <div class="supplier-status ${supplier.isActive ? 'active' : 'inactive'}">
                        ${supplier.isActive ? 'Active' : 'Inactive'}
                    </div>
                </div>
                <div class="supplier-details">
                    <div class="supplier-type">${supplier.type.toUpperCase()}</div>
                    <div class="supplier-specialties">
                        <strong>Specialties:</strong>
                        <div class="specialties-list">
                            ${supplier.specialties.map(specialty => `
                                <span class="specialty-tag">${specialty}</span>
                            `).join('')}
                        </div>
                    </div>
                    <div class="supplier-metrics">
                        <div class="metric">
                            <span class="metric-label">Reliability:</span>
                            <span class="metric-value">${(supplier.reliability * 100).toFixed(0)}%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Lead Time:</span>
                            <span class="metric-value">${supplier.leadTime} days</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Min Order:</span>
                            <span class="metric-value">$${supplier.minimumOrder}</span>
                        </div>
                    </div>
                </div>
                <div class="supplier-actions">
                    <button class="btn btn-primary" onclick="this.viewSupplier('${supplier.id}')">
                        View Details
                    </button>
                    <button class="btn btn-secondary" onclick="this.createOrder('${supplier.id}')">
                        Create Order
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadReportsTab() {
        // Set default date range (last 30 days)
        const today = new Date();
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        document.getElementById('report-date-to').value = today.toISOString().split('T')[0];
        document.getElementById('report-date-from').value = monthAgo.toISOString().split('T')[0];
    }

    // Action methods
    runStockCheck() {
        console.log('Running stock check...');
        
        // Show loading state
        const button = document.getElementById('stock-check-btn');
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="icon">⏳</span> Checking...';
        button.disabled = true;
        
        // Simulate stock check
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
            
            // Refresh the current tab data
            this.loadOverviewData();
            
            // Show notification
            this.showNotification('Stock check completed successfully', 'success');
        }, 2000);
    }

    exportInventoryReport() {
        console.log('Exporting inventory report...');
        this.showNotification('Report exported successfully', 'success');
    }

    showBulkRestockModal() {
        document.getElementById('bulk-restock-modal').classList.remove('hidden');
        this.updateRestockDetails('category');
    }

    showCreateOrderModal() {
        document.getElementById('create-order-modal').classList.remove('hidden');
        this.loadOrderSuppliers();
        this.loadOrderProducts();
    }

    showPriceAdjustmentInterface() {
        // This would show a price adjustment interface
        console.log('Opening price adjustment interface...');
        this.showNotification('Price adjustment interface would open here', 'info');
    }

    exportInventoryData() {
        console.log('Exporting inventory data...');
        this.showNotification('Inventory data exported successfully', 'success');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    updateRestockDetails(type) {
        const container = document.getElementById('restock-details');
        
        switch (type) {
            case 'category':
                container.innerHTML = `
                    <div class="form-group">
                        <label>Select Category</label>
                        <select id="restock-category">
                            <option value="lingerie">Lingerie</option>
                            <option value="toys">Adult Toys</option>
                            <option value="wellness">Wellness</option>
                            <option value="books">Books</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Restock Level</label>
                        <select id="restock-level">
                            <option value="optimal">Optimal Level</option>
                            <option value="maximum">Maximum Level</option>
                            <option value="custom">Custom Amount</option>
                        </select>
                    </div>
                `;
                break;
                
            case 'low-stock':
                container.innerHTML = `
                    <div class="low-stock-info">
                        <p>This will restock all products that are currently below their reorder point.</p>
                        <div class="affected-products">
                            <h4>Affected Products:</h4>
                            <ul>
                                <li>Romantic Lace Bodysuit (3 → 15 units)</li>
                                <li>Premium Personal Lubricant (0 → 20 units)</li>
                                <li>Fantasy Costume Set (2 → 12 units)</li>
                            </ul>
                        </div>
                    </div>
                `;
                break;
                
            case 'custom':
                container.innerHTML = `
                    <div class="custom-selection">
                        <div class="product-search">
                            <input type="text" placeholder="Search products..." id="custom-product-search">
                        </div>
                        <div class="selected-products" id="custom-selected-products">
                            <!-- Selected products will appear here -->
                        </div>
                    </div>
                `;
                break;
        }
    }

    loadOrderSuppliers() {
        const select = document.getElementById('order-supplier');
        const suppliers = this.getMockSuppliers();
        
        select.innerHTML = suppliers
            .filter(supplier => supplier.isActive)
            .map(supplier => `
                <option value="${supplier.id}">${supplier.name}</option>
            `).join('');
    }

    loadOrderProducts() {
        const container = document.getElementById('product-selector');
        container.innerHTML = `
            <div class="product-search-container">
                <input type="text" placeholder="Search products to add..." id="order-product-search">
                <div class="search-results" id="order-search-results"></div>
            </div>
            <div class="selected-order-products" id="selected-order-products">
                <!-- Selected products for order will appear here -->
            </div>
        `;
        
        // Add search functionality
        document.getElementById('order-product-search').addEventListener('input', (e) => {
            this.searchOrderProducts(e.target.value);
        });
    }

    searchOrderProducts(query) {
        const resultsContainer = document.getElementById('order-search-results');
        
        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }
        
        // Mock search results
        const mockResults = [
            { id: 'lg001', name: 'Silk Night Set', category: 'Lingerie', price: 35.00 },
            { id: 'wl001', name: 'Premium Personal Lubricant', category: 'Wellness', price: 8.00 },
            { id: 'ty001', name: 'Beginner-Friendly Massager', category: 'Adult Toys', price: 30.00 }
        ].filter(product => product.name.toLowerCase().includes(query.toLowerCase()));
        
        resultsContainer.innerHTML = mockResults.map(product => `
            <div class="search-result-item" onclick="this.addProductToOrder('${product.id}')">
                <div class="product-name">${product.name}</div>
                <div class="product-details">
                    <span class="product-category">${product.category}</span>
                    <span class="product-cost">Cost: $${product.price.toFixed(2)}</span>
                </div>
            </div>
        `).join('');
    }

    generateReport() {
        const reportType = document.getElementById('report-type').value;
        const dateFrom = document.getElementById('report-date-from').value;
        const dateTo = document.getElementById('report-date-to').value;
        
        console.log(`Generating ${reportType} report from ${dateFrom} to ${dateTo}`);
        
        const reportContainer = document.getElementById('report-content');
        reportContainer.innerHTML = `
            <div class="report-loading">
                <div class="loading-spinner"></div>
                <p>Generating ${reportType} report...</p>
            </div>
        `;
        
        // Simulate report generation
        setTimeout(() => {
            reportContainer.innerHTML = this.getMockReport(reportType);
        }, 1500);
    }

    getMockReport(type) {
        switch (type) {
            case 'summary':
                return `
                    <div class="report-summary">
                        <h3>Inventory Summary Report</h3>
                        <div class="summary-stats">
                            <div class="stat-card">
                                <h4>Total Products</h4>
                                <div class="stat-value">247</div>
                            </div>
                            <div class="stat-card">
                                <h4>Total Value</h4>
                                <div class="stat-value">$24,567.89</div>
                            </div>
                            <div class="stat-card">
                                <h4>Low Stock Items</h4>
                                <div class="stat-value">12</div>
                            </div>
                        </div>
                        <div class="category-summary">
                            <h4>By Category</h4>
                            <table class="report-table">
                                <thead>
                                    <tr><th>Category</th><th>Items</th><th>Value</th><th>Avg. Stock</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>Lingerie</td><td>68</td><td>$8,234.56</td><td>85%</td></tr>
                                    <tr><td>Adult Toys</td><td>89</td><td>$12,456.78</td><td>78%</td></tr>
                                    <tr><td>Wellness</td><td>45</td><td>$2,987.34</td><td>92%</td></tr>
                                    <tr><td>Books</td><td>45</td><td>$889.21</td><td>67%</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                
            default:
                return `<div class="report-placeholder">Report for ${type} would be generated here.</div>`;
        }
    }

    startAutoRefresh() {
        // Refresh overview data every 30 seconds
        this.refreshInterval = setInterval(() => {
            if (this.currentTab === 'overview') {
                this.loadOverviewData();
            }
        }, 30000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Remove on click
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    // Mock data methods
    getMockInventoryData() {
        return {
            totalProducts: 247,
            totalValue: 24567.89,
            lowStockCount: 12,
            outOfStockCount: 3,
            stockStatus: {
                in_stock: 232,
                low_stock: 12,
                out_of_stock: 3
            },
            recentActivity: [
                { icon: '📦', description: 'Restocked Silk Night Set', time: '2 hours ago', amount: '+15', type: 'positive' },
                { icon: '🛒', description: 'Sold Premium Lubricant', time: '4 hours ago', amount: '-2', type: 'negative' },
                { icon: '🚛', description: 'Order delivered from Supplier 1', time: '6 hours ago', amount: '+48', type: 'positive' },
                { icon: '⚠️', description: 'Low stock alert: Fantasy Costume', time: '8 hours ago', amount: '!', type: 'warning' }
            ],
            topProducts: [
                { name: 'Beginner-Friendly Massager', stock: 25, value: 1999.75 },
                { name: 'Silk Night Set', stock: 18, value: 1619.82 },
                { name: 'Premium Lubricant Set', stock: 45, value: 1124.55 },
                { name: 'Romantic Lace Collection', stock: 12, value: 791.88 }
            ],
            categoryBreakdown: [
                { name: 'Adult Toys', count: 89, value: 12456.78, percentage: 45 },
                { name: 'Lingerie', count: 68, value: 8234.56, percentage: 30 },
                { name: 'Wellness', count: 45, value: 2987.34, percentage: 18 },
                { name: 'Books', count: 45, value: 889.21, percentage: 7 }
            ],
            pendingOrders: [
                { id: 'ORD001', supplier: 'Intimate Essentials', itemCount: 5, value: 1250.00, status: 'pending' },
                { id: 'ORD002', supplier: 'Adult Novelty Dist.', itemCount: 12, value: 2100.00, status: 'approved' }
            ]
        };
    }

    getMockAlerts() {
        return [
            {
                id: 'ALT001',
                type: 'out_of_stock',
                priority: 'urgent',
                title: 'Out of Stock',
                message: 'Premium Personal Lubricant is completely out of stock',
                time: '2 hours ago',
                productId: 'wl001',
                productName: 'Premium Personal Lubricant'
            },
            {
                id: 'ALT002',
                type: 'critical_low',
                priority: 'high',
                title: 'Critical Low Stock',
                message: 'Romantic Lace Bodysuit has only 3 units remaining',
                time: '4 hours ago',
                productId: 'lg002',
                productName: 'Romantic Lace Bodysuit'
            },
            {
                id: 'ALT003',
                type: 'low_stock',
                priority: 'medium',
                title: 'Low Stock Warning',
                message: 'Fantasy Costume Set is running low on stock',
                time: '6 hours ago',
                productId: 'cs001',
                productName: 'Fantasy Costume Set'
            }
        ];
    }

    getMockOrders() {
        return [
            {
                id: 'ORD001',
                supplier: 'Intimate Essentials Wholesale',
                status: 'pending',
                totalValue: 1250.00,
                createdAt: '2024-01-15',
                estimatedDelivery: '2024-01-18',
                items: [
                    { productName: 'Silk Night Set', quantity: 10, totalCost: 350.00 },
                    { productName: 'Romantic Lace Bodysuit', quantity: 15, totalCost: 375.00 },
                    { productName: 'Fashion Accessories Set', quantity: 20, totalCost: 525.00 }
                ]
            },
            {
                id: 'ORD002',
                supplier: 'Adult Novelty Distributors',
                status: 'approved',
                totalValue: 2100.00,
                createdAt: '2024-01-14',
                estimatedDelivery: '2024-01-19',
                items: [
                    { productName: 'Beginner Massager', quantity: 20, totalCost: 600.00 },
                    { productName: 'Couples Items Set', quantity: 10, totalCost: 800.00 },
                    { productName: 'Novelty Gift Items', quantity: 25, totalCost: 700.00 }
                ]
            },
            {
                id: 'ORD003',
                supplier: 'Wellness & Care Supply Co',
                status: 'delivered',
                totalValue: 450.00,
                createdAt: '2024-01-12',
                estimatedDelivery: '2024-01-14',
                items: [
                    { productName: 'Premium Personal Lubricant', quantity: 30, totalCost: 240.00 },
                    { productName: 'Enhancement Products', quantity: 15, totalCost: 210.00 }
                ]
            }
        ];
    }

    getMockSuppliers() {
        return [
            {
                id: 'supplier_001',
                name: 'Intimate Essentials Wholesale',
                type: 'primary',
                specialties: ['lingerie', 'accessories', 'wellness'],
                reliability: 0.95,
                leadTime: 3,
                minimumOrder: 500,
                isActive: true
            },
            {
                id: 'supplier_002',
                name: 'Adult Novelty Distributors',
                type: 'secondary',
                specialties: ['toys', 'novelty', 'games'],
                reliability: 0.90,
                leadTime: 5,
                minimumOrder: 750,
                isActive: true
            },
            {
                id: 'supplier_003',
                name: 'Wellness & Care Supply Co',
                type: 'specialty',
                specialties: ['wellness', 'lubricants', 'cleansers'],
                reliability: 0.98,
                leadTime: 2,
                minimumOrder: 300,
                isActive: true
            },
            {
                id: 'supplier_004',
                name: 'Express Adult Books',
                type: 'specialty',
                specialties: ['books', 'media', 'digital'],
                reliability: 0.88,
                leadTime: 1,
                minimumOrder: 200,
                isActive: false
            }
        ];
    }
}

// Export for use in HTML
if (typeof window !== 'undefined') {
    window.InventoryManagementInterface = InventoryManagementInterface;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InventoryManagementInterface;
}
