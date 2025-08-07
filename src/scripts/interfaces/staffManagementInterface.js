/**
 * Staff Management Interface - Phase 5B UI Implementation
 * Advanced staff scheduling, performance management, and team coordination interface
 * Builds upon Phase 5A hiring interface with comprehensive management tools
 */

class StaffManagementInterface {
    constructor() {
        this.managementSystem = null;
        this.hiringSystem = null;
        this.gameState = null;
        this.eventBus = null;
        
        // UI state
        this.currentView = 'dashboard'; // dashboard, scheduling, performance, training, teams
        this.selectedEmployee = null;
        this.selectedWeek = null;
        this.selectedShift = null;
        this.calendarMode = 'week'; // week, month
        
        // Filters and settings
        this.filters = {
            role: 'all',
            status: 'all',
            performance: 'all',
            department: 'all'
        };
        
        this.viewPreferences = {
            showInactiveEmployees: false,
            autoRefresh: true,
            notificationsEnabled: true,
            compactView: false
        };
    }

    initialize(managementSystem, hiringSystem, gameState, eventBus) {
        this.managementSystem = managementSystem;
        this.hiringSystem = hiringSystem;
        this.gameState = gameState;
        this.eventBus = eventBus;
        
        this.setupEventListeners();
        this.initializeCalendar();
        
        console.log('📊 Staff Management Interface initialized');
    }

    setupEventListeners() {
        // Listen for management events to update UI
        this.eventBus.on('schedule.created', () => this.refreshSchedulingView());
        this.eventBus.on('performance.reviewCompleted', () => this.refreshPerformanceView());
        this.eventBus.on('training.completed', () => this.refreshTrainingView());
        this.eventBus.on('staff.hired', () => this.refreshDashboard());
        this.eventBus.on('shift.start', () => this.refreshActiveShifts());
        this.eventBus.on('shift.end', () => this.refreshActiveShifts());
    }

    initializeCalendar() {
        // Set initial week to current week
        this.selectedWeek = this.managementSystem.getCurrentWeekStart();
    }

    render() {
        return `
            <div class="staff-management-app">
                ${this.renderHeader()}
                ${this.renderNavigation()}
                ${this.renderMainContent()}
                ${this.renderQuickActions()}
                ${this.renderModal()}
            </div>
        `;
    }

