/**
 * Staff Management & Scheduling System - Phase 5B Implementation
 * Comprehensive staff scheduling, performance management, and team coordination
 * Builds upon Phase 5A hiring system with advanced management features
 */

class StaffManagementSystem {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.hiringSystem = null;
        this.timeSystem = null;
        
        // Scheduling system
        this.schedules = new Map(); // employeeId -> schedule data
        this.shifts = new Map(); // shiftId -> shift data
        this.timeSlots = new Map(); // time -> assigned employees
        this.shiftTemplates = new Map(); // template management
        
        // Performance management
        this.performanceReviews = new Map();
        this.trainingPrograms = new Map();
        this.disciplinaryActions = new Map();
        this.employeeFeedback = new Map();
        
        // Team dynamics
        this.teamRelationships = new Map();
        this.teamMorale = new Map();
        this.workGroups = new Map();
        
        // Management configuration
        this.managementConfig = {
            maxHoursPerWeek: 40,
            overtimeThreshold: 8, // hours per day
            breakDuration: 30, // minutes
            minShiftLength: 4, // hours
            maxShiftLength: 10, // hours
            reviewPeriod: 90, // days
            probationPeriod: 14, // days
            minStaffing: 2, // minimum employees during open hours
            maxStaffing: 8 // maximum concurrent employees
        };
        
