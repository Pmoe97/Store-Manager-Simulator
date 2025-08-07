/**
 * Inventory System - Manages stock levels, reordering, and inventory tracking
 * Handles stock alerts, automatic reordering, and inventory analytics
 */

class InventorySystem {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.productSystem = null;
        this.inventory = new Map(); // productId -> inventory data
        this.reorderRules = new Map();
        this.pendingOrders = new Map();
        this.inventoryHistory = [];
        this.stockAlerts = [];
        this.suppliers = new Map();
        this.lastStockCheck = null;
    }

    initialize(gameState, eventBus, productSystem) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        this.productSystem = productSystem;
        
        // Listen for inventory events
        this.eventBus.on('inventory.addStock', (data) => this.addStock(data));
        this.eventBus.on('inventory.removeStock', (data) => this.removeStock(data));
        this.eventBus.on('inventory.setStock', (data) => this.setStock(data));
        this.eventBus.on('inventory.checkStock', (productId) => this.getStock(productId));
        this.eventBus.on('inventory.reorder', (data) => this.createReorderRule(data));
        this.eventBus.on('inventory.processOrder', (orderId) => this.processSupplierOrder(orderId));
        this.eventBus.on('inventory.runStockCheck', () => this.performStockCheck());
        this.eventBus.on('product.sold', (data) => this.handleProductSale(data));
        
        // Initialize suppliers and inventory
        this.initializeSuppliers();
        this.initializeInventory();
        this.setupDefaultReorderRules();
        
        // Schedule regular stock checks
        this.scheduleStockChecks();
        
        console.log('📦 Inventory System initialized');
    }

    initializeSuppliers() {
        const defaultSuppliers = [
            {
                id: 'supplier_001',
                name: 'Intimate Essentials Wholesale',
                type: 'primary',
                specialties: ['lingerie', 'accessories', 'wellness'],
                reliability: 0.95,
                leadTime: 3, // days
                minimumOrder: 500,
                paymentTerms: 'NET30',
                contact: {
                    email: 'orders@intimateessentials.com',
                    phone: '+1-555-INTIMATE',
                    address: '123 Wholesale Blvd, Commerce City, CA 90210'
                },
                priceAdjustment: 1.0, // multiplier for base cost
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
                paymentTerms: 'NET15',
                contact: {
                    email: 'sales@adultnovelty.com',
                    phone: '+1-555-NOVELTY',
                    address: '456 Distribution Way, Industrial Park, NV 89123'
                },
                priceAdjustment: 0.95,
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
                paymentTerms: 'NET7',
                contact: {
                    email: 'orders@wellnesscare.com',
                    phone: '+1-555-WELLNESS',
                    address: '789 Health Plaza, Medical District, TX 75201'
                },
                priceAdjustment: 1.05,
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
                paymentTerms: 'COD',
                contact: {
                    email: 'rush@expressadult.com',
                    phone: '+1-555-EXPRESS',
                    address: '321 Quick Ship Dr, Fast City, FL 33101'
                },
                priceAdjustment: 1.15,
                isActive: true
            }
        ];

        defaultSuppliers.forEach(supplier => {
            this.suppliers.set(supplier.id, supplier);
        });
    }

    initializeInventory() {
        // Initialize inventory for all products
        this.productSystem.products.forEach((product, productId) => {
            this.setInitialStock(productId);
        });
    }

    setInitialStock(productId) {
        const product = this.productSystem.getProduct(productId);
        if (!product) return;

        // Determine initial stock levels based on product category and price
        let initialStock = 10; // default
        
        // Higher stock for lower-priced items
        if (product.basePrice < 30) initialStock = 25;
        else if (product.basePrice < 60) initialStock = 15;
        else if (product.basePrice > 100) initialStock = 5;

        // Adjust for category popularity
        const popularCategories = ['lingerie', 'wellness', 'toys'];
        if (popularCategories.includes(product.categoryId)) {
            initialStock = Math.ceil(initialStock * 1.5);
        }

        const inventoryData = {
            productId,
            currentStock: initialStock,
            reservedStock: 0,
            availableStock: initialStock,
            reorderPoint: Math.ceil(initialStock * 0.3),
            maxStock: initialStock * 3,
            minStock: Math.ceil(initialStock * 0.2),
            lastRestocked: new Date(),
            lastSold: null,
            turnoverRate: 0,
            supplierId: this.getPreferredSupplier(product.categoryId),
            stockStatus: 'in_stock',
            location: {
                section: this.getStorageSection(product.categoryId),
                shelf: `${product.categoryId.charAt(0).toUpperCase()}${Math.floor(Math.random() * 10) + 1}`,
                position: Math.floor(Math.random() * 20) + 1
            },
            alerts: []
        };

        this.inventory.set(productId, inventoryData);
        this.eventBus.emit('inventory.initialized', { productId, stock: inventoryData });
    }

    setupDefaultReorderRules() {
        // Category-based reorder rules
        const categoryRules = [
            {
                id: 'lingerie_auto',
                type: 'category',
                target: 'lingerie',
                enabled: true,
                trigger: 'stock_level',
                threshold: 0.25, // 25% of max stock
                reorderQuantity: 'optimal', // calculate optimal quantity
                maxOrderValue: 2000,
                supplierId: 'supplier_001'
            },
            {
                id: 'wellness_auto',
                type: 'category', 
                target: 'wellness',
                enabled: true,
                trigger: 'stock_level',
                threshold: 0.30,
                reorderQuantity: 'optimal',
                maxOrderValue: 1500,
                supplierId: 'supplier_003'
            },
            {
                id: 'toys_auto',
                type: 'category',
                target: 'toys',
                enabled: true,
                trigger: 'stock_level',
                threshold: 0.20,
                reorderQuantity: 'double_reorder_point',
                maxOrderValue: 3000,
                supplierId: 'supplier_002'
            },
            {
                id: 'books_rush',
                type: 'category',
                target: 'books',
                enabled: true,
                trigger: 'stock_level',
                threshold: 0.15,
                reorderQuantity: 'minimum_order',
                maxOrderValue: 500,
                supplierId: 'supplier_004'
            }
        ];

        // High-priority product rules
        const priorityRules = [
            {
                id: 'bestseller_priority',
                type: 'bestseller',
                enabled: true,
                trigger: 'sales_velocity',
                threshold: 10, // sales per week
                reorderQuantity: 'high_volume',
                priority: 'high',
                autoApprove: true
            },
            {
                id: 'low_stock_emergency',
                type: 'emergency',
                enabled: true,
                trigger: 'critical_stock',
                threshold: 2, // units remaining
                reorderQuantity: 'rush_order',
                priority: 'urgent',
                autoApprove: true
            }
        ];

        [...categoryRules, ...priorityRules].forEach(rule => {
            this.reorderRules.set(rule.id, rule);
        });
    }

    getStock(productId) {
        const inventoryData = this.inventory.get(productId);
        return inventoryData ? inventoryData.availableStock : 0;
    }

    addStock(data) {
        const { productId, quantity, reason = 'restock', cost = null, supplierId = null } = data;
        const inventoryData = this.inventory.get(productId);
        
        if (!inventoryData) {
            throw new Error(`No inventory record found for product ${productId}`);
        }

        // Update stock levels
        inventoryData.currentStock += quantity;
        inventoryData.availableStock = inventoryData.currentStock - inventoryData.reservedStock;
        inventoryData.lastRestocked = new Date();
        
        // Update stock status
        this.updateStockStatus(productId);
        
        // Record transaction
        const transaction = {
            id: `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            productId,
            type: 'add',
            quantity,
            reason,
            cost,
            supplierId,
            timestamp: new Date(),
            balanceBefore: inventoryData.currentStock - quantity,
            balanceAfter: inventoryData.currentStock
        };
        
        this.inventoryHistory.push(transaction);
        
        // Clear low stock alerts if resolved
        this.clearStockAlerts(productId, ['low_stock', 'out_of_stock']);
        
        this.eventBus.emit('inventory.stockAdded', { productId, quantity, transaction });
        
        return inventoryData;
    }

    removeStock(data) {
        const { productId, quantity, reason = 'sale', customerId = null, orderId = null } = data;
        const inventoryData = this.inventory.get(productId);
        
        if (!inventoryData) {
            throw new Error(`No inventory record found for product ${productId}`);
        }
        
        if (inventoryData.availableStock < quantity) {
            throw new Error(`Insufficient stock for product ${productId}. Available: ${inventoryData.availableStock}, Requested: ${quantity}`);
        }

        // Update stock levels
        inventoryData.currentStock -= quantity;
        inventoryData.availableStock = inventoryData.currentStock - inventoryData.reservedStock;
        inventoryData.lastSold = new Date();
        
        // Update turnover rate
        this.updateTurnoverRate(productId);
        
        // Update stock status
        this.updateStockStatus(productId);
        
        // Record transaction
        const transaction = {
            id: `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            productId,
            type: 'remove',
            quantity,
            reason,
            customerId,
            orderId,
            timestamp: new Date(),
            balanceBefore: inventoryData.currentStock + quantity,
            balanceAfter: inventoryData.currentStock
        };
        
        this.inventoryHistory.push(transaction);
        
        // Check for reorder triggers
        this.checkReorderTriggers(productId);
        
        this.eventBus.emit('inventory.stockRemoved', { productId, quantity, transaction });
        
        return inventoryData;
    }

    setStock(data) {
        const { productId, quantity, reason = 'adjustment' } = data;
        const inventoryData = this.inventory.get(productId);
        
        if (!inventoryData) {
            throw new Error(`No inventory record found for product ${productId}`);
        }

        const previousStock = inventoryData.currentStock;
        inventoryData.currentStock = quantity;
        inventoryData.availableStock = inventoryData.currentStock - inventoryData.reservedStock;
        
        // Update stock status
        this.updateStockStatus(productId);
        
        // Record transaction
        const transaction = {
            id: `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            productId,
            type: 'set',
            quantity: quantity - previousStock,
            reason,
            timestamp: new Date(),
            balanceBefore: previousStock,
            balanceAfter: quantity
        };
        
        this.inventoryHistory.push(transaction);
        
        this.eventBus.emit('inventory.stockSet', { productId, quantity, transaction });
        
        return inventoryData;
    }

    reserveStock(productId, quantity) {
        const inventoryData = this.inventory.get(productId);
        
        if (!inventoryData) {
            throw new Error(`No inventory record found for product ${productId}`);
        }
        
        if (inventoryData.availableStock < quantity) {
            return false; // Cannot reserve
        }

        inventoryData.reservedStock += quantity;
        inventoryData.availableStock = inventoryData.currentStock - inventoryData.reservedStock;
        
        return true;
    }

    releaseReservedStock(productId, quantity) {
        const inventoryData = this.inventory.get(productId);
        
        if (!inventoryData) {
            throw new Error(`No inventory record found for product ${productId}`);
        }

        inventoryData.reservedStock = Math.max(0, inventoryData.reservedStock - quantity);
        inventoryData.availableStock = inventoryData.currentStock - inventoryData.reservedStock;
        
        return inventoryData;
    }

    updateStockStatus(productId) {
        const inventoryData = this.inventory.get(productId);
        if (!inventoryData) return;

        const stockPercentage = inventoryData.currentStock / inventoryData.maxStock;
        
        let newStatus;
        if (inventoryData.currentStock === 0) {
            newStatus = 'out_of_stock';
        } else if (inventoryData.currentStock <= inventoryData.minStock) {
            newStatus = 'critical_low';
        } else if (inventoryData.currentStock <= inventoryData.reorderPoint) {
            newStatus = 'low_stock';
        } else if (stockPercentage >= 0.8) {
            newStatus = 'overstocked';
        } else {
            newStatus = 'in_stock';
        }

        if (newStatus !== inventoryData.stockStatus) {
            const previousStatus = inventoryData.stockStatus;
            inventoryData.stockStatus = newStatus;
            
            // Generate alerts for critical statuses
            if (newStatus === 'out_of_stock') {
                this.createStockAlert(productId, 'out_of_stock', 'urgent');
            } else if (newStatus === 'critical_low') {
                this.createStockAlert(productId, 'critical_low', 'high');
            } else if (newStatus === 'low_stock') {
                this.createStockAlert(productId, 'low_stock', 'medium');
            }
            
            this.eventBus.emit('inventory.statusChanged', { 
                productId, 
                previousStatus, 
                newStatus, 
                currentStock: inventoryData.currentStock 
            });
        }
    }

    performStockCheck() {
        console.log('🔍 Performing inventory stock check...');
        
        let totalProducts = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        let overstockedCount = 0;
        let totalValue = 0;
        
        this.inventory.forEach((inventoryData, productId) => {
            totalProducts++;
            
            const product = this.productSystem.getProduct(productId);
            if (product) {
                totalValue += inventoryData.currentStock * product.cost;
            }
            
            // Update stock status
            this.updateStockStatus(productId);
            
            // Count statuses
            switch (inventoryData.stockStatus) {
                case 'low_stock':
                case 'critical_low':
                    lowStockCount++;
                    break;
                case 'out_of_stock':
                    outOfStockCount++;
                    break;
                case 'overstocked':
                    overstockedCount++;
                    break;
            }
            
            // Check reorder triggers
            this.checkReorderTriggers(productId);
        });
        
        const stockReport = {
            timestamp: new Date(),
            totalProducts,
            lowStockCount,
            outOfStockCount,
            overstockedCount,
            totalInventoryValue: Math.round(totalValue * 100) / 100,
            alertsGenerated: this.stockAlerts.filter(alert => 
                new Date() - alert.createdAt < 24 * 60 * 60 * 1000 // last 24 hours
            ).length
        };
        
        this.lastStockCheck = new Date();
        
        this.eventBus.emit('inventory.stockCheckComplete', { report: stockReport });
        
        return stockReport;
    }

    checkReorderTriggers(productId) {
        const inventoryData = this.inventory.get(productId);
        const product = this.productSystem.getProduct(productId);
        
        if (!inventoryData || !product) return;

        // Check category-based rules
        this.reorderRules.forEach(rule => {
            if (!rule.enabled) return;
            
            let shouldTrigger = false;
            
            if (rule.type === 'category' && rule.target === product.categoryId) {
                if (rule.trigger === 'stock_level') {
                    const threshold = inventoryData.maxStock * rule.threshold;
                    shouldTrigger = inventoryData.currentStock <= threshold;
                }
            } else if (rule.type === 'emergency' && rule.trigger === 'critical_stock') {
                shouldTrigger = inventoryData.currentStock <= rule.threshold;
            } else if (rule.type === 'bestseller' && rule.trigger === 'sales_velocity') {
                // Check sales velocity (simplified)
                shouldTrigger = product.salesCount >= rule.threshold && inventoryData.currentStock <= inventoryData.reorderPoint;
            }
            
            if (shouldTrigger) {
                this.triggerReorder(productId, rule);
            }
        });
    }

    triggerReorder(productId, rule) {
        // Check if there's already a pending order for this product
        const existingOrder = Array.from(this.pendingOrders.values())
            .find(order => order.items.some(item => item.productId === productId));
            
        if (existingOrder) {
            console.log(`Reorder already pending for product ${productId}`);
            return;
        }

        const inventoryData = this.inventory.get(productId);
        const product = this.productSystem.getProduct(productId);
        const supplier = this.suppliers.get(rule.supplierId || inventoryData.supplierId);
        
        if (!supplier || !supplier.isActive) {
            console.error(`Supplier not available for product ${productId}`);
            return;
        }

        // Calculate reorder quantity
        let reorderQuantity = this.calculateReorderQuantity(productId, rule.reorderQuantity);
        
        // Calculate order value
        const unitCost = product.cost * supplier.priceAdjustment;
        const orderValue = reorderQuantity * unitCost;
        
        // Check against maximum order value
        if (rule.maxOrderValue && orderValue > rule.maxOrderValue) {
            reorderQuantity = Math.floor(rule.maxOrderValue / unitCost);
        }

        // Create reorder
        const order = {
            id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            supplierId: supplier.id,
            status: 'pending',
            priority: rule.priority || 'normal',
            triggeredBy: rule.id,
            items: [{
                productId,
                quantity: reorderQuantity,
                unitCost,
                totalCost: reorderQuantity * unitCost
            }],
            totalValue: reorderQuantity * unitCost,
            estimatedDelivery: new Date(Date.now() + supplier.leadTime * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            autoApprove: rule.autoApprove || false
        };

        this.pendingOrders.set(order.id, order);
        
        // Auto-approve if enabled
        if (order.autoApprove) {
            this.approveOrder(order.id);
        }
        
        this.eventBus.emit('inventory.reorderTriggered', { productId, order, rule });
        
        return order;
    }

    calculateReorderQuantity(productId, strategy) {
        const inventoryData = this.inventory.get(productId);
        const product = this.productSystem.getProduct(productId);
        
        if (!inventoryData) return 0;

        switch (strategy) {
            case 'optimal':
                // Economic Order Quantity (simplified)
                const demandRate = this.calculateDemandRate(productId);
                return Math.max(Math.ceil(demandRate * 30), inventoryData.reorderPoint * 2); // 30-day supply
                
            case 'double_reorder_point':
                return inventoryData.reorderPoint * 2;
                
            case 'fill_to_max':
                return inventoryData.maxStock - inventoryData.currentStock;
                
            case 'minimum_order':
                const supplier = this.suppliers.get(inventoryData.supplierId);
                return Math.max(10, Math.ceil(supplier?.minimumOrder / product.cost) || 10);
                
            case 'high_volume':
                return Math.max(inventoryData.maxStock * 0.5, 20);
                
            case 'rush_order':
                return Math.max(inventoryData.reorderPoint, 5);
                
            default:
                return inventoryData.reorderPoint;
        }
    }

    calculateDemandRate(productId) {
        // Calculate average daily demand based on sales history
        const recentSales = this.inventoryHistory
            .filter(transaction => 
                transaction.productId === productId && 
                transaction.type === 'remove' &&
                transaction.reason === 'sale' &&
                new Date() - transaction.timestamp < 30 * 24 * 60 * 60 * 1000 // last 30 days
            );
            
        if (recentSales.length === 0) return 1; // default
        
        const totalQuantity = recentSales.reduce((sum, sale) => sum + sale.quantity, 0);
        const daysCovered = Math.max(1, recentSales.length / 7); // approximate days
        
        return Math.max(1, totalQuantity / daysCovered);
    }

    approveOrder(orderId) {
        const order = this.pendingOrders.get(orderId);
        if (!order) return false;

        order.status = 'approved';
        order.approvedAt = new Date();
        
        // Simulate processing time
        setTimeout(() => {
            this.processSupplierOrder(orderId);
        }, 1000 + Math.random() * 2000); // 1-3 seconds
        
        this.eventBus.emit('inventory.orderApproved', { orderId, order });
        return true;
    }

    processSupplierOrder(orderId) {
        const order = this.pendingOrders.get(orderId);
        if (!order || order.status !== 'approved') return false;

        order.status = 'delivered';
        order.deliveredAt = new Date();
        
        // Add stock for all items in the order
        order.items.forEach(item => {
            this.addStock({
                productId: item.productId,
                quantity: item.quantity,
                reason: 'supplier_delivery',
                cost: item.unitCost,
                supplierId: order.supplierId
            });
        });
        
        // Move to completed orders
        this.pendingOrders.delete(orderId);
        
        // Record financial transaction
        this.eventBus.emit('finances.expense', {
            amount: order.totalValue,
            category: 'inventory',
            description: `Supplier order ${orderId}`,
            supplierId: order.supplierId
        });
        
        this.eventBus.emit('inventory.orderDelivered', { orderId, order });
        
        return true;
    }

    createStockAlert(productId, type, priority) {
        const product = this.productSystem.getProduct(productId);
        const inventoryData = this.inventory.get(productId);
        
        if (!product || !inventoryData) return;

        // Don't create duplicate alerts
        const existingAlert = this.stockAlerts.find(alert => 
            alert.productId === productId && 
            alert.type === type && 
            !alert.resolved
        );
        
        if (existingAlert) return existingAlert;

        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            productId,
            productName: product.name,
            type,
            priority,
            message: this.getAlertMessage(type, product, inventoryData),
            currentStock: inventoryData.currentStock,
            reorderPoint: inventoryData.reorderPoint,
            createdAt: new Date(),
            resolved: false,
            resolvedAt: null
        };
        
        this.stockAlerts.push(alert);
        
        this.eventBus.emit('inventory.alertCreated', { alert });
        
        return alert;
    }

    getAlertMessage(type, product, inventoryData) {
        switch (type) {
            case 'out_of_stock':
                return `${product.name} is out of stock! Immediate reorder required.`;
            case 'critical_low':
                return `${product.name} has critically low stock (${inventoryData.currentStock} units). Urgent reorder needed.`;
            case 'low_stock':
                return `${product.name} is running low (${inventoryData.currentStock} units). Consider reordering.`;
            case 'overstocked':
                return `${product.name} appears to be overstocked (${inventoryData.currentStock} units). Consider promotions.`;
            default:
                return `Stock alert for ${product.name}`;
        }
    }

    clearStockAlerts(productId, types = []) {
        this.stockAlerts
            .filter(alert => 
                alert.productId === productId && 
                !alert.resolved &&
                (types.length === 0 || types.includes(alert.type))
            )
            .forEach(alert => {
                alert.resolved = true;
                alert.resolvedAt = new Date();
            });
    }

    updateTurnoverRate(productId) {
        const inventoryData = this.inventory.get(productId);
        if (!inventoryData) return;

        // Simple turnover calculation based on recent sales
        const recentSales = this.inventoryHistory
            .filter(transaction => 
                transaction.productId === productId && 
                transaction.type === 'remove' &&
                new Date() - transaction.timestamp < 7 * 24 * 60 * 60 * 1000 // last 7 days
            );
            
        const totalSold = recentSales.reduce((sum, sale) => sum + sale.quantity, 0);
        const averageStock = (inventoryData.currentStock + inventoryData.maxStock) / 2;
        
        inventoryData.turnoverRate = averageStock > 0 ? (totalSold / averageStock) * 52 : 0; // annualized
    }

    getPreferredSupplier(categoryId) {
        // Find supplier that specializes in this category
        for (const [supplierId, supplier] of this.suppliers) {
            if (supplier.isActive && supplier.specialties.includes(categoryId)) {
                return supplierId;
            }
        }
        
        // Fallback to primary supplier
        return 'supplier_001';
    }

    getStorageSection(categoryId) {
        const sectionMap = {
            'lingerie': 'Section A - Apparel',
            'toys': 'Section B - Adult Products',
            'wellness': 'Section C - Health & Wellness', 
            'books': 'Section D - Media',
            'gifts': 'Section E - Gifts & Novelties',
            'costumes': 'Section F - Costumes'
        };
        
        return sectionMap[categoryId] || 'Section Z - General';
    }

    scheduleStockChecks() {
        // Perform stock check every hour during business hours
        setInterval(() => {
            const now = new Date();
            const hour = now.getHours();
            
            // Only during business hours (9 AM to 9 PM)
            if (hour >= 9 && hour <= 21) {
                this.performStockCheck();
            }
        }, 60 * 60 * 1000); // 1 hour
    }

    getInventoryReport() {
        const report = {
            timestamp: new Date(),
            totalProducts: this.inventory.size,
            stockStatus: {
                in_stock: 0,
                low_stock: 0,
                critical_low: 0,
                out_of_stock: 0,
                overstocked: 0
            },
            totalValue: 0,
            categoryBreakdown: {},
            topProducts: [],
            recentActivity: this.inventoryHistory.slice(-20),
            activeAlerts: this.stockAlerts.filter(alert => !alert.resolved),
            pendingOrders: Array.from(this.pendingOrders.values())
        };

        this.inventory.forEach((inventoryData, productId) => {
            const product = this.productSystem.getProduct(productId);
            if (!product) return;

            // Count by status
            report.stockStatus[inventoryData.stockStatus]++;
            
            // Calculate value
            const value = inventoryData.currentStock * product.cost;
            report.totalValue += value;
            
            // Category breakdown
            if (!report.categoryBreakdown[product.categoryId]) {
                report.categoryBreakdown[product.categoryId] = {
                    count: 0,
                    value: 0,
                    stock: 0
                };
            }
            report.categoryBreakdown[product.categoryId].count++;
            report.categoryBreakdown[product.categoryId].value += value;
            report.categoryBreakdown[product.categoryId].stock += inventoryData.currentStock;
            
            // Top products by value
            report.topProducts.push({
                productId,
                name: product.name,
                stock: inventoryData.currentStock,
                value,
                turnoverRate: inventoryData.turnoverRate
            });
        });

        // Sort top products by value
        report.topProducts.sort((a, b) => b.value - a.value);
        report.topProducts = report.topProducts.slice(0, 10);
        
        report.totalValue = Math.round(report.totalValue * 100) / 100;

        return report;
    }

    createReorderRule(ruleData) {
        const rule = {
            id: ruleData.id || `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: ruleData.type,
            target: ruleData.target,
            enabled: ruleData.enabled !== false,
            trigger: ruleData.trigger,
            threshold: ruleData.threshold,
            reorderQuantity: ruleData.reorderQuantity,
            maxOrderValue: ruleData.maxOrderValue,
            supplierId: ruleData.supplierId,
            priority: ruleData.priority || 'normal',
            autoApprove: ruleData.autoApprove || false,
            createdAt: new Date()
        };

        this.reorderRules.set(rule.id, rule);
        
        this.eventBus.emit('inventory.reorderRuleCreated', { rule });
        return rule;
    }

    handleProductSale(data) {
        const { productId, quantity } = data;
        
        try {
            this.removeStock({
                productId,
                quantity,
                reason: 'sale',
                customerId: data.customerId,
                orderId: data.orderId
            });
        } catch (error) {
            console.error('Error handling product sale:', error);
            this.eventBus.emit('inventory.saleError', { productId, quantity, error: error.message });
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InventorySystem;
}
