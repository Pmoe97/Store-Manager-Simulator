/**
 * Staff Hiring System - Phase 5A Implementation
 * Comprehensive staff recruitment and hiring management
 * Handles job roles, applications, interviews, and onboarding
 */

class StaffHiringSystem {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.npcSystem = null;
        this.aiContentManager = null;
        
        // Job definitions and requirements
        this.jobRoles = new Map();
        this.applicantPool = [];
        this.activeApplications = new Map();
        this.interviewQueue = [];
        this.hiredStaff = new Map();
        
        // Hiring configuration
        this.hiringConfig = {
            maxApplicationsPerDay: 5,
            applicationProcessingTime: 24, // hours
            interviewDuration: 30, // minutes
            backgroundCheckTime: 48, // hours
            probationPeriod: 14, // days
            maxStaffSize: 10
        };
        
        // Performance tracking
        this.hiringMetrics = {
            totalApplications: 0,
            totalInterviews: 0,
            totalHires: 0,
            averageHireTime: 0,
            retentionRate: 0,
            performanceRating: 0
        };
    }

    initialize(gameState, eventBus, npcSystem, aiContentManager) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        this.npcSystem = npcSystem;
        this.aiContentManager = aiContentManager;
        
        this.setupJobRoles();
        this.setupEventListeners();
        this.initializeHiringProcess();
        
        console.log('👔 Staff Hiring System initialized');
    }

    setupJobRoles() {
        // Define all available job roles with requirements and benefits
        this.jobRoles.set('cashier', {
            id: 'cashier',
            title: 'Cashier',
            icon: '💰',
            department: 'sales',
            level: 'entry',
            dailyWage: 40,
            hourlyRate: 12,
            maxHours: 8,
            description: 'Handle customer transactions and provide front-line customer service',
            
            requirements: {
                experience: 'none', // none, some, experienced
                education: 'high_school',
                skills: ['customer_service', 'basic_math', 'communication'],
                personality: ['friendly', 'patient', 'honest'],
                availability: ['morning', 'afternoon', 'evening'],
                minAge: 16,
                backgroundCheck: false
            },
            
            benefits: {
                healthInsurance: false,
                paidTimeOff: 5, // days per year
                employeeDiscount: 10, // percentage
                bonusEligible: true,
                trainingProvided: true
            },
            
            responsibilities: [
                'Process customer transactions accurately',
                'Handle cash, credit, and digital payments',
                'Provide friendly customer service',
                'Maintain clean and organized checkout area',
                'Assist with basic product questions',
                'Follow store policies and procedures'
            ],
            
            performance: {
                transactionSpeed: 70, // target transactions per hour
                accuracyRate: 98, // minimum accuracy percentage
                customerSatisfaction: 80, // minimum satisfaction score
                upsellSuccess: 10 // target upsell percentage
            }
        });

        this.jobRoles.set('janitor', {
            id: 'janitor',
            title: 'Janitor',
            icon: '🧹',
            department: 'maintenance',
            level: 'entry',
            dailyWage: 30,
            hourlyRate: 10,
            maxHours: 6,
            description: 'Maintain store cleanliness and handle basic maintenance tasks',
            
            requirements: {
                experience: 'none',
                education: 'none',
                skills: ['cleaning', 'basic_maintenance', 'time_management'],
                personality: ['reliable', 'detail_oriented', 'independent'],
                availability: ['early_morning', 'late_evening'],
                minAge: 18,
                backgroundCheck: false
            },
            
            benefits: {
                healthInsurance: false,
                paidTimeOff: 3,
                employeeDiscount: 5,
                bonusEligible: false,
                trainingProvided: true
            },
            
            responsibilities: [
                'Clean floors, windows, and surfaces',
                'Empty trash and recycling bins',
                'Maintain restroom cleanliness',
                'Report maintenance issues',
                'Stock cleaning supplies',
                'Ensure safety compliance'
            ],
            
            performance: {
                cleanlinessScore: 85,
                taskCompletion: 95,
                punctuality: 90,
                safetyCompliance: 100
            }
        });

        this.jobRoles.set('stocker', {
            id: 'stocker',
            title: 'Stocker',
            icon: '📦',
            department: 'inventory',
            level: 'entry',
            dailyWage: 35,
            hourlyRate: 11,
            maxHours: 8,
            description: 'Manage inventory, stock shelves, and organize products',
            
            requirements: {
                experience: 'none',
                education: 'high_school',
                skills: ['organization', 'physical_fitness', 'inventory_management'],
                personality: ['detail_oriented', 'efficient', 'team_player'],
                availability: ['morning', 'afternoon', 'evening'],
                minAge: 18,
                backgroundCheck: false
            },
            
            benefits: {
                healthInsurance: false,
                paidTimeOff: 5,
                employeeDiscount: 10,
                bonusEligible: true,
                trainingProvided: true
            },
            
            responsibilities: [
                'Receive and process inventory shipments',
                'Stock shelves and maintain product displays',
                'Track inventory levels and report shortages',
                'Organize stockroom and storage areas',
                'Assist customers with product location',
                'Perform inventory counts'
            ],
            
            performance: {
                stockingSpeed: 50, // items per hour
                organizationScore: 90,
                accuracyRate: 95,
                inventoryTurnover: 15 // days
            }
        });

        this.jobRoles.set('security', {
            id: 'security',
            title: 'Security Guard',
            icon: '🛡️',
            department: 'security',
            level: 'experienced',
            dailyWage: 50,
            hourlyRate: 15,
            maxHours: 8,
            description: 'Provide security, loss prevention, and handle difficult situations',
            
            requirements: {
                experience: 'some',
                education: 'high_school',
                skills: ['security', 'conflict_resolution', 'observation'],
                personality: ['calm', 'authoritative', 'alert'],
                availability: ['morning', 'afternoon', 'evening', 'night'],
                minAge: 21,
                backgroundCheck: true
            },
            
            benefits: {
                healthInsurance: true,
                paidTimeOff: 7,
                employeeDiscount: 15,
                bonusEligible: true,
                trainingProvided: true
            },
            
            responsibilities: [
                'Monitor store for theft and suspicious activity',
                'Handle difficult or disruptive customers',
                'Respond to security incidents',
                'Conduct bag checks and loss prevention',
                'Maintain incident reports',
                'Coordinate with local law enforcement'
            ],
            
            performance: {
                incidentResponse: 95, // response time in seconds
                theftPrevention: 80, // reduction in theft incidents
                customerCompliance: 90,
                reportAccuracy: 95
            }
        });

        this.jobRoles.set('assistant_manager', {
            id: 'assistant_manager',
            title: 'Assistant Manager',
            icon: '👨‍💼',
            department: 'management',
            level: 'experienced',
            dailyWage: 60,
            hourlyRate: 18,
            maxHours: 8,
            description: 'Assist with store management and supervise staff operations',
            
            requirements: {
                experience: 'experienced',
                education: 'college_preferred',
                skills: ['leadership', 'management', 'customer_service', 'problem_solving'],
                personality: ['responsible', 'decisive', 'communicative'],
                availability: ['morning', 'afternoon', 'evening'],
                minAge: 21,
                backgroundCheck: true
            },
            
            benefits: {
                healthInsurance: true,
                paidTimeOff: 10,
                employeeDiscount: 20,
                bonusEligible: true,
                trainingProvided: true
            },
            
            responsibilities: [
                'Supervise daily store operations',
                'Train and mentor junior staff',
                'Handle complex customer issues',
                'Manage staff schedules and breaks',
                'Implement store policies',
                'Report to store owner on performance'
            ],
            
            performance: {
                leadershipScore: 85,
                problemResolution: 90,
                staffSatisfaction: 80,
                operationalEfficiency: 85
            }
        });

        console.log(`💼 Job roles configured: ${this.jobRoles.size} positions available`);
    }

    setupEventListeners() {
        // Listen for hiring-related events
        this.eventBus.on('hiring.postJob', (data) => this.postJobOpening(data));
        this.eventBus.on('hiring.receiveApplication', (data) => this.receiveApplication(data));
        this.eventBus.on('hiring.scheduleInterview', (data) => this.scheduleInterview(data));
        this.eventBus.on('hiring.conductInterview', (data) => this.conductInterview(data));
        this.eventBus.on('hiring.makeOffer', (data) => this.makeJobOffer(data));
        this.eventBus.on('hiring.onboardStaff', (data) => this.onboardNewStaff(data));
        
        // Listen for time-based events
        this.eventBus.on('time.newDay', () => this.processDailyHiring());
        this.eventBus.on('time.newWeek', () => this.processWeeklyHiring());
        
        console.log('📡 Hiring system event listeners configured');
    }

    initializeHiringProcess() {
        // Initialize staff data structure in game state
        if (!this.gameState.staff) {
            this.gameState.staff = {
                employees: [],
                openPositions: [],
                applications: [],
                totalHired: 0,
                hiringBudget: 1000, // weekly hiring budget
                lastHireDate: null
            };
        }
        
        // Generate initial applicant pool
        this.generateApplicantPool();
        
        console.log('🚀 Hiring process initialized');
    }

    // Job posting and recruitment
    async postJobOpening(jobData) {
        const { roleId, urgency = 'normal', salaryOffer = null } = jobData;
        const role = this.jobRoles.get(roleId);
        
        if (!role) {
            console.error('❌ Unknown job role:', roleId);
            return null;
        }
        
        console.log(`📢 Posting job opening: ${role.title}`);
        
        const jobPosting = {
            id: this.generateJobId(),
            roleId: roleId,
            role: role,
            postedDate: Date.now(),
            urgency: urgency,
            salaryOffer: salaryOffer || role.dailyWage,
            status: 'active',
            applicationsReceived: 0,
            interviewsScheduled: 0
        };
        
        // Add to open positions
        this.gameState.staff.openPositions.push(jobPosting);
        
        // Generate applications based on urgency and market conditions
        const applicationCount = this.calculateExpectedApplications(role, urgency);
        await this.generateJobApplications(jobPosting, applicationCount);
        
        // Emit job posted event
        this.eventBus.emit('hiring.jobPosted', jobPosting);
        
        return jobPosting;
    }

    calculateExpectedApplications(role, urgency) {
        let baseApplications = 3; // Base number of applications
        
        // Adjust based on role difficulty
        switch (role.level) {
            case 'entry':
                baseApplications += 2;
                break;
            case 'experienced':
                baseApplications -= 1;
                break;
        }
        
        // Adjust based on urgency
        switch (urgency) {
            case 'urgent':
                baseApplications += 1;
                break;
            case 'low':
                baseApplications -= 1;
                break;
        }
        
        // Adjust based on store reputation
        const reputation = this.gameState.store?.reputation || 50;
        if (reputation > 70) baseApplications += 1;
        if (reputation < 30) baseApplications -= 1;
        
        // Random variation
        baseApplications += Math.floor(Math.random() * 3);
        
        return Math.max(1, Math.min(baseApplications, this.hiringConfig.maxApplicationsPerDay));
    }

    async generateJobApplications(jobPosting, count) {
        console.log(`📄 Generating ${count} applications for ${jobPosting.role.title}`);
        
        for (let i = 0; i < count; i++) {
            // Delay applications over time (1-6 hours)
            const delay = Math.random() * 6 * 60 * 60 * 1000;
            
            setTimeout(() => {
                this.generateSingleApplication(jobPosting);
            }, delay);
        }
    }

    async generateSingleApplication(jobPosting) {
        const role = jobPosting.role;
        
        // Generate applicant NPC
        const applicant = await this.generateApplicantNPC(role);
        
        // Create application
        const application = {
            id: this.generateApplicationId(),
            jobPostingId: jobPosting.id,
            applicant: applicant,
            submittedDate: Date.now(),
            status: 'submitted', // submitted, reviewed, interview_scheduled, interviewed, offer_made, hired, rejected
            qualificationScore: this.calculateQualificationScore(applicant, role),
            interviewScore: null,
            backgroundCheckResult: null,
            notes: []
        };
        
        // Add to applications
        this.gameState.staff.applications.push(application);
        this.activeApplications.set(application.id, application);
        
        // Update job posting
        jobPosting.applicationsReceived++;
        
        // Emit application received event
        this.eventBus.emit('hiring.applicationReceived', {
            application: application,
            jobPosting: jobPosting
        });
        
        console.log(`📋 Application received from ${applicant.name} for ${role.title}`);
        
        return application;
    }

    async generateApplicantNPC(role) {
        // Create a specialized NPC for job application
        const baseNPC = await this.npcSystem.generateNPC({
            archetype: this.selectApplicantArchetype(role),
            enhanceForRole: role.id
        });
        
        // Add job-specific attributes
        const applicant = {
            ...baseNPC,
            employment: {
                experience: this.generateWorkExperience(role),
                education: this.generateEducation(role),
                skills: this.generateSkills(role),
                references: this.generateReferences(),
                availability: this.generateAvailability(),
                salaryExpectation: this.generateSalaryExpectation(role),
                reasonForApplying: this.generateApplicationReason(role)
            },
            interview: {
                nervousness: Math.floor(Math.random() * 100),
                confidence: Math.floor(Math.random() * 100),
                honesty: Math.floor(Math.random() * 100),
                enthusiasm: Math.floor(Math.random() * 100)
            }
        };
        
        return applicant;
    }

    selectApplicantArchetype(role) {
        const archetypesByRole = {
            cashier: ['college_student', 'young_parent', 'retiree', 'teenager'],
            janitor: ['tradesperson', 'older_worker', 'part_timer'],
            stocker: ['college_student', 'tradesperson', 'young_adult'],
            security: ['ex_military', 'security_professional', 'bouncer'],
            assistant_manager: ['business_professional', 'retail_manager', 'supervisor']
        };
        
        const archetypes = archetypesByRole[role.id] || ['general_worker'];
        return archetypes[Math.floor(Math.random() * archetypes.length)];
    }

    generateWorkExperience(role) {
        const experience = [];
        const experienceLevel = role.requirements.experience;
        
        let jobCount = 0;
        switch (experienceLevel) {
            case 'none':
                jobCount = Math.random() < 0.3 ? 1 : 0;
                break;
            case 'some':
                jobCount = Math.floor(Math.random() * 3) + 1;
                break;
            case 'experienced':
                jobCount = Math.floor(Math.random() * 5) + 2;
                break;
        }
        
        for (let i = 0; i < jobCount; i++) {
            experience.push({
                position: this.generateJobTitle(role),
                company: this.generateCompanyName(),
                duration: Math.floor(Math.random() * 36) + 1, // 1-36 months
                responsibilities: this.generateJobResponsibilities(role),
                reasonForLeaving: this.generateLeavingReason()
            });
        }
        
        return experience;
    }

    generateSkills(role) {
        const allSkills = [
            'customer_service', 'communication', 'teamwork', 'problem_solving',
            'time_management', 'organization', 'leadership', 'sales',
            'computer_skills', 'cash_handling', 'inventory_management',
            'cleaning', 'maintenance', 'security', 'conflict_resolution'
        ];
        
        const requiredSkills = role.requirements.skills || [];
        const additionalSkills = allSkills.filter(skill => !requiredSkills.includes(skill));
        
        // Start with required skills (with varying proficiency)
        const skills = {};
        requiredSkills.forEach(skill => {
            skills[skill] = Math.floor(Math.random() * 80) + 20; // 20-100 proficiency
        });
        
        // Add some additional skills
        const additionalCount = Math.floor(Math.random() * 4);
        for (let i = 0; i < additionalCount; i++) {
            const skill = additionalSkills[Math.floor(Math.random() * additionalSkills.length)];
            if (!skills[skill]) {
                skills[skill] = Math.floor(Math.random() * 70) + 10; // 10-80 proficiency
            }
        }
        
        return skills;
    }

    calculateQualificationScore(applicant, role) {
        let score = 0;
        const requirements = role.requirements;
        
        // Experience score (30 points)
        const experienceLevel = applicant.employment.experience.length;
        switch (requirements.experience) {
            case 'none':
                score += 30; // No experience required
                break;
            case 'some':
                score += Math.min(experienceLevel * 10, 30);
                break;
            case 'experienced':
                score += Math.min(experienceLevel * 5, 30);
                break;
        }
        
        // Skills score (40 points)
        const requiredSkills = requirements.skills || [];
        let skillsScore = 0;
        requiredSkills.forEach(skill => {
            const proficiency = applicant.employment.skills[skill] || 0;
            skillsScore += proficiency;
        });
        const averageSkills = skillsScore / (requiredSkills.length || 1);
        score += (averageSkills / 100) * 40;
        
        // Personality match (20 points)
        const requiredPersonality = requirements.personality || [];
        let personalityScore = 0;
        requiredPersonality.forEach(trait => {
            if (applicant.personalityTraits && applicant.personalityTraits.includes(trait)) {
                personalityScore += 20 / requiredPersonality.length;
            }
        });
        score += personalityScore;
        
        // Availability score (10 points)
        if (this.checkAvailabilityMatch(applicant, requirements)) {
            score += 10;
        }
        
        return Math.round(score);
    }

    // Interview process
    async scheduleInterview(applicationData) {
        const { applicationId, interviewDate, interviewType = 'in_person' } = applicationData;
        const application = this.activeApplications.get(applicationId);
        
        if (!application) {
            console.error('❌ Application not found:', applicationId);
            return false;
        }
        
        console.log(`📅 Scheduling interview for ${application.applicant.name}`);
        
        application.status = 'interview_scheduled';
        application.interview = {
            scheduledDate: interviewDate || Date.now() + (24 * 60 * 60 * 1000), // Default: tomorrow
            type: interviewType,
            status: 'scheduled',
            questions: this.generateInterviewQuestions(application.jobPostingId),
            duration: this.hiringConfig.interviewDuration
        };
        
        // Add to interview queue
        this.interviewQueue.push(application);
        
        // Emit interview scheduled event
        this.eventBus.emit('hiring.interviewScheduled', {
            application: application,
            interviewDate: application.interview.scheduledDate
        });
        
        return true;
    }

    generateInterviewQuestions(jobPostingId) {
        const commonQuestions = [
            "Tell me about yourself and your work experience.",
            "Why are you interested in working here?",
            "What are your greatest strengths?",
            "Describe a challenging situation you've handled.",
            "Where do you see yourself in 5 years?",
            "Why did you leave your last job?",
            "What motivates you at work?",
            "How do you handle stress and pressure?",
            "Do you have any questions for us?"
        ];
        
        const jobPosting = this.gameState.staff.openPositions.find(job => job.id === jobPostingId);
        const roleSpecificQuestions = this.getRoleSpecificQuestions(jobPosting?.roleId);
        
        // Combine and select random questions
        const allQuestions = [...commonQuestions, ...roleSpecificQuestions];
        const selectedQuestions = [];
        
        // Select 5-7 questions randomly
        const questionCount = Math.floor(Math.random() * 3) + 5;
        for (let i = 0; i < questionCount; i++) {
            const questionIndex = Math.floor(Math.random() * allQuestions.length);
            const question = allQuestions[questionIndex];
            if (!selectedQuestions.includes(question)) {
                selectedQuestions.push(question);
            }
        }
        
        return selectedQuestions;
    }

    getRoleSpecificQuestions(roleId) {
        const questionsByRole = {
            cashier: [
                "How would you handle an angry customer?",
                "Describe your experience with cash handling.",
                "How do you ensure accuracy in transactions?",
                "What would you do if the register came up short?"
            ],
            janitor: [
                "Are you comfortable working alone?",
                "How do you prioritize cleaning tasks?",
                "Have you worked with cleaning chemicals before?",
                "What would you do if you found something valuable?"
            ],
            stocker: [
                "Are you comfortable lifting heavy objects?",
                "How do you stay organized?",
                "What's your experience with inventory systems?",
                "How would you handle a delivery during busy hours?"
            ],
            security: [
                "Describe your conflict resolution skills.",
                "Have you worked in security before?",
                "How would you handle a suspected shoplifter?",
                "What's your approach to de-escalation?"
            ],
            assistant_manager: [
                "Describe your leadership experience.",
                "How do you motivate team members?",
                "What's your management philosophy?",
                "How do you handle employee conflicts?"
            ]
        };
        
        return questionsByRole[roleId] || [];
    }

    async conductInterview(interviewData) {
        const { applicationId, responses, interviewerNotes = '' } = interviewData;
        const application = this.activeApplications.get(applicationId);
        
        if (!application || application.status !== 'interview_scheduled') {
            console.error('❌ Invalid interview attempt:', applicationId);
            return false;
        }
        
        console.log(`🎤 Conducting interview with ${application.applicant.name}`);
        
        // Calculate interview score based on responses and applicant traits
        const interviewScore = this.calculateInterviewScore(application, responses);
        
        application.status = 'interviewed';
        application.interview.status = 'completed';
        application.interview.conductedDate = Date.now();
        application.interview.responses = responses;
        application.interview.score = interviewScore;
        application.interview.notes = interviewerNotes;
        application.interviewScore = interviewScore;
        
        // Update hiring metrics
        this.hiringMetrics.totalInterviews++;
        
        // Emit interview completed event
        this.eventBus.emit('hiring.interviewCompleted', {
            application: application,
            score: interviewScore
        });
        
        return interviewScore;
    }

    calculateInterviewScore(application, responses) {
        const applicant = application.applicant;
        let score = 0;
        
        // Base score from applicant traits
        const confidence = applicant.interview?.confidence || 50;
        const enthusiasm = applicant.interview?.enthusiasm || 50;
        const honesty = applicant.interview?.honesty || 50;
        const nervousness = applicant.interview?.nervousness || 50;
        
        // Calculate base performance (nervousness reduces performance)
        const basePerformance = (confidence + enthusiasm + honesty) / 3;
        const nervousnessReduction = nervousness / 10; // 0-10 point reduction
        
        score = basePerformance - nervousnessReduction;
        
        // Adjust based on response quality (if provided)
        if (responses && responses.length > 0) {
            const responseQuality = this.evaluateResponses(responses, application);
            score = (score + responseQuality) / 2;
        }
        
        // Random variation
        score += (Math.random() - 0.5) * 10;
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    evaluateResponses(responses, application) {
        // Simple response evaluation based on length and keywords
        let score = 50; // Base score
        
        responses.forEach(response => {
            const length = response.length;
            
            // Prefer moderate length responses
            if (length > 50 && length < 300) {
                score += 5;
            } else if (length < 20) {
                score -= 10; // Too short
            } else if (length > 500) {
                score -= 5; // Too long
            }
            
            // Look for positive keywords
            const positiveWords = ['experience', 'teamwork', 'customer', 'responsible', 'reliable'];
            positiveWords.forEach(word => {
                if (response.toLowerCase().includes(word)) {
                    score += 2;
                }
            });
        });
        
        return Math.max(0, Math.min(100, score));
    }

    // Job offer and hiring
    async makeJobOffer(offerData) {
        const { applicationId, salary, benefits = {}, startDate } = offerData;
        const application = this.activeApplications.get(applicationId);
        
        if (!application || application.status !== 'interviewed') {
            console.error('❌ Cannot make offer for application:', applicationId);
            return false;
        }
        
        console.log(`💼 Making job offer to ${application.applicant.name}`);
        
        const jobOffer = {
            applicationId: applicationId,
            salary: salary,
            benefits: benefits,
            startDate: startDate || Date.now() + (7 * 24 * 60 * 60 * 1000), // Default: 1 week
            offerDate: Date.now(),
            expiryDate: Date.now() + (3 * 24 * 60 * 60 * 1000), // 3 days to respond
            status: 'pending' // pending, accepted, rejected, expired
        };
        
        application.status = 'offer_made';
        application.jobOffer = jobOffer;
        
        // Simulate applicant decision-making
        setTimeout(() => {
            this.processOfferResponse(application);
        }, Math.random() * 24 * 60 * 60 * 1000); // Response within 24 hours
        
        // Emit offer made event
        this.eventBus.emit('hiring.offerMade', {
            application: application,
            offer: jobOffer
        });
        
        return jobOffer;
    }

    processOfferResponse(application) {
        const offer = application.jobOffer;
        const applicant = application.applicant;
        
        // Calculate acceptance probability
        let acceptanceProbability = 0.7; // Base 70% chance
        
        // Adjust based on salary compared to expectation
        const salaryRatio = offer.salary / applicant.employment.salaryExpectation;
        if (salaryRatio >= 1.1) acceptanceProbability += 0.2;
        else if (salaryRatio < 0.9) acceptanceProbability -= 0.3;
        
        // Adjust based on store reputation
        const reputation = this.gameState.store?.reputation || 50;
        acceptanceProbability += (reputation - 50) / 100;
        
        // Adjust based on desperation (lower qualification score = more desperate)
        if (application.qualificationScore < 50) acceptanceProbability += 0.2;
        
        // Random factor
        acceptanceProbability += (Math.random() - 0.5) * 0.2;
        
        // Make decision
        const accepted = Math.random() < acceptanceProbability;
        
        if (accepted) {
            this.acceptJobOffer(application);
        } else {
            this.rejectJobOffer(application);
        }
    }

    acceptJobOffer(application) {
        console.log(`✅ ${application.applicant.name} accepted job offer`);
        
        application.status = 'hired';
        application.jobOffer.status = 'accepted';
        application.hireDate = Date.now();
        
        // Add to hired staff
        this.onboardNewStaff(application);
        
        // Update hiring metrics
        this.hiringMetrics.totalHires++;
        
        // Emit offer accepted event
        this.eventBus.emit('hiring.offerAccepted', {
            application: application,
            employee: application.applicant
        });
    }

    rejectJobOffer(application) {
        console.log(`❌ ${application.applicant.name} rejected job offer`);
        
        application.status = 'rejected';
        application.jobOffer.status = 'rejected';
        application.rejectionReason = this.generateRejectionReason();
        
        // Emit offer rejected event
        this.eventBus.emit('hiring.offerRejected', {
            application: application,
            reason: application.rejectionReason
        });
    }

    generateRejectionReason() {
        const reasons = [
            'Found a better opportunity',
            'Salary below expectations',
            'Schedule conflicts',
            'Changed career direction',
            'Personal circumstances',
            'Too far from home',
            'Benefits not competitive'
        ];
        
        return reasons[Math.floor(Math.random() * reasons.length)];
    }

    // Staff onboarding
    onboardNewStaff(application) {
        const employee = this.createEmployeeRecord(application);
        
        // Add to game state
        this.gameState.staff.employees.push(employee);
        this.hiredStaff.set(employee.id, employee);
        
        // Start probation period
        this.startProbationPeriod(employee);
        
        // Emit staff hired event
        this.eventBus.emit('staff.hired', {
            employee: employee,
            application: application
        });
        
        console.log(`🎉 ${employee.name} successfully onboarded as ${employee.role.title}`);
        
        return employee;
    }

    createEmployeeRecord(application) {
        const applicant = application.applicant;
        const role = this.jobRoles.get(application.jobPostingId);
        
        return {
            id: this.generateEmployeeId(),
            name: applicant.name,
            role: role,
            hireDate: Date.now(),
            salary: application.jobOffer.salary,
            benefits: application.jobOffer.benefits,
            
            // Performance tracking
            performance: {
                productivity: 50, // Will improve with experience
                reliability: applicant.interview?.honesty || 75,
                customerSatisfaction: 50,
                teamwork: 50,
                punctuality: 75,
                overallRating: 50
            },
            
            // Work tracking
            schedule: {
                hoursWorked: 0,
                shiftsCompleted: 0,
                overtime: 0,
                absences: 0,
                tardiness: 0
            },
            
            // Status
            status: 'probation', // probation, active, terminated
            probationEndDate: Date.now() + (this.hiringConfig.probationPeriod * 24 * 60 * 60 * 1000),
            
            // Development
            training: {
                completed: [],
                inProgress: [],
                required: this.getRequiredTraining(role)
            },
            
            // Personal info
            personalInfo: {
                age: applicant.age,
                personality: applicant.personalityTraits,
                availability: applicant.employment.availability,
                emergencyContact: this.generateEmergencyContact()
            }
        };
    }

    getRequiredTraining(role) {
        const trainingByRole = {
            cashier: ['register_operation', 'customer_service', 'cash_handling', 'store_policies'],
            janitor: ['safety_procedures', 'equipment_use', 'chemical_handling'],
            stocker: ['inventory_systems', 'lifting_safety', 'product_organization'],
            security: ['loss_prevention', 'incident_reporting', 'conflict_resolution'],
            assistant_manager: ['leadership', 'policy_enforcement', 'performance_management']
        };
        
        return trainingByRole[role.id] || ['basic_orientation'];
    }

    // Daily and weekly processing
    processDailyHiring() {
        // Process application deadlines
        this.processApplicationDeadlines();
        
        // Process interview schedules
        this.processScheduledInterviews();
        
        // Process offer deadlines
        this.processOfferDeadlines();
        
        // Generate new applicants for open positions
        this.generateDailyApplicants();
    }

    processWeeklyHiring() {
        // Update hiring metrics
        this.updateHiringMetrics();
        
        // Process probation periods
        this.processProbationPeriods();
        
        // Generate hiring reports
        this.generateHiringReport();
    }

    // Utility methods
    generateJobId() {
        return 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateApplicationId() {
        return 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateEmployeeId() {
        return 'emp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Public API
    getJobRoles() {
        return Array.from(this.jobRoles.values());
    }

    getOpenPositions() {
        return this.gameState.staff.openPositions.filter(job => job.status === 'active');
    }

    getApplications(status = null) {
        if (status) {
            return this.gameState.staff.applications.filter(app => app.status === status);
        }
        return this.gameState.staff.applications;
    }

    getHiredStaff() {
        return this.gameState.staff.employees;
    }

    getHiringMetrics() {
        return { ...this.hiringMetrics };
    }

    // Manual hiring actions for player
    async requestJobPosting(roleId, urgency = 'normal') {
        return await this.postJobOpening({ roleId, urgency });
    }

    async reviewApplication(applicationId) {
        const application = this.activeApplications.get(applicationId);
        if (application) {
            application.status = 'reviewed';
            return application;
        }
        return null;
    }

    async approveForInterview(applicationId) {
        return await this.scheduleInterview({ applicationId });
    }

    async completeInterview(applicationId, responses, notes) {
        return await this.conductInterview({ applicationId, responses, interviewerNotes: notes });
    }

    async extendJobOffer(applicationId, salary, benefits) {
        return await this.makeJobOffer({ applicationId, salary, benefits });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StaffHiringSystem;
} else if (typeof window !== 'undefined') {
    window.StaffHiringSystem = StaffHiringSystem;
}
