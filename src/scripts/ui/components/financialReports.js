/**
 * Financial Reports Component - Daily, weekly, and monthly financial reporting
 * Provides comprehensive financial analytics and business intelligence
 */

class FinancialReports {
    constructor() {
        this.eventBus = null;
        this.financialSystem = null;
        this.currentReport = null;
        this.reportHistory = [];
        this.container = null;
        
        this.reportTypes = {
            daily: 'Daily Summary',
            weekly: 'Weekly Report',
            monthly: 'Monthly Report',
            debt_summary: 'Debt Analysis',
            cash_flow: 'Cash Flow',
            profit_loss: 'Profit & Loss'
        };
    }

    initialize(eventBus, financialSystem) {
        this.eventBus = eventBus;
        this.financialSystem = financialSystem;

        // Listen for report events
        this.eventBus.on('reports.generate', (data) => this.generateReport(data));
        this.eventBus.on('reports.view', (data) => this.viewReport(data));
        this.eventBus.on('reports.export', (data) => this.exportReport(data));
        this.eventBus.on('ui.showFinancialReports', () => this.show());
        this.eventBus.on('finances.reportGenerated', (data) => this.addToHistory(data.report));

        console.log('📊 Financial Reports initialized');
    }

    render() {
        return `
            <div id="financial-reports" class="financial-reports hidden">
                <div class="reports-header">
                    <h2>Financial Reports & Analytics</h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="financialReports.showReportGenerator()">
                            Generate New Report
                        </button>
                        <button class="btn btn-outline" onclick="financialReports.exportAll()">
                            Export All
                        </button>
                    </div>
                </div>

                <div class="reports-dashboard">
                    <div class="dashboard-metrics">
                        ${this.renderQuickMetrics()}
                    </div>

                    <div class="reports-navigation">
                        <div class="nav-tabs">
                            <button class="tab-btn active" data-tab="overview" onclick="financialReports.switchTab('overview')">
                                Overview
                            </button>
                            <button class="tab-btn" data-tab="daily" onclick="financialReports.switchTab('daily')">
                                Daily Reports
                            </button>
                            <button class="tab-btn" data-tab="weekly" onclick="financialReports.switchTab('weekly')">
                                Weekly Reports
                            </button>
                            <button class="tab-btn" data-tab="monthly" onclick="financialReports.switchTab('monthly')">
                                Monthly Reports
                            </button>
                            <button class="tab-btn" data-tab="analytics" onclick="financialReports.switchTab('analytics')">
                                Analytics
                            </button>
                        </div>
                    </div>

                    <div class="reports-content">
                        <div id="overview-tab" class="tab-content active">
                            ${this.renderOverviewTab()}
                        </div>
                        <div id="daily-tab" class="tab-content">
                            ${this.renderDailyTab()}
                        </div>
                        <div id="weekly-tab" class="tab-content">
                            ${this.renderWeeklyTab()}
                        </div>
                        <div id="monthly-tab" class="tab-content">
                            ${this.renderMonthlyTab()}
                        </div>
                        <div id="analytics-tab" class="tab-content">
                            ${this.renderAnalyticsTab()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderQuickMetrics() {
        const summary = this.financialSystem.getFinancialSummary();
        const upcomingPayments = this.financialSystem.getUpcomingPayments(7);
        const urgentPayments = upcomingPayments.filter(p => p.priority === 'urgent').length;

        return `
            <div class="metrics-grid">
                <div class="metric-card revenue">
                    <div class="metric-icon">💰</div>
                    <div class="metric-content">
                        <h3>Today's Revenue</h3>
                        <div class="metric-value">$${summary.dailyRevenue.toFixed(2)}</div>
                        <div class="metric-change positive">+$127.50 vs yesterday</div>
                    </div>
                </div>

                <div class="metric-card expenses">
                    <div class="metric-icon">💸</div>
                    <div class="metric-content">
                        <h3>Today's Expenses</h3>
                        <div class="metric-value">$${summary.dailyExpenses.toFixed(2)}</div>
                        <div class="metric-change negative">+$45.20 vs yesterday</div>
                    </div>
                </div>

                <div class="metric-card cash">
                    <div class="metric-icon">💵</div>
                    <div class="metric-content">
                        <h3>Available Cash</h3>
                        <div class="metric-value">$${(summary.cash + summary.bankAccount).toFixed(2)}</div>
                        <div class="metric-breakdown">
                            Cash: $${summary.cash.toFixed(2)} | Bank: $${summary.bankAccount.toFixed(2)}
                        </div>
                    </div>
                </div>

                <div class="metric-card debt">
                    <div class="metric-icon">⚠️</div>
                    <div class="metric-content">
                        <h3>Total Debt</h3>
                        <div class="metric-value">$${summary.totalDebt.toFixed(2)}</div>
                        <div class="metric-alert">${urgentPayments} urgent payment(s) due</div>
                    </div>
                </div>

                <div class="metric-card profit">
                    <div class="metric-icon">📈</div>
                    <div class="metric-content">
                        <h3>Net Worth</h3>
                        <div class="metric-value ${summary.netWorth >= 0 ? 'positive' : 'negative'}">
                            $${summary.netWorth.toFixed(2)}
                        </div>
                        <div class="metric-trend">
                            ${summary.netWorth >= 0 ? '📈 Improving' : '📉 Declining'}
                        </div>
                    </div>
                </div>

                <div class="metric-card alerts">
                    <div class="metric-icon">🔔</div>
                    <div class="metric-content">
                        <h3>Upcoming Payments</h3>
                        <div class="metric-value">${upcomingPayments.length}</div>
                        <div class="metric-detail">Next 7 days</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderOverviewTab() {
        const upcomingPayments = this.financialSystem.getUpcomingPayments(14);
        
        return `
            <div class="overview-content">
                <div class="overview-grid">
                    <div class="overview-section">
                        <h3>Financial Health Summary</h3>
                        <div class="health-indicators">
                            ${this.renderHealthIndicators()}
                        </div>
                    </div>

                    <div class="overview-section">
                        <h3>Upcoming Payments (14 days)</h3>
                        <div class="payments-timeline">
                            ${this.renderPaymentsTimeline(upcomingPayments)}
                        </div>
                    </div>

                    <div class="overview-section">
                        <h3>Recent Financial Activity</h3>
                        <div class="recent-activity">
                            ${this.renderRecentActivity()}
                        </div>
                    </div>

                    <div class="overview-section">
                        <h3>Financial Goals Progress</h3>
                        <div class="goals-progress">
                            ${this.renderGoalsProgress()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderHealthIndicators() {
        const summary = this.financialSystem.getFinancialSummary();
        const debtToIncomeRatio = summary.totalDebt / (summary.dailyRevenue * 30 || 1);
        const cashReserveRatio = (summary.cash + summary.bankAccount) / (summary.dailyExpenses * 30 || 1);
        
        return `
            <div class="health-grid">
                <div class="health-indicator ${this.getHealthStatus(debtToIncomeRatio, 'debt')}">
                    <div class="indicator-label">Debt-to-Income Ratio</div>
                    <div class="indicator-value">${(debtToIncomeRatio * 100).toFixed(1)}%</div>
                    <div class="indicator-status">${this.getHealthMessage(debtToIncomeRatio, 'debt')}</div>
                </div>

                <div class="health-indicator ${this.getHealthStatus(cashReserveRatio, 'cash')}">
                    <div class="indicator-label">Cash Reserve (months)</div>
                    <div class="indicator-value">${cashReserveRatio.toFixed(1)}</div>
                    <div class="indicator-status">${this.getHealthMessage(cashReserveRatio, 'cash')}</div>
                </div>

                <div class="health-indicator ${summary.dailyRevenue > summary.dailyExpenses ? 'good' : 'poor'}">
                    <div class="indicator-label">Daily Profitability</div>
                    <div class="indicator-value">$${(summary.dailyRevenue - summary.dailyExpenses).toFixed(2)}</div>
                    <div class="indicator-status">
                        ${summary.dailyRevenue > summary.dailyExpenses ? 'Profitable' : 'Operating at Loss'}
                    </div>
                </div>
            </div>
        `;
    }

    renderPaymentsTimeline(payments) {
        if (payments.length === 0) {
            return '<p class="no-payments">No upcoming payments in the next 14 days.</p>';
        }

        return payments.slice(0, 10).map(payment => `
            <div class="payment-item ${payment.priority}">
                <div class="payment-date">
                    ${payment.date.toLocaleDateString()}
                </div>
                <div class="payment-details">
                    <div class="payment-name">${payment.name}</div>
                    <div class="payment-amount">$${payment.amount.toFixed(2)}</div>
                </div>
                <div class="payment-priority">
                    <span class="priority-badge ${payment.priority}">${payment.priority}</span>
                </div>
            </div>
        `).join('');
    }

    renderRecentActivity() {
        // Get recent transactions from financial system
        const recentTransactions = this.financialSystem.transactions
            .slice(-10)
            .reverse();

        if (recentTransactions.length === 0) {
            return '<p class="no-activity">No recent financial activity.</p>';
        }

        return recentTransactions.map(transaction => `
            <div class="activity-item ${transaction.type}">
                <div class="activity-icon">
                    ${this.getTransactionIcon(transaction.type)}
                </div>
                <div class="activity-details">
                    <div class="activity-description">${transaction.description}</div>
                    <div class="activity-timestamp">${transaction.timestamp.toLocaleString()}</div>
                </div>
                <div class="activity-amount ${transaction.type === 'sale' ? 'positive' : 'negative'}">
                    ${transaction.type === 'sale' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                </div>
            </div>
        `).join('');
    }

    renderGoalsProgress() {
        const summary = this.financialSystem.getFinancialSummary();
        
        const goals = [
            {
                name: 'Pay off mob debt',
                current: 25000 - (this.getMobDebtBalance() || 25000),
                target: 25000,
                priority: 'high'
            },
            {
                name: 'Build emergency fund',
                current: summary.cash + summary.bankAccount,
                target: 10000,
                priority: 'medium'
            },
            {
                name: 'Monthly profit target',
                current: summary.dailyRevenue * 30 - summary.dailyExpenses * 30,
                target: 5000,
                priority: 'medium'
            }
        ];

        return goals.map(goal => {
            const progress = Math.min(100, (goal.current / goal.target) * 100);
            return `
                <div class="goal-item">
                    <div class="goal-header">
                        <span class="goal-name">${goal.name}</span>
                        <span class="goal-amount">$${goal.current.toFixed(0)} / $${goal.target.toFixed(0)}</span>
                    </div>
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill ${goal.priority}" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-percentage">${progress.toFixed(1)}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderDailyTab() {
        return `
            <div class="daily-reports">
                <div class="reports-controls">
                    <div class="date-selector">
                        <label>Select Date:</label>
                        <input type="date" id="daily-date" value="${new Date().toISOString().split('T')[0]}" 
                               onchange="financialReports.loadDailyReport(this.value)">
                    </div>
                    <button class="btn btn-primary" onclick="financialReports.generateDailyReport()">
                        Generate Today's Report
                    </button>
                </div>

                <div id="daily-report-content">
                    ${this.renderDailyReport()}
                </div>
            </div>
        `;
    }

    renderDailyReport() {
        const report = this.financialSystem.generateFinancialReport({
            type: 'daily',
            startDate: new Date(),
            endDate: new Date()
        });

        return `
            <div class="report-container">
                <div class="report-header">
                    <h3>Daily Financial Report</h3>
                    <div class="report-meta">
                        <span>Generated: ${report.generatedAt.toLocaleString()}</span>
                        <span>Report ID: ${report.id}</span>
                    </div>
                </div>

                <div class="report-summary">
                    <div class="summary-cards">
                        <div class="summary-card revenue">
                            <h4>Revenue</h4>
                            <div class="card-value">$${report.summary.revenue.toFixed(2)}</div>
                            <div class="card-detail">${report.summary.transactionCount} transactions</div>
                        </div>
                        <div class="summary-card expenses">
                            <h4>Expenses</h4>
                            <div class="card-value">$${report.summary.expenses.toFixed(2)}</div>
                            <div class="card-detail">Various categories</div>
                        </div>
                        <div class="summary-card profit">
                            <h4>Net Income</h4>
                            <div class="card-value ${report.summary.netIncome >= 0 ? 'positive' : 'negative'}">
                                $${report.summary.netIncome.toFixed(2)}
                            </div>
                            <div class="card-detail">
                                ${report.summary.netIncome >= 0 ? 'Profitable day' : 'Loss for the day'}
                            </div>
                        </div>
                        <div class="summary-card average">
                            <h4>Avg Transaction</h4>
                            <div class="card-value">$${report.summary.averageTransaction.toFixed(2)}</div>
                            <div class="card-detail">Per sale</div>
                        </div>
                    </div>
                </div>

                <div class="report-details">
                    <div class="details-grid">
                        <div class="detail-section">
                            <h4>Sales by Payment Method</h4>
                            <div class="payment-breakdown">
                                ${this.renderPaymentMethodBreakdown(report.details.salesByPaymentMethod)}
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Expenses by Category</h4>
                            <div class="expense-breakdown">
                                ${this.renderExpenseBreakdown(report.details.expensesByCategory)}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="report-actions">
                    <button class="btn btn-outline" onclick="financialReports.exportReport('${report.id}', 'pdf')">
                        Export PDF
                    </button>
                    <button class="btn btn-outline" onclick="financialReports.exportReport('${report.id}', 'excel')">
                        Export Excel
                    </button>
                    <button class="btn btn-outline" onclick="financialReports.printReport('${report.id}')">
                        Print Report
                    </button>
                </div>
            </div>
        `;
    }

    renderWeeklyTab() {
        return `
            <div class="weekly-reports">
                <div class="reports-controls">
                    <div class="week-selector">
                        <label>Select Week:</label>
                        <input type="week" id="weekly-week" value="${this.getCurrentWeek()}" 
                               onchange="financialReports.loadWeeklyReport(this.value)">
                    </div>
                    <button class="btn btn-primary" onclick="financialReports.generateWeeklyReport()">
                        Generate This Week's Report
                    </button>
                </div>

                <div id="weekly-report-content">
                    ${this.renderWeeklyReport()}
                </div>
            </div>
        `;
    }

    renderWeeklyReport() {
        const report = this.financialSystem.generateFinancialReport({
            type: 'weekly',
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            endDate: new Date()
        });

        return `
            <div class="report-container">
                <div class="report-header">
                    <h3>Weekly Financial Report</h3>
                    <div class="report-meta">
                        <span>Week ending: ${new Date().toLocaleDateString()}</span>
                        <span>Report ID: ${report.id}</span>
                    </div>
                </div>

                <div class="report-summary">
                    <div class="summary-cards">
                        <div class="summary-card revenue">
                            <h4>Weekly Revenue</h4>
                            <div class="card-value">$${report.summary.revenue.toFixed(2)}</div>
                            <div class="card-detail">Avg: $${report.summary.averageDailyRevenue.toFixed(2)}/day</div>
                        </div>
                        <div class="summary-card expenses">
                            <h4>Weekly Expenses</h4>
                            <div class="card-value">$${report.summary.expenses.toFixed(2)}</div>
                            <div class="card-detail">All categories</div>
                        </div>
                        <div class="summary-card profit">
                            <h4>Net Income</h4>
                            <div class="card-value ${report.summary.netIncome >= 0 ? 'positive' : 'negative'}">
                                $${report.summary.netIncome.toFixed(2)}
                            </div>
                            <div class="card-detail">
                                ${report.summary.revenueGrowth >= 0 ? '📈' : '📉'} 
                                ${Math.abs(report.summary.revenueGrowth).toFixed(1)}% vs last week
                            </div>
                        </div>
                    </div>
                </div>

                <div class="weekly-chart">
                    <h4>Daily Breakdown</h4>
                    <div class="chart-container">
                        ${this.renderWeeklyChart(report.details.dailyBreakdown)}
                    </div>
                </div>

                <div class="report-actions">
                    <button class="btn btn-outline" onclick="financialReports.exportReport('${report.id}', 'pdf')">
                        Export PDF
                    </button>
                    <button class="btn btn-outline" onclick="financialReports.compareWeeks()">
                        Compare Weeks
                    </button>
                </div>
            </div>
        `;
    }

    renderMonthlyTab() {
        return `
            <div class="monthly-reports">
                <div class="reports-controls">
                    <div class="month-selector">
                        <label>Select Month:</label>
                        <input type="month" id="monthly-month" value="${this.getCurrentMonth()}" 
                               onchange="financialReports.loadMonthlyReport(this.value)">
                    </div>
                    <button class="btn btn-primary" onclick="financialReports.generateMonthlyReport()">
                        Generate This Month's Report
                    </button>
                </div>

                <div id="monthly-report-content">
                    ${this.renderMonthlyReport()}
                </div>
            </div>
        `;
    }

    renderMonthlyReport() {
        const report = this.financialSystem.generateFinancialReport({
            type: 'monthly',
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            endDate: new Date(),
            includeProjections: true
        });

        return `
            <div class="report-container">
                <div class="report-header">
                    <h3>Monthly Financial Report</h3>
                    <div class="report-meta">
                        <span>Month: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        <span>Report ID: ${report.id}</span>
                    </div>
                </div>

                <div class="monthly-overview">
                    <div class="overview-grid">
                        <div class="overview-card">
                            <h4>Revenue</h4>
                            <div class="big-number">$${report.summary.revenue.toFixed(2)}</div>
                            <div class="trend">Daily avg: $${report.summary.averageDailyRevenue.toFixed(2)}</div>
                        </div>
                        <div class="overview-card">
                            <h4>Expenses</h4>
                            <div class="big-number">$${report.summary.expenses.toFixed(2)}</div>
                            <div class="breakdown">Fixed + Variable</div>
                        </div>
                        <div class="overview-card">
                            <h4>Debt Payments</h4>
                            <div class="big-number">$${report.summary.totalDebtPayments.toFixed(2)}</div>
                            <div class="progress">Debt reduction</div>
                        </div>
                        <div class="overview-card">
                            <h4>Cash Flow</h4>
                            <div class="big-number ${report.summary.cashFlow >= 0 ? 'positive' : 'negative'}">
                                $${report.summary.cashFlow.toFixed(2)}
                            </div>
                            <div class="status">
                                ${report.summary.cashFlow >= 0 ? 'Positive' : 'Negative'} cash flow
                            </div>
                        </div>
                    </div>
                </div>

                ${report.projections ? `
                    <div class="projections-section">
                        <h4>Next Month Projections</h4>
                        <div class="projections-grid">
                            <div class="projection-item">
                                <span class="projection-label">Projected Revenue:</span>
                                <span class="projection-value">$${report.projections.nextMonthRevenue.toFixed(2)}</span>
                            </div>
                            <div class="projection-item">
                                <span class="projection-label">Debt Payoff Timeline:</span>
                                <span class="projection-value">${report.projections.debtPayoffTimeline}</span>
                            </div>
                            <div class="projection-item">
                                <span class="projection-label">Break-even Point:</span>
                                <span class="projection-value">${report.projections.breakEvenAnalysis}</span>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <div class="report-actions">
                    <button class="btn btn-outline" onclick="financialReports.exportReport('${report.id}', 'pdf')">
                        Export PDF
                    </button>
                    <button class="btn btn-outline" onclick="financialReports.generateProjections()">
                        Advanced Projections
                    </button>
                </div>
            </div>
        `;
    }

    renderAnalyticsTab() {
        return `
            <div class="analytics-content">
                <div class="analytics-tools">
                    <h3>Financial Analytics Tools</h3>
                    
                    <div class="tool-grid">
                        <div class="analytics-tool">
                            <h4>Debt Analysis</h4>
                            <p>Comprehensive debt tracking and payoff strategies</p>
                            <button class="btn btn-primary" onclick="financialReports.showDebtAnalysis()">
                                Open Debt Analysis
                            </button>
                        </div>

                        <div class="analytics-tool">
                            <h4>Cash Flow Forecasting</h4>
                            <p>Predict future cash flow based on current trends</p>
                            <button class="btn btn-primary" onclick="financialReports.showCashFlowForecast()">
                                Open Cash Flow Forecast
                            </button>
                        </div>

                        <div class="analytics-tool">
                            <h4>Profit Margin Analysis</h4>
                            <p>Analyze profit margins by product category</p>
                            <button class="btn btn-primary" onclick="financialReports.showProfitAnalysis()">
                                Open Profit Analysis
                            </button>
                        </div>

                        <div class="analytics-tool">
                            <h4>Break-even Analysis</h4>
                            <p>Calculate break-even points for various scenarios</p>
                            <button class="btn btn-primary" onclick="financialReports.showBreakEvenAnalysis()">
                                Open Break-even Analysis
                            </button>
                        </div>
                    </div>
                </div>

                <div class="trends-analysis">
                    <h3>Trends & Insights</h3>
                    <div class="insights-grid">
                        ${this.renderFinancialInsights()}
                    </div>
                </div>
            </div>
        `;
    }

    // Utility methods
    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    generateReport(config) {
        const report = this.financialSystem.generateFinancialReport(config);
        this.currentReport = report;
        this.updateDisplay();
        return report;
    }

    addToHistory(report) {
        this.reportHistory.unshift(report);
        // Keep only last 50 reports
        if (this.reportHistory.length > 50) {
            this.reportHistory = this.reportHistory.slice(0, 50);
        }
    }

    getHealthStatus(value, type) {
        if (type === 'debt') {
            return value < 0.5 ? 'good' : value < 1.0 ? 'warning' : 'poor';
        } else if (type === 'cash') {
            return value > 3 ? 'good' : value > 1 ? 'warning' : 'poor';
        }
        return 'unknown';
    }

    getHealthMessage(value, type) {
        if (type === 'debt') {
            if (value < 0.5) return 'Healthy debt level';
            if (value < 1.0) return 'Manageable debt';
            return 'High debt risk';
        } else if (type === 'cash') {
            if (value > 3) return 'Strong reserves';
            if (value > 1) return 'Adequate reserves';
            return 'Low cash reserves';
        }
        return 'Unknown status';
    }

    getTransactionIcon(type) {
        const icons = {
            sale: '💰',
            expense: '💸',
            payment: '🏦',
            refund: '↩️',
            transfer: '🔄'
        };
        return icons[type] || '📄';
    }

    getCurrentWeek() {
        const now = new Date();
        const year = now.getFullYear();
        const week = Math.ceil((now.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
        return `${year}-W${week.toString().padStart(2, '0')}`;
    }

    getCurrentMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
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

// Initialize global financial reports instance
let financialReports = null;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinancialReports;
}
