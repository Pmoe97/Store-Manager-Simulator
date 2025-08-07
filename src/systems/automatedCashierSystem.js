/**
 * Automated Cashier System
 * Handles routine customer transactions with AI assistance
 */

class AutomatedCashierSystem {
    constructor() {
        this.automationSystem = null;
        this.gameState = null;
        this.eventBus = null;
        
        // Cashier AI settings
        this.settings = {
            efficiency: 0.85,
            accuracy: 0.95,
            customerServiceLevel: 0.8,
            escalationThreshold: 0.7,
            personalityType: 'friendly'
        };
        
        // Transaction handling
        this.transactionQueue = [];
        this.activeTransactions = new Map();
        this.processedTransactions = [];
        
        // Performance metrics
        this.metrics = {
            transactionsProcessed: 0,
            averageTransactionTime: 45, // seconds
            customerSatisfactionRate: 0.82,
            errorRate: 0.03,
            escalationRate: 0.15
        };
        
        // AI conversation templates
        this.conversationTemplates = {
            greeting: [
                "Hello! Welcome to our store. How can I help you today?",
                "Good morning! What can I assist you with?",
                "Hi there! Ready to check out?",
                "Welcome! I'm here to help with your purchase."
            ],
            processing: [
                "Let me scan these items for you...",
                "Processing your purchase now...",
                "Just getting your total ready...",
                "Almost done with your transaction..."
            ],
            upselling: [
                "Would you like to add any batteries with that?",
                "We have a special offer on snacks today, interested?",
                "Can I interest you in our store loyalty program?",
                "Would you like a bag for your items?"
            ],
            completion: [
                "Your total comes to ${total}. Will that be cash or card?",
                "That'll be ${total}. How would you like to pay?",
                "Your purchase total is ${total}. Payment method?",
                "All set! That's ${total}. Cash or card today?"
            ],
            farewell: [
                "Thank you for shopping with us! Have a great day!",
                "Thanks for your purchase! Come back soon!",
                "Have a wonderful day, and thank you for choosing us!",
                "Thanks for visiting! See you next time!"
            ]
        };
        
        this.initialized = false;
    }
    
    async initialize(automationSystem) {
        console.log('🤖 Initializing Automated Cashier System...');
        
        this.automationSystem = automationSystem;
        this.gameState = automationSystem.gameState;
        this.eventBus = automationSystem.eventBus;
        
        // Set up transaction processing loop
        this.startTransactionProcessing();
        
        this.initialized = true;
        console.log('✅ Automated Cashier System initialized!');
    }
    
    startTransactionProcessing() {
        // Process transactions every 5 seconds
        setInterval(() => {
            this.processTransactionQueue();
        }, 5000);
        
        // Update metrics every 30 seconds
        setInterval(() => {
            this.updateMetrics();
        }, 30000);
    }
    
    async handleCustomer(customer) {
        if (!this.initialized) return null;
        
        console.log('🛒 Automated cashier handling customer:', customer.name);
        
        // Check if customer needs escalation
        if (this.needsEscalation(customer)) {
            return this.escalateToHuman(customer);
        }
        
        // Add to transaction queue
        const transaction = {
            id: `auto_trans_${Date.now()}`,
            customer: customer,
            items: customer.cart || [],
            startTime: Date.now(),
            status: 'queued',
            aiConversation: []
        };
        
        this.transactionQueue.push(transaction);
        this.activeTransactions.set(transaction.id, transaction);
        
        // Emit transaction started event
        this.eventBus.emit('cashier:transactionStarted', {
            transactionId: transaction.id,
            customer: customer.name,
            automated: true
        });
        
        return transaction;
    }
    
    needsEscalation(customer) {
        // Escalate for complex situations
        const escalationFactors = [
            customer.mood === 'angry',
            customer.hasComplaint === true,
            customer.specialRequest === true,
            customer.cart?.length > 20,
            customer.paymentIssue === true,
            customer.isVIP === true
        ];
        
        const escalationScore = escalationFactors.filter(factor => factor).length / escalationFactors.length;
        return escalationScore >= this.settings.escalationThreshold;
    }
    
    escalateToHuman(customer) {
        console.log('👤 Escalating customer to human cashier:', customer.name);
        
        this.eventBus.emit('cashier:escalation', {
            customer: customer,
            reason: 'Requires human attention',
            timestamp: Date.now()
        });
        
        this.metrics.escalationRate += 0.01;
        
        return {
            escalated: true,
            reason: 'Customer situation requires human cashier',
            customer: customer
        };
    }
    
