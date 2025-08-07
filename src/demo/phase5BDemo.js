/**
 * Phase 5B Demo Launcher
 * Complete Staff Management & Scheduling System test interface
 */

// Enhanced mock dependencies for Phase 5B testing
const mockGameState = {
    staff: {
        employees: [
            {
                id: 'emp_001',
                name: 'Sarah Johnson',
                role: { id: 'cashier', title: 'Cashier', icon: '💰' },
                status: 'active',
                hireDate: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
                salary: 40,
                performance: {
                    overallRating: 85,
                    productivity: 88,
                    reliability: 90,
                    customerSatisfaction: 82,
                    punctuality: 95,
                    teamwork: 78
                },
                schedule: {
                    hoursWorked: 160,
                    shiftsCompleted: 20,
                    overtime: 5,
                    absences: 1,
                    tardiness: 0
                },
                training: {
                    completed: ['basic_orientation', 'cashier_certification'],
                    inProgress: ['customer_service_excellence'],
                    assigned: []
                },
                employment: {
                    skills: {
                        customer_service: 85,
                        cash_handling: 90,
                        communication: 80,
                        teamwork: 78
                    }
                }
            },
            {
                id: 'emp_002',
                name: 'Mike Chen',
                role: { id: 'stocker', title: 'Stocker', icon: '📦' },
                status: 'active',
                hireDate: Date.now() - (45 * 24 * 60 * 60 * 1000), // 45 days ago
                salary: 35,
                performance: {
                    overallRating: 78,
                    productivity: 82,
                    reliability: 85,
                    customerSatisfaction: 75,
                    punctuality: 88,
                    teamwork: 85
                },
                schedule: {
                    hoursWorked: 180,
                    shiftsCompleted: 22,
                    overtime: 8,
                    absences: 0,
                    tardiness: 2
                },
                training: {
                    completed: ['basic_orientation', 'inventory_management'],
                    inProgress: [],
                    assigned: ['customer_service_excellence']
                },
                employment: {
                    skills: {
                        organization: 88,
                        inventory_management: 82,
                        physical_fitness: 90,
                        teamwork: 85
                    }
                }
            },
            {
                id: 'emp_003',
                name: 'Alex Rodriguez',
                role: { id: 'security', title: 'Security Guard', icon: '🛡️' },
                status: 'probation',
                hireDate: Date.now() - (10 * 24 * 60 * 60 * 1000), // 10 days ago
                salary: 50,
                performance: {
                    overallRating: 65,
                    productivity: 70,
                    reliability: 68,
                    customerSatisfaction: 72,
                    punctuality: 85,
                    teamwork: 60
                },
                schedule: {
                    hoursWorked: 80,
                    shiftsCompleted: 10,
                    overtime: 2,
                    absences: 1,
                    tardiness: 1
                },
                training: {
                    completed: ['basic_orientation'],
                    inProgress: ['security_training'],
                    assigned: []
                },
                employment: {
                    skills: {
                        security: 75,
                        conflict_resolution: 68,
                        observation: 80,
                        communication: 65
                    }
                }
            }
        ],
        openPositions: [],
        applications: [],
        totalHired: 3,
        hiringBudget: 800,
        lastHireDate: Date.now() - (10 * 24 * 60 * 60 * 1000)
    },
    staffManagement: {
        schedules: [],
        shifts: [],
        performances: [],
        training: [],
        teamDynamics: {
            morale: 78,
            productivity: 82,
            teamwork: 75
        },
        metrics: {
            averagePerformance: 76,
            turnoverRate: 8,
            customerSatisfaction: 82,
            operational_efficiency: 79
        }
    },
    store: {
        reputation: 75,
        operatingHours: {
            is24Hour: false,
            open: '08:00',
            close: '22:00'
        }
    },
    npcSystem: {
        generateNPC: async (config) => {
            const names = ['Emma Wilson', 'David Brown', 'Lisa Garcia', 'Tom Anderson', 'Maya Patel'];
            return {
                id: 'mock_' + Date.now(),
                name: names[Math.floor(Math.random() * names.length)],
                age: Math.floor(Math.random() * 30) + 18,
                personalityTraits: ['friendly', 'reliable', 'hardworking'],
                background: 'Mock applicant generated for demo'
            };
        }
    },
    aiContentManager: {
        generateContent: async (prompt) => {
            return {
                content: 'Mock AI generated content for: ' + prompt,
                confidence: 0.8
            };
        }
    },
    timeSystem: {
        getCurrentTime: () => Date.now(),
        processWeeklyPayroll: () => console.log('📊 Processing payroll...')
    }
};

