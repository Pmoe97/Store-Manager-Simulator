/**
 * Automated Inventory System
 * Smart restocking and inventory optimization
 */

class AutomatedInventorySystem {
    constructor() {
        this.automationSystem = null;
        this.gameState = null;
        this.eventBus = null;
        
        // Inventory AI settings
        this.settings = {
            autoRestock: true,
            reorderPoint: 0.2, // Reorder when 20% stock remaining
            safetyStock: 0.3, // Maintain 30% safety buffer
            maxOrderQuantity: 100,
            budgetLimit: 1000,
            demandForecastDays: 7,
            seasonalAdjustment: true
        };
        
        // Inventory tracking
        this.inventoryData = new Map();
        this.pendingOrders = new Map();
        this.orderHistory = [];
        this.demandForecasts = new Map();
        
        // Performance metrics
        this.metrics = {
            stockoutsPreventedToday: 0,
            overorderCost: 0,
            inventoryTurnover: 0,
            accuracyRate: 0.92,
            costSavings: 0
        };
        
        // Demand patterns
        this.demandPatterns = {
            daily: new Map(),
            weekly: new Map(),
            seasonal: new Map()
        };
        
        this.initialized = false;
    }
    
    async initialize(automationSystem) {
        console.log('📦 Initializing Automated Inventory System...');
        
        this.automationSystem = automationSystem;
        this.gameState = automationSystem.gameState;
        this.eventBus = automationSystem.eventBus;
        
        // Initialize inventory tracking
        await this.initializeInventoryTracking();
        
        // Start monitoring loops
        this.startInventoryMonitoring();
        this.startDemandAnalysis();
        
        this.initialized = true;
        console.log('✅ Automated Inventory System initialized!');
    }
    
    async initializeInventoryTracking() {
        // Get current inventory from game state
        const inventory = this.gameState.inventory || {};
        
        for (const [productId, productData] of Object.entries(inventory)) {
            this.inventoryData.set(productId, {
                id: productId,
                name: productData.name,
                currentStock: productData.quantity || 0,
                lastRestockDate: productData.lastRestock || Date.now(),
                averageDailySales: this.calculateAverageDailySales(productId),
                reorderPoint: Math.max(1, Math.floor(productData.maxStock * this.settings.reorderPoint)),
                maxStock: productData.maxStock || 50,
                cost: productData.cost || 5,
                supplier: productData.supplier || 'default',
                leadTime: productData.leadTime || 2 // days
            });
        }
        
        console.log(`📊 Tracking ${this.inventoryData.size} products`);
    }
    
    startInventoryMonitoring() {
        // Check inventory levels every 2 minutes
        setInterval(() => {
            this.performInventoryCheck();
        }, 120000);
        
        // Update demand forecasts every hour
        setInterval(() => {
            this.updateDemandForecasts();
        }, 3600000);
        
        // Daily inventory analysis
        setInterval(() => {
            this.performDailyAnalysis();
        }, 86400000); // 24 hours
    }
    
    startDemandAnalysis() {
        // Analyze sales patterns every 30 minutes
        setInterval(() => {
            this.analyzeDemandPatterns();
        }, 1800000);
    }
    
    async performInventoryCheck() {
        if (!this.initialized) return;
        
        console.log('🔍 Performing automated inventory check...');
        
        const restockNeeded = [];
        const currentTime = Date.now();
        
        for (const [productId, product] of this.inventoryData) {
            // Check if restock is needed
            if (this.needsRestock(product)) {
                const orderQuantity = this.calculateOptimalOrderQuantity(product);
                
                if (orderQuantity > 0 && !this.pendingOrders.has(productId)) {
                    restockNeeded.push({
                        product: product,
                        quantity: orderQuantity,
                        urgency: this.calculateUrgency(product)
                    });
                }
            }
            
            // Update stock levels from recent sales
            this.updateStockFromSales(product);
        }
        
        // Process restock orders
        if (restockNeeded.length > 0) {
            await this.processRestockOrders(restockNeeded);
        }
        
        // Emit inventory status
        this.eventBus.emit('inventory:statusUpdate', {
            totalProducts: this.inventoryData.size,
            restockNeeded: restockNeeded.length,
            pendingOrders: this.pendingOrders.size,
            timestamp: currentTime
        });
    }
    
