/**
 * Phase 5A Demo Launcher
 * Quick test interface for Staff Hiring System
 */

// Mock dependencies for testing
const mockGameState = {
    staff: {
        employees: [],
        openPositions: [],
        applications: [],
        totalHired: 0,
        hiringBudget: 1000,
        lastHireDate: null
    },
    store: {
        reputation: 65
    },
    npcSystem: {
        generateNPC: async (config) => {
            return {
                id: 'mock_' + Date.now(),
                name: ['Alex Johnson', 'Sarah Wilson', 'Mike Davis', 'Jessica Lee', 'David Brown'][Math.floor(Math.random() * 5)],
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

// Global variables for demo
let hiringSystem;
let hiringInterface;

// Demo initialization function
function initializeStaffHiringDemo() {
    console.log('🚀 Initializing Staff Hiring Demo...');
    
    // Create system instances
    hiringSystem = new StaffHiringSystem();
    hiringInterface = new StaffHiringInterface();
    
    // Initialize with mock dependencies
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
    
    // Render the interface
    const container = document.getElementById('staff-hiring-demo');
    if (container) {
        container.innerHTML = hiringInterface.render();
        console.log('✅ Staff Hiring Demo loaded successfully!');
        
        // Generate some demo applications
        setTimeout(() => {
            generateDemoApplications();
        }, 1000);
    } else {
        console.error('❌ Demo container not found! Please add <div id="staff-hiring-demo"></div> to your HTML');
    }
}

// Generate demo job applications
async function generateDemoApplications() {
    console.log('📄 Generating demo applications...');
    
    // Post some job openings
    await hiringSystem.postJobOpening({ roleId: 'cashier', urgency: 'normal' });
    await hiringSystem.postJobOpening({ roleId: 'stocker', urgency: 'urgent' });
    
    // Simulate some time passing for applications to be generated
    setTimeout(() => {
        hiringInterface.refreshUI();
        console.log('✅ Demo applications generated!');
    }, 2000);
}

// Demo action functions
function demoPostJob(roleId) {
    hiringSystem.requestJobPosting(roleId).then(() => {
        hiringInterface.refreshUI();
        console.log(`✅ Posted job for ${roleId}`);
    });
}

function demoScheduleInterview(applicationId) {
    hiringSystem.scheduleInterview({ applicationId }).then(() => {
        hiringInterface.refreshUI();
        console.log(`✅ Scheduled interview for application ${applicationId}`);
    });
}

function demoConductInterview(applicationId) {
    const responses = [
        "I have great customer service experience and love helping people.",
        "I'm very reliable and always show up on time for work.",
        "I work well in teams and communicate effectively with colleagues."
    ];
    
    hiringSystem.conductInterview({ 
        applicationId, 
        responses, 
        interviewerNotes: 'Demo interview conducted successfully' 
    }).then(() => {
        hiringInterface.refreshUI();
        console.log(`✅ Conducted interview for application ${applicationId}`);
    });
}

function demoMakeOffer(applicationId) {
    hiringSystem.makeJobOffer({ 
        applicationId, 
        salary: 40,
        benefits: { healthInsurance: false, paidTimeOff: 5 }
    }).then(() => {
        hiringInterface.refreshUI();
        console.log(`✅ Made job offer for application ${applicationId}`);
    });
}

// Global demo functions for HTML buttons
window.demoPostJob = demoPostJob;
window.demoScheduleInterview = demoScheduleInterview;
window.demoConductInterview = demoConductInterview;
window.demoMakeOffer = demoMakeOffer;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStaffHiringDemo);
} else {
    initializeStaffHiringDemo();
}

// Export for manual initialization
if (typeof window !== 'undefined') {
    window.initializeStaffHiringDemo = initializeStaffHiringDemo;
}
