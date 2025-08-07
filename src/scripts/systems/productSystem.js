/**
 * Product System - Manages product data, categories, and catalog
 * Handles product information, pricing, and product display mechanics
 */

class ProductSystem {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.products = new Map();
        this.categories = new Map();
        this.productCatalog = {
            featured: [],
            onSale: [],
            newArrivals: [],
            trending: []
        };
        this.priceModifiers = new Map();
        this.seasonalPricing = new Map();
    }

    initialize(gameState, eventBus) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        
        // Initialize Product AI Generator if available
        if (typeof productAIGenerator !== 'undefined') {
            if (typeof aiHooks !== 'undefined') {
                productAIGenerator.initialize(aiHooks);
            }
            this.productAIGenerator = productAIGenerator;
            console.log('🎯 Product AI Generator connected to Product System');
        }
        
        // Listen for product events
        this.eventBus.on('product.create', (data) => this.createProduct(data));
        this.eventBus.on('product.update', (data) => this.updateProduct(data));
        this.eventBus.on('product.delete', (productId) => this.deleteProduct(productId));
        this.eventBus.on('product.search', (query) => this.searchProducts(query));
        this.eventBus.on('product.getPricing', (data) => this.calculateDynamicPricing(data));
        this.eventBus.on('product.getCatalog', (filters) => this.getProductCatalog(filters));
        this.eventBus.on('product.generateAI', (options) => this.generateAIProduct(options));
        
        // Initialize default categories and products
        this.initializeDefaultCategories();
        this.initializeDefaultProducts();
        this.setupPricingRules();
        
        console.log('📦 Product System initialized');
    }

    initializeDefaultCategories() {
        const defaultCategories = [
            {
                id: 'clothing',
                name: 'Clothing & Apparel',
                description: 'Fashion items, underwear, accessories',
                parentId: null,
                displayOrder: 1,
                isActive: true,
                ageRestriction: 18,
                metadata: {
                    icon: '👕',
                    color: '#e11d48',
                    tags: ['fashion', 'apparel', 'adult']
                }
            },
            {
                id: 'toys',
                name: 'Adult Toys & Accessories',
                description: 'Adult entertainment products and accessories',
                parentId: null,
                displayOrder: 2,
                isActive: true,
                ageRestriction: 18,
                metadata: {
                    icon: '🎭',
                    color: '#7c3aed',
                    tags: ['toys', 'accessories', 'entertainment']
                }
            },
            {
                id: 'media',
                name: 'Media & Entertainment',
                description: 'Books, magazines, digital content',
                parentId: null,
                displayOrder: 3,
                isActive: true,
                ageRestriction: 18,
                metadata: {
                    icon: '📚',
                    color: '#059669',
                    tags: ['media', 'books', 'digital']
                }
            },
            {
                id: 'wellness',
                name: 'Health & Wellness',
                description: 'Personal care and wellness products',
                parentId: null,
                displayOrder: 4,
                isActive: true,
                ageRestriction: 18,
                metadata: {
                    icon: '💊',
                    color: '#dc2626',
                    tags: ['health', 'wellness', 'care']
                }
            },
            {
                id: 'gifts',
                name: 'Gifts & Novelties',
                description: 'Special occasion gifts and novelty items',
                parentId: null,
                displayOrder: 5,
                isActive: true,
                ageRestriction: 18,
                metadata: {
                    icon: '🎁',
                    color: '#d97706',
                    tags: ['gifts', 'novelty', 'special']
                }
            }
        ];

        // Add subcategories
        const subcategories = [
            // Clothing subcategories
            { id: 'lingerie', name: 'Lingerie', parentId: 'clothing', displayOrder: 1 },
            { id: 'costumes', name: 'Costumes & Roleplay', parentId: 'clothing', displayOrder: 2 },
            { id: 'accessories', name: 'Fashion Accessories', parentId: 'clothing', displayOrder: 3 },
            
            // Toys subcategories
            { id: 'vibrators', name: 'Vibrators', parentId: 'toys', displayOrder: 1 },
            { id: 'couples', name: 'Couples Items', parentId: 'toys', displayOrder: 2 },
            { id: 'novelty-toys', name: 'Novelty Items', parentId: 'toys', displayOrder: 3 },
            
            // Media subcategories
            { id: 'books', name: 'Adult Books', parentId: 'media', displayOrder: 1 },
            { id: 'magazines', name: 'Magazines', parentId: 'media', displayOrder: 2 },
            { id: 'digital', name: 'Digital Content', parentId: 'media', displayOrder: 3 },
            
            // Wellness subcategories
            { id: 'lubricants', name: 'Lubricants', parentId: 'wellness', displayOrder: 1 },
            { id: 'enhancement', name: 'Enhancement Products', parentId: 'wellness', displayOrder: 2 },
            { id: 'cleansers', name: 'Cleansers & Care', parentId: 'wellness', displayOrder: 3 },
            
            // Gifts subcategories
            { id: 'party', name: 'Party Supplies', parentId: 'gifts', displayOrder: 1 },
            { id: 'games', name: 'Adult Games', parentId: 'gifts', displayOrder: 2 },
            { id: 'kits', name: 'Gift Sets & Kits', parentId: 'gifts', displayOrder: 3 }
        ];

        // Create categories
        [...defaultCategories, ...subcategories].forEach(category => {
            this.createCategory(category);
        });
    }

    initializeDefaultProducts() {
        const defaultProducts = [
            // Lingerie
            {
                id: 'lg001',
                name: 'Silk Night Set',
                categoryId: 'lingerie',
                basePrice: 89.99,
                cost: 35.00,
                description: 'Luxurious silk nightwear set with delicate lace trim',
                brand: 'Intimate Elegance',
                tags: ['silk', 'luxury', 'nightwear', 'lace'],
                variants: [
                    { size: 'S', color: 'Black', sku: 'LG001-S-BLK' },
                    { size: 'M', color: 'Black', sku: 'LG001-M-BLK' },
                    { size: 'L', color: 'Black', sku: 'LG001-L-BLK' },
                    { size: 'S', color: 'Red', sku: 'LG001-S-RED' },
                    { size: 'M', color: 'Red', sku: 'LG001-M-RED' },
                    { size: 'L', color: 'Red', sku: 'LG001-L-RED' }
                ],
                features: ['Machine washable', 'Breathable fabric', 'Adjustable straps'],
                ageRestriction: 18,
                isDiscrete: true
            },
            {
                id: 'lg002',
                name: 'Romantic Lace Bodysuit',
                categoryId: 'lingerie',
                basePrice: 65.99,
                cost: 25.00,
                description: 'Romantic lace bodysuit with intricate patterns',
                brand: 'Passion Collection',
                tags: ['lace', 'bodysuit', 'romantic', 'stretchy'],
                variants: [
                    { size: 'S', color: 'White', sku: 'LG002-S-WHT' },
                    { size: 'M', color: 'White', sku: 'LG002-M-WHT' },
                    { size: 'L', color: 'White', sku: 'LG002-L-WHT' },
                    { size: 'XL', color: 'White', sku: 'LG002-XL-WHT' }
                ],
                features: ['Stretch fabric', 'Snap closure', 'Comfortable fit'],
                ageRestriction: 18,
                isDiscrete: true
            },

            // Wellness Products
            {
                id: 'wl001',
                name: 'Premium Personal Lubricant',
                categoryId: 'lubricants',
                basePrice: 24.99,
                cost: 8.00,
                description: 'Water-based personal lubricant for enhanced comfort',
                brand: 'TenderTouch',
                tags: ['water-based', 'safe', 'comfort', 'premium'],
                variants: [
                    { size: '50ml', type: 'Original', sku: 'WL001-50-ORG' },
                    { size: '100ml', type: 'Original', sku: 'WL001-100-ORG' },
                    { size: '50ml', type: 'Warming', sku: 'WL001-50-WRM' },
                    { size: '100ml', type: 'Warming', sku: 'WL001-100-WRM' }
                ],
                features: ['Dermatologist tested', 'Long-lasting', 'Easy cleanup'],
                ageRestriction: 18,
                isDiscrete: true
            },

            // Books & Media
            {
                id: 'bk001',
                name: 'The Art of Intimacy - Guide Book',
                categoryId: 'books',
                basePrice: 34.99,
                cost: 12.00,
                description: 'Educational guide for couples seeking to enhance their relationship',
                brand: 'Relationship Press',
                tags: ['educational', 'couples', 'guide', 'relationship'],
                variants: [
                    { format: 'Paperback', language: 'English', sku: 'BK001-PB-EN' },
                    { format: 'Hardcover', language: 'English', sku: 'BK001-HC-EN' },
                    { format: 'Digital', language: 'English', sku: 'BK001-DIG-EN' }
                ],
                features: ['Expert advice', 'Illustrated guide', 'Discrete packaging'],
                ageRestriction: 18,
                isDiscrete: true
            },

            // Adult Toys
            {
                id: 'ty001',
                name: 'Beginner-Friendly Massager',
                categoryId: 'vibrators',
                basePrice: 79.99,
                cost: 30.00,
                description: 'Gentle and quiet personal massager perfect for beginners',
                brand: 'SoftTouch Wellness',
                tags: ['beginner', 'quiet', 'rechargeable', 'waterproof'],
                variants: [
                    { color: 'Pink', material: 'Silicone', sku: 'TY001-PNK-SIL' },
                    { color: 'Purple', material: 'Silicone', sku: 'TY001-PUR-SIL' },
                    { color: 'Teal', material: 'Silicone', sku: 'TY001-TEL-SIL' }
                ],
                features: ['USB rechargeable', 'Waterproof', 'Multiple settings', 'Quiet operation'],
                ageRestriction: 18,
                isDiscrete: true
            },

            // Gifts & Games
            {
                id: 'gf001',
                name: 'Romantic Game for Couples',
                categoryId: 'games',
                basePrice: 45.99,
                cost: 18.00,
                description: 'Fun and intimate card game designed for couples',
                brand: 'PlayTime Games',
                tags: ['couples', 'game', 'cards', 'romantic', 'fun'],
                variants: [
                    { edition: 'Classic', level: 'Mild', sku: 'GF001-CLS-MLD' },
                    { edition: 'Adventurous', level: 'Spicy', sku: 'GF001-ADV-SPC' }
                ],
                features: ['100 cards', 'Multiple game modes', 'Relationship building'],
                ageRestriction: 18,
                isDiscrete: true
            },

            // Costumes
            {
                id: 'cs001',
                name: 'Professional Fantasy Costume',
                categoryId: 'costumes',
                basePrice: 69.99,
                cost: 25.00,
                description: 'High-quality costume for role-playing adventures',
                brand: 'Fantasy Wardrobe',
                tags: ['costume', 'roleplay', 'professional', 'quality'],
                variants: [
                    { theme: 'Nurse', size: 'S', sku: 'CS001-NRS-S' },
                    { theme: 'Nurse', size: 'M', sku: 'CS001-NRS-M' },
                    { theme: 'Nurse', size: 'L', sku: 'CS001-NRS-L' },
                    { theme: 'Teacher', size: 'S', sku: 'CS001-TCH-S' },
                    { theme: 'Teacher', size: 'M', sku: 'CS001-TCH-M' },
                    { theme: 'Teacher', size: 'L', sku: 'CS001-TCH-L' }
                ],
                features: ['Complete outfit', 'Comfortable fabric', 'Authentic styling'],
                ageRestriction: 18,
                isDiscrete: true
            }
        ];

        // Create products
        defaultProducts.forEach(product => {
            this.createProduct(product);
        });

        // Set up featured products and promotions
        this.updateProductCatalog();
    }

    setupPricingRules() {
        // Dynamic pricing modifiers based on various factors
        this.priceModifiers.set('bulk_discount', {
            name: 'Bulk Discount',
            type: 'quantity',
            conditions: [
                { minQuantity: 3, discount: 0.10 },
                { minQuantity: 5, discount: 0.15 },
                { minQuantity: 10, discount: 0.20 }
            ]
        });

        this.priceModifiers.set('loyalty_discount', {
            name: 'Loyalty Discount',
            type: 'customer',
            conditions: [
                { tier: 'regular', discount: 0.05 },
                { tier: 'vip', discount: 0.10 },
                { tier: 'premium', discount: 0.15 }
            ]
        });

        this.priceModifiers.set('seasonal_pricing', {
            name: 'Seasonal Pricing',
            type: 'seasonal',
            conditions: [
                { season: 'valentine', markup: 0.10, categories: ['lingerie', 'gifts'] },
                { season: 'summer', discount: 0.15, categories: ['wellness'] },
                { season: 'holiday', markup: 0.05, categories: ['gifts', 'games'] }
            ]
        });

        this.priceModifiers.set('clearance', {
            name: 'Clearance Sale',
            type: 'clearance',
            conditions: [
                { reason: 'overstock', discount: 0.30 },
                { reason: 'discontinued', discount: 0.50 },
                { reason: 'damaged_packaging', discount: 0.20 }
            ]
        });
    }

    createCategory(categoryData) {
        const category = {
            id: categoryData.id,
            name: categoryData.name,
            description: categoryData.description || '',
            parentId: categoryData.parentId || null,
            displayOrder: categoryData.displayOrder || 0,
            isActive: categoryData.isActive !== false,
            ageRestriction: categoryData.ageRestriction || 18,
            metadata: categoryData.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.categories.set(category.id, category);
        
        this.eventBus.emit('product.categoryCreated', { category });
        return category;
    }

    createProduct(productData) {
        const product = {
            id: productData.id,
            name: productData.name,
            categoryId: productData.categoryId,
            basePrice: productData.basePrice,
            currentPrice: productData.basePrice,
            cost: productData.cost,
            margin: ((productData.basePrice - productData.cost) / productData.basePrice * 100).toFixed(2),
            description: productData.description,
            brand: productData.brand || 'Generic',
            tags: productData.tags || [],
            variants: productData.variants || [],
            features: productData.features || [],
            ageRestriction: productData.ageRestriction || 18,
            isDiscrete: productData.isDiscrete || true,
            isActive: true,
            rating: 0,
            reviewCount: 0,
            salesCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
                supplier: productData.supplier || 'Default Supplier',
                barcode: productData.barcode || this.generateBarcode(),
                weight: productData.weight || 0,
                dimensions: productData.dimensions || { length: 0, width: 0, height: 0 },
                materials: productData.materials || [],
                careInstructions: productData.careInstructions || []
            }
        };

        this.products.set(product.id, product);
        
        this.eventBus.emit('product.created', { product });
        return product;
    }

    updateProduct(productId, updates) {
        const product = this.products.get(productId);
        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        // Apply updates
        Object.keys(updates).forEach(key => {
            if (key !== 'id' && key !== 'createdAt') {
                product[key] = updates[key];
            }
        });

        // Recalculate margin if price or cost changed
        if (updates.basePrice || updates.cost) {
            product.margin = ((product.basePrice - product.cost) / product.basePrice * 100).toFixed(2);
        }

        product.updatedAt = new Date();
        
        this.eventBus.emit('product.updated', { product, updates });
        return product;
    }

    deleteProduct(productId) {
        const product = this.products.get(productId);
        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        this.products.delete(productId);
        this.eventBus.emit('product.deleted', { productId, product });
        return true;
    }

    getProduct(productId) {
        return this.products.get(productId);
    }

    getCategory(categoryId) {
        return this.categories.get(categoryId);
    }

    searchProducts(query) {
        const searchTerms = query.toLowerCase().split(' ');
        const results = [];

        this.products.forEach(product => {
            if (!product.isActive) return;

            let score = 0;
            
            // Search in name
            searchTerms.forEach(term => {
                if (product.name.toLowerCase().includes(term)) score += 10;
                if (product.description.toLowerCase().includes(term)) score += 5;
                if (product.brand.toLowerCase().includes(term)) score += 3;
                product.tags.forEach(tag => {
                    if (tag.toLowerCase().includes(term)) score += 2;
                });
            });

            if (score > 0) {
                results.push({ product, score });
            }
        });

        // Sort by relevance score
        results.sort((a, b) => b.score - a.score);
        
        return results.map(result => result.product);
    }

    getProductsByCategory(categoryId, includeSubcategories = true) {
        const products = [];
        const targetCategories = new Set([categoryId]);

        if (includeSubcategories) {
            this.categories.forEach(category => {
                if (category.parentId === categoryId) {
                    targetCategories.add(category.id);
                }
            });
        }

        this.products.forEach(product => {
            if (product.isActive && targetCategories.has(product.categoryId)) {
                products.push(product);
            }
        });

        return products;
    }

    calculateDynamicPricing(data) {
        const { productId, quantity = 1, customerId = null, context = {} } = data;
        const product = this.getProduct(productId);
        
        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        let finalPrice = product.basePrice;
        const appliedModifiers = [];

        // Apply quantity discounts
        const bulkDiscount = this.priceModifiers.get('bulk_discount');
        if (quantity >= 3) {
            const applicableDiscount = bulkDiscount.conditions
                .filter(condition => quantity >= condition.minQuantity)
                .sort((a, b) => b.discount - a.discount)[0];
            
            if (applicableDiscount) {
                finalPrice *= (1 - applicableDiscount.discount);
                appliedModifiers.push({
                    type: 'bulk_discount',
                    description: `${Math.round(applicableDiscount.discount * 100)}% bulk discount`,
                    value: -product.basePrice * applicableDiscount.discount
                });
            }
        }

        // Apply loyalty discounts
        if (customerId && this.gameState.npcs.has(customerId)) {
            const customer = this.gameState.npcs.get(customerId);
            const loyaltyDiscount = this.priceModifiers.get('loyalty_discount');
            const tier = customer.relationship?.tier || 'regular';
            
            const applicableDiscount = loyaltyDiscount.conditions.find(condition => condition.tier === tier);
            if (applicableDiscount) {
                const discountAmount = product.basePrice * applicableDiscount.discount;
                finalPrice -= discountAmount;
                appliedModifiers.push({
                    type: 'loyalty_discount',
                    description: `${Math.round(applicableDiscount.discount * 100)}% loyalty discount`,
                    value: -discountAmount
                });
            }
        }

        // Apply seasonal pricing
        const currentSeason = this.getCurrentSeason();
        if (currentSeason) {
            const seasonalPricing = this.priceModifiers.get('seasonal_pricing');
            const applicableSeasonalRule = seasonalPricing.conditions.find(condition => 
                condition.season === currentSeason && 
                condition.categories.includes(product.categoryId)
            );
            
            if (applicableSeasonalRule) {
                if (applicableSeasonalRule.discount) {
                    const discountAmount = product.basePrice * applicableSeasonalRule.discount;
                    finalPrice -= discountAmount;
                    appliedModifiers.push({
                        type: 'seasonal_discount',
                        description: `${Math.round(applicableSeasonalRule.discount * 100)}% seasonal discount`,
                        value: -discountAmount
                    });
                } else if (applicableSeasonalRule.markup) {
                    const markupAmount = product.basePrice * applicableSeasonalRule.markup;
                    finalPrice += markupAmount;
                    appliedModifiers.push({
                        type: 'seasonal_markup',
                        description: `${Math.round(applicableSeasonalRule.markup * 100)}% seasonal premium`,
                        value: markupAmount
                    });
                }
            }
        }

        // Apply clearance pricing if applicable
        if (product.metadata.clearanceReason) {
            const clearance = this.priceModifiers.get('clearance');
            const applicableDiscount = clearance.conditions.find(condition => 
                condition.reason === product.metadata.clearanceReason
            );
            
            if (applicableDiscount) {
                const discountAmount = product.basePrice * applicableDiscount.discount;
                finalPrice -= discountAmount;
                appliedModifiers.push({
                    type: 'clearance',
                    description: `${Math.round(applicableDiscount.discount * 100)}% clearance sale`,
                    value: -discountAmount
                });
            }
        }

        // Ensure minimum price (cost + small margin)
        const minimumPrice = product.cost * 1.05; // 5% minimum margin
        finalPrice = Math.max(finalPrice, minimumPrice);

        return {
            productId,
            basePrice: product.basePrice,
            finalPrice: Math.round(finalPrice * 100) / 100,
            totalPrice: Math.round(finalPrice * quantity * 100) / 100,
            quantity,
            appliedModifiers,
            savings: Math.round((product.basePrice - finalPrice) * 100) / 100
        };
    }

    getProductCatalog(filters = {}) {
        const {
            category = null,
            priceRange = null,
            sortBy = 'name',
            sortOrder = 'asc',
            featured = false,
            onSale = false,
            limit = null
        } = filters;

        let products = Array.from(this.products.values()).filter(product => product.isActive);

        // Apply category filter
        if (category) {
            products = this.getProductsByCategory(category);
        }

        // Apply price range filter
        if (priceRange) {
            products = products.filter(product => 
                product.currentPrice >= priceRange.min && 
                product.currentPrice <= priceRange.max
            );
        }

        // Apply featured filter
        if (featured) {
            products = products.filter(product => 
                this.productCatalog.featured.includes(product.id)
            );
        }

        // Apply on sale filter
        if (onSale) {
            products = products.filter(product => 
                this.productCatalog.onSale.includes(product.id)
            );
        }

        // Sort products
        products.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (sortOrder === 'desc') {
                return aValue < bValue ? 1 : -1;
            } else {
                return aValue > bValue ? 1 : -1;
            }
        });

        // Apply limit
        if (limit) {
            products = products.slice(0, limit);
        }

        return products;
    }

    updateProductCatalog() {
        // Update featured products (highest rated or best sellers)
        const allProducts = Array.from(this.products.values())
            .filter(product => product.isActive)
            .sort((a, b) => (b.rating * b.reviewCount + b.salesCount) - (a.rating * a.reviewCount + a.salesCount));
        
        this.productCatalog.featured = allProducts.slice(0, 8).map(p => p.id);

        // Update on sale products (those with active discounts)
        this.productCatalog.onSale = allProducts
            .filter(product => product.metadata.clearanceReason)
            .slice(0, 12)
            .map(p => p.id);

        // Update trending products (recent high sales)
        this.productCatalog.trending = allProducts
            .filter(product => product.salesCount > 0)
            .sort((a, b) => b.salesCount - a.salesCount)
            .slice(0, 10)
            .map(p => p.id);

        // Update new arrivals (recently added products)
        this.productCatalog.newArrivals = allProducts
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 6)
            .map(p => p.id);

        this.eventBus.emit('product.catalogUpdated', { catalog: this.productCatalog });
    }

    getCurrentSeason() {
        const now = new Date();
        const month = now.getMonth() + 1;
        
        // Simple seasonal detection
        if (month === 2) return 'valentine';
        if (month >= 6 && month <= 8) return 'summer';
        if (month === 12) return 'holiday';
        
        return null;
    }

    generateBarcode() {
        return '80' + Math.random().toString().slice(2, 13);
    }

    getProductVariants(productId) {
        const product = this.getProduct(productId);
        return product ? product.variants : [];
    }

    getProductsByBrand(brand) {
        return Array.from(this.products.values())
            .filter(product => product.isActive && product.brand.toLowerCase() === brand.toLowerCase());
    }

    addProductReview(productId, rating, review) {
        const product = this.getProduct(productId);
        if (!product) return false;

        // Update rating (simple average for now)
        const totalRating = product.rating * product.reviewCount + rating;
        product.reviewCount++;
        product.rating = Math.round((totalRating / product.reviewCount) * 10) / 10;
        
        product.updatedAt = new Date();
        
        this.eventBus.emit('product.reviewAdded', { productId, rating, review });
        return true;
    }

    incrementSalesCount(productId, quantity = 1) {
        const product = this.getProduct(productId);
        if (!product) return false;

        product.salesCount += quantity;
        product.updatedAt = new Date();
        
        this.eventBus.emit('product.saleMade', { productId, quantity });
        return true;
    }

    getPopularProducts(limit = 10) {
        return Array.from(this.products.values())
            .filter(product => product.isActive)
            .sort((a, b) => b.salesCount - a.salesCount)
            .slice(0, limit);
    }

    getProductRecommendations(customerId, limit = 5) {
        // Simple recommendation based on purchase history and preferences
        const recommendations = [];
        const customer = this.gameState.npcs.get(customerId);
        
        if (customer && customer.preferences) {
            const preferredCategories = customer.preferences.productCategories || [];
            const preferredTags = customer.preferences.tags || [];
            
            this.products.forEach(product => {
                if (!product.isActive) return;
                
                let score = 0;
                
                // Category preference
                if (preferredCategories.includes(product.categoryId)) score += 5;
                
                // Tag preference
                product.tags.forEach(tag => {
                    if (preferredTags.includes(tag)) score += 2;
                });
                
                // Popular products get slight boost
                score += Math.min(product.salesCount * 0.1, 3);
                
                if (score > 0) {
                    recommendations.push({ product, score });
                }
            });
            
            recommendations.sort((a, b) => b.score - a.score);
            return recommendations.slice(0, limit).map(r => r.product);
        }
        
        // Fallback to popular products
        return this.getPopularProducts(limit);
    }

    // AI Product Generation Methods
    async generateAIProduct(options = {}) {
        if (!this.productAIGenerator) {
            console.warn('⚠️ Product AI Generator not available');
            return null;
        }

        try {
            const generatedProduct = await this.productAIGenerator.generateProduct(options);
            
            // Convert AI product format to system format
            const productData = this.convertAIProductToSystemFormat(generatedProduct);
            
            // Add to inventory
            const product = this.createProduct(productData);
            
            // Generate product image if needed
            if (generatedProduct.imagePrompt && !generatedProduct.image) {
                this.generateProductImage(product, generatedProduct.imagePrompt);
            }
            
            console.log(`✨ AI-generated product added: ${product.name}`);
            return product;
        } catch (error) {
            console.error('❌ Failed to generate AI product:', error);
            return null;
        }
    }

    // Convert AI-generated product to system format
    convertAIProductToSystemFormat(aiProduct) {
        return {
            id: aiProduct.id,
            name: aiProduct.name,
            categoryId: aiProduct.category,
            basePrice: aiProduct.price,
            cost: aiProduct.cost,
            description: aiProduct.description,
            brand: 'AI Generated',
            tags: aiProduct.tags || [],
            features: aiProduct.features || [],
            ageRestriction: aiProduct.ageRestriction || 18,
            isDiscrete: true,
            materials: aiProduct.materials || [],
            metadata: {
                aiGenerated: true,
                generationDate: aiProduct.generationDate,
                rarity: aiProduct.rarity,
                imagePrompt: aiProduct.imagePrompt,
                concept: aiProduct.concept,
                seasonal: aiProduct.seasonal,
                trending: aiProduct.trending
            }
        };
    }

    // Generate multiple AI products
    async generateMultipleAIProducts(count, options = {}) {
        const products = [];
        
        for (let i = 0; i < count; i++) {
            try {
                const product = await this.generateAIProduct(options);
                if (product) {
                    products.push(product);
                }
                
                // Brief pause between generations
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`❌ Failed to generate product ${i + 1}:`, error);
            }
        }
        
        console.log(`✅ Generated ${products.length} AI products`);
        return products;
    }

    // Generate seasonal product collection
    async generateSeasonalCollection(season, count = 5) {
        return this.generateMultipleAIProducts(count, {
            seasonal: true,
            trending: Math.random() > 0.5 // 50% chance of trending
        });
    }

    // Generate trending products
    async generateTrendingProducts(count = 3) {
        return this.generateMultipleAIProducts(count, {
            trending: true,
            rarity: Math.random() > 0.7 ? 'rare' : 'uncommon' // Higher rarity for trending
        });
    }

    // Generate product image using AI
    async generateProductImage(product, imagePrompt) {
        if (this.productAIGenerator) {
            try {
                const imageUrl = await this.productAIGenerator.generateProductImage({
                    ...product,
                    imagePrompt: imagePrompt || product.metadata?.imagePrompt
                });
                
                if (imageUrl) {
                    product.imageUrl = imageUrl;
                    product.metadata.hasAIImage = true;
                    this.eventBus.emit('product.imageGenerated', { product, imageUrl });
                }
                
                return imageUrl;
            } catch (error) {
                console.error(`❌ Failed to generate image for ${product.name}:`, error);
                return null;
            }
        }
        return null;
    }

    // Get AI generation statistics
    getAIGenerationStats() {
        const aiProducts = Array.from(this.products.values()).filter(p => p.metadata?.aiGenerated);
        
        return {
            totalAIProducts: aiProducts.length,
            totalProducts: this.products.size,
            aiPercentage: ((aiProducts.length / this.products.size) * 100).toFixed(1),
            byCategory: this.groupProductsByCategory(aiProducts),
            byRarity: this.groupProductsByRarity(aiProducts),
            seasonal: aiProducts.filter(p => p.metadata?.seasonal).length,
            trending: aiProducts.filter(p => p.metadata?.trending).length
        };
    }

    groupProductsByCategory(products) {
        const grouped = {};
        products.forEach(product => {
            const category = product.categoryId;
            grouped[category] = (grouped[category] || 0) + 1;
        });
        return grouped;
    }

    groupProductsByRarity(products) {
        const grouped = {};
        products.forEach(product => {
            const rarity = product.metadata?.rarity || 'common';
            grouped[rarity] = (grouped[rarity] || 0) + 1;
        });
        return grouped;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductSystem;
}