        // Performance metrics
        this.performanceMetrics = {
            productivity: new Map(),
            customerSatisfaction: new Map(),
            punctuality: new Map(),
            teamwork: new Map(),
            reliability: new Map(),
            overallPerformance: new Map()
        };
    }

    initialize(gameState, eventBus, hiringSystem, timeSystem) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        this.hiringSystem = hiringSystem;
        this.timeSystem = timeSystem;
        
        this.setupShiftTemplates();
        this.setupTrainingPrograms();
        this.setupEventListeners();
        this.initializeSchedulingSystem();
        
        console.log('📅 Staff Management & Scheduling System initialized');
    }

    setupShiftTemplates() {
        // Define standard shift templates
        this.shiftTemplates.set('morning', {
            id: 'morning',
            name: 'Morning Shift',
            icon: '🌅',
            startTime: '08:00',
            endTime: '16:00',
            duration: 8,
            breakTimes: ['10:00', '12:00', '14:00'],
            positions: {
                cashier: 2,
                stocker: 1,
                janitor: 0,
                security: 1,
                assistant_manager: 1
            },
            priority: 'high' // high customer traffic
        });

        this.shiftTemplates.set('afternoon', {
            id: 'afternoon',
            name: 'Afternoon Shift',
            icon: '☀️',
            startTime: '12:00',
            endTime: '20:00',
            duration: 8,
            breakTimes: ['14:00', '16:00', '18:00'],
            positions: {
                cashier: 3,
                stocker: 2,
                janitor: 0,
                security: 1,
                assistant_manager: 1
            },
            priority: 'high' // peak hours
        });

        this.shiftTemplates.set('evening', {
            id: 'evening',
            name: 'Evening Shift',
            icon: '🌆',
            startTime: '16:00',
            endTime: '24:00',
            duration: 8,
            breakTimes: ['18:00', '20:00', '22:00'],
            positions: {
                cashier: 2,
                stocker: 1,
                janitor: 1,
                security: 2,
                assistant_manager: 1
            },
            priority: 'medium'
        });

        this.shiftTemplates.set('night', {
            id: 'night',
            name: 'Night Shift',
            icon: '🌙',
            startTime: '22:00',
            endTime: '06:00',
            duration: 8,
            breakTimes: ['00:00', '02:00', '04:00'],
            positions: {
                cashier: 1,
                stocker: 2,
                janitor: 1,
                security: 2,
                assistant_manager: 0
            },
            priority: 'low',
            nightShiftBonus: 1.5 // 50% bonus for night work
        });

        this.shiftTemplates.set('weekend', {
            id: 'weekend',
            name: 'Weekend Shift',
            icon: '🎉',
            startTime: '10:00',
            endTime: '22:00',
            duration: 12,
            breakTimes: ['12:00', '15:00', '18:00'],
            positions: {
                cashier: 3,
                stocker: 2,
                janitor: 1,
                security: 2,
                assistant_manager: 1
            },
            priority: 'high',
            weekendBonus: 1.25 // 25% weekend bonus
        });

        console.log(`📋 Shift templates configured: ${this.shiftTemplates.size} templates`);
    }

    setupTrainingPrograms() {
        // Define comprehensive training programs for each role
        this.trainingPrograms.set('basic_orientation', {
            id: 'basic_orientation',
            name: 'Basic Store Orientation',
            icon: '📚',
            duration: 4, // hours
            cost: 50,
            description: 'Introduction to store policies, procedures, and safety',
            required: true,
            applicableRoles: ['all'],
            modules: [
                'Store Layout and Navigation',
                'Company Values and Mission',
                'Basic Safety Procedures',
                'Customer Service Standards',
                'Emergency Procedures'
            ],
            skillBoosts: {
                'communication': 10,
                'customer_service': 15,
                'safety_awareness': 20
            }
        });

        this.trainingPrograms.set('cashier_certification', {
            id: 'cashier_certification',
            name: 'Cashier Certification',
            icon: '💰',
            duration: 6,
            cost: 100,
            description: 'Complete training for register operation and cash handling',
            required: true,
            applicableRoles: ['cashier', 'assistant_manager'],
            modules: [
                'POS System Operation',
                'Cash Handling Procedures',
                'Credit Card Processing',
                'Return and Exchange Policies',
                'Loss Prevention Basics',
                'Upselling Techniques'
            ],
            skillBoosts: {
                'cash_handling': 25,
                'computer_skills': 15,
                'sales': 20,
                'accuracy': 20
            }
        });

        this.trainingPrograms.set('inventory_management', {
            id: 'inventory_management',
            name: 'Inventory Management',
            icon: '📦',
            duration: 8,
            cost: 150,
            description: 'Advanced inventory tracking and organization systems',
            required: true,
            applicableRoles: ['stocker', 'assistant_manager'],
            modules: [
                'Inventory Systems Operation',
                'Product Organization Standards',
                'Receiving and Processing Shipments',
                'Stock Level Management',
                'Product Rotation (FIFO)',
                'Warehouse Safety'
            ],
            skillBoosts: {
                'organization': 30,
                'inventory_management': 35,
                'efficiency': 20,
                'physical_fitness': 10
            }
        });

        this.trainingPrograms.set('security_training', {
            id: 'security_training',
            name: 'Security & Loss Prevention',
            icon: '🛡️',
            duration: 12,
            cost: 300,
            description: 'Comprehensive security and loss prevention training',
            required: true,
            applicableRoles: ['security', 'assistant_manager'],
            modules: [
                'Theft Detection Techniques',
                'Conflict De-escalation',
                'Emergency Response Procedures',
                'Legal Aspects of Security',
                'Camera System Operation',
                'Incident Report Writing'
            ],
            skillBoosts: {
                'security': 40,
                'conflict_resolution': 35,
                'observation': 30,
                'communication': 15
            }
        });

        this.trainingPrograms.set('leadership_development', {
            id: 'leadership_development',
            name: 'Leadership Development',
            icon: '👨‍💼',
            duration: 16,
            cost: 500,
            description: 'Advanced leadership and management skills',
            required: true,
            applicableRoles: ['assistant_manager'],
            modules: [
                'Team Leadership Principles',
                'Performance Management',
                'Conflict Resolution',
                'Staff Scheduling',
                'Budget Management',
                'Training and Development'
            ],
            skillBoosts: {
                'leadership': 50,
                'management': 45,
                'communication': 25,
                'problem_solving': 30
            }
        });

        this.trainingPrograms.set('customer_service_excellence', {
            id: 'customer_service_excellence',
            name: 'Customer Service Excellence',
            icon: '⭐',
            duration: 6,
            cost: 120,
            description: 'Advanced customer service and satisfaction techniques',
            required: false,
            applicableRoles: ['cashier', 'assistant_manager'],
            modules: [
                'Advanced Communication Skills',
                'Handling Difficult Customers',
                'Upselling and Cross-selling',
                'Customer Retention Strategies',
                'Service Recovery',
                'Building Customer Relationships'
            ],
            skillBoosts: {
                'customer_service': 35,
                'communication': 25,
                'sales': 30,
                'problem_solving': 20
            }
        });

        console.log(`🎓 Training programs configured: ${this.trainingPrograms.size} programs`);
    }

    setupEventListeners() {
        // Listen for staff management events
        this.eventBus.on('staff.hired', (data) => this.onStaffHired(data));
        this.eventBus.on('staff.terminated', (data) => this.onStaffTerminated(data));
        this.eventBus.on('schedule.create', (data) => this.createSchedule(data));
        this.eventBus.on('schedule.update', (data) => this.updateSchedule(data));
        this.eventBus.on('performance.review', (data) => this.conductPerformanceReview(data));
        this.eventBus.on('training.assign', (data) => this.assignTraining(data));
        this.eventBus.on('training.complete', (data) => this.completeTraining(data));
        
        // Listen for time-based events
        this.eventBus.on('time.hourly', () => this.processHourlyUpdates());
        this.eventBus.on('time.daily', () => this.processDailyUpdates());
        this.eventBus.on('time.weekly', () => this.processWeeklyUpdates());
        
        // Listen for shift events
        this.eventBus.on('shift.start', (data) => this.startShift(data));
        this.eventBus.on('shift.end', (data) => this.endShift(data));
        this.eventBus.on('shift.break', (data) => this.takeBreak(data));
        
        console.log('📡 Staff management event listeners configured');
    }

    initializeSchedulingSystem() {
        // Initialize staff scheduling data structure
        if (!this.gameState.staffManagement) {
            this.gameState.staffManagement = {
                schedules: [],
                shifts: [],
                performances: [],
                training: [],
                teamDynamics: {
                    morale: 75,
                    productivity: 70,
                    teamwork: 80
                },
                metrics: {
                    averagePerformance: 75,
                    turnoverRate: 5,
                    customerSatisfaction: 80,
                    operational_efficiency: 70
                }
            };
        }
        
        // Generate initial schedules for existing employees
        this.generateInitialSchedules();
        
        console.log('🗓️ Scheduling system initialized');
    }

    // Scheduling Management
    async createWeeklySchedule(weekStartDate, options = {}) {
        const {
            autoAssign = true,
            considerPreferences = true,
            optimizeForCosts = false,
            minimumStaffing = true
        } = options;
        
        console.log(`📅 Creating weekly schedule starting ${new Date(weekStartDate).toDateString()}`);
        
        const schedule = {
            id: this.generateScheduleId(),
            weekStart: weekStartDate,
            weekEnd: weekStartDate + (7 * 24 * 60 * 60 * 1000),
            status: 'draft', // draft, published, active, completed
            shifts: [],
            totalHours: 0,
            totalCost: 0,
            staffingLevel: 0,
            createdDate: Date.now(),
            lastModified: Date.now()
        };
        
        // Get available employees
        const availableEmployees = this.getAvailableEmployees();
        if (availableEmployees.length === 0) {
            console.warn('⚠️ No available employees for scheduling');
            return null;
        }
        
        // Generate shifts for each day of the week
        for (let day = 0; day < 7; day++) {
            const dayDate = weekStartDate + (day * 24 * 60 * 60 * 1000);
            const dayShifts = await this.createDaySchedule(dayDate, availableEmployees, options);
            schedule.shifts.push(...dayShifts);
        }
        
        // Calculate schedule metrics
        this.calculateScheduleMetrics(schedule);
        
        // Auto-assign employees if requested
        if (autoAssign) {
            await this.autoAssignEmployees(schedule, considerPreferences);
        }
        
        // Store schedule
        this.schedules.set(schedule.id, schedule);
        this.gameState.staffManagement.schedules.push(schedule);
        
        // Emit schedule created event
        this.eventBus.emit('schedule.created', {
            schedule: schedule,
            weekStart: weekStartDate
        });
        
        return schedule;
    }

    async createDaySchedule(dayDate, availableEmployees, options) {
        const dayOfWeek = new Date(dayDate).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        const shifts = [];
        let shiftTemplates = [];
        
        // Select appropriate shift templates
        if (isWeekend) {
            shiftTemplates = [this.shiftTemplates.get('weekend')];
        } else {
            // Regular weekday - use multiple overlapping shifts
            shiftTemplates = [
                this.shiftTemplates.get('morning'),
                this.shiftTemplates.get('afternoon'),
                this.shiftTemplates.get('evening')
            ];
            
            // Add night shift if store operates 24/7
            if (this.gameState.store?.operatingHours?.is24Hour) {
                shiftTemplates.push(this.shiftTemplates.get('night'));
            }
        }
        
        // Create shifts based on templates
        shiftTemplates.forEach(template => {
            if (template) {
                const shift = this.createShiftFromTemplate(template, dayDate);
                shifts.push(shift);
            }
        });
        
        return shifts;
    }

    createShiftFromTemplate(template, date) {
        const shift = {
            id: this.generateShiftId(),
            templateId: template.id,
            date: date,
            name: template.name,
            icon: template.icon,
            startTime: template.startTime,
            endTime: template.endTime,
            duration: template.duration,
            breakTimes: [...template.breakTimes],
            positions: { ...template.positions },
            assignedEmployees: [],
            status: 'scheduled', // scheduled, active, completed, cancelled
            priority: template.priority,
            bonusMultiplier: template.nightShiftBonus || template.weekendBonus || 1.0,
            requirements: this.calculateShiftRequirements(template),
            performance: {
                punctuality: 0,
                productivity: 0,
                customerSatisfaction: 0,
                teamwork: 0
            }
        };
        
        return shift;
    }

    calculateShiftRequirements(template) {
        const totalPositions = Object.values(template.positions).reduce((sum, count) => sum + count, 0);
        
        return {
            minEmployees: Math.max(2, Math.floor(totalPositions * 0.6)),
            maxEmployees: totalPositions,
            criticalRoles: Object.entries(template.positions)
                .filter(([role, count]) => count > 0 && ['cashier', 'security'].includes(role))
                .map(([role]) => role),
            preferredSkills: this.getPreferredSkillsForShift(template),
            experienceLevel: template.priority === 'high' ? 'experienced' : 'any'
        };
    }

    getPreferredSkillsForShift(template) {
        const skills = [];
        
        if (template.positions.cashier > 0) {
            skills.push('customer_service', 'cash_handling', 'communication');
        }
        if (template.positions.stocker > 0) {
            skills.push('organization', 'physical_fitness', 'inventory_management');
        }
        if (template.positions.security > 0) {
            skills.push('security', 'conflict_resolution', 'observation');
        }
        if (template.positions.assistant_manager > 0) {
            skills.push('leadership', 'management', 'problem_solving');
        }
        
        return [...new Set(skills)]; // Remove duplicates
    }

    async autoAssignEmployees(schedule, considerPreferences = true) {
        console.log('🤖 Auto-assigning employees to shifts...');
        
        const employees = this.getAvailableEmployees();
        let assignmentCount = 0;
        
        // Sort shifts by priority and requirements
        const sortedShifts = schedule.shifts.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        });
        
        for (const shift of sortedShifts) {
            const assignments = await this.assignEmployeesToShift(shift, employees, considerPreferences);
            assignmentCount += assignments.length;
        }
        
        console.log(`✅ Auto-assigned ${assignmentCount} employee shifts`);
        return assignmentCount;
    }

    async assignEmployeesToShift(shift, availableEmployees, considerPreferences = true) {
        const assignments = [];
        const roleNeeds = { ...shift.positions };
        
        // Filter employees based on availability and role compatibility
        const compatibleEmployees = availableEmployees.filter(employee => {
            return this.isEmployeeAvailableForShift(employee, shift) &&
                   this.isEmployeeCompatibleWithShift(employee, shift);
        });
        
        // Score and rank employees for this shift
        const rankedEmployees = this.rankEmployeesForShift(compatibleEmployees, shift, considerPreferences);
        
        // Assign employees to roles
        for (const employee of rankedEmployees) {
            const preferredRole = this.getPreferredRoleForEmployee(employee, roleNeeds);
            
            if (preferredRole && roleNeeds[preferredRole] > 0) {
                const assignment = {
                    employeeId: employee.id,
                    employeeName: employee.name,
                    role: preferredRole,
                    shiftId: shift.id,
                    startTime: shift.startTime,
                    endTime: shift.endTime,
                    status: 'assigned',
                    assignedDate: Date.now()
                };
                
                assignments.push(assignment);
                shift.assignedEmployees.push(assignment);
                roleNeeds[preferredRole]--;
                
                // Mark employee as scheduled for this time slot
                this.markEmployeeScheduled(employee.id, shift);
            }
            
            // Stop if all positions are filled
            if (Object.values(roleNeeds).every(count => count <= 0)) {
                break;
            }
        }
        
        return assignments;
    }

    isEmployeeAvailableForShift(employee, shift) {
        // Check if employee is not already scheduled for conflicting time
        const shiftStart = this.parseTime(shift.startTime);
        const shiftEnd = this.parseTime(shift.endTime);
        
        // Check availability preferences
        if (employee.personalInfo?.availability) {
            const shiftPeriod = this.getShiftPeriod(shift.startTime);
            if (!employee.personalInfo.availability.includes(shiftPeriod)) {
                return false;
            }
        }
        
        // Check maximum hours constraints
        const weeklyHours = this.calculateEmployeeWeeklyHours(employee.id, shift.date);
        if (weeklyHours + shift.duration > this.managementConfig.maxHoursPerWeek) {
            return false;
        }
        
        // Check if employee is active and not on leave
        return employee.status === 'active' || employee.status === 'probation';
    }

    isEmployeeCompatibleWithShift(employee, shift) {
        const employeeRole = employee.role.id;
        const shiftRoles = Object.keys(shift.positions).filter(role => shift.positions[role] > 0);
        
        // Check if employee's role is needed in this shift
        if (!shiftRoles.includes(employeeRole)) {
            // Allow assistant managers to fill any role
            return employeeRole === 'assistant_manager';
        }
        
        return true;
    }

    rankEmployeesForShift(employees, shift, considerPreferences) {
        return employees.map(employee => {
            let score = 0;
            
            // Base performance score (0-100)
            score += employee.performance?.overallRating || 50;
            
            // Role match bonus
            if (shift.positions[employee.role.id] > 0) {
                score += 20;
            }
            
            // Experience level bonus
            if (shift.requirements.experienceLevel === 'experienced') {
                score += employee.employment?.experience?.length * 5 || 0;
            }
            
            // Skill match bonus
            if (employee.employment?.skills) {
                const matchingSkills = shift.requirements.preferredSkills.filter(skill => 
                    employee.employment.skills[skill] && employee.employment.skills[skill] > 50
                );
                score += matchingSkills.length * 10;
            }
            
            // Availability preference bonus
            if (considerPreferences && employee.personalInfo?.availability) {
                const shiftPeriod = this.getShiftPeriod(shift.startTime);
                if (employee.personalInfo.availability.includes(shiftPeriod)) {
                    score += 15;
                }
            }
            
            // Reliability bonus
            score += (employee.performance?.reliability || 50) * 0.3;
            
            // Random factor for variety
            score += Math.random() * 10;
            
            return { employee, score };
        }).sort((a, b) => b.score - a.score).map(item => item.employee);
    }

    getPreferredRoleForEmployee(employee, roleNeeds) {
        const employeeRole = employee.role.id;
        
        // Prefer employee's primary role if available
        if (roleNeeds[employeeRole] > 0) {
            return employeeRole;
        }
        
        // Assistant managers can fill any role
        if (employeeRole === 'assistant_manager') {
            const availableRoles = Object.entries(roleNeeds)
                .filter(([role, count]) => count > 0)
                .map(([role]) => role);
            
            if (availableRoles.length > 0) {
                // Prefer higher-responsibility roles first
                const priorityOrder = ['assistant_manager', 'cashier', 'security', 'stocker', 'janitor'];
                for (const role of priorityOrder) {
                    if (availableRoles.includes(role)) {
                        return role;
                    }
                }
            }
        }
        
        return null;
    }

    // Performance Management
    async conductPerformanceReview(reviewData) {
        const { employeeId, reviewerId, period, metrics } = reviewData;
        const employee = this.getEmployeeById(employeeId);
        
        if (!employee) {
            console.error('❌ Employee not found for performance review:', employeeId);
            return null;
        }
        
        console.log(`📊 Conducting performance review for ${employee.name}`);
        
        const review = {
            id: this.generateReviewId(),
            employeeId: employeeId,
            reviewerId: reviewerId,
            period: period,
            conductedDate: Date.now(),
            metrics: {
                productivity: this.calculateProductivityScore(employee),
                reliability: this.calculateReliabilityScore(employee),
                customerSatisfaction: this.calculateCustomerSatisfactionScore(employee),
                teamwork: this.calculateTeamworkScore(employee),
                punctuality: this.calculatePunctualityScore(employee),
                qualityOfWork: this.calculateQualityScore(employee),
                initiative: this.calculateInitiativeScore(employee)
            },
            strengths: [],
            areasForImprovement: [],
            goals: [],
            rating: 'satisfactory', // outstanding, exceeds, satisfactory, needs_improvement, unsatisfactory
            recommendations: [],
            nextReviewDate: Date.now() + (90 * 24 * 60 * 60 * 1000), // 90 days
            salaryRecommendation: null,
            promotionRecommendation: null
        };
        
        // Calculate overall performance rating
        this.calculateOverallRating(review);
        
        // Generate AI-powered feedback and recommendations
        await this.generatePerformanceFeedback(review, employee);
        
        // Store performance review
        this.performanceReviews.set(review.id, review);
        
        // Update employee performance history
        if (!employee.performanceHistory) {
            employee.performanceHistory = [];
        }
        employee.performanceHistory.push(review);
        
        // Update current performance metrics
        this.updateEmployeePerformance(employee, review.metrics);
        
        // Emit performance review event
        this.eventBus.emit('performance.reviewCompleted', {
            review: review,
            employee: employee
        });
        
        return review;
    }

    calculateProductivityScore(employee) {
        // Base score from role-specific metrics
        let score = 50;
        
        // Add role-specific productivity calculations
        switch (employee.role.id) {
            case 'cashier':
                score += this.calculateCashierProductivity(employee);
                break;
            case 'stocker':
                score += this.calculateStockerProductivity(employee);
                break;
            case 'security':
                score += this.calculateSecurityProductivity(employee);
                break;
            case 'janitor':
                score += this.calculateJanitorProductivity(employee);
                break;
            case 'assistant_manager':
                score += this.calculateManagerProductivity(employee);
                break;
        }
        
        return Math.max(0, Math.min(100, score));
    }

    calculateCashierProductivity(employee) {
        // Simulate cashier-specific metrics
        const baseScore = employee.performance?.productivity || 50;
        const transactionSpeed = Math.random() * 40 + 60; // 60-100
        const accuracy = Math.random() * 20 + 80; // 80-100
        const upsellSuccess = Math.random() * 30 + 10; // 10-40
        
        return (baseScore + transactionSpeed + accuracy + upsellSuccess) / 4 - 50;
    }

    calculateStockerProductivity(employee) {
        const baseScore = employee.performance?.productivity || 50;
        const stockingSpeed = Math.random() * 30 + 70; // 70-100
        const organization = Math.random() * 25 + 75; // 75-100
        const accuracy = Math.random() * 20 + 80; // 80-100
        
        return (baseScore + stockingSpeed + organization + accuracy) / 4 - 50;
    }

    calculateSecurityProductivity(employee) {
        const baseScore = employee.performance?.productivity || 50;
        const vigilance = Math.random() * 30 + 70; // 70-100
        const incidentResponse = Math.random() * 25 + 75; // 75-100
        const preventionEffectiveness = Math.random() * 35 + 65; // 65-100
        
        return (baseScore + vigilance + incidentResponse + preventionEffectiveness) / 4 - 50;
    }

    // Training Management
    async assignTraining(trainingData) {
        const { employeeId, programId, priority = 'normal', deadline = null } = trainingData;
        const employee = this.getEmployeeById(employeeId);
        const program = this.trainingPrograms.get(programId);
        
        if (!employee || !program) {
            console.error('❌ Invalid employee or training program');
            return null;
        }
        
        console.log(`📚 Assigning training "${program.name}" to ${employee.name}`);
        
        const training = {
            id: this.generateTrainingId(),
            employeeId: employeeId,
            programId: programId,
            assignedDate: Date.now(),
            deadline: deadline || Date.now() + (7 * 24 * 60 * 60 * 1000), // 1 week default
            status: 'assigned', // assigned, in_progress, completed, failed, cancelled
            priority: priority,
            progress: 0,
            startDate: null,
            completionDate: null,
            score: null,
            cost: program.cost,
            notes: []
        };
        
        // Add to employee's training record
        if (!employee.training) {
            employee.training = {
                completed: [],
                inProgress: [],
                assigned: []
            };
        }
        employee.training.assigned.push(training);
        
        // Store training record
        this.gameState.staffManagement.training.push(training);
        
        // Emit training assigned event
        this.eventBus.emit('training.assigned', {
            training: training,
            employee: employee,
            program: program
        });
        
        return training;
    }

    async startTraining(trainingId) {
        const training = this.getTrainingById(trainingId);
        if (!training || training.status !== 'assigned') {
            console.error('❌ Cannot start training:', trainingId);
            return false;
        }
        
        const employee = this.getEmployeeById(training.employeeId);
        const program = this.trainingPrograms.get(training.programId);
        
        console.log(`🎓 Starting training "${program.name}" for ${employee.name}`);
        
        training.status = 'in_progress';
        training.startDate = Date.now();
        
        // Move from assigned to in_progress
        employee.training.assigned = employee.training.assigned.filter(t => t.id !== trainingId);
        employee.training.inProgress.push(training);
        
        // Simulate training progress over time
        this.simulateTrainingProgress(training, program);
        
        return true;
    }

    async completeTraining(trainingData) {
        const { trainingId, score = null, notes = '' } = trainingData;
        const training = this.getTrainingById(trainingId);
        
        if (!training || training.status !== 'in_progress') {
            console.error('❌ Cannot complete training:', trainingId);
            return false;
        }
        
        const employee = this.getEmployeeById(training.employeeId);
        const program = this.trainingPrograms.get(training.programId);
        
        console.log(`✅ Completing training "${program.name}" for ${employee.name}`);
        
        training.status = 'completed';
        training.completionDate = Date.now();
        training.progress = 100;
        training.score = score || this.calculateTrainingScore(employee, program);
        training.notes.push(notes);
        
        // Apply skill boosts from training
        this.applyTrainingBenefits(employee, program, training.score);
        
        // Move from in_progress to completed
        employee.training.inProgress = employee.training.inProgress.filter(t => t.id !== trainingId);
        employee.training.completed.push(training);
        
        // Emit training completed event
        this.eventBus.emit('training.completed', {
            training: training,
            employee: employee,
            program: program
        });
        
        return true;
    }

    applyTrainingBenefits(employee, program, score) {
        console.log(`🚀 Applying training benefits for ${employee.name} (Score: ${score}%)`);
        
        // Calculate effectiveness based on score
        const effectiveness = Math.max(0.5, score / 100); // Minimum 50% effectiveness
        
        // Apply skill boosts
        if (program.skillBoosts && employee.employment?.skills) {
            Object.entries(program.skillBoosts).forEach(([skill, boost]) => {
                const currentLevel = employee.employment.skills[skill] || 0;
                const improvedLevel = Math.min(100, currentLevel + (boost * effectiveness));
                employee.employment.skills[skill] = Math.round(improvedLevel);
                
                console.log(`📈 ${skill}: ${currentLevel} → ${improvedLevel}`);
            });
        }
        
        // Improve overall performance
        const performanceBoost = Math.round(5 * effectiveness);
        employee.performance.overallRating = Math.min(100, 
            employee.performance.overallRating + performanceBoost
        );
        
        // Add training certification
        if (!employee.certifications) {
            employee.certifications = [];
        }
        employee.certifications.push({
            programId: program.id,
            name: program.name,
            completedDate: Date.now(),
            score: score,
            validUntil: program.renewalRequired ? Date.now() + (365 * 24 * 60 * 60 * 1000) : null
        });
    }

    // Team Dynamics & Morale
    calculateTeamMorale() {
        const employees = this.gameState.staff?.employees || [];
        if (employees.length === 0) return 75; // Default
        
        let totalMorale = 0;
        let moraleFactors = {
            performance: 0,
            workload: 0,
            relationships: 0,
            recognition: 0,
            growth: 0
        };
        
        employees.forEach(employee => {
            // Performance satisfaction
            const performance = employee.performance?.overallRating || 50;
            moraleFactors.performance += performance > 75 ? 10 : performance < 50 ? -10 : 0;
            
            // Workload balance
            const weeklyHours = this.calculateEmployeeWeeklyHours(employee.id);
            moraleFactors.workload += weeklyHours > 35 ? -5 : weeklyHours < 20 ? -3 : 5;
            
            // Training and growth opportunities
            const recentTraining = employee.training?.completed?.filter(t => 
                Date.now() - t.completionDate < 30 * 24 * 60 * 60 * 1000
            ).length || 0;
            moraleFactors.growth += recentTraining * 5;
            
            // Individual morale calculation
            const individualMorale = 50 + 
                (performance - 50) * 0.3 +
                Math.random() * 20 - 10; // Random variation
            
            totalMorale += Math.max(0, Math.min(100, individualMorale));
        });
        
        const averageMorale = totalMorale / employees.length;
        
        // Update team morale in game state
        this.gameState.staffManagement.teamDynamics.morale = Math.round(averageMorale);
        
        return averageMorale;
    }

    // Utility Methods
    generateScheduleId() {
        return 'schedule_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateShiftId() {
        return 'shift_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateReviewId() {
        return 'review_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateTrainingId() {
        return 'training_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getEmployeeById(employeeId) {
        return this.gameState.staff?.employees?.find(emp => emp.id === employeeId);
    }

    getAvailableEmployees() {
        return this.gameState.staff?.employees?.filter(emp => 
            emp.status === 'active' || emp.status === 'probation'
        ) || [];
    }

    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes; // Convert to minutes
    }

    getShiftPeriod(startTime) {
        const hour = parseInt(startTime.split(':')[0]);
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 22) return 'evening';
        return 'night';
    }

    calculateEmployeeWeeklyHours(employeeId, weekStart = null) {
        // Calculate total scheduled hours for an employee in a given week
        const schedules = this.gameState.staffManagement?.schedules || [];
        const currentWeek = weekStart || this.getCurrentWeekStart();
        
        let totalHours = 0;
        schedules.forEach(schedule => {
            if (schedule.weekStart === currentWeek) {
                schedule.shifts.forEach(shift => {
                    const assignment = shift.assignedEmployees?.find(a => a.employeeId === employeeId);
                    if (assignment) {
                        totalHours += shift.duration;
                    }
                });
            }
        });
        
        return totalHours;
    }

    getCurrentWeekStart() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        return weekStart.getTime();
    }

    // Public API Methods
    getShiftTemplates() {
        return Array.from(this.shiftTemplates.values());
    }

    getTrainingPrograms() {
        return Array.from(this.trainingPrograms.values());
    }

    getSchedules() {
        return this.gameState.staffManagement?.schedules || [];
    }

    getActiveShifts() {
        const now = Date.now();
        return this.gameState.staffManagement?.shifts?.filter(shift => 
            shift.status === 'active' && 
            shift.date <= now && 
            shift.date + (shift.duration * 60 * 60 * 1000) > now
        ) || [];
    }

    getEmployeePerformance(employeeId) {
        const employee = this.getEmployeeById(employeeId);
        return employee?.performance || null;
    }

    getTeamMetrics() {
        return {
            morale: this.calculateTeamMorale(),
            productivity: this.gameState.staffManagement?.teamDynamics?.productivity || 70,
            turnover: this.gameState.staffManagement?.metrics?.turnoverRate || 5,
            satisfaction: this.gameState.staffManagement?.metrics?.customerSatisfaction || 80
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StaffManagementSystem;
} else if (typeof window !== 'undefined') {
    window.StaffManagementSystem = StaffManagementSystem;
}
