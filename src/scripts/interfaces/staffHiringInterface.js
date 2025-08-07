/**
 * Staff Hiring Interface - Phase 5A UI Implementation
 * Complete hiring management interface for the workstation system
 * Handles job postings, applications, interviews, and hiring decisions
 */

class StaffHiringInterface {
    constructor() {
        this.hiringSystem = null;
        this.gameState = null;
        this.eventBus = null;
        
        // UI state
        this.currentView = 'overview'; // overview, postings, applications, interviews, employees
        this.selectedApplication = null;
        this.selectedJobPosting = null;
        this.interviewInProgress = false;
        
        // Filters and sorting
        this.applicationFilters = {
            status: 'all',
            role: 'all',
            qualificationScore: 0
        };
        
        this.sortOptions = {
            applications: 'submittedDate', // submittedDate, qualificationScore, name
            employees: 'hireDate' // hireDate, name, performance
        };
    }

    initialize(hiringSystem, gameState, eventBus) {
        this.hiringSystem = hiringSystem;
        this.gameState = gameState;
        this.eventBus = eventBus;
        
        this.setupEventListeners();
        console.log('💼 Staff Hiring Interface initialized');
    }

    setupEventListeners() {
        // Listen for hiring events to update UI
        this.eventBus.on('hiring.applicationReceived', () => this.refreshApplicationsList());
        this.eventBus.on('hiring.interviewCompleted', () => this.refreshApplicationsList());
        this.eventBus.on('hiring.offerAccepted', () => this.refreshEmployeesList());
        this.eventBus.on('staff.hired', () => this.refreshEmployeesList());
    }

    render() {
        return `
            <div class="staff-hiring-app">
                ${this.renderHeader()}
                ${this.renderNavigation()}
                ${this.renderMainContent()}
                ${this.renderModal()}
            </div>
        `;
    }