    processTransactionQueue() {
        if (this.transactionQueue.length === 0) return;
        
        // Process up to 3 transactions simultaneously
        const maxConcurrent = 3;
        const processing = Array.from(this.activeTransactions.values())
            .filter(t => t.status === 'processing').length;
        
        if (processing >= maxConcurrent) return;
        
        // Start processing next transaction
        const nextTransaction = this.transactionQueue.shift();
        if (nextTransaction) {
            this.processTransaction(nextTransaction);
        }
    }
    
    async processTransaction(transaction) {
        console.log('💳 Processing automated transaction:', transaction.id);
        
        transaction.status = 'processing';
        transaction.processingStartTime = Date.now();
        
        try {
            // Step 1: Greeting
            await this.addConversationStep(transaction, 'greeting');
            await this.simulateDelay(1000, 2000);
            
            // Step 2: Scan items
            await this.scanItems(transaction);
            await this.simulateDelay(2000, 4000);
            
            // Step 3: Upselling (optional)
            if (Math.random() < 0.3) { // 30% chance of upselling
                await this.addConversationStep(transaction, 'upselling');
                await this.simulateDelay(1000, 2000);
            }
            
            // Step 4: Calculate total and request payment
            await this.calculateTotal(transaction);
            await this.addConversationStep(transaction, 'completion', { total: transaction.total });
            await this.simulateDelay(2000, 3000);
            
            // Step 5: Process payment
            await this.processPayment(transaction);
            await this.simulateDelay(2000, 4000);
            
            // Step 6: Farewell
            await this.addConversationStep(transaction, 'farewell');
            await this.simulateDelay(500, 1000);
            
            // Complete transaction
            this.completeTransaction(transaction);
            
        } catch (error) {
            console.error('❌ Error processing automated transaction:', error);
            this.failTransaction(transaction, error);
        }
    }
    
    async addConversationStep(transaction, type, data = {}) {
        const templates = this.conversationTemplates[type];
        if (!templates) return;
        
        let message = templates[Math.floor(Math.random() * templates.length)];
        
        // Replace placeholders
        if (data.total) {
            message = message.replace('${total}', `$${data.total.toFixed(2)}`);
        }
        
        const conversationStep = {
            type: type,
            message: message,
            timestamp: Date.now(),
            speaker: 'cashier_ai'
        };
        
        transaction.aiConversation.push(conversationStep);
        
        // Emit conversation update
        this.eventBus.emit('cashier:conversation', {
            transactionId: transaction.id,
            step: conversationStep
        });
    }
    
    async scanItems(transaction) {
        let totalItems = 0;
        let totalValue = 0;
        
        for (const item of transaction.items) {
            // Simulate scanning time per item
            await this.simulateDelay(500, 1500);
            
            totalItems += item.quantity || 1;
            totalValue += (item.price || 5) * (item.quantity || 1);
            
            // Chance of scanning error
            if (Math.random() < this.metrics.errorRate) {
                console.log('⚠️ Scanning error detected, requesting manual verification');
                await this.simulateDelay(2000, 3000); // Extra time for error handling
            }
        }
        
        transaction.totalItems = totalItems;
        transaction.subtotal = totalValue;
        
        await this.addConversationStep(transaction, 'processing');
    }
    
    async calculateTotal(transaction) {
        const subtotal = transaction.subtotal || 0;
        const tax = subtotal * 0.08; // 8% tax rate
        const total = subtotal + tax;
        
        transaction.tax = tax;
        transaction.total = total;
        
        // Record transaction details
        this.eventBus.emit('transaction:calculated', {
            transactionId: transaction.id,
            subtotal: subtotal,
            tax: tax,
            total: total,
            items: transaction.totalItems
        });
    }
    
    async processPayment(transaction) {
        // Simulate payment processing
        const paymentMethods = ['card', 'cash', 'mobile'];
        const selectedMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        
        transaction.paymentMethod = selectedMethod;
        
        // Different processing times for different methods
        const processingTime = {
            card: { min: 3000, max: 6000 },
            cash: { min: 2000, max: 4000 },
            mobile: { min: 1000, max: 3000 }
        };
        
        const times = processingTime[selectedMethod];
        await this.simulateDelay(times.min, times.max);
        
        // Small chance of payment failure
        if (Math.random() < 0.02) { // 2% payment failure rate
            throw new Error('Payment processing failed');
        }
        
        transaction.paymentProcessed = true;
        transaction.paymentTime = Date.now();
    }
    