    needsRestock(product) {
        // Check against reorder point
        if (product.currentStock <= product.reorderPoint) {
            return true;
        }
        
        // Check forecast demand vs current stock
        const forecast = this.demandForecasts.get(product.id);
        if (forecast) {
            const daysUntilStockout = product.currentStock / forecast.dailyDemand;
            if (daysUntilStockout <= product.leadTime + 1) {
                return true;
            }
        }
        
        return false;
    }
    
    calculateOptimalOrderQuantity(product) {
        const forecast = this.demandForecasts.get(product.id);
        const dailyDemand = forecast ? forecast.dailyDemand : product.averageDailySales;
        
        // Economic Order Quantity (EOQ) calculation
        const demandPeriod = 30; // 30 days
        const orderingCost = 10; // Fixed cost per order
        const holdingCostRate = 0.1; // 10% of product cost annually
        
        const annualDemand = dailyDemand * 365;
        const holdingCost = product.cost * holdingCostRate;
        
        let eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
        
        // Adjust for constraints
        eoq = Math.min(eoq, this.settings.maxOrderQuantity);
        eoq = Math.min(eoq, product.maxStock - product.currentStock);
        eoq = Math.max(eoq, 1);
        
        // Seasonal adjustment
        if (this.settings.seasonalAdjustment) {
            const seasonalFactor = this.getSeasonalFactor(product.id);
            eoq *= seasonalFactor;
        }
        
        return Math.floor(eoq);
    }
    
    calculateUrgency(product) {
        const stockRatio = product.currentStock / product.maxStock;
        const forecast = this.demandForecasts.get(product.id);
        
        if (stockRatio < 0.1) return 'critical';
        if (stockRatio < 0.2) return 'high';
        if (forecast && forecast.trend === 'increasing') return 'medium';
        return 'low';
    }
    
    async processRestockOrders(restockOrders) {
        console.log(`📋 Processing ${restockOrders.length} restock orders...`);
        
        // Sort by urgency
        restockOrders.sort((a, b) => {
            const urgencyPriority = { critical: 4, high: 3, medium: 2, low: 1 };
            return urgencyPriority[b.urgency] - urgencyPriority[a.urgency];
        });
        
        let totalCost = 0;
        const successfulOrders = [];
        
        for (const order of restockOrders) {
            const orderCost = order.quantity * order.product.cost;
            
            // Check budget constraint
            if (totalCost + orderCost > this.settings.budgetLimit) {
                console.log(`💰 Budget limit reached, skipping order for ${order.product.name}`);
                continue;
            }
            
            // Create order
            const orderDetails = await this.createRestockOrder(order);
            if (orderDetails) {
                successfulOrders.push(orderDetails);
                totalCost += orderCost;
            }
        }
        
        if (successfulOrders.length > 0) {
            this.eventBus.emit('inventory:restockOrdered', {
                orders: successfulOrders,
                totalCost: totalCost,
                timestamp: Date.now()
            });
        }
    }
    
    async createRestockOrder(order) {
        const orderId = `auto_order_${Date.now()}_${order.product.id}`;
        const deliveryDate = Date.now() + (order.product.leadTime * 24 * 60 * 60 * 1000);
        
        const orderDetails = {
            id: orderId,
            productId: order.product.id,
            productName: order.product.name,
            quantity: order.quantity,
            unitCost: order.product.cost,
            totalCost: order.quantity * order.product.cost,
            supplier: order.product.supplier,
            orderDate: Date.now(),
            expectedDelivery: deliveryDate,
            urgency: order.urgency,
            automated: true
        };
        
        // Add to pending orders
        this.pendingOrders.set(order.product.id, orderDetails);
        
        // Add to order history
        this.orderHistory.push(orderDetails);
        
        // Schedule delivery
        setTimeout(() => {
            this.processDelivery(orderDetails);
        }, order.product.leadTime * 24 * 60 * 60 * 1000);
        
        console.log(`📦 Restock order placed: ${order.quantity}x ${order.product.name} - $${orderDetails.totalCost}`);
        
        return orderDetails;
    }
    