const mockEventBus = {
    events: {},
    on: function(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    },
    emit: function(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
};

// Global variables for Phase 5B demo
let staffManagementSystem;
let staffManagementInterface;
let hiringSystem;
let hiringInterface;

// Demo initialization function
function initializePhase5BDemo() {
    console.log('🚀 Initializing Phase 5B: Staff Management & Scheduling Demo...');
    
    // Create system instances
    hiringSystem = new StaffHiringSystem();
    hiringInterface = new StaffHiringInterface();
    staffManagementSystem = new StaffManagementSystem();
    staffManagementInterface = new StaffManagementInterface();
    
    // Initialize hiring system first (Phase 5A)
    hiringSystem.initialize(
        mockGameState,
        mockEventBus,
        mockGameState.npcSystem,
        mockGameState.aiContentManager
    );
    
    hiringInterface.initialize(
        hiringSystem,
        mockGameState,
        mockEventBus
    );
    
    // Initialize management system (Phase 5B)
    staffManagementSystem.initialize(
        mockGameState,
        mockEventBus,
        hiringSystem,
        mockGameState.timeSystem
    );
    
    staffManagementInterface.initialize(
        staffManagementSystem,
        hiringSystem,
        mockGameState,
        mockEventBus
    );
    
    // Render the interface
    const container = document.getElementById('phase5b-demo');
    if (container) {
        container.innerHTML = renderPhase5BInterface();
        console.log('✅ Phase 5B Demo loaded successfully!');
        
        // Generate demo schedule
        setTimeout(() => {
            generateDemoSchedule();
        }, 1000);
    } else {
        console.error('❌ Demo container not found! Please add <div id="phase5b-demo"></div> to your HTML');
    }
}

function renderPhase5BInterface() {
    return `
        <div class="staff-app-container">
            <div class="staff-app-tabs">
                <button class="staff-tab active" onclick="switchDemoTab('management')">
                    📊 Management
                </button>
                <button class="staff-tab" onclick="switchDemoTab('hiring')">
                    👔 Hiring
                </button>
            </div>
            <div class="staff-app-content" id="demoContent">
                ${staffManagementInterface.render()}
            </div>
        </div>
    `;
}

function switchDemoTab(tab) {
    // Update tab appearance
    document.querySelectorAll('.staff-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update content
    const contentElement = document.getElementById('demoContent');
    if (tab === 'management') {
        contentElement.innerHTML = staffManagementInterface.render();
    } else {
        contentElement.innerHTML = hiringInterface.render();
    }
    
    updateDemoStatus(`Switched to ${tab} interface`);
}

// Demo action functions
async function generateDemoSchedule() {
    console.log('📅 Generating demo weekly schedule...');
    
    try {
        const weekStart = staffManagementSystem.getCurrentWeekStart();
        const schedule = await staffManagementSystem.createWeeklySchedule(weekStart, {
            autoAssign: true,
            considerPreferences: true,
            optimizeForCosts: false
        });
        
        if (schedule) {
            updateDemoStatus('Demo schedule created successfully! 📅');
            refreshDemoInterface();
        }
    } catch (error) {
        console.error('❌ Error generating demo schedule:', error);
        updateDemoStatus('Error generating schedule 😞');
    }
}

async function demoPerformanceReview(employeeId) {
    console.log('⭐ Conducting demo performance review...');
    
    try {
        const review = await staffManagementSystem.conductPerformanceReview({
            employeeId: employeeId,
            reviewerId: 'demo_manager',
            period: '90_days',
            metrics: {}
        });
        
        if (review) {
            updateDemoStatus(`Performance review completed for employee ${employeeId}! ⭐`);
            refreshDemoInterface();
        }
    } catch (error) {
        console.error('❌ Error conducting review:', error);
    }
}

async function demoAssignTraining(employeeId, programId) {
    console.log('🎓 Assigning demo training...');
    
    try {
        const training = await staffManagementSystem.assignTraining({
            employeeId: employeeId,
            programId: programId,
            priority: 'normal'
        });
        
        if (training) {
            updateDemoStatus(`Training assigned to employee ${employeeId}! 🎓`);
            refreshDemoInterface();
        }
    } catch (error) {
        console.error('❌ Error assigning training:', error);
    }
}

function demoCreateShift(templateId) {
    console.log('⏰ Creating demo shift...');
    
    const template = staffManagementSystem.shiftTemplates.get(templateId);
    if (template) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const shift = staffManagementSystem.createShiftFromTemplate(template, today.getTime());
        updateDemoStatus(`${template.name} shift created! ⏰`);
        refreshDemoInterface();
    }
}

function refreshDemoInterface() {
    // Refresh current view
    const managementTab = document.querySelector('.staff-tab.active');
    if (managementTab && managementTab.textContent.includes('Management')) {
        staffManagementInterface.refreshUI();
    } else {
        hiringInterface.refreshUI();
    }
}

function updateDemoStatus(message) {
    const statusEl = document.getElementById('demoStatus');
    if (statusEl) {
        statusEl.textContent = message;
        console.log('📢 Demo Status:', message);
    }
}

// Global demo functions for HTML buttons
window.switchDemoTab = switchDemoTab;
window.generateDemoSchedule = generateDemoSchedule;
window.demoPerformanceReview = demoPerformanceReview;
window.demoAssignTraining = demoAssignTraining;
window.demoCreateShift = demoCreateShift;
window.staffManagementInterface = staffManagementInterface;
window.hiringInterface = hiringInterface;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePhase5BDemo);
} else {
    initializePhase5BDemo();
}

// Export for manual initialization
if (typeof window !== 'undefined') {
    window.initializePhase5BDemo = initializePhase5BDemo;
}