    completeTransaction(transaction) {
        transaction.status = 'completed';
        transaction.endTime = Date.now();
        transaction.duration = transaction.endTime - transaction.startTime;
        
        // Remove from active transactions
        this.activeTransactions.delete(transaction.id);
        
        // Add to processed transactions
        this.processedTransactions.push(transaction);
        
        // Update metrics
        this.metrics.transactionsProcessed++;
        
        // Calculate customer satisfaction based on transaction
        const satisfaction = this.calculateCustomerSatisfaction(transaction);
        transaction.customerSatisfaction = satisfaction;
        
        // Update game state
        if (this.gameState.store) {
            this.gameState.store.revenue = (this.gameState.store.revenue || 0) + transaction.total;
            this.gameState.store.transactionsToday = (this.gameState.store.transactionsToday || 0) + 1;
        }
        
        // Emit completion event
        this.eventBus.emit('cashier:transactionCompleted', {
            transactionId: transaction.id,
            customer: transaction.customer.name,
            total: transaction.total,
            duration: transaction.duration,
            satisfaction: satisfaction,
            automated: true
        });
        
        console.log(`✅ Automated transaction completed: ${transaction.id} - $${transaction.total.toFixed(2)}`);
    }
    
    failTransaction(transaction, error) {
        transaction.status = 'failed';
        transaction.endTime = Date.now();
        transaction.error = error.message;
        
        // Remove from active transactions
        this.activeTransactions.delete(transaction.id);
        
        // Escalate to human cashier
        this.escalateToHuman(transaction.customer);
        
        console.log(`❌ Automated transaction failed: ${transaction.id} - ${error.message}`);
    }
    
    calculateCustomerSatisfaction(transaction) {
        let satisfaction = 0.8; // Base satisfaction
        
        // Adjust based on transaction duration
        const expectedDuration = 30000; // 30 seconds expected
        if (transaction.duration < expectedDuration) {
            satisfaction += 0.1; // Bonus for quick service
        } else if (transaction.duration > expectedDuration * 2) {
            satisfaction -= 0.2; // Penalty for slow service
        }
        
        // Adjust based on conversation quality
        if (transaction.aiConversation.length >= 4) {
            satisfaction += 0.05; // Bonus for good interaction
        }
        
        // Random variation for realism
        satisfaction += (Math.random() - 0.5) * 0.1;
        
        return Math.max(0, Math.min(1, satisfaction));
    }
    
    updateMetrics() {
        if (this.processedTransactions.length === 0) return;
        
        // Calculate average transaction time
        const totalTime = this.processedTransactions.reduce((sum, t) => sum + t.duration, 0);
        this.metrics.averageTransactionTime = totalTime / this.processedTransactions.length / 1000; // Convert to seconds
        
        // Calculate customer satisfaction rate
        const satisfactionSum = this.processedTransactions.reduce((sum, t) => sum + (t.customerSatisfaction || 0), 0);
        this.metrics.customerSatisfactionRate = satisfactionSum / this.processedTransactions.length;
        
        // Update error rate based on recent performance
        const recentTransactions = this.processedTransactions.slice(-20); // Last 20 transactions
        const errors = recentTransactions.filter(t => t.status === 'failed').length;
        this.metrics.errorRate = errors / recentTransactions.length;
        
        // Emit metrics update
        this.eventBus.emit('cashier:metricsUpdated', this.metrics);
    }
    
    async simulateDelay(min, max) {
        const delay = Math.random() * (max - min) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }
    
    getPerformanceReport() {
        return {
            metrics: this.metrics,
            activeTransactions: this.activeTransactions.size,
            queueLength: this.transactionQueue.length,
            recentTransactions: this.processedTransactions.slice(-10),
            settings: this.settings
        };
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        console.log('⚙️ Automated cashier settings updated:', newSettings);
    }
}

// Export for use in automation system
if (typeof window !== 'undefined') {
    window.AutomatedCashierSystem = AutomatedCashierSystem;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutomatedCashierSystem;
}
