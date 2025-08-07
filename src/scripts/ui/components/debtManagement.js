/**
 * Debt Management Component - Track and manage all debts and payment schedules
 * Provides debt analysis, payment planning, and consequence management
 */

class DebtManagement {
    constructor() {
        this.eventBus = null;
        this.financialSystem = null;
        this.container = null;
        this.selectedDebt = null;
        this.paymentPlan = null;
        
        this.viewMode = 'overview'; // overview, details, planning
    }

    initialize(eventBus, financialSystem) {
        this.eventBus = eventBus;
        this.financialSystem = financialSystem;

        // Listen for debt events
        this.eventBus.on('debt.payment', (data) => this.processPayment(data));
        this.eventBus.on('debt.view', (data) => this.viewDebt(data));
        this.eventBus.on('debt.plan', (data) => this.createPaymentPlan(data));
        this.eventBus.on('ui.showDebtManagement', () => this.show());
        this.eventBus.on('finances.debtOverdue', (data) => this.handleOverdueAlert(data));

        console.log('💳 Debt Management initialized');
    }

    render() {
        return `
            <div id="debt-management" class="debt-management hidden">
                <div class="debt-header">
                    <h2>Debt Management</h2>
                    <div class="debt-summary-bar">
                        ${this.renderDebtSummaryBar()}
                    </div>
                </div>

                <div class="debt-navigation">
                    <div class="view-tabs">
                        <button class="view-tab ${this.viewMode === 'overview' ? 'active' : ''}" 
                                onclick="debtManagement.switchView('overview')">
                            Overview
                        </button>
                        <button class="view-tab ${this.viewMode === 'details' ? 'active' : ''}" 
                                onclick="debtManagement.switchView('details')">
                            Debt Details
                        </button>
                        <button class="view-tab ${this.viewMode === 'planning' ? 'active' : ''}" 
                                onclick="debtManagement.switchView('planning')">
                            Payment Planning
                        </button>
                    </div>
                    
                    <div class="debt-actions">
                        <button class="btn btn-primary" onclick="debtManagement.showPaymentModal()">
                            Make Payment
                        </button>
                        <button class="btn btn-outline" onclick="debtManagement.generatePayoffPlan()">
                            Generate Payoff Plan
                        </button>
                    </div>
                </div>

                <div class="debt-content">
                    <div id="overview-view" class="debt-view ${this.viewMode === 'overview' ? 'active' : ''}">
                        ${this.renderOverviewView()}
                    </div>
                    <div id="details-view" class="debt-view ${this.viewMode === 'details' ? 'active' : ''}">
                        ${this.renderDetailsView()}
                    </div>
                    <div id="planning-view" class="debt-view ${this.viewMode === 'planning' ? 'active' : ''}">
                        ${this.renderPlanningView()}
                    </div>
                </div>
            </div>
        `;
    }

    renderDebtSummaryBar() {
        const debts = Array.from(this.financialSystem.debts.values()).filter(debt => debt.isActive);
        const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
        const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
        const overdueDebts = debts.filter(debt => new Date() > debt.dueDate).length;

        return `
            <div class="summary-metrics">
                <div class="summary-metric">
                    <span class="metric-label">Total Debt:</span>
                    <span class="metric-value debt-amount">$${totalDebt.toFixed(2)}</span>
                </div>
                <div class="summary-metric">
                    <span class="metric-label">Monthly Payments:</span>
                    <span class="metric-value payment-amount">$${totalMinimumPayments.toFixed(2)}</span>
                </div>
                <div class="summary-metric">
                    <span class="metric-label">Active Debts:</span>
                    <span class="metric-value count">${debts.length}</span>
                </div>
                <div class="summary-metric ${overdueDebts > 0 ? 'alert' : ''}">
                    <span class="metric-label">Overdue:</span>
                    <span class="metric-value overdue-count">${overdueDebts}</span>
                </div>
            </div>
        `;
    }

