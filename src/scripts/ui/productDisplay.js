/**
 * Product Display Component - Handles product catalog interface and pricing display
 * Manages product browsing, search, filtering, and inventory status display
 */

class ProductDisplayComponent {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.productSystem = null;
        this.inventorySystem = null;
        this.container = null;
        this.currentView = 'catalog';
        this.currentFilters = {};
        this.currentSort = { field: 'name', order: 'asc' };
        this.selectedCategory = null;
        this.searchQuery = '';
    }

    initialize(container, gameState, eventBus, productSystem, inventorySystem) {
        this.container = container;
        this.gameState = gameState;
        this.eventBus = eventBus;
        this.productSystem = productSystem;
        this.inventorySystem = inventorySystem;

        // Listen for events
        this.eventBus.on('product.displayCatalog', () => this.showCatalog());
        this.eventBus.on('product.displayCategory', (data) => this.showCategory(data.categoryId));
        this.eventBus.on('product.search', (data) => this.performSearch(data.query));
        this.eventBus.on('product.showDetails', (data) => this.showProductDetails(data.productId));
        this.eventBus.on('inventory.stockChanged', (data) => this.updateProductStock(data));
        this.eventBus.on('product.priceChanged', (data) => this.updateProductPrice(data));

        this.createInterface();
        this.loadInitialData();

        console.log('🛍️ Product Display Component initialized');
    }

    createInterface() {
        this.container.innerHTML = `
            <div class="product-display">
                <!-- Header with Search and Filters -->
                <div class="product-header">
                    <div class="search-section">
                        <div class="search-bar">
                            <input type="text" id="product-search" placeholder="Search products..." />
                            <button id="search-btn" class="search-button">
                                <span class="icon">🔍</span>
                            </button>
                        </div>
                        <div class="view-toggles">
                            <button id="catalog-view" class="view-btn active">Catalog</button>
                            <button id="inventory-view" class="view-btn">Inventory</button>
                            <button id="pricing-view" class="view-btn">Pricing</button>
                        </div>
                    </div>
                    
                    <div class="filter-section">
                        <div class="category-filter">
                            <select id="category-select">
                                <option value="">All Categories</option>
                            </select>
                        </div>
                        <div class="sort-options">
                            <select id="sort-select">
                                <option value="name_asc">Name (A-Z)</option>
                                <option value="name_desc">Name (Z-A)</option>
                                <option value="price_asc">Price (Low to High)</option>
                                <option value="price_desc">Price (High to Low)</option>
                                <option value="stock_asc">Stock (Low to High)</option>
                                <option value="stock_desc">Stock (High to Low)</option>
                                <option value="sales_desc">Best Selling</option>
                            </select>
                        </div>
                        <div class="filter-controls">
                            <button id="filter-btn" class="filter-button">
                                <span class="icon">⚙️</span> Filters
                            </button>
                            <button id="clear-filters" class="clear-button">Clear</button>
                        </div>
                    </div>
                </div>

                <!-- Advanced Filters Panel -->
                <div id="advanced-filters" class="advanced-filters hidden">
                    <div class="filter-group">
                        <label>Price Range</label>
                        <div class="price-range">
                            <input type="number" id="min-price" placeholder="Min" />
                            <span>to</span>
                            <input type="number" id="max-price" placeholder="Max" />
                        </div>
                    </div>
                    <div class="filter-group">
                        <label>Stock Status</label>
                        <div class="stock-filters">
                            <label><input type="checkbox" id="in-stock"> In Stock</label>
                            <label><input type="checkbox" id="low-stock"> Low Stock</label>
                            <label><input type="checkbox" id="out-of-stock"> Out of Stock</label>
                        </div>
                    </div>
                    <div class="filter-group">
                        <label>Special Categories</label>
                        <div class="special-filters">
                            <label><input type="checkbox" id="featured"> Featured</label>
                            <label><input type="checkbox" id="on-sale"> On Sale</label>
                            <label><input type="checkbox" id="new-arrivals"> New Arrivals</label>
                        </div>
                    </div>
                </div>

                <!-- Category Navigation -->
                <div class="category-nav">
                    <div class="category-breadcrumb">
                        <span id="breadcrumb-home" class="breadcrumb-item active">All Products</span>
                        <span id="breadcrumb-path" class="breadcrumb-path"></span>
                    </div>
                    <div class="category-grid" id="category-grid"></div>
                </div>

                <!-- Product Grid/List -->
                <div class="product-content">
                    <div class="content-header">
                        <div class="results-info">
                            <span id="results-count">0 products</span>
                            <span id="results-details"></span>
                        </div>
                        <div class="display-options">
                            <button id="grid-view" class="display-btn active">
                                <span class="icon">⊞</span>
                            </button>
                            <button id="list-view" class="display-btn">
                                <span class="icon">☰</span>
                            </button>
                        </div>
                    </div>
                    
                    <div id="product-grid" class="product-grid"></div>
                    
                    <!-- Pagination -->
                    <div class="pagination" id="pagination"></div>
                </div>

                <!-- Product Details Modal -->
                <div id="product-modal" class="product-modal hidden">
                    <div class="modal-overlay"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 id="modal-title">Product Details</h2>
                            <button id="close-modal" class="close-btn">×</button>
                        </div>
                        <div class="modal-body" id="modal-body">
                            <!-- Product details will be inserted here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        // Search functionality
        const searchInput = this.container.querySelector('#product-search');
        const searchBtn = this.container.querySelector('#search-btn');
        
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.debounceSearch();
        });
        
        searchBtn.addEventListener('click', () => {
            this.performSearch(this.searchQuery);
        });

        // View toggles
        this.container.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.container.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentView = e.target.id.replace('-view', '');
                this.refreshDisplay();
            });
        });

        // Category and sort filters
        this.container.querySelector('#category-select').addEventListener('change', (e) => {
            this.selectedCategory = e.target.value || null;
            this.refreshDisplay();
        });

        this.container.querySelector('#sort-select').addEventListener('change', (e) => {
            const [field, order] = e.target.value.split('_');
            this.currentSort = { field, order };
            this.refreshDisplay();
        });

        // Filter controls
        this.container.querySelector('#filter-btn').addEventListener('click', () => {
            this.toggleAdvancedFilters();
        });

        this.container.querySelector('#clear-filters').addEventListener('click', () => {
            this.clearAllFilters();
        });

        // Display options
        this.container.querySelectorAll('.display-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.container.querySelectorAll('.display-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.refreshDisplay();
            });
        });

        // Modal controls
        this.container.querySelector('#close-modal').addEventListener('click', () => {
            this.hideProductModal();
        });
        
        this.container.querySelector('.modal-overlay').addEventListener('click', () => {
            this.hideProductModal();
        });

        // Breadcrumb navigation
        this.container.querySelector('#breadcrumb-home').addEventListener('click', () => {
            this.selectedCategory = null;
            this.updateBreadcrumb();
            this.refreshDisplay();
        });
    }

    loadInitialData() {
        this.loadCategories();
        this.refreshDisplay();
    }

    loadCategories() {
        const categorySelect = this.container.querySelector('#category-select');
        const categoryGrid = this.container.querySelector('#category-grid');
        
        // Clear existing options
        categorySelect.innerHTML = '<option value="">All Categories</option>';
        
        // Load main categories
        const mainCategories = Array.from(this.productSystem.categories.values())
            .filter(category => !category.parentId && category.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder);

        mainCategories.forEach(category => {
            // Add to dropdown
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);

            // Add to category grid
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.innerHTML = `
                <div class="category-icon">${category.metadata.icon || '📦'}</div>
                <div class="category-name">${category.name}</div>
                <div class="category-count">${this.getProductCountForCategory(category.id)} products</div>
            `;
            categoryCard.addEventListener('click', () => {
                this.selectedCategory = category.id;
                this.updateBreadcrumb();
                this.refreshDisplay();
            });
            categoryGrid.appendChild(categoryCard);
        });
    }

    getProductCountForCategory(categoryId) {
        return this.productSystem.getProductsByCategory(categoryId).length;
    }

    refreshDisplay() {
        let products = [];

        switch (this.currentView) {
            case 'catalog':
                products = this.getFilteredProducts();
                this.displayProductGrid(products);
                break;
            case 'inventory':
                products = this.getFilteredProducts();
                this.displayInventoryView(products);
                break;
            case 'pricing':
                products = this.getFilteredProducts();
                this.displayPricingView(products);
                break;
        }

        this.updateResultsInfo(products);
    }

    getFilteredProducts() {
        let products = [];

        // Get base product set
        if (this.selectedCategory) {
            products = this.productSystem.getProductsByCategory(this.selectedCategory);
        } else if (this.searchQuery) {
            products = this.productSystem.searchProducts(this.searchQuery);
        } else {
            products = Array.from(this.productSystem.products.values()).filter(p => p.isActive);
        }

        // Apply advanced filters
        products = this.applyAdvancedFilters(products);

        // Apply sorting
        products = this.sortProducts(products);

        return products;
    }

    applyAdvancedFilters(products) {
        const filters = this.getActiveFilters();

        return products.filter(product => {
            // Price range filter
            if (filters.minPrice !== null && product.currentPrice < filters.minPrice) return false;
            if (filters.maxPrice !== null && product.currentPrice > filters.maxPrice) return false;

            // Stock status filter
            if (filters.stockStatus.length > 0) {
                const inventoryData = this.inventorySystem.inventory.get(product.id);
                const stockStatus = inventoryData ? inventoryData.stockStatus : 'out_of_stock';
                
                const statusMap = {
                    'in-stock': ['in_stock'],
                    'low-stock': ['low_stock', 'critical_low'],
                    'out-of-stock': ['out_of_stock']
                };

                let matchesStock = false;
                filters.stockStatus.forEach(status => {
                    if (statusMap[status] && statusMap[status].includes(stockStatus)) {
                        matchesStock = true;
                    }
                });

                if (!matchesStock) return false;
            }

            // Special categories filter
            if (filters.featured && !this.productSystem.productCatalog.featured.includes(product.id)) return false;
            if (filters.onSale && !this.productSystem.productCatalog.onSale.includes(product.id)) return false;
            if (filters.newArrivals && !this.productSystem.productCatalog.newArrivals.includes(product.id)) return false;

            return true;
        });
    }

    getActiveFilters() {
        const filters = {
            minPrice: null,
            maxPrice: null,
            stockStatus: [],
            featured: false,
            onSale: false,
            newArrivals: false
        };

        // Price range
        const minPrice = this.container.querySelector('#min-price').value;
        const maxPrice = this.container.querySelector('#max-price').value;
        if (minPrice) filters.minPrice = parseFloat(minPrice);
        if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

        // Stock status
        if (this.container.querySelector('#in-stock').checked) filters.stockStatus.push('in-stock');
        if (this.container.querySelector('#low-stock').checked) filters.stockStatus.push('low-stock');
        if (this.container.querySelector('#out-of-stock').checked) filters.stockStatus.push('out-of-stock');

        // Special categories
        filters.featured = this.container.querySelector('#featured').checked;
        filters.onSale = this.container.querySelector('#on-sale').checked;
        filters.newArrivals = this.container.querySelector('#new-arrivals').checked;

        return filters;
    }

    sortProducts(products) {
        const { field, order } = this.currentSort;

        return products.sort((a, b) => {
            let aValue, bValue;

            switch (field) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'price':
                    aValue = a.currentPrice;
                    bValue = b.currentPrice;
                    break;
                case 'stock':
                    aValue = this.inventorySystem.getStock(a.id);
                    bValue = this.inventorySystem.getStock(b.id);
                    break;
                case 'sales':
                    aValue = a.salesCount;
                    bValue = b.salesCount;
                    break;
                default:
                    return 0;
            }

            if (order === 'desc') {
                return aValue < bValue ? 1 : -1;
            } else {
                return aValue > bValue ? 1 : -1;
            }
        });
    }

    displayProductGrid(products) {
        const productGrid = this.container.querySelector('#product-grid');
        const isListView = this.container.querySelector('#list-view').classList.contains('active');
        
        productGrid.className = isListView ? 'product-list' : 'product-grid';
        productGrid.innerHTML = '';

        if (products.length === 0) {
            productGrid.innerHTML = `
                <div class="no-products">
                    <div class="no-products-icon">📦</div>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                </div>
            `;
            return;
        }

        products.forEach(product => {
            const productCard = this.createProductCard(product, isListView);
            productGrid.appendChild(productCard);
        });
    }

    createProductCard(product, isListView = false) {
        const inventoryData = this.inventorySystem.inventory.get(product.id);
        const stock = inventoryData ? inventoryData.currentStock : 0;
        const stockStatus = inventoryData ? inventoryData.stockStatus : 'out_of_stock';
        
        const pricing = this.productSystem.calculateDynamicPricing({
            productId: product.id,
            quantity: 1
        });

        const card = document.createElement('div');
        card.className = `product-card ${stockStatus}`;
        card.innerHTML = `
            <div class="product-image">
                <div class="product-placeholder">
                    <span class="product-icon">📦</span>
                </div>
                <div class="product-badges">
                    ${this.productSystem.productCatalog.featured.includes(product.id) ? '<span class="badge featured">Featured</span>' : ''}
                    ${this.productSystem.productCatalog.onSale.includes(product.id) ? '<span class="badge on-sale">Sale</span>' : ''}
                    ${this.productSystem.productCatalog.newArrivals.includes(product.id) ? '<span class="badge new">New</span>' : ''}
                </div>
                <div class="stock-indicator ${stockStatus}">
                    <span class="stock-text">${this.getStockStatusText(stockStatus, stock)}</span>
                </div>
            </div>
            
            <div class="product-info">
                <div class="product-category">${this.getCategoryName(product.categoryId)}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                
                <div class="product-details">
                    <div class="product-brand">by ${product.brand}</div>
                    <div class="product-rating">
                        <span class="stars">${this.renderStars(product.rating)}</span>
                        <span class="review-count">(${product.reviewCount})</span>
                    </div>
                </div>
                
                <div class="product-pricing">
                    ${pricing.savings > 0 ? `<div class="original-price">$${product.basePrice.toFixed(2)}</div>` : ''}
                    <div class="current-price">$${pricing.finalPrice.toFixed(2)}</div>
                    ${pricing.savings > 0 ? `<div class="savings">Save $${pricing.savings.toFixed(2)}</div>` : ''}
                </div>
                
                <div class="product-stock">
                    <div class="stock-level">
                        <span class="stock-count">${stock} in stock</span>
                        <div class="stock-bar">
                            <div class="stock-fill" style="width: ${this.getStockPercentage(inventoryData)}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="product-actions">
                    <button class="btn btn-primary view-details" data-product-id="${product.id}">
                        View Details
                    </button>
                    <button class="btn btn-secondary add-to-cart" data-product-id="${product.id}" ${stock === 0 ? 'disabled' : ''}>
                        ${stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        card.querySelector('.view-details').addEventListener('click', () => {
            this.showProductDetails(product.id);
        });

        if (stock > 0) {
            card.querySelector('.add-to-cart').addEventListener('click', () => {
                this.eventBus.emit('checkout.addToCart', { productId: product.id, quantity: 1 });
            });
        }

        return card;
    }

    displayInventoryView(products) {
        const productGrid = this.container.querySelector('#product-grid');
        productGrid.className = 'inventory-view';
        productGrid.innerHTML = `
            <div class="inventory-table">
                <div class="table-header">
                    <div class="col-product">Product</div>
                    <div class="col-stock">Current Stock</div>
                    <div class="col-status">Status</div>
                    <div class="col-reorder">Reorder Point</div>
                    <div class="col-value">Inventory Value</div>
                    <div class="col-actions">Actions</div>
                </div>
                <div class="table-body">
                    ${products.map(product => this.createInventoryRow(product)).join('')}
                </div>
            </div>
        `;

        this.bindInventoryActions();
    }

    createInventoryRow(product) {
        const inventoryData = this.inventorySystem.inventory.get(product.id);
        const stock = inventoryData ? inventoryData.currentStock : 0;
        const stockStatus = inventoryData ? inventoryData.stockStatus : 'out_of_stock';
        const value = stock * product.cost;

        return `
            <div class="table-row ${stockStatus}">
                <div class="col-product">
                    <div class="product-summary">
                        <div class="product-icon">📦</div>
                        <div class="product-details">
                            <div class="product-name">${product.name}</div>
                            <div class="product-sku">${product.id}</div>
                        </div>
                    </div>
                </div>
                <div class="col-stock">
                    <div class="stock-display">
                        <span class="stock-number">${stock}</span>
                        <div class="stock-bar">
                            <div class="stock-fill" style="width: ${this.getStockPercentage(inventoryData)}%"></div>
                        </div>
                    </div>
                </div>
                <div class="col-status">
                    <span class="status-badge ${stockStatus}">${this.getStockStatusText(stockStatus, stock)}</span>
                </div>
                <div class="col-reorder">
                    <span class="reorder-point">${inventoryData ? inventoryData.reorderPoint : 0}</span>
                </div>
                <div class="col-value">
                    <span class="inventory-value">$${value.toFixed(2)}</span>
                </div>
                <div class="col-actions">
                    <button class="btn btn-sm restock-btn" data-product-id="${product.id}">Restock</button>
                    <button class="btn btn-sm adjust-btn" data-product-id="${product.id}">Adjust</button>
                </div>
            </div>
        `;
    }

    displayPricingView(products) {
        const productGrid = this.container.querySelector('#product-grid');
        productGrid.className = 'pricing-view';
        productGrid.innerHTML = `
            <div class="pricing-table">
                <div class="table-header">
                    <div class="col-product">Product</div>
                    <div class="col-cost">Cost</div>
                    <div class="col-price">Base Price</div>
                    <div class="col-current">Current Price</div>
                    <div class="col-margin">Margin</div>
                    <div class="col-actions">Actions</div>
                </div>
                <div class="table-body">
                    ${products.map(product => this.createPricingRow(product)).join('')}
                </div>
            </div>
        `;

        this.bindPricingActions();
    }

    createPricingRow(product) {
        const pricing = this.productSystem.calculateDynamicPricing({
            productId: product.id,
            quantity: 1
        });

        const margin = ((pricing.finalPrice - product.cost) / pricing.finalPrice * 100).toFixed(1);

        return `
            <div class="table-row">
                <div class="col-product">
                    <div class="product-summary">
                        <div class="product-icon">📦</div>
                        <div class="product-details">
                            <div class="product-name">${product.name}</div>
                            <div class="product-category">${this.getCategoryName(product.categoryId)}</div>
                        </div>
                    </div>
                </div>
                <div class="col-cost">
                    <span class="cost-price">$${product.cost.toFixed(2)}</span>
                </div>
                <div class="col-price">
                    <span class="base-price">$${product.basePrice.toFixed(2)}</span>
                </div>
                <div class="col-current">
                    <span class="current-price ${pricing.savings > 0 ? 'discounted' : ''}">
                        $${pricing.finalPrice.toFixed(2)}
                    </span>
                    ${pricing.savings > 0 ? `<div class="price-modifier">-$${pricing.savings.toFixed(2)}</div>` : ''}
                </div>
                <div class="col-margin">
                    <span class="margin-percentage ${margin < 20 ? 'low' : margin > 50 ? 'high' : ''}">${margin}%</span>
                </div>
                <div class="col-actions">
                    <button class="btn btn-sm price-btn" data-product-id="${product.id}">Edit Price</button>
                </div>
            </div>
        `;
    }

    showProductDetails(productId) {
        const product = this.productSystem.getProduct(productId);
        if (!product) return;

        const inventoryData = this.inventorySystem.inventory.get(productId);
        const pricing = this.productSystem.calculateDynamicPricing({ productId, quantity: 1 });

        const modal = this.container.querySelector('#product-modal');
        const modalBody = this.container.querySelector('#modal-body');
        const modalTitle = this.container.querySelector('#modal-title');

        modalTitle.textContent = product.name;
        modalBody.innerHTML = `
            <div class="product-detail-content">
                <div class="detail-image">
                    <div class="product-placeholder large">
                        <span class="product-icon">📦</span>
                    </div>
                </div>
                
                <div class="detail-info">
                    <div class="product-meta">
                        <span class="category">${this.getCategoryName(product.categoryId)}</span>
                        <span class="brand">by ${product.brand}</span>
                    </div>
                    
                    <div class="product-description">
                        <p>${product.description}</p>
                    </div>
                    
                    <div class="product-features">
                        <h4>Features:</h4>
                        <ul>
                            ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="product-variants">
                        <h4>Available Options:</h4>
                        <div class="variants-grid">
                            ${product.variants.map(variant => `
                                <div class="variant-option">
                                    ${Object.entries(variant).filter(([key]) => key !== 'sku').map(([key, value]) => 
                                        `<span class="variant-${key}">${value}</span>`
                                    ).join(' ')}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="detail-sidebar">
                    <div class="pricing-info">
                        <div class="price-display">
                            ${pricing.savings > 0 ? `<div class="original-price">$${product.basePrice.toFixed(2)}</div>` : ''}
                            <div class="current-price">$${pricing.finalPrice.toFixed(2)}</div>
                            ${pricing.savings > 0 ? `<div class="savings">Save $${pricing.savings.toFixed(2)}</div>` : ''}
                        </div>
                        
                        ${pricing.appliedModifiers.length > 0 ? `
                            <div class="price-modifiers">
                                <h5>Applied Discounts:</h5>
                                ${pricing.appliedModifiers.map(modifier => `
                                    <div class="modifier">${modifier.description}</div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="stock-info">
                        <div class="stock-status ${inventoryData?.stockStatus || 'out_of_stock'}">
                            ${this.getStockStatusText(inventoryData?.stockStatus || 'out_of_stock', inventoryData?.currentStock || 0)}
                        </div>
                        <div class="stock-details">
                            <div class="stock-count">${inventoryData?.currentStock || 0} in stock</div>
                            ${inventoryData ? `<div class="stock-location">${inventoryData.location.section}</div>` : ''}
                        </div>
                    </div>
                    
                    <div class="product-actions">
                        <div class="quantity-selector">
                            <label>Quantity:</label>
                            <div class="quantity-controls">
                                <button class="qty-btn minus">-</button>
                                <input type="number" class="qty-input" value="1" min="1" max="${inventoryData?.availableStock || 0}">
                                <button class="qty-btn plus">+</button>
                            </div>
                        </div>
                        
                        <button class="btn btn-primary add-to-cart-detailed" ${!inventoryData || inventoryData.currentStock === 0 ? 'disabled' : ''}>
                            ${!inventoryData || inventoryData.currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        this.bindProductDetailActions(productId);
    }

    bindProductDetailActions(productId) {
        const modal = this.container.querySelector('#product-modal');
        const qtyInput = modal.querySelector('.qty-input');
        const qtyMinus = modal.querySelector('.qty-btn.minus');
        const qtyPlus = modal.querySelector('.qty-btn.plus');
        const addToCartBtn = modal.querySelector('.add-to-cart-detailed');

        // Quantity controls
        qtyMinus.addEventListener('click', () => {
            const current = parseInt(qtyInput.value);
            if (current > 1) qtyInput.value = current - 1;
        });

        qtyPlus.addEventListener('click', () => {
            const current = parseInt(qtyInput.value);
            const max = parseInt(qtyInput.max);
            if (current < max) qtyInput.value = current + 1;
        });

        // Add to cart
        if (addToCartBtn && !addToCartBtn.disabled) {
            addToCartBtn.addEventListener('click', () => {
                const quantity = parseInt(qtyInput.value);
                this.eventBus.emit('checkout.addToCart', { productId, quantity });
                this.hideProductModal();
            });
        }
    }

    hideProductModal() {
        this.container.querySelector('#product-modal').classList.add('hidden');
    }

    bindInventoryActions() {
        // Bind restock and adjust buttons
        this.container.querySelectorAll('.restock-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.showRestockDialog(productId);
            });
        });

        this.container.querySelectorAll('.adjust-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.showStockAdjustDialog(productId);
            });
        });
    }

    bindPricingActions() {
        // Bind price edit buttons
        this.container.querySelectorAll('.price-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.showPriceEditDialog(productId);
            });
        });
    }

    showRestockDialog(productId) {
        // Implementation for restock dialog
        const product = this.productSystem.getProduct(productId);
        const quantity = prompt(`How many units of "${product.name}" would you like to add to stock?`);
        
        if (quantity && !isNaN(quantity) && quantity > 0) {
            this.eventBus.emit('inventory.addStock', {
                productId,
                quantity: parseInt(quantity),
                reason: 'manual_restock'
            });
            this.refreshDisplay();
        }
    }

    showStockAdjustDialog(productId) {
        // Implementation for stock adjustment dialog
        const product = this.productSystem.getProduct(productId);
        const currentStock = this.inventorySystem.getStock(productId);
        const newStock = prompt(`Current stock: ${currentStock}. Set new stock level for "${product.name}":`, currentStock);
        
        if (newStock !== null && !isNaN(newStock) && newStock >= 0) {
            this.eventBus.emit('inventory.setStock', {
                productId,
                quantity: parseInt(newStock),
                reason: 'manual_adjustment'
            });
            this.refreshDisplay();
        }
    }

    showPriceEditDialog(productId) {
        // Implementation for price edit dialog
        const product = this.productSystem.getProduct(productId);
        const newPrice = prompt(`Current price: $${product.basePrice.toFixed(2)}. Set new base price for "${product.name}":`, product.basePrice);
        
        if (newPrice !== null && !isNaN(newPrice) && newPrice > 0) {
            this.productSystem.updateProduct(productId, { basePrice: parseFloat(newPrice) });
            this.refreshDisplay();
        }
    }

    // Helper methods
    getCategoryName(categoryId) {
        const category = this.productSystem.getCategory(categoryId);
        return category ? category.name : 'Unknown';
    }

    getStockStatusText(status, stock) {
        const statusMap = {
            'in_stock': 'In Stock',
            'low_stock': 'Low Stock',
            'critical_low': 'Critical Low',
            'out_of_stock': 'Out of Stock',
            'overstocked': 'Overstocked'
        };
        return statusMap[status] || 'Unknown';
    }

    getStockPercentage(inventoryData) {
        if (!inventoryData) return 0;
        return Math.min(100, (inventoryData.currentStock / inventoryData.maxStock) * 100);
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
    }

    updateBreadcrumb() {
        const breadcrumbPath = this.container.querySelector('#breadcrumb-path');
        
        if (this.selectedCategory) {
            const category = this.productSystem.getCategory(this.selectedCategory);
            breadcrumbPath.innerHTML = ` > <span class="breadcrumb-item">${category.name}</span>`;
        } else {
            breadcrumbPath.innerHTML = '';
        }
    }

    updateResultsInfo(products) {
        const resultsCount = this.container.querySelector('#results-count');
        const resultsDetails = this.container.querySelector('#results-details');
        
        resultsCount.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;
        
        if (this.selectedCategory) {
            const category = this.productSystem.getCategory(this.selectedCategory);
            resultsDetails.textContent = `in ${category.name}`;
        } else if (this.searchQuery) {
            resultsDetails.textContent = `matching "${this.searchQuery}"`;
        } else {
            resultsDetails.textContent = '';
        }
    }

    toggleAdvancedFilters() {
        const filtersPanel = this.container.querySelector('#advanced-filters');
        filtersPanel.classList.toggle('hidden');
    }

    clearAllFilters() {
        // Clear search
        this.container.querySelector('#product-search').value = '';
        this.searchQuery = '';
        
        // Clear category
        this.container.querySelector('#category-select').value = '';
        this.selectedCategory = null;
        
        // Clear advanced filters
        this.container.querySelector('#min-price').value = '';
        this.container.querySelector('#max-price').value = '';
        this.container.querySelectorAll('#advanced-filters input[type="checkbox"]').forEach(cb => cb.checked = false);
        
        // Reset sort
        this.container.querySelector('#sort-select').value = 'name_asc';
        this.currentSort = { field: 'name', order: 'asc' };
        
        this.updateBreadcrumb();
        this.refreshDisplay();
    }

    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.performSearch(this.searchQuery);
        }, 300);
    }

    performSearch(query) {
        this.searchQuery = query;
        this.selectedCategory = null;
        this.updateBreadcrumb();
        this.refreshDisplay();
    }

    updateProductStock(data) {
        // Update display when stock changes
        if (this.currentView === 'inventory' || this.currentView === 'catalog') {
            this.refreshDisplay();
        }
    }

    updateProductPrice(data) {
        // Update display when prices change
        if (this.currentView === 'pricing' || this.currentView === 'catalog') {
            this.refreshDisplay();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductDisplayComponent;
}