    renderHeader() {
        const metrics = this.hiringSystem.getHiringMetrics();
        const openPositions = this.hiringSystem.getOpenPositions().length;
        const pendingApplications = this.hiringSystem.getApplications('submitted').length;
        
        return `
            <div class="hiring-header">
                <div class="header-title">
                    <h2>👔 Staff Hiring Center</h2>
                    <p>Recruit and manage your store's workforce</p>
                </div>
                
                <div class="hiring-metrics">
                    <div class="metric-card">
                        <div class="metric-icon">📢</div>
                        <div class="metric-info">
                            <span class="metric-value">${openPositions}</span>
                            <span class="metric-label">Open Positions</span>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">📄</div>
                        <div class="metric-info">
                            <span class="metric-value">${pendingApplications}</span>
                            <span class="metric-label">New Applications</span>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">🎤</div>
                        <div class="metric-info">
                            <span class="metric-value">${metrics.totalInterviews}</span>
                            <span class="metric-label">Total Interviews</span>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">✅</div>
                        <div class="metric-info">
                            <span class="metric-value">${metrics.totalHires}</span>
                            <span class="metric-label">Total Hires</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderNavigation() {
        const tabs = [
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'postings', label: 'Job Postings', icon: '📢' },
            { id: 'applications', label: 'Applications', icon: '📄' },
            { id: 'interviews', label: 'Interviews', icon: '🎤' },
            { id: 'employees', label: 'Employees', icon: '👥' }
        ];
        
        return `
            <div class="hiring-navigation">
                ${tabs.map(tab => `
                    <button 
                        class="nav-tab ${this.currentView === tab.id ? 'active' : ''}"
                        onclick="hiringInterface.switchView('${tab.id}')"
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
            case 'overview':
                return this.renderOverview();
            case 'postings':
                return this.renderJobPostings();
            case 'applications':
                return this.renderApplications();
            case 'interviews':
                return this.renderInterviews();
            case 'employees':
                return this.renderEmployees();
            default:
                return this.renderOverview();
        }
    }

    renderOverview() {
        const jobRoles = this.hiringSystem.getJobRoles();
        const openPositions = this.hiringSystem.getOpenPositions();
        const recentApplications = this.hiringSystem.getApplications()
            .sort((a, b) => b.submittedDate - a.submittedDate)
            .slice(0, 5);
        
        return `
            <div class="hiring-overview">
                <div class="overview-section">
                    <h3>🎯 Quick Actions</h3>
                    <div class="quick-actions">
                        <button class="action-btn primary" onclick="hiringInterface.showPostJobModal()">
                            <span class="btn-icon">📢</span>
                            Post New Job
                        </button>
                        <button class="action-btn" onclick="hiringInterface.switchView('applications')">
                            <span class="btn-icon">📄</span>
                            Review Applications
                        </button>
                        <button class="action-btn" onclick="hiringInterface.switchView('interviews')">
                            <span class="btn-icon">🎤</span>
                            Schedule Interviews
                        </button>
                    </div>
                </div>
                
                <div class="overview-section">
                    <h3>💼 Available Positions</h3>
                    <div class="job-roles-grid">
                        ${jobRoles.map(role => this.renderJobRoleCard(role, openPositions)).join('')}
                    </div>
                </div>
                
                <div class="overview-section">
                    <h3>📋 Recent Applications</h3>
                    <div class="recent-applications">
                        ${recentApplications.length > 0 ? 
                            recentApplications.map(app => this.renderApplicationSummary(app)).join('') :
                            '<p class="no-data">No recent applications</p>'
                        }
                    </div>
                </div>
            </div>
        `;
    }

    renderJobRoleCard(role, openPositions) {
        const hasOpenPosition = openPositions.some(pos => pos.roleId === role.id);
        const currentEmployees = this.gameState.staff.employees.filter(emp => emp.role.id === role.id);
        
        return `
            <div class="job-role-card ${hasOpenPosition ? 'has-opening' : ''}">
                <div class="role-header">
                    <span class="role-icon">${role.icon}</span>
                    <h4>${role.title}</h4>
                </div>
                
                <div class="role-info">
                    <p class="role-description">${role.description}</p>
                    <div class="role-details">
                        <span class="detail-item">💰 $${role.dailyWage}/day</span>
                        <span class="detail-item">👥 ${currentEmployees.length} employed</span>
                        <span class="detail-item">⏰ ${role.maxHours}h max</span>
                    </div>
                </div>
                
                <div class="role-actions">
                    ${hasOpenPosition ? 
                        '<span class="status-badge active">Position Open</span>' :
                        `<button class="btn-small" onclick="hiringInterface.postJob('${role.id}')">Post Job</button>`
                    }
                </div>
            </div>
        `;
    }

    renderApplicationSummary(application) {
        const timeAgo = this.formatTimeAgo(application.submittedDate);
        const role = this.hiringSystem.getJobRoles().find(r => r.id === application.jobPostingId);
        
        return `
            <div class="application-summary" onclick="hiringInterface.viewApplication('${application.id}')">
                <div class="summary-info">
                    <span class="applicant-name">${application.applicant.name}</span>
                    <span class="applied-role">${role?.title || 'Unknown Role'}</span>
                </div>
                <div class="summary-details">
                    <span class="qualification-score">${application.qualificationScore}% match</span>
                    <span class="application-time">${timeAgo}</span>
                </div>
                <div class="summary-status">
                    <span class="status-badge ${application.status}">${this.formatStatus(application.status)}</span>
                </div>
            </div>
        `;
    }

    renderJobPostings() {
        const openPositions = this.hiringSystem.getOpenPositions();
        const jobRoles = this.hiringSystem.getJobRoles();
        
        return `
            <div class="job-postings-view">
                <div class="view-header">
                    <h3>📢 Job Postings</h3>
                    <button class="btn primary" onclick="hiringInterface.showPostJobModal()">
                        + Post New Job
                    </button>
                </div>
                
                <div class="postings-list">
                    ${openPositions.length > 0 ? 
                        openPositions.map(posting => this.renderJobPosting(posting)).join('') :
                        this.renderNoPostings()
                    }
                </div>
                
                <div class="available-roles">
                    <h4>💼 Available Roles to Post</h4>
                    <div class="roles-grid">
                        ${jobRoles.map(role => this.renderPostableRole(role, openPositions)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderJobPosting(posting) {
        const role = posting.role;
        const postedTime = this.formatTimeAgo(posting.postedDate);
        
        return `
            <div class="job-posting-card">
                <div class="posting-header">
                    <div class="posting-title">
                        <span class="role-icon">${role.icon}</span>
                        <h4>${role.title}</h4>
                        <span class="urgency-badge ${posting.urgency}">${posting.urgency}</span>
                    </div>
                    <div class="posting-actions">
                        <button class="btn-small" onclick="hiringInterface.editPosting('${posting.id}')">Edit</button>
                        <button class="btn-small danger" onclick="hiringInterface.closePosting('${posting.id}')">Close</button>
                    </div>
                </div>
                
                <div class="posting-info">
                    <p>${role.description}</p>
                    <div class="posting-details">
                        <span class="detail">💰 $${posting.salaryOffer}/day</span>
                        <span class="detail">📄 ${posting.applicationsReceived} applications</span>
                        <span class="detail">⏰ Posted ${postedTime}</span>
                    </div>
                </div>
                
                <div class="posting-requirements">
                    <h5>Requirements:</h5>
                    <ul>
                        <li>Experience: ${this.formatExperience(role.requirements.experience)}</li>
                        <li>Education: ${this.formatEducation(role.requirements.education)}</li>
                        <li>Skills: ${role.requirements.skills.join(', ')}</li>
                        ${role.requirements.backgroundCheck ? '<li>Background check required</li>' : ''}
                    </ul>
                </div>
            </div>
        `;
    }

    renderNoPostings() {
        return `
            <div class="no-postings">
                <div class="no-data-icon">📢</div>
                <h4>No Active Job Postings</h4>
                <p>Create your first job posting to start recruiting talent for your store.</p>
                <button class="btn primary" onclick="hiringInterface.showPostJobModal()">
                    Post Your First Job
                </button>
            </div>
        `;
    }

    renderPostableRole(role, openPositions) {
        const hasOpenPosition = openPositions.some(pos => pos.roleId === role.id);
        
        if (hasOpenPosition) return '';
        
        return `
            <div class="postable-role" onclick="hiringInterface.postJob('${role.id}')">
                <span class="role-icon">${role.icon}</span>
                <span class="role-title">${role.title}</span>
                <span class="role-wage">$${role.dailyWage}/day</span>
            </div>
        `;
    }

    renderApplications() {
        const applications = this.getFilteredApplications();
        
        return `
            <div class="applications-view">
                <div class="view-header">
                    <h3>📄 Job Applications</h3>
                    ${this.renderApplicationFilters()}
                </div>
                
                <div class="applications-list">
                    ${applications.length > 0 ? 
                        applications.map(app => this.renderApplicationCard(app)).join('') :
                        '<div class="no-data">No applications match your filters</div>'
                    }
                </div>
            </div>
        `;
    }

    renderApplicationFilters() {
        const statuses = ['all', 'submitted', 'reviewed', 'interview_scheduled', 'interviewed', 'offer_made', 'hired', 'rejected'];
        const roles = ['all', ...this.hiringSystem.getJobRoles().map(r => r.id)];
        
        return `
            <div class="application-filters">
                <select onchange="hiringInterface.updateFilter('status', this.value)">
                    ${statuses.map(status => `
                        <option value="${status}" ${this.applicationFilters.status === status ? 'selected' : ''}>
                            ${this.formatStatus(status)}
                        </option>
                    `).join('')}
                </select>
                
                <select onchange="hiringInterface.updateFilter('role', this.value)">
                    ${roles.map(role => `
                        <option value="${role}" ${this.applicationFilters.role === role ? 'selected' : ''}>
                            ${role === 'all' ? 'All Roles' : this.formatRoleName(role)}
                        </option>
                    `).join('')}
                </select>
                
                <div class="score-filter">
                    <label>Min Score: ${this.applicationFilters.qualificationScore}%</label>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value="${this.applicationFilters.qualificationScore}"
                        onchange="hiringInterface.updateFilter('qualificationScore', this.value)"
                    >
                </div>
            </div>
        `;
    }

    renderApplicationCard(application) {
        const applicant = application.applicant;
        const timeAgo = this.formatTimeAgo(application.submittedDate);
        const role = this.hiringSystem.getJobRoles().find(r => r.id === application.jobPostingId);
        
        return `
            <div class="application-card" onclick="hiringInterface.viewApplication('${application.id}')">
                <div class="application-header">
                    <div class="applicant-info">
                        <h4>${applicant.name}</h4>
                        <p>Applied for ${role?.title || 'Unknown Role'}</p>
                    </div>
                    <div class="application-score">
                        <div class="score-circle ${this.getScoreClass(application.qualificationScore)}">
                            ${application.qualificationScore}%
                        </div>
                    </div>
                </div>
                
                <div class="application-details">
                    <div class="detail-row">
                        <span class="label">Experience:</span>
                        <span class="value">${this.formatExperience(applicant.employment.experience.length)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Skills:</span>
                        <span class="value">${Object.keys(applicant.employment.skills).slice(0, 3).join(', ')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Applied:</span>
                        <span class="value">${timeAgo}</span>
                    </div>
                </div>
                
                <div class="application-footer">
                    <span class="status-badge ${application.status}">${this.formatStatus(application.status)}</span>
                    <div class="quick-actions">
                        ${this.renderApplicationQuickActions(application)}
                    </div>
                </div>
            </div>
        `;
    }

    renderApplicationQuickActions(application) {
        switch (application.status) {
            case 'submitted':
                return `
                    <button class="btn-small" onclick="hiringInterface.scheduleInterview('${application.id}'); event.stopPropagation();">
                        📅 Interview
                    </button>
                    <button class="btn-small danger" onclick="hiringInterface.rejectApplication('${application.id}'); event.stopPropagation();">
                        ❌ Reject
                    </button>
                `;
            case 'interview_scheduled':
                return `
                    <button class="btn-small" onclick="hiringInterface.conductInterview('${application.id}'); event.stopPropagation();">
                        🎤 Conduct
                    </button>
                `;
            case 'interviewed':
                return `
                    <button class="btn-small" onclick="hiringInterface.makeOffer('${application.id}'); event.stopPropagation();">
                        💼 Make Offer
                    </button>
                    <button class="btn-small danger" onclick="hiringInterface.rejectApplication('${application.id}'); event.stopPropagation();">
                        ❌ Reject
                    </button>
                `;
            default:
                return '';
        }
    }

    renderInterviews() {
        const scheduledInterviews = this.hiringSystem.getApplications('interview_scheduled');
        const completedInterviews = this.hiringSystem.getApplications('interviewed');
        
        return `
            <div class="interviews-view">
                <div class="view-header">
                    <h3>🎤 Interviews</h3>
                </div>
                
                <div class="interviews-section">
                    <h4>📅 Scheduled Interviews (${scheduledInterviews.length})</h4>
                    <div class="interviews-list">
                        ${scheduledInterviews.length > 0 ? 
                            scheduledInterviews.map(app => this.renderScheduledInterview(app)).join('') :
                            '<p class="no-data">No interviews scheduled</p>'
                        }
                    </div>
                </div>
                
                <div class="interviews-section">
                    <h4>✅ Completed Interviews (${completedInterviews.length})</h4>
                    <div class="interviews-list">
                        ${completedInterviews.length > 0 ? 
                            completedInterviews.map(app => this.renderCompletedInterview(app)).join('') :
                            '<p class="no-data">No completed interviews</p>'
                        }
                    </div>
                </div>
            </div>
        `;
    }

    renderScheduledInterview(application) {
        const applicant = application.applicant;
        const interview = application.interview;
        const scheduleTime = new Date(interview.scheduledDate).toLocaleString();
        
        return `
            <div class="interview-card scheduled">
                <div class="interview-header">
                    <h4>${applicant.name}</h4>
                    <span class="interview-time">${scheduleTime}</span>
                </div>
                
                <div class="interview-info">
                    <p>Qualification Score: <strong>${application.qualificationScore}%</strong></p>
                    <p>Interview Type: <strong>${interview.type}</strong></p>
                    <p>Duration: <strong>${interview.duration} minutes</strong></p>
                </div>
                
                <div class="interview-actions">
                    <button class="btn primary" onclick="hiringInterface.conductInterview('${application.id}')">
                        🎤 Start Interview
                    </button>
                    <button class="btn" onclick="hiringInterface.rescheduleInterview('${application.id}')">
                        📅 Reschedule
                    </button>
                </div>
            </div>
        `;
    }

    renderCompletedInterview(application) {
        const applicant = application.applicant;
        const interview = application.interview;
        const completedTime = new Date(interview.conductedDate).toLocaleString();
        
        return `
            <div class="interview-card completed">
                <div class="interview-header">
                    <h4>${applicant.name}</h4>
                    <span class="interview-score ${this.getScoreClass(interview.score)}">${interview.score}%</span>
                </div>
                
                <div class="interview-details">
                    <p>Completed: ${completedTime}</p>
                    <p>Qualification: ${application.qualificationScore}% | Interview: ${interview.score}%</p>
                    ${interview.notes ? `<p class="interview-notes">"${interview.notes}"</p>` : ''}
                </div>
                
                <div class="interview-actions">
                    <button class="btn primary" onclick="hiringInterface.makeOffer('${application.id}')">
                        💼 Make Offer
                    </button>
                    <button class="btn danger" onclick="hiringInterface.rejectApplication('${application.id}')">
                        ❌ Reject
                    </button>
                </div>
            </div>
        `;
    }

    renderEmployees() {
        const employees = this.hiringSystem.getHiredStaff();
        
        return `
            <div class="employees-view">
                <div class="view-header">
                    <h3>👥 Current Employees (${employees.length})</h3>
                    <div class="employee-stats">
                        <span>Active: ${employees.filter(e => e.status === 'active').length}</span>
                        <span>Probation: ${employees.filter(e => e.status === 'probation').length}</span>
                    </div>
                </div>
                
                <div class="employees-list">
                    ${employees.length > 0 ? 
                        employees.map(emp => this.renderEmployeeCard(emp)).join('') :
                        '<div class="no-data">No employees hired yet</div>'
                    }
                </div>
            </div>
        `;
    }

    renderEmployeeCard(employee) {
        const hireDate = new Date(employee.hireDate).toLocaleDateString();
        const performance = employee.performance.overallRating;
        
        return `
            <div class="employee-card">
                <div class="employee-header">
                    <div class="employee-info">
                        <h4>${employee.name}</h4>
                        <p>${employee.role.icon} ${employee.role.title}</p>
                    </div>
                    <div class="employee-status">
                        <span class="status-badge ${employee.status}">${employee.status}</span>
                        <span class="performance-score ${this.getScoreClass(performance)}">${performance}%</span>
                    </div>
                </div>
                
                <div class="employee-details">
                    <div class="detail-row">
                        <span class="label">Hired:</span>
                        <span class="value">${hireDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Salary:</span>
                        <span class="value">$${employee.salary}/day</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Hours Worked:</span>
                        <span class="value">${employee.schedule.hoursWorked}</span>
                    </div>
                </div>
                
                <div class="employee-actions">
                    <button class="btn-small" onclick="hiringInterface.viewEmployee('${employee.id}')">
                        👁️ View Details
                    </button>
                    <button class="btn-small" onclick="hiringInterface.manageEmployee('${employee.id}')">
                        ⚙️ Manage
                    </button>
                </div>
            </div>
        `;
    }

    renderModal() {
        return `
            <div id="hiringModal" class="modal-overlay" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modalTitle">Modal Title</h3>
                        <button class="modal-close" onclick="hiringInterface.closeModal()">×</button>
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

    updateFilter(filterType, value) {
        this.applicationFilters[filterType] = value;
        this.refreshUI();
    }

    refreshUI() {
        // Refresh the current view content
        const mainContent = document.querySelector('.staff-hiring-app .hiring-main');
        if (mainContent) {
            mainContent.innerHTML = this.renderMainContent();
        }
    }

    refreshApplicationsList() {
        if (this.currentView === 'applications') {
            this.refreshUI();
        }
    }

    refreshEmployeesList() {
        if (this.currentView === 'employees') {
            this.refreshUI();
        }
    }

    // Modal Management
    showModal(title, content) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('hiringModal').style.display = 'flex';
    }

    closeModal() {
        document.getElementById('hiringModal').style.display = 'none';
    }

    // Action Handlers
    async showPostJobModal() {
        const roles = this.hiringSystem.getJobRoles();
        const openPositions = this.hiringSystem.getOpenPositions();
        const availableRoles = roles.filter(role => 
            !openPositions.some(pos => pos.roleId === role.id)
        );
        
        const modalContent = `
            <form onsubmit="hiringInterface.submitJobPosting(event)">
                <div class="form-group">
                    <label>Job Role:</label>
                    <select id="jobRole" required>
                        <option value="">Select a role...</option>
                        ${availableRoles.map(role => `
                            <option value="${role.id}">${role.icon} ${role.title} - $${role.dailyWage}/day</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Urgency:</label>
                    <select id="urgency">
                        <option value="normal">Normal</option>
                        <option value="urgent">Urgent</option>
                        <option value="low">Low Priority</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Salary Offer (optional):</label>
                    <input type="number" id="salaryOffer" placeholder="Leave empty for default wage">
                </div>
                
                <div class="form-actions">
                    <button type="button" onclick="hiringInterface.closeModal()">Cancel</button>
                    <button type="submit" class="btn primary">Post Job</button>
                </div>
            </form>
        `;
        
        this.showModal('📢 Post New Job', modalContent);
    }

    async submitJobPosting(event) {
        event.preventDefault();
        
        const roleId = document.getElementById('jobRole').value;
        const urgency = document.getElementById('urgency').value;
        const salaryOffer = document.getElementById('salaryOffer').value;
        
        if (!roleId) {
            alert('Please select a job role');
            return;
        }
        
        const jobData = {
            roleId: roleId,
            urgency: urgency,
            salaryOffer: salaryOffer ? parseInt(salaryOffer) : null
        };
        
        try {
            await this.hiringSystem.postJobOpening(jobData);
            this.closeModal();
            this.refreshUI();
            console.log('✅ Job posted successfully');
        } catch (error) {
            console.error('❌ Error posting job:', error);
            alert('Failed to post job. Please try again.');
        }
    }

    async postJob(roleId) {
        try {
            await this.hiringSystem.requestJobPosting(roleId);
            this.refreshUI();
            console.log('✅ Job posted for role:', roleId);
        } catch (error) {
            console.error('❌ Error posting job:', error);
        }
    }

    // Utility Methods
    getFilteredApplications() {
        let applications = this.hiringSystem.getApplications();
        
        if (this.applicationFilters.status !== 'all') {
            applications = applications.filter(app => app.status === this.applicationFilters.status);
        }
        
        if (this.applicationFilters.role !== 'all') {
            applications = applications.filter(app => app.jobPostingId === this.applicationFilters.role);
        }
        
        if (this.applicationFilters.qualificationScore > 0) {
            applications = applications.filter(app => app.qualificationScore >= this.applicationFilters.qualificationScore);
        }
        
        return applications.sort((a, b) => b.submittedDate - a.submittedDate);
    }

    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    formatStatus(status) {
        const statusMap = {
            'all': 'All Applications',
            'submitted': 'New Application',
            'reviewed': 'Under Review',
            'interview_scheduled': 'Interview Scheduled',
            'interviewed': 'Interview Complete',
            'offer_made': 'Offer Extended',
            'hired': 'Hired',
            'rejected': 'Rejected',
            'probation': 'On Probation',
            'active': 'Active'
        };
        
        return statusMap[status] || status;
    }

    formatExperience(experience) {
        if (typeof experience === 'string') {
            return experience === 'none' ? 'No experience required' : 
                   experience === 'some' ? 'Some experience preferred' : 
                   'Experienced candidate required';
        }
        
        if (typeof experience === 'number') {
            return experience === 0 ? 'No experience' : 
                   experience === 1 ? '1 previous job' : 
                   `${experience} previous jobs`;
        }
        
        return 'Unknown';
    }

    formatEducation(education) {
        const educationMap = {
            'none': 'No requirements',
            'high_school': 'High school diploma',
            'college_preferred': 'College preferred',
            'college_required': 'College degree required'
        };
        
        return educationMap[education] || education;
    }

    formatRoleName(roleId) {
        const role = this.hiringSystem.getJobRoles().find(r => r.id === roleId);
        return role ? role.title : roleId;
    }

    getScoreClass(score) {
        if (score >= 80) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 60) return 'average';
        if (score >= 50) return 'below-average';
        return 'poor';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StaffHiringInterface;
} else if (typeof window !== 'undefined') {
    window.StaffHiringInterface = StaffHiringInterface;
}
