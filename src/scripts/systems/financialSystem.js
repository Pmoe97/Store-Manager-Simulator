/**
 * Financial System - Manages all monetary transactions, debt tracking, and financial reporting
 * Handles cash register operations, expense management, and profit/loss calculations
 */

class FinancialSystem {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.timeSystem = null;
        this.financialData = {
            cash: 1000.00, // Starting cash
            bankAccount: 2500.00,
            totalDebt: 85000.00, // Starting debt (bank + mob + supplier)
            dailyRevenue: 0,
            dailyExpenses: 0,
            weeklyRevenue: 0,
            weeklyExpenses: 0,
            monthlyRevenue: 0,
            monthlyExpenses: 0
        };
        this.transactions = [];
        this.debts = new Map();
        this.expenses = new Map();
        this.financialReports = [];
        this.paymentSchedule = [];
        this.cashRegister = {
            isOpen: false,
            startingCash: 200.00,
            currentCash: 200.00,
            salesTotal: 0,
            transactionCount: 0,
            lastTransaction: null
        };
    }

    initialize(gameState, eventBus, timeSystem) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        this.timeSystem = timeSystem;

        // Listen for financial events
        this.eventBus.on('finances.transaction', (data) => this.processTransaction(data));
        this.eventBus.on('finances.sale', (data) => this.processSale(data));
        this.eventBus.on('finances.expense', (data) => this.processExpense(data));
        this.eventBus.on('finances.payment', (data) => this.processPayment(data));
        this.eventBus.on('finances.openRegister', () => this.openCashRegister());
        this.eventBus.on('finances.closeRegister', () => this.closeCashRegister());
        this.eventBus.on('finances.generateReport', (data) => this.generateFinancialReport(data));
        this.eventBus.on('time.dayEnd', () => this.processDayEnd());
        this.eventBus.on('time.weekEnd', () => this.processWeekEnd());
        this.eventBus.on('time.monthEnd', () => this.processMonthEnd());

        // Initialize default debts and expenses
        this.initializeDebts();
        this.initializeExpenses();
        this.setupPaymentSchedule();

        console.log('💰 Financial System initialized');
    }

    initializeDebts() {
        // Bank loan - structured debt with scheduled payments
        this.debts.set('bank_loan', {
            id: 'bank_loan',
            creditor: 'First National Bank',
            type: 'structured_loan',
            originalAmount: 50000.00,
            currentBalance: 48750.00,
            interestRate: 0.03, // 3% monthly
            minimumPayment: 2500.00,
            dueDate: this.calculateNextDueDate(15), // 15th of each month
            paymentHistory: [
                { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), amount: 1250.00, type: 'payment' }
            ],
            consequences: {
                missedPayment: 'credit_rating_damage',
                multipleMissed: 'asset_seizure_threat',
                default: 'business_closure'
            },
            isActive: true
        });

        // Mob debt - dangerous but no interest
        this.debts.set('mob_debt', {
            id: 'mob_debt',
            creditor: 'Tony "The Accountant" Romano',
            type: 'informal_debt',
            originalAmount: 25000.00,
            currentBalance: 25000.00,
            interestRate: 0.00, // No interest but consequences
            minimumPayment: 1000.00, // Weekly
            dueDate: this.calculateNextDueDate(0, 'weekly'), // Every Monday
            paymentHistory: [],
            consequences: {
                missedPayment: 'intimidation_visit',
                multipleMissed: 'property_damage',
                default: 'physical_threats'
            },
            isActive: true,
            riskLevel: 'high'
        });

        // Supplier credit - affects product availability
        this.debts.set('supplier_credit', {
            id: 'supplier_credit',
            creditor: 'Wholesale Supply Co.',
            type: 'trade_credit',
            originalAmount: 10000.00,
            currentBalance: 8500.00,
            interestRate: 0.015, // 1.5% monthly on overdue
            minimumPayment: 500.00,
            dueDate: this.calculateNextDueDate(30), // 30 days from invoice
            paymentHistory: [
                { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), amount: 1500.00, type: 'payment' }
            ],
            consequences: {
                missedPayment: 'credit_hold',
                multipleMissed: 'restricted_ordering',
                default: 'supplier_termination'
            },
            isActive: true
        });
    }

    initializeExpenses() {
        // Fixed monthly expenses
        this.expenses.set('rent', {
            id: 'rent',
            name: 'Store Rent',
            type: 'fixed',
            amount: 3500.00,
            frequency: 'monthly',
            dueDate: 1, // 1st of each month
            category: 'facilities',
            isEssential: true,
            paymentHistory: [],
            nextDue: this.calculateNextDueDate(1)
        });

        this.expenses.set('utilities', {
            id: 'utilities',
            name: 'Utilities (Electric, Water, Internet)',
            type: 'variable',
            baseAmount: 450.00,
            currentAmount: 487.65,
            frequency: 'monthly',
            dueDate: 15,
            category: 'utilities',
            isEssential: true,
            paymentHistory: [],
            nextDue: this.calculateNextDueDate(15)
        });

        this.expenses.set('insurance', {
            id: 'insurance',
            name: 'Business Insurance',
            type: 'fixed',
            amount: 850.00,
            frequency: 'monthly',
            dueDate: 20,
            category: 'insurance',
            isEssential: true,
            paymentHistory: [],
            nextDue: this.calculateNextDueDate(20)
        });

        this.expenses.set('pos_system', {
            id: 'pos_system',
            name: 'POS System Subscription',
            type: 'fixed',
            amount: 89.99,
            frequency: 'monthly',
            dueDate: 5,
            category: 'technology',
            isEssential: false,
            paymentHistory: [],
            nextDue: this.calculateNextDueDate(5)
        });

        // Variable daily expenses
        this.expenses.set('bank_fees', {
            id: 'bank_fees',
            name: 'Banking Fees',
            type: 'variable',
            estimatedDaily: 5.50,
            category: 'banking',
            isEssential: true
        });

        this.expenses.set('credit_processing', {
            id: 'credit_processing',
            name: 'Credit Card Processing Fees',
            type: 'percentage',
            rate: 0.029, // 2.9% of credit card sales
            category: 'payment_processing',
            isEssential: true
        });
    }

    setupPaymentSchedule() {
        // Create a schedule of all upcoming payments
        const today = new Date();
        const scheduleHorizon = 90; // 90 days ahead

        for (let i = 0; i < scheduleHorizon; i++) {
            const checkDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
            
            // Check debt payments
            this.debts.forEach(debt => {
                if (this.isPaymentDue(debt, checkDate)) {
                    this.paymentSchedule.push({
                        date: new Date(checkDate),
                        type: 'debt_payment',
                        id: debt.id,
                        name: `${debt.creditor} Payment`,
                        amount: debt.minimumPayment,
                        priority: debt.riskLevel === 'high' ? 'urgent' : 'normal',
                        consequences: debt.consequences
                    });
                }
            });

            // Check expense payments
            this.expenses.forEach(expense => {
                if (this.isExpenseDue(expense, checkDate)) {
                    this.paymentSchedule.push({
                        date: new Date(checkDate),
                        type: 'expense_payment',
                        id: expense.id,
                        name: expense.name,
                        amount: expense.amount || expense.currentAmount,
                        priority: expense.isEssential ? 'high' : 'low',
                        category: expense.category
                    });
                }
            });
        }

        // Sort by date and priority
        this.paymentSchedule.sort((a, b) => {
            if (a.date.getTime() !== b.date.getTime()) {
                return a.date.getTime() - b.date.getTime();
            }
            const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    openCashRegister() {
        if (this.cashRegister.isOpen) {
            console.warn('Cash register is already open');
            return false;
        }

        this.cashRegister.isOpen = true;
        this.cashRegister.startingCash = this.cashRegister.currentCash;
        this.cashRegister.salesTotal = 0;
        this.cashRegister.transactionCount = 0;
        this.cashRegister.openTime = new Date();

        this.eventBus.emit('finances.registerOpened', {
            startingCash: this.cashRegister.startingCash,
            openTime: this.cashRegister.openTime
        });

        return true;
    }

    closeCashRegister() {
        if (!this.cashRegister.isOpen) {
            console.warn('Cash register is not open');
            return false;
        }

        const closeTime = new Date();
        const sessionData = {
            openTime: this.cashRegister.openTime,
            closeTime,
            startingCash: this.cashRegister.startingCash,
            endingCash: this.cashRegister.currentCash,
            salesTotal: this.cashRegister.salesTotal,
            transactionCount: this.cashRegister.transactionCount,
            cashVariance: this.cashRegister.currentCash - (this.cashRegister.startingCash + this.cashRegister.salesTotal)
        };

        // Reset register
        this.cashRegister.isOpen = false;
        this.cashRegister.lastSession = sessionData;

        // Add cash to daily revenue if positive variance
        if (sessionData.cashVariance > 0) {
            this.financialData.cash += sessionData.cashVariance;
        }

        this.eventBus.emit('finances.registerClosed', { sessionData });
        
        return sessionData;
    }

    processTransaction(transactionData) {
        const transaction = {
            id: this.generateTransactionId(),
            timestamp: new Date(),
            type: transactionData.type,
            amount: transactionData.amount,
            description: transactionData.description,
            category: transactionData.category,
            paymentMethod: transactionData.paymentMethod || 'cash',
            reference: transactionData.reference,
            customerId: transactionData.customerId,
            metadata: transactionData.metadata || {}
        };

        // Apply to appropriate accounts
        switch (transaction.type) {
            case 'sale':
                this.processSaleTransaction(transaction);
                break;
            case 'expense':
                this.processExpenseTransaction(transaction);
                break;
            case 'payment':
                this.processPaymentTransaction(transaction);
                break;
            case 'refund':
                this.processRefundTransaction(transaction);
                break;
            case 'transfer':
                this.processTransferTransaction(transaction);
                break;
        }

        this.transactions.push(transaction);
        this.eventBus.emit('finances.transactionProcessed', { transaction });

        return transaction;
    }

    processSale(saleData) {
        const { items, totalAmount, paymentMethod, customerId, discounts = [] } = saleData;
        
        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalDiscounts = discounts.reduce((sum, discount) => sum + discount.amount, 0);
        const taxAmount = this.calculateSalesTax(subtotal - totalDiscounts);
        const finalTotal = subtotal - totalDiscounts + taxAmount;

        // Process payment
        const paymentSuccess = this.processPayment({
            amount: finalTotal,
            method: paymentMethod,
            type: 'incoming'
        });

        if (!paymentSuccess) {
            throw new Error('Payment processing failed');
        }

        // Create transaction record
        const transaction = this.processTransaction({
            type: 'sale',
            amount: finalTotal,
            description: `Sale - ${items.length} item(s)`,
            category: 'revenue',
            paymentMethod,
            customerId,
            metadata: {
                items,
                subtotal,
                discounts,
                taxAmount,
                transactionDate: new Date().toISOString()
            }
        });

        // Update daily totals
        this.financialData.dailyRevenue += finalTotal;
        this.financialData.weeklyRevenue += finalTotal;
        this.financialData.monthlyRevenue += finalTotal;

        // Update cash register if open
        if (this.cashRegister.isOpen) {
            if (paymentMethod === 'cash') {
                this.cashRegister.currentCash += finalTotal;
            }
            this.cashRegister.salesTotal += finalTotal;
            this.cashRegister.transactionCount++;
            this.cashRegister.lastTransaction = transaction;
        }

        // Emit sale event for other systems
        this.eventBus.emit('finances.saleCompleted', {
            transaction,
            saleData: {
                ...saleData,
                finalTotal,
                taxAmount,
                subtotal
            }
        });

        return transaction;
    }

    processExpense(expenseData) {
        const { amount, description, category, vendor, reference } = expenseData;

        // Process payment
        const paymentSuccess = this.processPayment({
            amount,
            method: 'bank_transfer',
            type: 'outgoing'
        });

        if (!paymentSuccess) {
            throw new Error('Expense payment failed - insufficient funds');
        }

        // Create transaction record
        const transaction = this.processTransaction({
            type: 'expense',
            amount,
            description,
            category,
            reference,
            metadata: {
                vendor,
                expenseDate: new Date().toISOString()
            }
        });

        // Update daily totals
        this.financialData.dailyExpenses += amount;
        this.financialData.weeklyExpenses += amount;
        this.financialData.monthlyExpenses += amount;

        // Update specific expense tracking
        if (this.expenses.has(reference)) {
            const expense = this.expenses.get(reference);
            expense.paymentHistory.push({
                date: new Date(),
                amount,
                transactionId: transaction.id
            });
            expense.nextDue = this.calculateNextExpenseDue(expense);
        }

        this.eventBus.emit('finances.expenseProcessed', { transaction, expenseData });

        return transaction;
    }

    processPayment(paymentData) {
        const { amount, method, type } = paymentData;

        switch (type) {
            case 'incoming':
                return this.processIncomingPayment(amount, method);
            case 'outgoing':
                return this.processOutgoingPayment(amount, method);
            default:
                throw new Error(`Unknown payment type: ${type}`);
        }
    }

    processIncomingPayment(amount, method) {
        switch (method) {
            case 'cash':
                this.financialData.cash += amount;
                break;
            case 'credit_card':
            case 'debit_card':
                // Apply processing fees
                const processingFee = amount * this.expenses.get('credit_processing').rate;
                const netAmount = amount - processingFee;
                this.financialData.bankAccount += netAmount;
                
                // Record processing fee as expense
                this.processExpense({
                    amount: processingFee,
                    description: 'Credit card processing fee',
                    category: 'payment_processing',
                    reference: 'credit_processing'
                });
                break;
            case 'bank_transfer':
                this.financialData.bankAccount += amount;
                break;
            default:
                console.warn(`Unknown payment method: ${method}`);
                return false;
        }
        return true;
    }

    processOutgoingPayment(amount, method) {
        switch (method) {
            case 'cash':
                if (this.financialData.cash < amount) {
                    return false; // Insufficient cash
                }
                this.financialData.cash -= amount;
                break;
            case 'bank_transfer':
            case 'check':
                if (this.financialData.bankAccount < amount) {
                    return false; // Insufficient funds
                }
                this.financialData.bankAccount -= amount;
                break;
            default:
                console.warn(`Unknown payment method: ${method}`);
                return false;
        }
        return true;
    }

    makeDebtPayment(debtId, amount) {
        const debt = this.debts.get(debtId);
        if (!debt) {
            throw new Error(`Debt ${debtId} not found`);
        }

        // Check if we have enough funds
        const totalAvailable = this.financialData.cash + this.financialData.bankAccount;
        if (totalAvailable < amount) {
            throw new Error('Insufficient funds for debt payment');
        }

        // Process payment (prefer bank account for debt payments)
        const paymentSuccess = this.processPayment({
            amount,
            method: this.financialData.bankAccount >= amount ? 'bank_transfer' : 'cash',
            type: 'outgoing'
        });

        if (!paymentSuccess) {
            throw new Error('Debt payment processing failed');
        }

        // Update debt balance
        debt.currentBalance = Math.max(0, debt.currentBalance - amount);
        debt.paymentHistory.push({
            date: new Date(),
            amount,
            type: 'payment'
        });

        // Update next due date if minimum payment met
        if (amount >= debt.minimumPayment) {
            debt.dueDate = this.calculateNextDebtDue(debt);
        }

        // Create transaction record
        const transaction = this.processTransaction({
            type: 'payment',
            amount,
            description: `Debt payment to ${debt.creditor}`,
            category: 'debt_service',
            reference: debtId,
            metadata: {
                debtId,
                creditor: debt.creditor,
                remainingBalance: debt.currentBalance
            }
        });

        // Check if debt is fully paid
        if (debt.currentBalance === 0) {
            debt.isActive = false;
            this.eventBus.emit('finances.debtPaidOff', { debtId, debt });
        }

        this.eventBus.emit('finances.debtPaymentMade', { 
            debtId, 
            amount, 
            remainingBalance: debt.currentBalance,
            transaction 
        });

        return transaction;
    }

    calculateSalesTax(subtotal) {
        const taxRate = 0.0875; // 8.75% sales tax
        return Math.round(subtotal * taxRate * 100) / 100;
    }

    generateFinancialReport(reportConfig) {
        const { type, startDate, endDate, includeProjections = false } = reportConfig;
        
        let report = {
            id: this.generateReportId(),
            type,
            period: { startDate, endDate },
            generatedAt: new Date(),
            summary: {},
            details: {},
            projections: includeProjections ? {} : null
        };

        switch (type) {
            case 'daily':
                report = this.generateDailyReport(report);
                break;
            case 'weekly':
                report = this.generateWeeklyReport(report);
                break;
            case 'monthly':
                report = this.generateMonthlyReport(report);
                break;
            case 'debt_summary':
                report = this.generateDebtSummaryReport(report);
                break;
            case 'cash_flow':
                report = this.generateCashFlowReport(report);
                break;
            case 'profit_loss':
                report = this.generateProfitLossReport(report);
                break;
        }

        this.financialReports.push(report);
        this.eventBus.emit('finances.reportGenerated', { report });

        return report;
    }

    generateDailyReport(report) {
        const today = new Date();
        const todayTransactions = this.getTransactionsByDate(today);

        report.summary = {
            revenue: this.financialData.dailyRevenue,
            expenses: this.financialData.dailyExpenses,
            netIncome: this.financialData.dailyRevenue - this.financialData.dailyExpenses,
            transactionCount: todayTransactions.length,
            averageTransaction: todayTransactions.length > 0 ? 
                this.financialData.dailyRevenue / todayTransactions.length : 0
        };

        report.details = {
            transactions: todayTransactions,
            salesByPaymentMethod: this.groupTransactionsByPaymentMethod(todayTransactions),
            expensesByCategory: this.groupExpensesByCategory(todayTransactions),
            cashRegisterSessions: this.cashRegister.lastSession ? [this.cashRegister.lastSession] : []
        };

        return report;
    }

    generateWeeklyReport(report) {
        report.summary = {
            revenue: this.financialData.weeklyRevenue,
            expenses: this.financialData.weeklyExpenses,
            netIncome: this.financialData.weeklyRevenue - this.financialData.weeklyExpenses,
            averageDailyRevenue: this.financialData.weeklyRevenue / 7,
            revenueGrowth: this.calculateRevenueGrowth('weekly')
        };

        report.details = {
            dailyBreakdown: this.getDailyBreakdownForWeek(),
            topExpenseCategories: this.getTopExpenseCategories('weekly'),
            paymentMethodAnalysis: this.getPaymentMethodAnalysis('weekly')
        };

        return report;
    }

    generateMonthlyReport(report) {
        report.summary = {
            revenue: this.financialData.monthlyRevenue,
            expenses: this.financialData.monthlyExpenses,
            netIncome: this.financialData.monthlyRevenue - this.financialData.monthlyExpenses,
            averageDailyRevenue: this.financialData.monthlyRevenue / 30,
            totalDebtPayments: this.calculateDebtPaymentsForPeriod('monthly'),
            cashFlow: this.calculateCashFlow('monthly')
        };

        report.details = {
            weeklyBreakdown: this.getWeeklyBreakdownForMonth(),
            debtStatus: this.getCurrentDebtStatus(),
            expenseAnalysis: this.getExpenseAnalysis('monthly'),
            profitMargins: this.calculateProfitMargins()
        };

        if (report.projections) {
            report.projections = {
                nextMonthRevenue: this.projectRevenue('monthly'),
                debtPayoffTimeline: this.projectDebtPayoff(),
                breakEvenAnalysis: this.calculateBreakEvenPoint()
            };
        }

        return report;
    }

    generateDebtSummaryReport(report) {
        const activeDebts = Array.from(this.debts.values()).filter(debt => debt.isActive);
        const totalDebt = activeDebts.reduce((sum, debt) => sum + debt.currentBalance, 0);
        const monthlyPayments = activeDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);

        report.summary = {
            totalActiveDebts: activeDebts.length,
            totalOutstandingBalance: totalDebt,
            totalMonthlyPayments: monthlyPayments,
            averageInterestRate: this.calculateAverageInterestRate(activeDebts),
            highRiskDebts: activeDebts.filter(debt => debt.riskLevel === 'high').length
        };

        report.details = {
            debtBreakdown: activeDebts.map(debt => ({
                id: debt.id,
                creditor: debt.creditor,
                balance: debt.currentBalance,
                minimumPayment: debt.minimumPayment,
                interestRate: debt.interestRate,
                nextDueDate: debt.dueDate,
                riskLevel: debt.riskLevel || 'normal'
            })),
            upcomingPayments: this.getUpcomingDebtPayments(30),
            paymentHistory: this.getRecentDebtPayments(90)
        };

        return report;
    }

    processDayEnd() {
        // Reset daily totals
        this.financialData.dailyRevenue = 0;
        this.financialData.dailyExpenses = 0;

        // Process daily expenses (banking fees, etc.)
        this.processDailyExpenses();

        // Check for overdue payments
        this.checkOverduePayments();

        // Apply interest to overdue debts
        this.applyDebtInterest();

        // Generate daily report
        const dailyReport = this.generateFinancialReport({
            type: 'daily',
            startDate: new Date(),
            endDate: new Date()
        });

        this.eventBus.emit('finances.dayEndProcessed', { dailyReport });
    }

    processWeekEnd() {
        // Generate weekly report
        const weeklyReport = this.generateFinancialReport({
            type: 'weekly',
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            endDate: new Date()
        });

        // Reset weekly totals
        this.financialData.weeklyRevenue = 0;
        this.financialData.weeklyExpenses = 0;

        this.eventBus.emit('finances.weekEndProcessed', { weeklyReport });
    }

    processMonthEnd() {
        // Process monthly expenses
        this.processMonthlyExpenses();

        // Generate monthly report
        const monthlyReport = this.generateFinancialReport({
            type: 'monthly',
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            endDate: new Date(),
            includeProjections: true
        });

        // Reset monthly totals
        this.financialData.monthlyRevenue = 0;
        this.financialData.monthlyExpenses = 0;

        this.eventBus.emit('finances.monthEndProcessed', { monthlyReport });
    }

    processDailyExpenses() {
        // Process variable daily expenses
        const bankFees = this.expenses.get('bank_fees');
        if (bankFees) {
            this.processExpense({
                amount: bankFees.estimatedDaily + (Math.random() * 2 - 1), // Add some variance
                description: 'Daily banking fees',
                category: 'banking',
                reference: 'bank_fees'
            });
        }
    }

    processMonthlyExpenses() {
        // Process all monthly fixed expenses
        this.expenses.forEach(expense => {
            if (expense.frequency === 'monthly' && this.isExpenseCurrentlyDue(expense)) {
                this.processExpense({
                    amount: expense.amount || expense.currentAmount,
                    description: expense.name,
                    category: expense.category,
                    reference: expense.id
                });
            }
        });
    }

    checkOverduePayments() {
        const today = new Date();
        
        // Check overdue debts
        this.debts.forEach(debt => {
            if (debt.isActive && debt.dueDate < today) {
                this.handleOverdueDebt(debt);
            }
        });

        // Check overdue expenses
        this.expenses.forEach(expense => {
            if (expense.nextDue && expense.nextDue < today) {
                this.handleOverdueExpense(expense);
            }
        });
    }

    handleOverdueDebt(debt) {
        // Apply consequences based on debt type and how overdue it is
        const daysOverdue = Math.floor((new Date() - debt.dueDate) / (24 * 60 * 60 * 1000));
        
        if (daysOverdue === 1) {
            // First day overdue - warning
            this.eventBus.emit('finances.debtOverdue', {
                debtId: debt.id,
                creditor: debt.creditor,
                daysOverdue,
                consequence: 'warning'
            });
        } else if (daysOverdue === 7) {
            // One week overdue - escalation
            this.eventBus.emit('finances.debtOverdue', {
                debtId: debt.id,
                creditor: debt.creditor,
                daysOverdue,
                consequence: debt.consequences.missedPayment
            });
        } else if (daysOverdue === 30) {
            // One month overdue - severe consequences
            this.eventBus.emit('finances.debtOverdue', {
                debtId: debt.id,
                creditor: debt.creditor,
                daysOverdue,
                consequence: debt.consequences.multipleMissed
            });
        }
    }

    applyDebtInterest() {
        this.debts.forEach(debt => {
            if (debt.isActive && debt.interestRate > 0) {
                const dailyInterest = (debt.currentBalance * debt.interestRate) / 30;
                debt.currentBalance += dailyInterest;
                
                // Record interest as a transaction
                this.processTransaction({
                    type: 'expense',
                    amount: dailyInterest,
                    description: `Interest charge - ${debt.creditor}`,
                    category: 'debt_service',
                    reference: debt.id,
                    metadata: {
                        interestRate: debt.interestRate,
                        principal: debt.currentBalance - dailyInterest
                    }
                });
            }
        });
    }

    // Utility methods
    calculateNextDueDate(day, frequency = 'monthly') {
        const today = new Date();
        let nextDue;

        if (frequency === 'weekly') {
            nextDue = new Date(today);
            nextDue.setDate(today.getDate() + (day - today.getDay() + 7) % 7);
        } else {
            nextDue = new Date(today.getFullYear(), today.getMonth(), day);
            if (nextDue <= today) {
                nextDue.setMonth(nextDue.getMonth() + 1);
            }
        }

        return nextDue;
    }

    generateTransactionId() {
        return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateReportId() {
        return 'RPT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getTransactionsByDate(date) {
        return this.transactions.filter(transaction => 
            transaction.timestamp.toDateString() === date.toDateString()
        );
    }

    getTotalAvailableFunds() {
        return this.financialData.cash + this.financialData.bankAccount;
    }

    getFinancialSummary() {
        return {
            cash: this.financialData.cash,
            bankAccount: this.financialData.bankAccount,
            totalDebt: Array.from(this.debts.values())
                .filter(debt => debt.isActive)
                .reduce((sum, debt) => sum + debt.currentBalance, 0),
            dailyRevenue: this.financialData.dailyRevenue,
            dailyExpenses: this.financialData.dailyExpenses,
            netWorth: this.financialData.cash + this.financialData.bankAccount - 
                     Array.from(this.debts.values())
                         .filter(debt => debt.isActive)
                         .reduce((sum, debt) => sum + debt.currentBalance, 0)
        };
    }

    getUpcomingPayments(days = 30) {
        const cutoffDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        return this.paymentSchedule.filter(payment => payment.date <= cutoffDate);
    }

    isPaymentDue(debt, date) {
        return debt.dueDate.toDateString() === date.toDateString();
    }

    isExpenseDue(expense, date) {
        return expense.nextDue && expense.nextDue.toDateString() === date.toDateString();
    }

    transferFunds(fromAccount, toAccount, amount) {
        if (fromAccount === 'cash' && this.financialData.cash >= amount) {
            this.financialData.cash -= amount;
            this.financialData.bankAccount += amount;
            
            this.processTransaction({
                type: 'transfer',
                amount,
                description: `Transfer from cash to bank`,
                category: 'internal_transfer',
                metadata: { from: 'cash', to: 'bank' }
            });
            
            return true;
        } else if (fromAccount === 'bank' && this.financialData.bankAccount >= amount) {
            this.financialData.bankAccount -= amount;
            this.financialData.cash += amount;
            
            this.processTransaction({
                type: 'transfer',
                amount,
                description: `Transfer from bank to cash`,
                category: 'internal_transfer',
                metadata: { from: 'bank', to: 'cash' }
            });
            
            return true;
        }
        
        return false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinancialSystem;
}
