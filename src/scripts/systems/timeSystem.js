/**
 * Time System - Handles day/week progression and time-based events
 */

class TimeSystem {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.isRunning = false;
        this.interval = null;
        this.tickSpeed = 1000; // milliseconds per game minute
        this.autoSaveInterval = 30; // minutes between auto-saves
        this.lastAutoSave = 0;
        
        // Time constants
        this.MINUTES_PER_HOUR = 60;
        this.HOURS_PER_DAY = 24;
        this.DAYS_PER_WEEK = 7;
        this.WEEKS_PER_MONTH = 4;
        
        // Business hours
        this.DEFAULT_OPEN_TIME = "09:00";
        this.DEFAULT_CLOSE_TIME = "21:00";
        
        // Event scheduling
        this.scheduledEvents = [];
        this.recurringEvents = [];
    }

    initialize(gameState, eventBus) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        
        // Listen for time-related events
        this.eventBus.on('game.start', () => this.start());
        this.eventBus.on('game.pause', () => this.pause());
        this.eventBus.on('game.resume', () => this.resume());
        this.eventBus.on('game.stop', () => this.stop());
        this.eventBus.on('time.setSpeed', (speed) => this.setSpeed(speed));
        this.eventBus.on('store.openClose', (isOpen) => this.toggleStore(isOpen));
        
        console.log('⏰ Time System initialized');
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.gameState.data.time.lastUpdate = Date.now();
        
        this.interval = setInterval(() => {
            this.tick();
        }, this.tickSpeed);
        
        this.eventBus.emit('time.started');
        console.log('⏰ Time system started');
    }

    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        this.eventBus.emit('time.paused');
        console.log('⏰ Time system paused');
    }

    resume() {
        if (this.isRunning) return;
        this.start();
        this.eventBus.emit('time.resumed');
    }

    stop() {
        this.pause();
        this.eventBus.emit('time.stopped');
        console.log('⏰ Time system stopped');
    }

    tick() {
        if (!this.isRunning) return;
        
        const timeData = this.gameState.data.time;
        const now = Date.now();
        const deltaTime = now - timeData.lastUpdate;
        
        // Calculate minutes passed based on time speed
        const minutesPassed = (deltaTime / 1000) * timeData.speed;
        
        // Update game time
        this.addMinutes(minutesPassed);
        timeData.lastUpdate = now;
        
        // Update playtime
        this.gameState.data.meta.playtime += deltaTime / 1000;
        
        // Check for scheduled events
        this.processScheduledEvents();
        
        // Auto-save check
        this.checkAutoSave();
        
        // Emit time update event
        this.eventBus.emit('time.updated', {
            time: timeData.currentTime,
            day: timeData.currentDay,
            week: timeData.currentWeek,
            dayOfWeek: timeData.dayOfWeek
        });
    }

    addMinutes(minutes) {
        const timeData = this.gameState.data.time;
        const currentTime = this.timeToMinutes(timeData.currentTime);
        const newTime = currentTime + minutes;
        
        // Handle day overflow
        if (newTime >= this.MINUTES_PER_HOUR * this.HOURS_PER_DAY) {
            const daysToAdd = Math.floor(newTime / (this.MINUTES_PER_HOUR * this.HOURS_PER_DAY));
            this.addDays(daysToAdd);
            
            const remainingMinutes = newTime % (this.MINUTES_PER_HOUR * this.HOURS_PER_DAY);
            timeData.currentTime = this.minutesToTime(remainingMinutes);
        } else {
            timeData.currentTime = this.minutesToTime(newTime);
        }
        
        // Check store hours
        this.updateStoreStatus();
    }

    addDays(days) {
        const timeData = this.gameState.data.time;
        
        for (let i = 0; i < days; i++) {
            timeData.currentDay++;
            timeData.dayOfWeek++;
            
            if (timeData.dayOfWeek > 7) {
                timeData.dayOfWeek = 1;
                timeData.currentWeek++;
                this.processWeekEnd();
            }
            
            if (timeData.currentWeek > this.WEEKS_PER_MONTH) {
                timeData.currentWeek = 1;
                timeData.currentMonth++;
                this.processMonthEnd();
            }
            
            this.processDayEnd();
            this.processDayStart();
        }
    }

    processDayStart() {
        const timeData = this.gameState.data.time;
        
        // Reset daily stats
        this.gameState.data.player.stats.energy = Math.min(100, 
            this.gameState.data.player.stats.energy + 20);
        
        // Process daily expenses
        this.processDailyExpenses();
        
        // Generate daily events
        this.generateDailyEvents();
        
        // Update NPC availability
        this.updateNPCAvailability();
        
        this.eventBus.emit('time.dayStart', {
            day: timeData.currentDay,
            dayOfWeek: timeData.dayOfWeek,
            week: timeData.currentWeek
        });
        
        console.log(`🌅 Day ${timeData.currentDay} (${this.getDayName(timeData.dayOfWeek)}) started`);
    }

    processDayEnd() {
        const timeData = this.gameState.data.time;
        
        // Force close store
        timeData.isOpen = false;
        
        // Process end-of-day finances
        this.processEndOfDayFinances();
        
        // Update staff schedules
        this.updateStaffSchedules();
        
        // Process relationship decay
        this.processRelationshipDecay();
        
        this.eventBus.emit('time.dayEnd', {
            day: timeData.currentDay,
            week: timeData.currentWeek,
            sales: this.getDailySales()
        });
        
        console.log(`🌙 Day ${timeData.currentDay} ended`);
    }

    processWeekEnd() {
        // Pay staff
        this.processWeeklyPayroll();
        
        // Process debt payments
        this.processDebtPayments();
        
        // Generate weekly reports
        this.generateWeeklyReport();
        
        this.eventBus.emit('time.weekEnd', {
            week: this.gameState.data.time.currentWeek,
            revenue: this.getWeeklyRevenue()
        });
        
        console.log(`📊 Week ${this.gameState.data.time.currentWeek} ended`);
    }

    processMonthEnd() {
        // Pay monthly expenses (rent, insurance, etc.)
        this.processMonthlyExpenses();
        
        // Update market conditions
        this.updateMarketConditions();
        
        // Generate monthly report
        this.generateMonthlyReport();
        
        this.eventBus.emit('time.monthEnd', {
            month: this.gameState.data.time.currentMonth,
            profit: this.getMonthlyProfit()
        });
        
        console.log(`📈 Month ${this.gameState.data.time.currentMonth} ended`);
    }

    updateStoreStatus() {
        const timeData = this.gameState.data.time;
        const storeHours = this.gameState.data.store.hours;
        const dayName = this.getDayName(timeData.dayOfWeek).toLowerCase();
        const dayHours = storeHours[dayName];
        
        if (!dayHours || dayHours.closed) {
            timeData.isOpen = false;
            return;
        }
        
        const currentMinutes = this.timeToMinutes(timeData.currentTime);
        const openMinutes = this.timeToMinutes(dayHours.open);
        const closeMinutes = this.timeToMinutes(dayHours.close);
        
        const wasOpen = timeData.isOpen;
        timeData.isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
        
        // Emit events on status change
        if (wasOpen !== timeData.isOpen) {
            this.eventBus.emit('store.statusChanged', {
                isOpen: timeData.isOpen,
                time: timeData.currentTime
            });
            
            if (timeData.isOpen) {
                this.eventBus.emit('store.opened');
                console.log('🏪 Store opened for business');
            } else {
                this.eventBus.emit('store.closed');
                console.log('🔒 Store closed');
            }
        }
    }

    // Utility Methods
    timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * this.MINUTES_PER_HOUR + minutes;
    }

    minutesToTime(minutes) {
        const hours = Math.floor(minutes / this.MINUTES_PER_HOUR);
        const mins = Math.floor(minutes % this.MINUTES_PER_HOUR);
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    getDayName(dayNumber) {
        const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return days[dayNumber] || 'Unknown';
    }

    setSpeed(speed) {
        this.gameState.data.time.speed = Math.max(0.1, Math.min(10, speed));
        this.eventBus.emit('time.speedChanged', this.gameState.data.time.speed);
    }

    toggleStore(isOpen) {
        this.gameState.data.time.isOpen = isOpen;
        this.eventBus.emit('store.statusChanged', { isOpen });
    }

    // Event Scheduling
    scheduleEvent(eventData, triggerTime) {
        this.scheduledEvents.push({
            ...eventData,
            triggerTime,
            id: this.generateEventId()
        });
    }

    scheduleRecurring(eventData, interval, triggerCondition) {
        this.recurringEvents.push({
            ...eventData,
            interval,
            triggerCondition,
            lastTriggered: 0,
            id: this.generateEventId()
        });
    }

    processScheduledEvents() {
        const currentTime = this.getCurrentTimeStamp();
        
        // Process one-time events
        this.scheduledEvents = this.scheduledEvents.filter(event => {
            if (currentTime >= event.triggerTime) {
                this.eventBus.emit('event.triggered', event);
                return false; // Remove from array
            }
            return true; // Keep in array
        });
        
        // Process recurring events
        this.recurringEvents.forEach(event => {
            if (currentTime - event.lastTriggered >= event.interval) {
                if (!event.triggerCondition || event.triggerCondition()) {
                    this.eventBus.emit('event.triggered', event);
                    event.lastTriggered = currentTime;
                }
            }
        });
    }

    getCurrentTimeStamp() {
        const timeData = this.gameState.data.time;
        return timeData.currentDay * 1440 + this.timeToMinutes(timeData.currentTime);
    }

    generateEventId() {
        return 'event_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    // Financial Processing Methods
    processDailyExpenses() {
        const expenses = this.gameState.data.finances.dailyExpenses;
        let totalExpenses = 0;
        
        Object.entries(expenses).forEach(([type, amount]) => {
            this.gameState.data.finances.cash -= amount;
            totalExpenses += amount;
            
            this.gameState.data.finances.transactions.push({
                id: this.generateEventId(),
                type: 'expense',
                category: type,
                amount: -amount,
                timestamp: Date.now(),
                description: `Daily ${type}`
            });
        });
        
        this.eventBus.emit('finances.dailyExpenses', { total: totalExpenses });
    }

    processEndOfDayFinances() {
        // Calculate daily profit/loss
        const dailySales = this.getDailySales();
        const dailyExpenses = Object.values(this.gameState.data.finances.dailyExpenses)
            .reduce((sum, expense) => sum + expense, 0);
        
        const dailyProfit = dailySales - dailyExpenses;
        
        this.eventBus.emit('finances.dailyReport', {
            sales: dailySales,
            expenses: dailyExpenses,
            profit: dailyProfit
        });
    }

    processWeeklyPayroll() {
        const staff = this.gameState.data.staff;
        let totalPayroll = 0;
        
        staff.employees.forEach(employee => {
            const weeklyPay = employee.hourlyRate * employee.hoursWorked;
            this.gameState.data.finances.cash -= weeklyPay;
            totalPayroll += weeklyPay;
            
            // Reset hours for next week
            employee.hoursWorked = 0;
            
            this.gameState.data.finances.transactions.push({
                id: this.generateEventId(),
                type: 'expense',
                category: 'payroll',
                amount: -weeklyPay,
                timestamp: Date.now(),
                description: `Weekly pay for ${employee.name}`
            });
        });
        
        staff.payroll.totalWeekly = totalPayroll;
        staff.payroll.lastPayDate = this.gameState.data.time.currentDay;
        
        this.eventBus.emit('finances.payroll', { total: totalPayroll });
    }

    processDebtPayments() {
        const debt = this.gameState.data.finances.debt;
        const currentDay = this.gameState.data.time.currentDay;
        
        // Check each debt for due payments
        Object.entries(debt).forEach(([debtType, debtData]) => {
            if (currentDay >= debtData.dueDate) {
                this.eventBus.emit('debt.paymentDue', {
                    type: debtType,
                    amount: debtData.nextPayment,
                    daysOverdue: currentDay - debtData.dueDate
                });
            }
        });
    }

    processMonthlyExpenses() {
        // Rent, insurance, utilities
        const monthlyExpenses = {
            rent: 6000,
            insurance: 750,
            utilities: 1500
        };
        
        Object.entries(monthlyExpenses).forEach(([type, amount]) => {
            this.gameState.data.finances.cash -= amount;
            
            this.gameState.data.finances.transactions.push({
                id: this.generateEventId(),
                type: 'expense',
                category: type,
                amount: -amount,
                timestamp: Date.now(),
                description: `Monthly ${type}`
            });
        });
    }

    // Helper Methods for Financial Calculations
    getDailySales() {
        const today = this.gameState.data.time.currentDay;
        return this.gameState.data.finances.transactions
            .filter(t => t.type === 'sale' && this.isSameDay(t.timestamp, today))
            .reduce((sum, t) => sum + t.amount, 0);
    }

    getWeeklyRevenue() {
        const currentWeek = this.gameState.data.time.currentWeek;
        return this.gameState.data.finances.transactions
            .filter(t => t.type === 'sale' && this.isSameWeek(t.timestamp, currentWeek))
            .reduce((sum, t) => sum + t.amount, 0);
    }

    getMonthlyProfit() {
        const currentMonth = this.gameState.data.time.currentMonth;
        const transactions = this.gameState.data.finances.transactions
            .filter(t => this.isSameMonth(t.timestamp, currentMonth));
        
        const revenue = transactions
            .filter(t => t.type === 'sale')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        return revenue - expenses;
    }

    // Auto-save functionality
    checkAutoSave() {
        if (!this.gameState.data.settings.autoSave) return;
        
        const currentMinutes = this.getCurrentTimeStamp();
        if (currentMinutes - this.lastAutoSave >= this.autoSaveInterval) {
            this.eventBus.emit('game.autoSave');
            this.lastAutoSave = currentMinutes;
        }
    }

    // Placeholder methods for future implementation
    generateDailyEvents() {
        // TODO: Generate random daily events
    }

    updateNPCAvailability() {
        // TODO: Update which NPCs are available today
    }

    updateStaffSchedules() {
        // TODO: Update staff schedules for next day
    }

    processRelationshipDecay() {
        // TODO: Slowly decay relationships that aren't maintained
    }

    generateWeeklyReport() {
        // TODO: Generate comprehensive weekly business report
    }

    generateMonthlyReport() {
        // TODO: Generate comprehensive monthly business report
    }

    updateMarketConditions() {
        // TODO: Update product demand, pricing, competition
    }

    // Date comparison helpers
    isSameDay(timestamp, gameDay) {
        // Convert timestamp to game day and compare
        // This is a simplified implementation
        return true; // TODO: Implement proper date comparison
    }

    isSameWeek(timestamp, gameWeek) {
        // Convert timestamp to game week and compare
        return true; // TODO: Implement proper date comparison
    }

    isSameMonth(timestamp, gameMonth) {
        // Convert timestamp to game month and compare
        return true; // TODO: Implement proper date comparison
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeSystem;
} else if (typeof window !== 'undefined') {
    window.TimeSystem = TimeSystem;
}