    renderHeader() {
        const teamMetrics = this.managementSystem.getTeamMetrics();
        const employees = this.managementSystem.getAvailableEmployees();
        const activeShifts = this.managementSystem.getActiveShifts();
        
        return `
            <div class="management-header">
                <div class="header-title">
                    <h2>📊 Staff Management Center</h2>
                    <p>Comprehensive workforce management and scheduling</p>
                </div>
                
                <div class="team-metrics">
                    <div class="metric-card ${this.getMoraleClass(teamMetrics.morale)}">
                        <div class="metric-icon">😊</div>
                        <div class="metric-info">
                            <span class="metric-value">${teamMetrics.morale}%</span>
                            <span class="metric-label">Team Morale</span>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">⚡</div>
                        <div class="metric-info">
                            <span class="metric-value">${teamMetrics.productivity}%</span>
                            <span class="metric-label">Productivity</span>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">👥</div>
                        <div class="metric-info">
                            <span class="metric-value">${employees.length}</span>
                            <span class="metric-label">Active Staff</span>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">🔄</div>
                        <div class="metric-info">
                            <span class="metric-value">${activeShifts.length}</span>
                            <span class="metric-label">Active Shifts</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderNavigation() {
        const tabs = [
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'scheduling', label: 'Scheduling', icon: '📅' },
            { id: 'performance', label: 'Performance', icon: '⭐' },
            { id: 'training', label: 'Training', icon: '🎓' },
            { id: 'teams', label: 'Team Dynamics', icon: '👥' }
        ];
        
        return `
            <div class="management-navigation">
                ${tabs.map(tab => `
                    <button 
                        class="nav-tab ${this.currentView === tab.id ? 'active' : ''}"
                        onclick="staffManagementInterface.switchView('${tab.id}')"
                    >
                        <span class="tab-icon">${tab.icon}</span>
                        <span class="tab-label">${tab.label}</span>
                    </button>
                `).join('')}
            </div>
        `;
    }

    renderMainContent() {
        switch (this.currentView) {
            case 'dashboard':
                return this.renderDashboard();
            case 'scheduling':
                return this.renderScheduling();
            case 'performance':
                return this.renderPerformance();
            case 'training':
                return this.renderTraining();
            case 'teams':
                return this.renderTeamDynamics();
            default:
                return this.renderDashboard();
        }
    }

    renderDashboard() {
        const employees = this.managementSystem.getAvailableEmployees();
        const recentReviews = this.getRecentPerformanceReviews();
        const upcomingTraining = this.getUpcomingTraining();
        const todayShifts = this.getTodayShifts();
        
        return `
            <div class="management-dashboard">
                <div class="dashboard-section">
                    <h3>🎯 Today's Overview</h3>
                    <div class="today-overview">
                        <div class="overview-card">
                            <h4>📅 Today's Shifts</h4>
                            <div class="shift-list">
                                ${todayShifts.length > 0 ? 
                                    todayShifts.map(shift => this.renderTodayShift(shift)).join('') :
                                    '<p class="no-data">No shifts scheduled for today</p>'
                                }
                            </div>
                        </div>
                        
                        <div class="overview-card">
                            <h4>⏰ Quick Actions</h4>
                            <div class="quick-actions-grid">
                                <button class="action-card" onclick="staffManagementInterface.createWeeklySchedule()">
                                    <span class="action-icon">📅</span>
                                    <span class="action-text">Create Schedule</span>
                                </button>
                                <button class="action-card" onclick="staffManagementInterface.conductPerformanceReviews()">
                                    <span class="action-icon">⭐</span>
                                    <span class="action-text">Performance Reviews</span>
                                </button>
                                <button class="action-card" onclick="staffManagementInterface.assignTraining()">
                                    <span class="action-icon">🎓</span>
                                    <span class="action-text">Assign Training</span>
                                </button>
                                <button class="action-card" onclick="staffManagementInterface.viewTeamStats()">
                                    <span class="action-icon">📊</span>
                                    <span class="action-text">Team Analytics</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3>👥 Staff Overview</h3>
                    <div class="staff-overview">
                        ${employees.length > 0 ? 
                            employees.slice(0, 6).map(emp => this.renderEmployeeSummaryCard(emp)).join('') :
                            '<div class="no-employees">No active employees. <a href="#" onclick="hiringInterface.switchView(\'overview\')">Hire staff</a></div>'
                        }
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3>📋 Recent Activity</h3>
                    <div class="activity-feed">
                        ${this.renderActivityFeed()}
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3>⚠️ Attention Required</h3>
                    <div class="alerts-panel">
                        ${this.renderManagementAlerts()}
                    </div>
                </div>
            </div>
        `;
    }

    renderScheduling() {
        const schedules = this.managementSystem.getSchedules();
        const shiftTemplates = this.managementSystem.getShiftTemplates();
        
        return `
            <div class="scheduling-view">
                <div class="scheduling-header">
                    <h3>📅 Staff Scheduling</h3>
                    <div class="scheduling-controls">
                        <button class="btn primary" onclick="staffManagementInterface.showCreateScheduleModal()">
                            + Create Weekly Schedule
                        </button>
                        <select onchange="staffManagementInterface.changeWeek(this.value)">
                            ${this.renderWeekOptions()}
                        </select>
                        <button class="btn-small" onclick="staffManagementInterface.toggleCalendarMode()">
                            ${this.calendarMode === 'week' ? '📅 Month View' : '📅 Week View'}
                        </button>
                    </div>
                </div>
                
                <div class="scheduling-content">
                    <div class="schedule-calendar">
                        ${this.renderScheduleCalendar()}
                    </div>
                    
                    <div class="scheduling-sidebar">
                        <div class="sidebar-section">
                            <h4>🎯 Shift Templates</h4>
                            <div class="template-list">
                                ${shiftTemplates.map(template => this.renderShiftTemplate(template)).join('')}
                            </div>
                        </div>
                        
                        <div class="sidebar-section">
                            <h4>👥 Available Staff</h4>
                            <div class="available-staff">
                                ${this.renderAvailableStaff()}
                            </div>
                        </div>
                        
                        <div class="sidebar-section">
                            <h4>📊 Schedule Metrics</h4>
                            <div class="schedule-metrics">
                                ${this.renderScheduleMetrics()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderScheduleCalendar() {
        if (this.calendarMode === 'week') {
            return this.renderWeeklyCalendar();
        } else {
            return this.renderMonthlyCalendar();
        }
    }

    renderWeeklyCalendar() {
        const weekStart = new Date(this.selectedWeek);
        const days = [];
        
        // Generate 7 days starting from selected week
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            days.push(day);
        }
        
        return `
            <div class="weekly-calendar">
                <div class="calendar-header">
                    ${days.map(day => `
                        <div class="day-header">
                            <div class="day-name">${day.toLocaleDateString([], { weekday: 'short' })}</div>
                            <div class="day-date">${day.getDate()}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="calendar-body">
                    ${days.map(day => `
                        <div class="day-column" data-date="${day.getTime()}">
                            ${this.renderDayShifts(day)}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderDayShifts(date) {
        const dayShifts = this.getShiftsForDate(date);
        
        if (dayShifts.length === 0) {
            return `
                <div class="empty-day" onclick="staffManagementInterface.addShift('${date.getTime()}')">
                    <span class="add-shift-icon">+</span>
                    <span class="add-shift-text">Add Shift</span>
                </div>
            `;
        }
        
        return dayShifts.map(shift => `
            <div class="shift-block ${shift.status}" onclick="staffManagementInterface.editShift('${shift.id}')">
                <div class="shift-header">
                    <span class="shift-icon">${shift.icon}</span>
                    <span class="shift-name">${shift.name}</span>
                </div>
                <div class="shift-time">${shift.startTime} - ${shift.endTime}</div>
                <div class="shift-staff">
                    ${shift.assignedEmployees.length}/${Object.values(shift.positions).reduce((a, b) => a + b, 0)} staff
                </div>
                <div class="shift-status">${this.formatShiftStatus(shift.status)}</div>
            </div>
        `).join('');
    }

    renderPerformance() {
        const employees = this.managementSystem.getAvailableEmployees();
        const recentReviews = this.getRecentPerformanceReviews();
        
        return `
            <div class="performance-view">
                <div class="performance-header">
                    <h3>⭐ Performance Management</h3>
                    <div class="performance-controls">
                        <button class="btn primary" onclick="staffManagementInterface.showPerformanceReviewModal()">
                            + Conduct Review
                        </button>
                        <select onchange="staffManagementInterface.filterPerformance(this.value)">
                            <option value="all">All Employees</option>
                            <option value="outstanding">Outstanding</option>
                            <option value="exceeds">Exceeds Expectations</option>
                            <option value="satisfactory">Satisfactory</option>
                            <option value="needs_improvement">Needs Improvement</option>
                        </select>
                    </div>
                </div>
                
                <div class="performance-dashboard">
                    <div class="performance-metrics">
                        <div class="metric-summary">
                            <h4>📊 Team Performance Overview</h4>
                            ${this.renderTeamPerformanceChart()}
                        </div>
                        
                        <div class="performance-alerts">
                            <h4>⚠️ Performance Alerts</h4>
                            ${this.renderPerformanceAlerts()}
                        </div>
                    </div>
                    
                    <div class="employee-performance-list">
                        <h4>👥 Individual Performance</h4>
                        <div class="performance-grid">
                            ${employees.map(emp => this.renderEmployeePerformanceCard(emp)).join('')}
                        </div>
                    </div>
                    
                    <div class="recent-reviews">
                        <h4>📋 Recent Reviews</h4>
                        <div class="reviews-list">
                            ${recentReviews.length > 0 ? 
                                recentReviews.map(review => this.renderReviewSummary(review)).join('') :
                                '<p class="no-data">No recent performance reviews</p>'
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderTraining() {
        const trainingPrograms = this.managementSystem.getTrainingPrograms();
        const activeTraining = this.getActiveTraining();
        const employees = this.managementSystem.getAvailableEmployees();
        
        return `
            <div class="training-view">
                <div class="training-header">
                    <h3>🎓 Training & Development</h3>
                    <div class="training-controls">
                        <button class="btn primary" onclick="staffManagementInterface.showAssignTrainingModal()">
                            + Assign Training
                        </button>
                        <button class="btn" onclick="staffManagementInterface.showTrainingReportsModal()">
                            📊 Training Reports
                        </button>
                    </div>
                </div>
                
                <div class="training-dashboard">
                    <div class="training-programs">
                        <h4>📚 Available Programs</h4>
                        <div class="programs-grid">
                            ${trainingPrograms.map(program => this.renderTrainingProgram(program)).join('')}
                        </div>
                    </div>
                    
                    <div class="active-training">
                        <h4>🎯 Active Training</h4>
                        <div class="training-list">
                            ${activeTraining.length > 0 ? 
                                activeTraining.map(training => this.renderActiveTraining(training)).join('') :
                                '<p class="no-data">No active training sessions</p>'
                            }
                        </div>
                    </div>
                    
                    <div class="training-progress">
                        <h4>📈 Progress Tracking</h4>
                        <div class="progress-grid">
                            ${employees.map(emp => this.renderEmployeeTrainingProgress(emp)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderTeamDynamics() {
        const teamMetrics = this.managementSystem.getTeamMetrics();
        const employees = this.managementSystem.getAvailableEmployees();
        
        return `
            <div class="team-dynamics-view">
                <div class="dynamics-header">
                    <h3>👥 Team Dynamics</h3>
                    <p>Monitor team relationships, morale, and collaboration</p>
                </div>
                
                <div class="dynamics-dashboard">
                    <div class="team-health">
                        <h4>💚 Team Health Indicators</h4>
                        <div class="health-metrics">
                            <div class="health-card">
                                <div class="health-icon">😊</div>
                                <div class="health-info">
                                    <span class="health-value">${teamMetrics.morale}%</span>
                                    <span class="health-label">Morale</span>
                                    <div class="health-bar">
                                        <div class="health-fill" style="width: ${teamMetrics.morale}%"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="health-card">
                                <div class="health-icon">⚡</div>
                                <div class="health-info">
                                    <span class="health-value">${teamMetrics.productivity}%</span>
                                    <span class="health-label">Productivity</span>
                                    <div class="health-bar">
                                        <div class="health-fill" style="width: ${teamMetrics.productivity}%"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="health-card">
                                <div class="health-icon">🤝</div>
                                <div class="health-info">
                                    <span class="health-value">85%</span>
                                    <span class="health-label">Collaboration</span>
                                    <div class="health-bar">
                                        <div class="health-fill" style="width: 85%"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="health-card">
                                <div class="health-icon">⭐</div>
                                <div class="health-info">
                                    <span class="health-value">${teamMetrics.satisfaction}%</span>
                                    <span class="health-label">Satisfaction</span>
                                    <div class="health-bar">
                                        <div class="health-fill" style="width: ${teamMetrics.satisfaction}%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="team-structure">
                        <h4>🏗️ Team Structure</h4>
                        <div class="structure-chart">
                            ${this.renderTeamStructureChart(employees)}
                        </div>
                    </div>
                    
                    <div class="team-insights">
                        <h4>💡 Team Insights</h4>
                        <div class="insights-panel">
                            ${this.renderTeamInsights(teamMetrics, employees)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderEmployeeSummaryCard(employee) {
        const performance = employee.performance?.overallRating || 50;
        const status = employee.status;
        
        return `
            <div class="employee-summary-card" onclick="staffManagementInterface.viewEmployeeDetails('${employee.id}')">
                <div class="employee-header">
                    <div class="employee-info">
                        <h4>${employee.name}</h4>
                        <p>${employee.role.icon} ${employee.role.title}</p>
                    </div>
                    <div class="employee-status">
                        <span class="status-badge ${status}">${this.formatStatus(status)}</span>
                    </div>
                </div>
                
                <div class="employee-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Performance</span>
                        <div class="metric-bar">
                            <div class="metric-fill ${this.getPerformanceClass(performance)}" 
                                 style="width: ${performance}%"></div>
                        </div>
                        <span class="metric-value">${performance}%</span>
                    </div>
                </div>
                
                <div class="employee-quick-actions">
                    <button class="btn-small" onclick="staffManagementInterface.scheduleEmployee('${employee.id}'); event.stopPropagation();">
                        📅 Schedule
                    </button>
                    <button class="btn-small" onclick="staffManagementInterface.reviewEmployee('${employee.id}'); event.stopPropagation();">
                        ⭐ Review
                    </button>
                </div>
            </div>
        `;
    }

    renderShiftTemplate(template) {
        const totalPositions = Object.values(template.positions).reduce((sum, count) => sum + count, 0);
        
        return `
            <div class="shift-template" onclick="staffManagementInterface.useTemplate('${template.id}')">
                <div class="template-header">
                    <span class="template-icon">${template.icon}</span>
                    <span class="template-name">${template.name}</span>
                </div>
                <div class="template-details">
                    <span class="template-time">${template.startTime} - ${template.endTime}</span>
                    <span class="template-staff">${totalPositions} positions</span>
                    <span class="template-priority priority-${template.priority}">${template.priority}</span>
                </div>
            </div>
        `;
    }

    renderModal() {
        return `
            <div id="staffManagementModal" class="modal-overlay" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modalTitle">Modal Title</h3>
                        <button class="modal-close" onclick="staffManagementInterface.closeModal()">×</button>
                    </div>
                    <div class="modal-body" id="modalBody">
                        <!-- Dynamic content -->
                    </div>
                </div>
            </div>
        `;
    }

    // UI State Management
    switchView(view) {
        this.currentView = view;
        this.refreshUI();
    }

    refreshUI() {
        const mainContent = document.querySelector('.staff-management-app .management-main');
        if (mainContent) {
            mainContent.innerHTML = this.renderMainContent();
        }
    }

    refreshDashboard() {
        if (this.currentView === 'dashboard') {
            this.refreshUI();
        }
    }

    refreshSchedulingView() {
        if (this.currentView === 'scheduling') {
            this.refreshUI();
        }
    }

    refreshPerformanceView() {
        if (this.currentView === 'performance') {
            this.refreshUI();
        }
    }

    refreshTrainingView() {
        if (this.currentView === 'training') {
            this.refreshUI();
        }
    }

    refreshActiveShifts() {
        // Update any active shift displays
        const activeShiftElements = document.querySelectorAll('.active-shift');
        activeShiftElements.forEach(element => {
            // Update shift status or information
        });
    }

    // Modal Management
    showModal(title, content) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('staffManagementModal').style.display = 'flex';
    }

    closeModal() {
        document.getElementById('staffManagementModal').style.display = 'none';
    }

    // Action Handlers
    async createWeeklySchedule() {
        const weekStart = this.selectedWeek || this.managementSystem.getCurrentWeekStart();
        
        try {
            const schedule = await this.managementSystem.createWeeklySchedule(weekStart, {
                autoAssign: true,
                considerPreferences: true,
                optimizeForCosts: true
            });
            
            if (schedule) {
                this.refreshSchedulingView();
                console.log('✅ Weekly schedule created successfully');
            }
        } catch (error) {
            console.error('❌ Error creating schedule:', error);
            alert('Failed to create schedule. Please try again.');
        }
    }

    async conductPerformanceReviews() {
        this.switchView('performance');
        // Could auto-select employees due for review
    }

    async assignTraining() {
        this.switchView('training');
        // Could show quick training assignment interface
    }

    viewTeamStats() {
        this.switchView('teams');
    }

    // Utility Methods
    formatStatus(status) {
        const statusMap = {
            'active': 'Active',
            'probation': 'Probation',
            'inactive': 'Inactive',
            'terminated': 'Terminated'
        };
        return statusMap[status] || status;
    }

    formatShiftStatus(status) {
        const statusMap = {
            'scheduled': 'Scheduled',
            'active': 'In Progress',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    }

    getMoraleClass(morale) {
        if (morale >= 80) return 'excellent';
        if (morale >= 60) return 'good';
        if (morale >= 40) return 'average';
        return 'poor';
    }

    getPerformanceClass(performance) {
        if (performance >= 80) return 'excellent';
        if (performance >= 70) return 'good';
        if (performance >= 60) return 'average';
        if (performance >= 50) return 'below-average';
        return 'poor';
    }

    // Data Helper Methods
    getTodayShifts() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.getShiftsForDate(today);
    }

    getShiftsForDate(date) {
        const schedules = this.managementSystem.getSchedules();
        const shifts = [];
        
        schedules.forEach(schedule => {
            schedule.shifts.forEach(shift => {
                const shiftDate = new Date(shift.date);
                shiftDate.setHours(0, 0, 0, 0);
                
                if (shiftDate.getTime() === date.getTime()) {
                    shifts.push(shift);
                }
            });
        });
        
        return shifts.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    getRecentPerformanceReviews() {
        // Mock implementation - would get from management system
        return [];
    }

    getUpcomingTraining() {
        // Mock implementation - would get from management system
        return [];
    }

    getActiveTraining() {
        // Mock implementation - would get from management system
        return [];
    }

    renderWeekOptions() {
        const options = [];
        const currentWeek = this.managementSystem.getCurrentWeekStart();
        
        // Generate options for current week and next 4 weeks
        for (let i = 0; i < 5; i++) {
            const weekStart = new Date(currentWeek + (i * 7 * 24 * 60 * 60 * 1000));
            const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
            
            options.push(`
                <option value="${weekStart.getTime()}" ${this.selectedWeek === weekStart.getTime() ? 'selected' : ''}>
                    ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}
                </option>
            `);
        }
        
        return options.join('');
    }

    renderActivityFeed() {
        // Mock activity feed - would be populated with real events
        return `
            <div class="activity-item">
                <span class="activity-icon">👤</span>
                <span class="activity-text">John Smith completed Customer Service Training</span>
                <span class="activity-time">2 hours ago</span>
            </div>
            <div class="activity-item">
                <span class="activity-icon">📅</span>
                <span class="activity-text">Weekly schedule published for next week</span>
                <span class="activity-time">5 hours ago</span>
            </div>
            <div class="activity-item">
                <span class="activity-icon">⭐</span>
                <span class="activity-text">Performance review completed for Sarah Wilson</span>
                <span class="activity-time">1 day ago</span>
            </div>
        `;
    }

    renderManagementAlerts() {
        // Mock alerts - would be generated based on actual conditions
        return `
            <div class="alert-item warning">
                <span class="alert-icon">⚠️</span>
                <span class="alert-text">3 employees need performance reviews this week</span>
                <button class="alert-action" onclick="staffManagementInterface.conductPerformanceReviews()">Review</button>
            </div>
            <div class="alert-item info">
                <span class="alert-icon">📚</span>
                <span class="alert-text">New training programs available</span>
                <button class="alert-action" onclick="staffManagementInterface.viewTraining()">View</button>
            </div>
        `;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StaffManagementInterface;
} else if (typeof window !== 'undefined') {
    window.StaffManagementInterface = StaffManagementInterface;
}