    processDelivery(orderDetails) {
        console.log(`🚚 Processing delivery: ${orderDetails.productName}`);
        
        // Update inventory
        const product = this.inventoryData.get(orderDetails.productId);
        if (product) {
            product.currentStock += orderDetails.quantity;
            product.lastRestockDate = Date.now();
            
            // Update game state
            if (this.gameState.inventory && this.gameState.inventory[orderDetails.productId]) {
                this.gameState.inventory[orderDetails.productId].quantity = product.currentStock;
                this.gameState.inventory[orderDetails.productId].lastRestock = product.lastRestockDate;
            }
            
            // Update store finances
            if (this.gameState.store) {
                this.gameState.store.cash = (this.gameState.store.cash || 1000) - orderDetails.totalCost;
            }
        }
        
        // Remove from pending orders
        this.pendingOrders.delete(orderDetails.productId);
        
        // Update order status
        orderDetails.status = 'delivered';
        orderDetails.deliveryDate = Date.now();
        
        // Update metrics
        this.metrics.stockoutsPreventedToday++;
        
        this.eventBus.emit('inventory:deliveryReceived', orderDetails);
    }
    
    updateDemandForecasts() {
        console.log('📈 Updating demand forecasts...');
        
        for (const [productId, product] of this.inventoryData) {
            const historicalData = this.getSalesHistory(productId);
            const forecast = this.generateDemandForecast(product, historicalData);
            this.demandForecasts.set(productId, forecast);
        }
    }
    
    generateDemandForecast(product, historicalData) {
        // Simple moving average with trend analysis
        const recentSales = historicalData.slice(-7); // Last 7 days
        const averageDailySales = recentSales.reduce((sum, day) => sum + day.quantity, 0) / recentSales.length;
        
        // Calculate trend
        let trend = 'stable';
        if (recentSales.length >= 3) {
            const earlyAvg = recentSales.slice(0, 3).reduce((sum, day) => sum + day.quantity, 0) / 3;
            const lateAvg = recentSales.slice(-3).reduce((sum, day) => sum + day.quantity, 0) / 3;
            
            if (lateAvg > earlyAvg * 1.1) trend = 'increasing';
            else if (lateAvg < earlyAvg * 0.9) trend = 'decreasing';
        }
        
        // Future demand projection
        const trendMultiplier = trend === 'increasing' ? 1.1 : trend === 'decreasing' ? 0.9 : 1.0;
        const forecastDemand = averageDailySales * trendMultiplier;
        
        return {
            dailyDemand: Math.max(0.1, forecastDemand),
            trend: trend,
            confidence: Math.min(0.9, recentSales.length / 7),
            lastUpdated: Date.now()
        };
    }
    
    analyzeDemandPatterns() {
        // Analyze daily patterns (hour of day)
        // Analyze weekly patterns (day of week)
        // Analyze seasonal patterns (month/season)
        
        for (const [productId, product] of this.inventoryData) {
            const salesHistory = this.getSalesHistory(productId);
            
            // Daily pattern analysis
            const hourlyPattern = this.analyzeHourlyPattern(salesHistory);
            this.demandPatterns.daily.set(productId, hourlyPattern);
            
            // Weekly pattern analysis
            const weeklyPattern = this.analyzeWeeklyPattern(salesHistory);
            this.demandPatterns.weekly.set(productId, weeklyPattern);
        }
    }
    
    analyzeHourlyPattern(salesHistory) {
        const hourlyData = new Array(24).fill(0);
        
        salesHistory.forEach(sale => {
            const hour = new Date(sale.timestamp).getHours();
            hourlyData[hour] += sale.quantity;
        });
        
        return hourlyData;
    }
    
    analyzeWeeklyPattern(salesHistory) {
        const weeklyData = new Array(7).fill(0); // 0 = Sunday
        
        salesHistory.forEach(sale => {
            const dayOfWeek = new Date(sale.timestamp).getDay();
            weeklyData[dayOfWeek] += sale.quantity;
        });
        
        return weeklyData;
    }
    
