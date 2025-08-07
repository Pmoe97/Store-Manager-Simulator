/**
 * Checkout System - Handles point-of-sale transactions
 * Manages cart, pricing, payment processing, and sales completion
 */

class CheckoutSystem {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.conversationSystem = null;
        this.npcSystem = null;
        this.currentTransaction = null;
        this.cart = [];
        this.paymentMethods = ['cash', 'card', 'digital'];
        this.discountTypes = ['loyalty', 'bulk', 'clearance', 'employee'];
    }

    initialize(gameState, eventBus, conversationSystem, npcSystem) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        this.conversationSystem = conversationSystem;
        this.npcSystem = npcSystem;
        
        // Listen for checkout events
        this.eventBus.on('checkout.start', (data) => this.startCheckout(data));
        this.eventBus.on('checkout.addItem', (data) => this.addItemToCart(data));
        this.eventBus.on('checkout.removeItem', (data) => this.removeItemFromCart(data));
        this.eventBus.on('checkout.applyDiscount', (data) => this.applyDiscount(data));
        this.eventBus.on('checkout.selectPayment', (data) => this.selectPaymentMethod(data));
        this.eventBus.on('checkout.process', () => this.processPayment());
        this.eventBus.on('checkout.cancel', () => this.cancelCheckout());
        
        console.log('🛒 Checkout System initialized');
    }

    // Transaction Management
    startCheckout(data) {
        const { npc, items = [], context = {} } = data;
        
        if (this.currentTransaction) {
            this.cancelCheckout();
        }
        
        this.currentTransaction = {
            id: this.generateTransactionId(),
            npc: npc,
            startTime: Date.now(),
            status: 'active',
            context: context,
            
            // Cart and pricing
            cart: [],
            subtotal: 0,
            discounts: [],
            totalDiscount: 0,
            tax: 0,
            total: 0,
            
            // Payment
            paymentMethod: null,
            paymentDetails: {},
            
            // Customer interaction
            customerSatisfaction: 50,
            upsellAttempts: 0,
            negotiationAttempts: 0,
            
            // Analytics
            startedBy: context.startedBy || 'customer', // customer, player, or staff
            itemsAdded: 0,
            itemsRemoved: 0,
            timeToComplete: 0
        };
        
        // Add initial items if provided
        if (items.length > 0) {
            items.forEach(item => this.addItemToCart({ item, skipNotification: true }));
        }
        
        this.eventBus.emit('checkout.started', {
            transaction: this.currentTransaction
        });
        
        console.log(`🛒 Started checkout for ${npc.name}`);
        return this.currentTransaction;
    }

    addItemToCart(data) {
        if (!this.currentTransaction) return false;
        
        const { item, quantity = 1, skipNotification = false } = data;
        
        // Validate item
        if (!this.validateItem(item)) {
            console.error('Invalid item for checkout:', item);
            return false;
        }
        
        // Check if item already in cart
        const existingIndex = this.currentTransaction.cart.findIndex(cartItem => 
            cartItem.id === item.id
        );
        
        if (existingIndex >= 0) {
            // Update quantity
            this.currentTransaction.cart[existingIndex].quantity += quantity;
        } else {
            // Add new item
            const cartItem = {
                id: item.id,
                name: item.name,
                category: item.category,
                basePrice: item.price,
                currentPrice: item.price,
                quantity: quantity,
                discounts: [],
                itemDiscount: 0,
                subtotal: item.price * quantity,
                addedAt: Date.now()
            };
            
            this.currentTransaction.cart.push(cartItem);
        }
        
        this.currentTransaction.itemsAdded++;
        this.recalculateTotal();
        
        if (!skipNotification) {
            this.eventBus.emit('checkout.itemAdded', {
                item: item,
                quantity: quantity,
                transaction: this.currentTransaction
            });
        }
        
        // Check for upsell opportunities
        this.checkUpsellOpportunities(item);
        
        return true;
    }

    removeItemFromCart(data) {
        if (!this.currentTransaction) return false;
        
        const { itemId, quantity = null } = data;
        
        const itemIndex = this.currentTransaction.cart.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return false;
        
        const cartItem = this.currentTransaction.cart[itemIndex];
        
        if (quantity === null || quantity >= cartItem.quantity) {
            // Remove entire item
            this.currentTransaction.cart.splice(itemIndex, 1);
        } else {
            // Reduce quantity
            cartItem.quantity -= quantity;
            cartItem.subtotal = cartItem.currentPrice * cartItem.quantity;
        }
        
        this.currentTransaction.itemsRemoved++;
        this.recalculateTotal();
        
        this.eventBus.emit('checkout.itemRemoved', {
            itemId: itemId,
            quantity: quantity,
            transaction: this.currentTransaction
        });
        
        return true;
    }

    // Pricing and Discounts
    recalculateTotal() {
        if (!this.currentTransaction) return;
        
        const transaction = this.currentTransaction;
        
        // Calculate subtotal
        transaction.subtotal = transaction.cart.reduce((sum, item) => {
            item.subtotal = item.currentPrice * item.quantity;
            return sum + item.subtotal;
        }, 0);
        
        // Apply discounts
        transaction.totalDiscount = this.calculateDiscounts();
        
        // Calculate tax (simplified - 8.5% sales tax)
        const taxableAmount = transaction.subtotal - transaction.totalDiscount;
        transaction.tax = Math.round(taxableAmount * 0.085 * 100) / 100;
        
        // Calculate final total
        transaction.total = Math.max(0, transaction.subtotal - transaction.totalDiscount + transaction.tax);
        
        this.eventBus.emit('checkout.totalsUpdated', {
            transaction: transaction
        });
    }

    calculateDiscounts() {
        if (!this.currentTransaction) return 0;
        
        let totalDiscount = 0;
        const npc = this.currentTransaction.npc;
        
        // Clear existing discounts
        this.currentTransaction.discounts = [];
        
        // Loyalty discount
        const loyaltyDiscount = this.calculateLoyaltyDiscount(npc);
        if (loyaltyDiscount > 0) {
            this.currentTransaction.discounts.push({
                type: 'loyalty',
                amount: loyaltyDiscount,
                description: `${npc.relationshipLevel} customer discount`
            });
            totalDiscount += loyaltyDiscount;
        }
        
        // Bulk discount
        const bulkDiscount = this.calculateBulkDiscount();
        if (bulkDiscount > 0) {
            this.currentTransaction.discounts.push({
                type: 'bulk',
                amount: bulkDiscount,
                description: 'Bulk purchase discount'
            });
            totalDiscount += bulkDiscount;
        }
        
        // Employee discretion discount (player can manually apply)
        const employeeDiscount = this.currentTransaction.discounts
            .filter(d => d.type === 'employee')
            .reduce((sum, d) => sum + d.amount, 0);
        totalDiscount += employeeDiscount;
        
        return Math.round(totalDiscount * 100) / 100;
    }

    calculateLoyaltyDiscount(npc) {
        const subtotal = this.currentTransaction.subtotal;
        let discountPercent = 0;
        
        switch (npc.relationshipLevel) {
            case 'regular':
                discountPercent = 0.05; // 5%
                break;
            case 'friend':
                discountPercent = 0.10; // 10%
                break;
            case 'vip':
                discountPercent = 0.15; // 15%
                break;
        }
        
        return subtotal * discountPercent;
    }

    calculateBulkDiscount() {
        const cart = this.currentTransaction.cart;
        let discount = 0;
        
        // 5% off if buying 5+ of the same item
        cart.forEach(item => {
            if (item.quantity >= 5) {
                discount += item.subtotal * 0.05;
            }
        });
        
        // 3% off total if buying 10+ total items
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems >= 10) {
            discount += this.currentTransaction.subtotal * 0.03;
        }
        
        return discount;
    }

    applyDiscount(data) {
        if (!this.currentTransaction) return false;
        
        const { type, amount, description, percent = false } = data;
        
        let discountAmount = amount;
        if (percent) {
            discountAmount = this.currentTransaction.subtotal * (amount / 100);
        }
        
        // Validate discount
        if (discountAmount <= 0 || discountAmount > this.currentTransaction.subtotal) {
            return false;
        }
        
        // Add employee discretion discount
        this.currentTransaction.discounts.push({
            type: type || 'employee',
            amount: discountAmount,
            description: description || 'Manager discount',
            appliedBy: 'player',
            appliedAt: Date.now()
        });
        
        this.recalculateTotal();
        
        // Customer satisfaction boost for discounts
        this.adjustCustomerSatisfaction(5, 'discount_applied');
        
        this.eventBus.emit('checkout.discountApplied', {
            discount: {
                type: type,
                amount: discountAmount,
                description: description
            },
            transaction: this.currentTransaction
        });
        
        return true;
    }

    // Upselling and Customer Service
    checkUpsellOpportunities(item) {
        if (!this.currentTransaction || this.currentTransaction.upsellAttempts >= 2) return;
        
        const upsellItems = this.findUpsellItems(item);
        if (upsellItems.length > 0) {
            setTimeout(() => {
                this.eventBus.emit('checkout.upsellOpportunity', {
                    baseItem: item,
                    suggestedItems: upsellItems,
                    transaction: this.currentTransaction
                });
            }, 2000);
        }
    }

    findUpsellItems(baseItem) {
        // Simplified upsell logic - in full game this would check actual inventory
        const suggestions = [];
        
        // Category-based suggestions
        switch (baseItem.category) {
            case 'electronics':
                suggestions.push({
                    id: 'extended_warranty',
                    name: 'Extended Warranty',
                    price: baseItem.price * 0.15,
                    category: 'services'
                });
                break;
            case 'food':
                suggestions.push({
                    id: 'drink_combo',
                    name: 'Drink Combo',
                    price: 2.99,
                    category: 'drinks'
                });
                break;
            case 'clothing':
                suggestions.push({
                    id: 'accessory',
                    name: 'Matching Accessory',
                    price: baseItem.price * 0.3,
                    category: 'accessories'
                });
                break;
        }
        
        return suggestions;
    }

    attemptUpsell(data) {
        if (!this.currentTransaction) return false;
        
        const { items, approach = 'suggestion' } = data;
        this.currentTransaction.upsellAttempts++;
        
        // Success chance based on approach and relationship
        const npc = this.currentTransaction.npc;
        let successChance = 0.3; // Base 30%
        
        if (approach === 'gentle') successChance += 0.1;
        if (approach === 'aggressive') successChance -= 0.1;
        
        // Relationship modifier
        if (npc.relationshipLevel === 'regular') successChance += 0.1;
        if (npc.relationshipLevel === 'friend') successChance += 0.2;
        if (npc.relationshipLevel === 'vip') successChance += 0.3;
        
        const success = Math.random() < successChance;
        
        if (success) {
            // Add upsell items to cart
            const acceptedItems = items.slice(0, Math.ceil(items.length * Math.random()));
            acceptedItems.forEach(item => {
                this.addItemToCart({ item, skipNotification: true });
            });
            
            this.adjustCustomerSatisfaction(2, 'successful_upsell');
        } else {
            // Unsuccessful upsell may reduce satisfaction
            if (approach === 'aggressive') {
                this.adjustCustomerSatisfaction(-3, 'pushy_upsell');
            }
        }
        
        this.eventBus.emit('checkout.upsellResult', {
            success: success,
            items: success ? acceptedItems : [],
            approach: approach,
            transaction: this.currentTransaction
        });
        
        return success;
    }

    // Payment Processing
    selectPaymentMethod(data) {
        if (!this.currentTransaction) return false;
        
        const { method, details = {} } = data;
        
        if (!this.paymentMethods.includes(method)) {
            console.error('Invalid payment method:', method);
            return false;
        }
        
        this.currentTransaction.paymentMethod = method;
        this.currentTransaction.paymentDetails = details;
        
        this.eventBus.emit('checkout.paymentMethodSelected', {
            method: method,
            details: details,
            transaction: this.currentTransaction
        });
        
        return true;
    }

    processPayment() {
        if (!this.currentTransaction) return false;
        
        const transaction = this.currentTransaction;
        const npc = transaction.npc;
        
        // Validate payment
        if (!transaction.paymentMethod) {
            this.eventBus.emit('checkout.error', {
                error: 'No payment method selected',
                transaction: transaction
            });
            return false;
        }
        
        // Check if customer has enough money
        if (!this.validateCustomerPayment(npc, transaction.total)) {
            this.eventBus.emit('checkout.paymentFailed', {
                reason: 'insufficient_funds',
                transaction: transaction
            });
            return false;
        }
        
        // Process the payment
        const paymentResult = this.executePayment(transaction);
        
        if (paymentResult.success) {
            this.completeTransaction(paymentResult);
            return true;
        } else {
            this.eventBus.emit('checkout.paymentFailed', {
                reason: paymentResult.reason,
                transaction: transaction
            });
            return false;
        }
    }

    validateCustomerPayment(npc, amount) {
        // Check if NPC has enough money
        return npc.currentCash >= amount;
    }

    executePayment(transaction) {
        const method = transaction.paymentMethod;
        const amount = transaction.total;
        const npc = transaction.npc;
        
        // Simulate payment processing
        let success = true;
        let reason = '';
        
        switch (method) {
            case 'cash':
                if (npc.currentCash >= amount) {
                    npc.currentCash -= amount;
                } else {
                    success = false;
                    reason = 'insufficient_cash';
                }
                break;
                
            case 'card':
                // 2% chance of card decline
                if (Math.random() < 0.02) {
                    success = false;
                    reason = 'card_declined';
                } else {
                    // Assume card payment deducts from their available cash
                    npc.currentCash -= amount;
                }
                break;
                
            case 'digital':
                // 1% chance of digital payment failure
                if (Math.random() < 0.01) {
                    success = false;
                    reason = 'payment_service_error';
                } else {
                    npc.currentCash -= amount;
                }
                break;
        }
        
        return {
            success: success,
            reason: reason,
            amount: amount,
            method: method,
            timestamp: Date.now()
        };
    }

    completeTransaction(paymentResult) {
        if (!this.currentTransaction) return;
        
        const transaction = this.currentTransaction;
        const npc = transaction.npc;
        
        // Update transaction status
        transaction.status = 'completed';
        transaction.endTime = Date.now();
        transaction.timeToComplete = transaction.endTime - transaction.startTime;
        transaction.paymentResult = paymentResult;
        
        // Update game state finances
        this.updateFinances(transaction);
        
        // Update NPC spending history
        npc.totalSpent += transaction.total;
        
        // Update inventory (simplified)
        this.updateInventory(transaction.cart);
        
        // Calculate final satisfaction
        const finalSatisfaction = this.calculateFinalSatisfaction(transaction);
        transaction.finalSatisfaction = finalSatisfaction;
        
        // Relationship impact based on satisfaction
        let relationshipChange = 0;
        if (finalSatisfaction >= 80) relationshipChange = 3;
        else if (finalSatisfaction >= 60) relationshipChange = 1;
        else if (finalSatisfaction < 40) relationshipChange = -1;
        
        if (relationshipChange !== 0) {
            this.npcSystem.updateRelationship(
                npc.id,
                relationshipChange,
                `Purchase transaction (satisfaction: ${finalSatisfaction})`
            );
        }
        
        // Add to transaction history
        this.gameState.data.finances.transactions.push({
            id: transaction.id,
            type: 'sale',
            npcId: npc.id,
            npcName: npc.name,
            timestamp: transaction.endTime,
            amount: transaction.total,
            subtotal: transaction.subtotal,
            discounts: transaction.totalDiscount,
            tax: transaction.tax,
            paymentMethod: transaction.paymentMethod,
            itemCount: transaction.cart.reduce((sum, item) => sum + item.quantity, 0),
            satisfaction: finalSatisfaction,
            duration: transaction.timeToComplete
        });
        
        console.log(`🛒 Transaction completed: ${npc.name} - $${transaction.total.toFixed(2)}`);
        
        this.eventBus.emit('checkout.completed', {
            transaction: transaction,
            npc: npc,
            satisfaction: finalSatisfaction,
            relationshipChange: relationshipChange
        });
        
        // End conversation if active
        if (this.conversationSystem.isInConversation()) {
            this.conversationSystem.endConversation('successful_sale');
        }
        
        // Clear current transaction
        this.currentTransaction = null;
        this.cart = [];
    }

    // System Updates
    updateFinances(transaction) {
        const finances = this.gameState.data.finances;
        
        // Add revenue
        finances.cash += transaction.total;
        finances.dailyStats.sales += transaction.total;
        finances.dailyStats.transactions++;
        
        // Update weekly/monthly totals
        const currentWeek = Math.floor(this.gameState.data.time.currentDay / 7);
        const currentMonth = Math.floor(this.gameState.data.time.currentDay / 30);
        
        if (!finances.weeklyStats[currentWeek]) {
            finances.weeklyStats[currentWeek] = { sales: 0, transactions: 0, profit: 0 };
        }
        if (!finances.monthlyStats[currentMonth]) {
            finances.monthlyStats[currentMonth] = { sales: 0, transactions: 0, profit: 0 };
        }
        
        finances.weeklyStats[currentWeek].sales += transaction.total;
        finances.weeklyStats[currentWeek].transactions++;
        finances.monthlyStats[currentMonth].sales += transaction.total;
        finances.monthlyStats[currentMonth].transactions++;
    }

    updateInventory(cartItems) {
        // Simplified inventory update - in full game this would interact with inventory system
        cartItems.forEach(item => {
            console.log(`📦 Sold ${item.quantity}x ${item.name}`);
        });
    }

    calculateFinalSatisfaction(transaction) {
        let satisfaction = transaction.customerSatisfaction;
        
        // Bonus for quick service
        if (transaction.timeToComplete < 30000) { // Under 30 seconds
            satisfaction += 5;
        } else if (transaction.timeToComplete > 120000) { // Over 2 minutes
            satisfaction -= 10;
        }
        
        // Bonus for discounts
        if (transaction.totalDiscount > 0) {
            satisfaction += Math.min(10, transaction.totalDiscount / transaction.subtotal * 20);
        }
        
        // Penalty for too many upsell attempts
        if (transaction.upsellAttempts > 1) {
            satisfaction -= (transaction.upsellAttempts - 1) * 3;
        }
        
        return Math.max(0, Math.min(100, Math.round(satisfaction)));
    }

    adjustCustomerSatisfaction(change, reason) {
        if (!this.currentTransaction) return;
        
        this.currentTransaction.customerSatisfaction = Math.max(0, Math.min(100,
            this.currentTransaction.customerSatisfaction + change
        ));
        
        this.eventBus.emit('checkout.satisfactionChanged', {
            change: change,
            newSatisfaction: this.currentTransaction.customerSatisfaction,
            reason: reason,
            transaction: this.currentTransaction
        });
    }

    // Checkout Control
    cancelCheckout() {
        if (!this.currentTransaction) return;
        
        const transaction = this.currentTransaction;
        transaction.status = 'cancelled';
        transaction.endTime = Date.now();
        
        console.log(`🛒 Checkout cancelled for ${transaction.npc.name}`);
        
        this.eventBus.emit('checkout.cancelled', {
            transaction: transaction
        });
        
        this.currentTransaction = null;
        this.cart = [];
    }

    // Utility Methods
    validateItem(item) {
        return item && 
               typeof item.id === 'string' && 
               typeof item.name === 'string' && 
               typeof item.price === 'number' && 
               item.price > 0;
    }

    generateTransactionId() {
        return 'txn_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    // Public Interface
    getCurrentTransaction() {
        return this.currentTransaction;
    }

    isCheckoutActive() {
        return this.currentTransaction !== null;
    }

    getCart() {
        return this.currentTransaction ? this.currentTransaction.cart : [];
    }

    getTotal() {
        return this.currentTransaction ? this.currentTransaction.total : 0;
    }

    getTransactionHistory(npcId = null) {
        const transactions = this.gameState.data.finances.transactions;
        if (npcId) {
            return transactions.filter(txn => txn.npcId === npcId);
        }
        return transactions;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CheckoutSystem;
} else if (typeof window !== 'undefined') {
    window.CheckoutSystem = CheckoutSystem;
}