    renderOverviewView() {
        const debts = Array.from(this.financialSystem.debts.values()).filter(debt => debt.isActive);
        const urgentDebts = debts.filter(debt => debt.riskLevel === 'high' || new Date() > debt.dueDate);

        return `
            <div class="overview-content">
                <div class="overview-grid">
                    <div class="debt-cards-section">
                        <h3>All Debts</h3>
                        <div class="debt-cards">
                            ${debts.map(debt => this.renderDebtCard(debt)).join('')}
                        </div>
                    </div>

                    <div class="urgent-section">
                        <h3>Urgent Attention Required</h3>
                        <div class="urgent-debts">
                            ${urgentDebts.length > 0 ? 
                                urgentDebts.map(debt => this.renderUrgentDebtItem(debt)).join('') :
                                '<p class="no-urgent">No urgent debts at this time.</p>'
                            }
                        </div>
                    </div>

                    <div class="payment-calendar-section">
                        <h3>Upcoming Payments (30 days)</h3>
                        <div class="payment-calendar">
                            ${this.renderPaymentCalendar()}
                        </div>
                    </div>

                    <div class="debt-insights-section">
                        <h3>Debt Insights</h3>
                        <div class="insights-content">
                            ${this.renderDebtInsights()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderDebtCard(debt) {
        const progress = ((debt.originalAmount - debt.currentBalance) / debt.originalAmount) * 100;
        const daysUntilDue = Math.ceil((debt.dueDate - new Date()) / (1000 * 60 * 60 * 24));
        const isOverdue = daysUntilDue < 0;

        return `
            <div class="debt-card ${debt.riskLevel || 'normal'} ${isOverdue ? 'overdue' : ''}" 
                 onclick="debtManagement.selectDebt('${debt.id}')">
                <div class="debt-card-header">
                    <h4>${debt.creditor}</h4>
                    <span class="debt-type">${this.formatDebtType(debt.type)}</span>
                </div>
                
                <div class="debt-amount">
                    <div class="current-balance">$${debt.currentBalance.toFixed(2)}</div>
                    <div class="original-amount">of $${debt.originalAmount.toFixed(2)}</div>
                </div>

                <div class="debt-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${progress.toFixed(1)}% paid off</span>
                </div>

                <div class="debt-details">
                    <div class="detail-row">
                        <span>Interest Rate:</span>
                        <span>${(debt.interestRate * 100).toFixed(2)}%</span>
                    </div>
                    <div class="detail-row">
                        <span>Min Payment:</span>
                        <span>$${debt.minimumPayment.toFixed(2)}</span>
                    </div>
                    <div class="detail-row ${isOverdue ? 'overdue' : ''}">
                        <span>Next Due:</span>
                        <span>
                            ${isOverdue ? 
                                `OVERDUE (${Math.abs(daysUntilDue)} days)` :
                                debt.dueDate.toLocaleDateString()
                            }
                        </span>
                    </div>
                </div>

                ${debt.riskLevel === 'high' ? `
                    <div class="risk-warning">
                        <i class="icon-warning"></i>
                        High Risk - Serious Consequences
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderUrgentDebtItem(debt) {
        const daysOverdue = Math.ceil((new Date() - debt.dueDate) / (1000 * 60 * 60 * 24));
        const isOverdue = daysOverdue > 0;

        return `
            <div class="urgent-debt-item ${debt.riskLevel}">
                <div class="urgent-icon">⚠️</div>
                <div class="urgent-content">
                    <h4>${debt.creditor}</h4>
                    <p class="urgent-reason">
                        ${isOverdue ? 
                            `Payment overdue by ${daysOverdue} days` :
                            'High-risk debt requiring immediate attention'
                        }
                    </p>
                    <div class="urgent-amount">
                        Amount due: $${debt.minimumPayment.toFixed(2)}
                    </div>
                </div>
                <div class="urgent-actions">
                    <button class="btn btn-sm btn-danger" onclick="debtManagement.makeUrgentPayment('${debt.id}')">
                        Pay Now
                    </button>
                </div>
            </div>
        `;
    }

    renderPaymentCalendar() {
        const upcomingPayments = this.financialSystem.getUpcomingPayments(30)
            .filter(payment => payment.type === 'debt_payment');

        if (upcomingPayments.length === 0) {
            return '<p class="no-payments">No debt payments due in the next 30 days.</p>';
        }

        return upcomingPayments.map(payment => `
            <div class="calendar-payment ${payment.priority}">
                <div class="payment-date">
                    <div class="date-day">${payment.date.getDate()}</div>
                    <div class="date-month">${payment.date.toLocaleDateString('en-US', { month: 'short' })}</div>
                </div>
                <div class="payment-info">
                    <div class="payment-creditor">${payment.name}</div>
                    <div class="payment-amount">$${payment.amount.toFixed(2)}</div>
                </div>
                <div class="payment-priority">
                    <span class="priority-indicator ${payment.priority}"></span>
                </div>
            </div>
        `).join('');
    }

    renderDebtInsights() {
        const debts = Array.from(this.financialSystem.debts.values()).filter(debt => debt.isActive);
        const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
        const totalInterest = debts.reduce((sum, debt) => sum + (debt.currentBalance * debt.interestRate), 0);
        const weightedAvgRate = totalInterest / totalDebt;

        const insights = [
            {
                icon: '📊',
                title: 'Weighted Average Interest Rate',
                value: `${(weightedAvgRate * 100).toFixed(2)}%`,
                description: 'Average rate across all debts'
            },
            {
                icon: '💰',
                title: 'Monthly Interest Cost',
                value: `$${(totalInterest / 12).toFixed(2)}`,
                description: 'Total monthly interest payments'
            },
            {
                icon: '⏱️',
                title: 'Estimated Payoff Time',
                value: this.calculatePayoffTime(debts),
                description: 'At current payment rates'
            },
            {
                icon: '🎯',
                title: 'Priority Recommendation',
                value: this.getPayoffStrategy(debts),
                description: 'Optimal payment strategy'
            }
        ];

        return insights.map(insight => `
            <div class="insight-item">
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-content">
                    <h5>${insight.title}</h5>
                    <div class="insight-value">${insight.value}</div>
                    <p class="insight-description">${insight.description}</p>
                </div>
            </div>
        `).join('');
    }

    renderDetailsView() {
        const debts = Array.from(this.financialSystem.debts.values()).filter(debt => debt.isActive);

        return `
            <div class="details-content">
                <div class="debt-list">
                    <div class="debt-list-header">
                        <h3>Detailed Debt Information</h3>
                        <div class="list-controls">
                            <select id="debt-sort" onchange="debtManagement.sortDebts(this.value)">
                                <option value="balance_desc">Highest Balance</option>
                                <option value="balance_asc">Lowest Balance</option>
                                <option value="rate_desc">Highest Interest</option>
                                <option value="rate_asc">Lowest Interest</option>
                                <option value="due_date">Due Date</option>
                                <option value="risk">Risk Level</option>
                            </select>
                        </div>
                    </div>

                    <div class="debt-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Creditor</th>
                                    <th>Type</th>
                                    <th>Balance</th>
                                    <th>Interest Rate</th>
                                    <th>Min Payment</th>
                                    <th>Next Due</th>
                                    <th>Risk Level</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${debts.map(debt => this.renderDebtTableRow(debt)).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                ${this.selectedDebt ? this.renderDebtDetailPanel() : ''}
            </div>
        `;
    }

    renderDebtTableRow(debt) {
        const isOverdue = new Date() > debt.dueDate;
        const daysUntilDue = Math.ceil((debt.dueDate - new Date()) / (1000 * 60 * 60 * 24));

        return `
            <tr class="debt-row ${debt.riskLevel} ${isOverdue ? 'overdue' : ''}" 
                onclick="debtManagement.selectDebt('${debt.id}')">
                <td class="creditor-cell">
                    <div class="creditor-name">${debt.creditor}</div>
                </td>
                <td class="type-cell">
                    <span class="debt-type-badge ${debt.type}">${this.formatDebtType(debt.type)}</span>
                </td>
                <td class="balance-cell">
                    <div class="balance-amount">$${debt.currentBalance.toFixed(2)}</div>
                    <div class="original-amount">of $${debt.originalAmount.toFixed(2)}</div>
                </td>
                <td class="rate-cell">
                    ${(debt.interestRate * 100).toFixed(2)}%
                </td>
                <td class="payment-cell">
                    $${debt.minimumPayment.toFixed(2)}
                </td>
                <td class="due-cell ${isOverdue ? 'overdue' : ''}">
                    ${isOverdue ? 
                        `OVERDUE (${Math.abs(daysUntilDue)}d)` :
                        debt.dueDate.toLocaleDateString()
                    }
                </td>
                <td class="risk-cell">
                    <span class="risk-badge ${debt.riskLevel || 'normal'}">${debt.riskLevel || 'Normal'}</span>
                </td>
                <td class="actions-cell">
                    <button class="btn btn-sm btn-primary" onclick="debtManagement.makePayment('${debt.id}')">
                        Pay
                    </button>
                </td>
            </tr>
        `;
    }

    renderDebtDetailPanel() {
        const debt = this.financialSystem.debts.get(this.selectedDebt);
        if (!debt) return '';

        return `
            <div class="debt-detail-panel">
                <div class="detail-header">
                    <h3>${debt.creditor} - Detailed View</h3>
                    <button class="btn btn-sm btn-outline" onclick="debtManagement.clearSelection()">
                        <i class="icon-close"></i>
                    </button>
                </div>

                <div class="detail-content">
                    <div class="detail-grid">
                        <div class="detail-section">
                            <h4>Debt Information</h4>
                            <div class="info-grid">
                                <div class="info-item">
                                    <label>Current Balance:</label>
                                    <span class="value">$${debt.currentBalance.toFixed(2)}</span>
                                </div>
                                <div class="info-item">
                                    <label>Original Amount:</label>
                                    <span class="value">$${debt.originalAmount.toFixed(2)}</span>
                                </div>
                                <div class="info-item">
                                    <label>Interest Rate:</label>
                                    <span class="value">${(debt.interestRate * 100).toFixed(2)}%</span>
                                </div>
                                <div class="info-item">
                                    <label>Minimum Payment:</label>
                                    <span class="value">$${debt.minimumPayment.toFixed(2)}</span>
                                </div>
                                <div class="info-item">
                                    <label>Next Due Date:</label>
                                    <span class="value">${debt.dueDate.toLocaleDateString()}</span>
                                </div>
                                <div class="info-item">
                                    <label>Risk Level:</label>
                                    <span class="value risk-${debt.riskLevel}">${debt.riskLevel || 'Normal'}</span>
                                </div>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Payment History</h4>
                            <div class="payment-history">
                                ${debt.paymentHistory.length > 0 ? 
                                    debt.paymentHistory.slice(-10).reverse().map(payment => `
                                        <div class="history-item">
                                            <span class="payment-date">${payment.date.toLocaleDateString()}</span>
                                            <span class="payment-amount">$${payment.amount.toFixed(2)}</span>
                                            <span class="payment-type">${payment.type}</span>
                                        </div>
                                    `).join('') :
                                    '<p class="no-history">No payment history available.</p>'
                                }
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Consequences</h4>
                            <div class="consequences-info">
                                <div class="consequence-item">
                                    <label>Missed Payment:</label>
                                    <span>${this.formatConsequence(debt.consequences.missedPayment)}</span>
                                </div>
                                <div class="consequence-item">
                                    <label>Multiple Missed:</label>
                                    <span>${this.formatConsequence(debt.consequences.multipleMissed)}</span>
                                </div>
                                <div class="consequence-item">
                                    <label>Default:</label>
                                    <span>${this.formatConsequence(debt.consequences.default)}</span>
                                </div>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Quick Actions</h4>
                            <div class="quick-actions">
                                <button class="btn btn-primary" onclick="debtManagement.makePayment('${debt.id}')">
                                    Make Payment
                                </button>
                                <button class="btn btn-outline" onclick="debtManagement.createPayoffPlan('${debt.id}')">
                                    Create Payoff Plan
                                </button>
                                <button class="btn btn-outline" onclick="debtManagement.viewPaymentSchedule('${debt.id}')">
                                    View Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPlanningView() {
        return `
            <div class="planning-content">
                <div class="planning-tools">
                    <h3>Debt Payment Planning Tools</h3>
                    
                    <div class="tool-grid">
                        <div class="planning-tool">
                            <h4>Debt Snowball Method</h4>
                            <p>Pay minimums on all debts, then focus extra payments on the smallest balance first.</p>
                            <button class="btn btn-primary" onclick="debtManagement.generateSnowballPlan()">
                                Generate Snowball Plan
                            </button>
                        </div>

                        <div class="planning-tool">
                            <h4>Debt Avalanche Method</h4>
                            <p>Pay minimums on all debts, then focus extra payments on the highest interest rate first.</p>
                            <button class="btn btn-primary" onclick="debtManagement.generateAvalanchePlan()">
                                Generate Avalanche Plan
                            </button>
                        </div>

                        <div class="planning-tool">
                            <h4>Custom Payment Plan</h4>
                            <p>Create a custom payment strategy based on your priorities and constraints.</p>
                            <button class="btn btn-primary" onclick="debtManagement.showCustomPlanBuilder()">
                                Build Custom Plan
                            </button>
                        </div>

                        <div class="planning-tool">
                            <h4>Consolidation Analysis</h4>
                            <p>Analyze potential benefits of debt consolidation options.</p>
                            <button class="btn btn-primary" onclick="debtManagement.analyzeConsolidation()">
                                Analyze Consolidation
                            </button>
                        </div>
                    </div>
                </div>

                ${this.paymentPlan ? this.renderPaymentPlan() : ''}
            </div>
        `;
    }

    renderPaymentPlan() {
        return `
            <div class="payment-plan-display">
                <h3>Your Payment Plan: ${this.paymentPlan.type}</h3>
                
                <div class="plan-summary">
                    <div class="summary-metrics">
                        <div class="metric">
                            <label>Total Payoff Time:</label>
                            <span>${this.paymentPlan.totalMonths} months</span>
                        </div>
                        <div class="metric">
                            <label>Total Interest Paid:</label>
                            <span>$${this.paymentPlan.totalInterest.toFixed(2)}</span>
                        </div>
                        <div class="metric">
                            <label>Monthly Payment Required:</label>
                            <span>$${this.paymentPlan.monthlyPayment.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div class="plan-schedule">
                    <h4>Payment Schedule</h4>
                    <div class="schedule-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Debt</th>
                                    <th>Payment</th>
                                    <th>Remaining Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.paymentPlan.schedule.slice(0, 12).map((payment, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${payment.debtName}</td>
                                        <td>$${payment.amount.toFixed(2)}</td>
                                        <td>$${payment.remainingBalance.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="plan-actions">
                    <button class="btn btn-success" onclick="debtManagement.activatePlan()">
                        Activate This Plan
                    </button>
                    <button class="btn btn-outline" onclick="debtManagement.exportPlan()">
                        Export Plan
                    </button>
                    <button class="btn btn-outline" onclick="debtManagement.clearPlan()">
                        Clear Plan
                    </button>
                </div>
            </div>
        `;
    }

    // Utility methods
    switchView(viewName) {
        this.viewMode = viewName;
        this.updateDisplay();
    }

    selectDebt(debtId) {
        this.selectedDebt = debtId;
        this.updateDisplay();
    }

    clearSelection() {
        this.selectedDebt = null;
        this.updateDisplay();
    }

    formatDebtType(type) {
        const types = {
            structured_loan: 'Bank Loan',
            informal_debt: 'Informal Debt',
            trade_credit: 'Trade Credit'
        };
        return types[type] || type;
    }

    formatConsequence(consequence) {
        const consequences = {
            credit_rating_damage: 'Credit rating damage',
            asset_seizure_threat: 'Asset seizure threat',
            business_closure: 'Business closure',
            intimidation_visit: 'Intimidation visit',
            property_damage: 'Property damage',
            physical_threats: 'Physical threats',
            credit_hold: 'Credit hold',
            restricted_ordering: 'Restricted ordering',
            supplier_termination: 'Supplier termination'
        };
        return consequences[consequence] || consequence;
    }

    calculatePayoffTime(debts) {
        // Simplified calculation - could be more sophisticated
        const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
        const totalMinPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
        const avgInterestRate = debts.reduce((sum, debt) => sum + debt.interestRate, 0) / debts.length;
        
        if (totalMinPayments === 0) return 'Cannot calculate';
        
        // Simple approximation
        const months = Math.ceil(totalDebt / totalMinPayments);
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        
        if (years > 0) {
            return `${years}y ${remainingMonths}m`;
        } else {
            return `${months} months`;
        }
    }

    getPayoffStrategy(debts) {
        const highestRate = Math.max(...debts.map(debt => debt.interestRate));
        const lowestBalance = Math.min(...debts.map(debt => debt.currentBalance));
        
        if (highestRate > 0.15) { // 15% or higher
            return 'Avalanche (High Interest)';
        } else if (lowestBalance < 5000) {
            return 'Snowball (Quick Wins)';
        } else {
            return 'Balanced Approach';
        }
    }

    makePayment(debtId) {
        this.eventBus.emit('ui.showModal', {
            type: 'debt-payment',
            title: 'Make Debt Payment',
            content: this.renderPaymentModal(debtId),
            buttons: [
                { text: 'Make Payment', action: () => this.processPaymentModal(debtId), primary: true },
                { text: 'Cancel', action: () => this.eventBus.emit('ui.closeModal') }
            ]
        });
    }

    renderPaymentModal(debtId) {
        const debt = this.financialSystem.debts.get(debtId);
        const availableFunds = this.financialSystem.getTotalAvailableFunds();

        return `
            <div class="payment-modal">
                <div class="debt-info">
                    <h4>${debt.creditor}</h4>
                    <p>Current Balance: $${debt.currentBalance.toFixed(2)}</p>
                    <p>Minimum Payment: $${debt.minimumPayment.toFixed(2)}</p>
                    <p>Available Funds: $${availableFunds.toFixed(2)}</p>
                </div>

                <div class="payment-form">
                    <label for="payment-amount">Payment Amount:</label>
                    <input type="number" id="payment-amount" min="${debt.minimumPayment}" 
                           max="${Math.min(debt.currentBalance, availableFunds)}" 
                           step="0.01" value="${debt.minimumPayment}">
                    
                    <div class="payment-options">
                        <button type="button" onclick="document.getElementById('payment-amount').value = '${debt.minimumPayment}'">
                            Minimum Payment
                        </button>
                        <button type="button" onclick="document.getElementById('payment-amount').value = '${Math.min(debt.currentBalance, availableFunds)}'">
                            Pay in Full
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    processPaymentModal(debtId) {
        const amount = parseFloat(document.getElementById('payment-amount').value);
        const debt = this.financialSystem.debts.get(debtId);

        if (amount < debt.minimumPayment) {
            alert('Payment amount must be at least the minimum payment amount.');
            return;
        }

        try {
            this.financialSystem.makeDebtPayment(debtId, amount);
            this.eventBus.emit('ui.closeModal');
            this.updateDisplay();
            this.eventBus.emit('ui.showNotification', {
                message: `Payment of $${amount.toFixed(2)} made to ${debt.creditor}`,
                type: 'success'
            });
        } catch (error) {
            alert(`Payment failed: ${error.message}`);
        }
    }

    show() {
        if (this.container) {
            this.container.classList.remove('hidden');
        }
    }

    hide() {
        if (this.container) {
            this.container.classList.add('hidden');
        }
    }

    updateDisplay() {
        if (this.container) {
            this.container.innerHTML = this.render();
        }
    }
}

// Initialize global debt management instance
let debtManagement = null;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DebtManagement;
}