    getSeasonalFactor(productId) {
        const currentMonth = new Date().getMonth();
        
        // Simple seasonal factors (could be enhanced with ML)
        const seasonalFactors = {
            beverages: [0.8, 0.8, 0.9, 1.0, 1.2, 1.3, 1.4, 1.3, 1.1, 1.0, 0.9, 0.8],
            snacks: [1.1, 1.0, 0.9, 0.9, 1.0, 1.1, 1.2, 1.1, 1.0, 1.0, 1.1, 1.2],
            default: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
        };
        
        // Determine product category (simplified)
        const product = this.inventoryData.get(productId);
        let category = 'default';
        if (product.name.toLowerCase().includes('drink') || product.name.toLowerCase().includes('soda')) {
            category = 'beverages';
        } else if (product.name.toLowerCase().includes('snack') || product.name.toLowerCase().includes('chip')) {
            category = 'snacks';
        }
        
        return seasonalFactors[category][currentMonth];
    }
    
    getSalesHistory(productId) {
        // Mock sales history - in real implementation, this would come from actual sales data
        const history = [];
        const daysBack = 30;
        
        for (let i = daysBack; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            // Generate mock sales with some randomness
            const baseSales = Math.random() * 10 + 2;
            history.push({
                date: date.toISOString().split('T')[0],
                timestamp: date.getTime(),
                quantity: Math.floor(baseSales),
                productId: productId
            });
        }
        
        return history;
    }
    
    calculateAverageDailySales(productId) {
        const history = this.getSalesHistory(productId);
        const total = history.reduce((sum, day) => sum + day.quantity, 0);
        return total / history.length;
    }
    
    updateStockFromSales(product) {
        // This would be called when actual sales occur
        // For now, we simulate gradual stock depletion
        if (Math.random() < 0.1) { // 10% chance per check
            const salesAmount = Math.floor(Math.random() * 3) + 1;
            product.currentStock = Math.max(0, product.currentStock - salesAmount);
            
            if (this.gameState.inventory && this.gameState.inventory[product.id]) {
                this.gameState.inventory[product.id].quantity = product.currentStock;
            }
        }
    }
    
    async handleLowStock(product) {
        console.log('⚠️ Low stock alert received for:', product.name);
        
        if (this.settings.autoRestock) {
            const productData = this.inventoryData.get(product.id);
            if (productData && !this.pendingOrders.has(product.id)) {
                const quantity = this.calculateOptimalOrderQuantity(productData);
                if (quantity > 0) {
                    await this.createRestockOrder({
                        product: productData,
                        quantity: quantity,
                        urgency: 'high'
                    });
                }
            }
        }
    }
    
    performDailyAnalysis() {
        console.log('📊 Performing daily inventory analysis...');
        
        // Calculate inventory turnover
        // Analyze cost savings
        // Update performance metrics
        
        this.eventBus.emit('inventory:dailyAnalysis', {
            metrics: this.metrics,
            inventoryStatus: this.getInventoryStatus(),
            timestamp: Date.now()
        });
    }
    
    getInventoryStatus() {
        const status = {
            totalProducts: this.inventoryData.size,
            lowStockItems: 0,
            overstockedItems: 0,
            pendingOrders: this.pendingOrders.size,
            totalValue: 0
        };
        
        for (const [productId, product] of this.inventoryData) {
            status.totalValue += product.currentStock * product.cost;
            
            if (product.currentStock <= product.reorderPoint) {
                status.lowStockItems++;
            } else if (product.currentStock > product.maxStock * 0.9) {
                status.overstockedItems++;
            }
        }
        
        return status;
    }
    
    getPerformanceReport() {
        return {
            metrics: this.metrics,
            inventoryStatus: this.getInventoryStatus(),
            demandForecasts: Array.from(this.demandForecasts.entries()),
            recentOrders: this.orderHistory.slice(-10),
            settings: this.settings
        };
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        console.log('⚙️ Automated inventory settings updated:', newSettings);
    }
}

// Export for use in automation system
if (typeof window !== 'undefined') {
    window.AutomatedInventorySystem = AutomatedInventorySystem;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutomatedInventorySystem;
}
