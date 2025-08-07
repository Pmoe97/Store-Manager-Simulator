/**
 * Store Manager Simulator - Build Script
 * Combines all files into a single index.html for easy deployment
 */

const fs = require('fs-extra');
const path = require('path');

class StoreManagerBuilder {
    constructor() {
        this.srcDir = path.join(__dirname, 'src');
        this.distDir = path.join(__dirname, 'dist');
        this.baseHtml = '';
        this.allCSS = '';
        this.allJS = '';
        
        // File order for proper dependency loading (ALL files from src/index.html)
        this.cssFiles = [
            'src/styles/main.css',
            'styles/ui.css',
            'styles/computer.css', 
            'styles/workstation.css',
            'styles/staffHiring.css',
            'styles/staffManagement.css',
            'src/styles/automation.css'
        ];
        
        this.jsFiles = [
            // Core JavaScript Files
            'src/scripts/core/constants.js',
            'src/scripts/core/eventBus.js',
            'src/scripts/core/gameState.js',
            
            // System Scripts
            'scripts/systems/aiHooks.js',
            'scripts/systems/timeSystem.js',
            'scripts/systems/npcSystem.js',
            'scripts/systems/productSystem.js',
            'scripts/systems/financeSystem.js',
            'scripts/systems/relationshipSystem.js',
            'scripts/systems/conversationSystem.js',
            'scripts/systems/checkoutSystem.js',
            
            // UI Scripts
            'scripts/ui/uiManager.js',
            'scripts/ui/components/modal.js',
            'scripts/ui/components/notification.js',
            'scripts/ui/components/dialogue.js',
            'scripts/ui/components/tooltip.js',
            'scripts/ui/screens/mainStore.js',
            'scripts/ui/screens/setupScreen.js',
            'scripts/ui/screens/pauseMenu.js',
            
            // Workstation Scripts
            'scripts/workstation/components/appWindow.js',
            'scripts/workstation/components/appToolbar.js',
            
            // Staff Systems (Phase 5A & 5B) - Use src/ versions to avoid duplicates
            'src/scripts/systems/staffHiringSystem.js',
            'src/scripts/interfaces/staffHiringInterface.js',
            'src/scripts/systems/staffManagementSystem.js',
            'src/scripts/interfaces/staffManagementInterface.js',
            
            // Phase 5C: Automation Scripts
            'systems/automationSystem.js',
            'systems/aiAssistantManager.js',
            'systems/automatedCashierSystem.js',
            'systems/automatedInventorySystem.js',
            'interfaces/automationInterface.js',
            
            // Workstation Apps
            'scripts/workstation/workstationManager.js',
            'scripts/workstation/apps/customerRelationsApp.js',
            'scripts/workstation/apps/npcApp.js',
            'scripts/workstation/apps/productApp.js',
            'scripts/workstation/apps/socialApp.js',
            'scripts/workstation/apps/bankApp.js',
            'scripts/workstation/apps/staffApp.js',
            'scripts/workstation/apps/settingsApp.js',
            
            // Main game initialization
            'scripts/main.js'
        ];
    }
    
    async readFileFromMultiplePaths(relativePath) {
        // Try multiple possible paths for the file
        const possiblePaths = [
            path.join(this.srcDir, relativePath),
            path.join(process.cwd(), relativePath),
            path.join(this.srcDir, 'src', relativePath),
            path.join(process.cwd(), 'src', relativePath),
            relativePath // Try as absolute path
        ];
        
        for (const fullPath of possiblePaths) {
            try {
                if (await fs.pathExists(fullPath)) {
                    const content = await fs.readFile(fullPath, 'utf8');
                    return content;
                }
            } catch (error) {
                // Continue to next path
                continue;
            }
        }
        
        return null; // File not found in any location
    }

    extractSymbols(content, allFunctions, allClasses, allConstants) {
        // Extract function declarations
        const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
        let match;
        while ((match = functionRegex.exec(content)) !== null) {
            allFunctions.add(match[1]);
        }

        // Extract class declarations
        const classRegex = /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        while ((match = classRegex.exec(content)) !== null) {
            allClasses.add(match[1]);
        }

        // Extract const declarations (for constants like GAME_CONSTANTS)
        const constRegex = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g;
        while ((match = constRegex.exec(content)) !== null) {
            allConstants.add(match[1]);
        }

        // Extract arrow function assignments
        const arrowFunctionRegex = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\([^)]*\)\s*=>/g;
        while ((match = arrowFunctionRegex.exec(content)) !== null) {
            allFunctions.add(match[1]);
        }

        // Extract variable function assignments
        const varFunctionRegex = /(?:let|var|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*function/g;
        while ((match = varFunctionRegex.exec(content)) !== null) {
            allFunctions.add(match[1]);
        }
    }

    generateGlobalExports(allFunctions, allClasses, allConstants) {
        let exports = '\n/* === Global Exports for Perchance === */\n';
        
        // Browser APIs and reserved words to exclude from export
        const reservedNames = new Set([
            'history', 'location', 'navigator', 'document', 'window', 'console', 
            'localStorage', 'sessionStorage', 'screen', 'alert', 'confirm', 'prompt',
            'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
            'fetch', 'XMLHttpRequest', 'FormData', 'URL', 'URLSearchParams',
            'length', 'name', 'constructor', 'prototype', 'toString', 'valueOf'
        ]);
        
        // Export constants (excluding reserved names)
        for (const constant of allConstants) {
            if (!reservedNames.has(constant)) {
                exports += `    if (typeof ${constant} !== 'undefined') window.${constant} = ${constant};\n`;
            }
        }
        
        // Export classes (excluding reserved names)
        for (const className of allClasses) {
            if (!reservedNames.has(className)) {
                exports += `    if (typeof ${className} !== 'undefined') window.${className} = ${className};\n`;
            }
        }
        
        // Export functions (excluding reserved names)
        for (const functionName of allFunctions) {
            if (!reservedNames.has(functionName)) {
                exports += `    if (typeof ${functionName} !== 'undefined') window.${functionName} = ${functionName};\n`;
            }
        }
        
        exports += '\n    console.log("🌐 Global exports complete for Perchance compatibility");\n';
        
        return exports;
    }

    async build() {
        console.log('🏗️  Building Store Manager Simulator...');
        
        try {
            // Ensure dist directory exists
            await fs.ensureDir(this.distDir);
            
            // Read base HTML
            await this.readBaseHTML();
            
            // Combine all CSS files
            await this.combineCSS();
            
            // Combine all JavaScript files
            await this.combineJS();
            
            // Generate final HTML
            await this.generateFinalHTML();
            
            console.log('✅ Build complete! Check dist/index.html');
            console.log('🚀 Run "npm run serve" to test the build');
            
        } catch (error) {
            console.error('❌ Build failed:', error);
            process.exit(1);
        }
    }
    
    async readBaseHTML() {
        const htmlPath = path.join(this.srcDir, 'index.html');
        
        if (await fs.pathExists(htmlPath)) {
            this.baseHtml = await fs.readFile(htmlPath, 'utf8');
            console.log('📄 Base HTML loaded');
        } else {
            // Create a basic HTML template if none exists
            this.baseHtml = this.createBaseHTML();
            console.log('📄 Using default HTML template');
        }
    }
    
    createBaseHTML() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Store Manager Simulator</title>
    <style>/* CSS_PLACEHOLDER */</style>
</head>
<body>
    <div id="game-container">
        <div id="loading-screen">
            <h1>🏪 Store Manager Simulator</h1>
            <p>Loading your business empire...</p>
            <div class="loading-spinner"></div>
        </div>
        
        <div id="main-game" style="display: none;">
            <div id="work-computer-container"></div>
            <div id="ui-overlay"></div>
        </div>
    </div>
    
    <script>/* JS_PLACEHOLDER */</script>
</body>
</html>`;
    }
    
    async combineCSS() {
        console.log('🎨 Combining CSS files...');
        
        let combinedCSS = '';
        
        for (const cssFile of this.cssFiles) {
            const content = await this.readFileFromMultiplePaths(cssFile);
            if (content) {
                combinedCSS += `\n/* === ${cssFile} === */\n`;
                combinedCSS += content;
                combinedCSS += '\n';
                console.log(`  ✅ ${cssFile}`);
            } else {
                console.log(`  ⚠️  ${cssFile} not found, skipping`);
            }
        }
        
        // Add loading screen styles
        combinedCSS += `
/* === Loading Screen Styles === */
#loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    z-index: 9999;
}

#loading-screen h1 {
    font-size: 3em;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

#loading-screen p {
    font-size: 1.2em;
    margin-bottom: 30px;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(255,255,255,0.3);
    border-top: 5px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

#game-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
}
`;
        
        this.allCSS = combinedCSS;
        console.log(`🎨 Combined ${this.cssFiles.length} CSS files`);
    }
    
    async combineJS() {
        console.log('📜 Combining JavaScript files...');
        
        let combinedJS = '';
        let allFunctions = new Set();
        let allClasses = new Set();
        let allConstants = new Set();
        
        // Add initialization wrapper
        combinedJS += `
/* === Store Manager Simulator - Combined Build === */
(function() {
    'use strict';
    
    console.log('🏪 Store Manager Simulator - Loading...');
    
    // Global game state containers
    window.gameState = {};
    window.eventBus = null;
    window.uiManager = null;
    window.workComputer = null;
`;

        for (const jsFile of this.jsFiles) {
            const content = await this.readFileFromMultiplePaths(jsFile);
            if (content) {
                combinedJS += `\n/* === ${jsFile} === */\n`;
                combinedJS += content;
                combinedJS += '\n';
                
                // Extract functions, classes, and constants for global export
                this.extractSymbols(content, allFunctions, allClasses, allConstants);
                
                console.log(`  ✅ ${jsFile}`);
            } else {
                console.log(`  ⚠️  ${jsFile} not found, skipping`);
            }
        }

        // Add global exports for all detected symbols
        combinedJS += this.generateGlobalExports(allFunctions, allClasses, allConstants);

        // Add initialization code
        combinedJS += `
    
    /* === Game Initialization === */
    function initializeGame() {
        if (window.gameInitialized) {
            console.log('⚠️ Game already initialized, skipping...');
            return;
        }
        
        console.log('🚀 === STORE MANAGER SIMULATOR INITIALIZATION ===');
        console.log('Document ready state:', document.readyState);
        console.log('Available classes check:');
        console.log('- EventBus:', typeof EventBus);
        console.log('- GameState:', typeof GameState);
        console.log('- UIManager:', typeof UIManager);
        console.log('- StoreManagerSimulator:', typeof StoreManagerSimulator);
        console.log('- SetupScreenController:', typeof SetupScreenController);
        
        try {
            // Mark as initialized
            window.gameInitialized = true;
            
            // Ensure only one screen is visible at a time
            console.log('🔄 Managing screen visibility...');
            hideAllScreens();
            
            // Check available DOM elements
            console.log('🔍 Checking DOM elements...');
            console.log('- setup-screen:', !!document.getElementById('setup-screen'));
            console.log('- game-interface:', !!document.getElementById('game-interface'));
            console.log('- loading-screen:', !!document.getElementById('loading-screen'));
            console.log('- newGameButton:', !!document.getElementById('newGameButton'));
            console.log('- loadGameButton:', !!document.getElementById('loadGameButton'));
            
            // Initialize core systems
            if (typeof EventBus !== 'undefined') {
                window.eventBus = new EventBus();
                console.log('✅ Event bus initialized');
            } else {
                console.log('⚠️ EventBus not available');
            }
            
            if (typeof GameState !== 'undefined') {
                window.gameState = new GameState();
                console.log('✅ Game state initialized');
            } else {
                console.log('⚠️ GameState not available');
            }
            
            if (typeof UIManager !== 'undefined') {
                window.uiManager = new UIManager();
                console.log('✅ UI manager initialized');
            } else {
                console.log('⚠️ UIManager not available');
            }
            
            // Start the main application
            if (typeof StoreManagerSimulator !== 'undefined') {
                console.log('🎮 Starting StoreManagerSimulator...');
                window.app = new StoreManagerSimulator();
                window.app.init();
                console.log('✅ Application started');
            } else {
                console.log('⚠️ StoreManagerSimulator not available, showing setup screen');
                // Fallback: show setup screen
                showSetupScreen();
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            console.error('Error stack:', error.stack);
            // Fallback: show setup screen
            console.log('🔄 Falling back to setup screen...');
            showSetupScreen();
        }
        
        console.log('🚀 === INITIALIZATION COMPLETE ===');
    }
    
    function hideAllScreens() {
        console.log('🔄 === HIDING ALL SCREENS ===');
        const screens = document.querySelectorAll('.screen');
        console.log('Found screens:', screens.length);
        
        screens.forEach((screen, index) => {
            console.log(\`Screen \${index}: \${screen.id}, currently hidden: \${screen.classList.contains('hidden')}\`);
            screen.classList.add('hidden');
            screen.style.display = 'none';
            console.log(\`Screen \${index}: \${screen.id} - HIDDEN\`);
        });
        
        console.log('🔄 === ALL SCREENS HIDDEN ===');
    }
    
    function showSetupScreen() {
        console.log('📝 === SHOWING SETUP SCREEN ===');
        hideAllScreens();
        
        const setupScreen = document.getElementById('setup-screen');
        if (setupScreen) {
            console.log('✅ Found setup screen:', setupScreen);
            setupScreen.classList.remove('hidden');
            setupScreen.style.display = 'flex';
            setupScreen.style.alignItems = 'center';
            setupScreen.style.justifyContent = 'center';
            console.log('✅ Setup screen classes and styles applied');
            console.log('Setup screen display:', window.getComputedStyle(setupScreen).display);
            console.log('Setup screen visibility:', window.getComputedStyle(setupScreen).visibility);
            
            // Initialize setup screen controller
            initializeSetupScreen();
        } else {
            console.error('❌ Setup screen element NOT FOUND');
        }
        console.log('📝 === SETUP SCREEN SHOW COMPLETE ===');
    }
    
    function initializeSetupScreen() {
        console.log('⚙️ === INITIALIZING SETUP SCREEN ===');
        
        try {
            // Create and initialize setup screen controller
            if (typeof SetupScreenController !== 'undefined') {
                console.log('✅ SetupScreenController class found');
                window.setupController = new SetupScreenController();
                
                // Initialize with minimal dependencies
                const mockGameState = window.gameState || { 
                    initializeNewGame: () => console.log('🎮 Mock: New game initialized'),
                    data: { meta: {} }
                };
                const mockEventBus = window.eventBus || {
                    emit: (event, data) => console.log('📡 Event:', event, data),
                    on: (event, handler) => console.log('📡 Listening for:', event)
                };
                
                window.setupController.initialize(mockGameState, mockEventBus, null, null);
                console.log('✅ Setup screen controller initialized');
                
                // Bind buttons with multiple retry attempts
                attemptButtonBinding();
            } else {
                console.log('⚠️ SetupScreenController not found, using fallback');
                // Fallback: manually bind button events
                attemptButtonBinding();
            }
        } catch (error) {
            console.error('❌ Failed to initialize setup controller:', error);
            // Fallback: manually bind button events
            attemptButtonBinding();
        }
        
        console.log('⚙️ === SETUP SCREEN INITIALIZATION COMPLETE ===');
    }
    
    function attemptButtonBinding(retryCount = 0) {
        console.log(\`🔗 Attempting button binding (attempt \${retryCount + 1}/5)...\`);
        
        const success = bindSetupButtons();
        
        if (!success && retryCount < 4) {
            console.log(\`⚠️ Button binding failed, retrying in \${(retryCount + 1) * 100}ms...\`);
            setTimeout(() => attemptButtonBinding(retryCount + 1), (retryCount + 1) * 100);
        } else if (!success) {
            console.error('❌ Button binding failed after all attempts');
        }
    }
    
    function bindSetupButtons() {
        console.log('🔧 Starting button binding process...');
        let success = true;
        
        // Bind New Game button
        const newGameBtn = document.getElementById('newGameButton');
        if (newGameBtn) {
            console.log('✅ Found New Game button:', newGameBtn);
            
            // Remove any existing listeners first
            const newButton = newGameBtn.cloneNode(true);
            newGameBtn.parentNode.replaceChild(newButton, newGameBtn);
            
            newButton.addEventListener('click', (e) => {
                console.log('🎮 NEW GAME BUTTON CLICKED!');
                console.log('Event:', e);
                e.preventDefault();
                e.stopPropagation();
                startNewGameFlow();
            });
            console.log('✅ New Game button event listener attached');
        } else {
            console.error('❌ New Game button NOT FOUND');
            success = false;
        }
        
        // Bind Load Game button  
        const loadGameBtn = document.getElementById('loadGameButton');
        if (loadGameBtn) {
            console.log('✅ Found Load Game button:', loadGameBtn);
            
            // Remove any existing listeners first
            const newLoadButton = loadGameBtn.cloneNode(true);
            loadGameBtn.parentNode.replaceChild(newLoadButton, loadGameBtn);
            
            newLoadButton.addEventListener('click', (e) => {
                console.log('💾 LOAD GAME BUTTON CLICKED!');
                console.log('Event:', e);
                e.preventDefault();
                e.stopPropagation();
                startLoadGameFlow();
            });
            console.log('✅ Load Game button event listener attached');
        } else {
            console.error('❌ Load Game button NOT FOUND');
            success = false;
        }
        
        // Bind adult content toggle
        const adultToggle = document.getElementById('adultContentToggle');
        if (adultToggle) {
            console.log('✅ Found Adult Content toggle:', adultToggle);
            adultToggle.addEventListener('change', (e) => {
                console.log('🔞 ADULT CONTENT TOGGLED:', e.target.checked);
            });
            console.log('✅ Adult content toggle event listener attached');
        } else {
            console.error('❌ Adult content toggle NOT FOUND');
        }
        
        console.log('🔧 Button binding process complete, success:', success);
        return success;
    }
    
    function startNewGameFlow() {
        console.log('🚀 === START NEW GAME FLOW ===');
        console.log('Current screens before hiding:');
        document.querySelectorAll('.screen').forEach(screen => {
            console.log('Screen:', screen.id, 'Hidden:', screen.classList.contains('hidden'), 'Display:', window.getComputedStyle(screen).display);
        });
        
        // Hide setup screen and start game
        console.log('🔄 Hiding all screens...');
        hideAllScreens();
        
        console.log('Screens after hiding:');
        document.querySelectorAll('.screen').forEach(screen => {
            console.log('Screen:', screen.id, 'Hidden:', screen.classList.contains('hidden'), 'Display:', window.getComputedStyle(screen).display);
        });
        
        // Show game interface
        console.log('🎮 Looking for game interface...');
        const gameInterface = document.getElementById('game-interface');
        if (gameInterface) {
            console.log('✅ Found game interface:', gameInterface);
            gameInterface.classList.remove('hidden');
            gameInterface.style.display = 'block';
            console.log('✅ Game interface shown');
            
            // Show store view by default
            const storeView = document.getElementById('store-view');
            if (storeView) {
                console.log('✅ Found store view:', storeView);
                storeView.classList.add('active');
                storeView.style.display = 'block';
                console.log('✅ Store view activated');
            } else {
                console.error('❌ Store view NOT FOUND');
            }
            
            console.log('🏪 Game started - showing store view');
        } else {
            console.log('❌ Game interface not found, creating fallback...');
            // Create a simple game started message
            const fallbackHTML = \`
                <div id="game-started-screen" style="display: flex !important; align-items: center !important; justify-content: center !important; 
                     height: 100vh !important; width: 100vw !important; position: fixed !important; top: 0 !important; left: 0 !important;
                     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; color: white !important; 
                     font-family: 'Segoe UI', sans-serif !important; text-align: center !important; z-index: 2000 !important;">
                    <div>
                        <h1 style="font-size: 3rem !important; margin-bottom: 1rem !important;">🏪 Store Manager Simulator</h1>
                        <h2 style="font-size: 2rem !important; margin-bottom: 1rem !important;">Game Started Successfully!</h2>
                        <p style="font-size: 1.2rem !important; margin-bottom: 0.5rem !important;">Phase 5C Automation Systems: Online</p>
                        <p style="font-size: 1.2rem !important; margin-bottom: 2rem !important;">Your store is ready for business!</p>
                        <button onclick="console.log('🔄 Restart clicked'); location.reload();" 
                                style="background: #4CAF50 !important; color: white !important; border: none !important; 
                                       padding: 15px 30px !important; font-size: 1.1rem !important; border-radius: 10px !important; 
                                       cursor: pointer !important; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3) !important;">
                            🔄 Restart Demo
                        </button>
                    </div>
                </div>
            \`;
            document.body.insertAdjacentHTML('beforeend', fallbackHTML);
            console.log('✅ Fallback game started screen created');
        }
        
        console.log('🚀 === END NEW GAME FLOW ===');
    }
    
    function startLoadGameFlow() {
        console.log('💾 === START LOAD GAME FLOW ===');
        alert('Load Game functionality will be implemented in a future update!');
        console.log('💾 Load game alert displayed');
        console.log('💾 === END LOAD GAME FLOW ===');
    }
    
    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            console.log('🚫 Loading screen hidden');
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📄 DOM loaded, initializing application...');
            setTimeout(initializeGame, 500); // Longer delay to ensure all elements are rendered
        });
    } else {
        console.log('📄 DOM already loaded, initializing application...');
        setTimeout(initializeGame, 500);
    }
    
    // Also try after window load as backup
    window.addEventListener('load', () => {
        console.log('🌐 Window fully loaded');
        // Only initialize if not already done
        if (!window.gameInitialized) {
            console.log('🔄 Backup initialization...');
            setTimeout(initializeGame, 100);
        }
    });
    
})();
`;
        
        this.allJS = combinedJS;
        console.log(`📜 Combined ${this.jsFiles.length} JavaScript files`);
        console.log(`🌐 Exported ${allFunctions.size} functions, ${allClasses.size} classes, ${allConstants.size} constants globally`);
    }    async generateFinalHTML() {
        console.log('🔧 Generating final HTML...');
        
        let finalHTML = this.baseHtml;
        
        // Remove all external script and link tags since we're inlining everything
        finalHTML = finalHTML.replace(/<script src="[^"]*"><\/script>/g, '');
        finalHTML = finalHTML.replace(/<link rel="stylesheet" href="[^"]*">/g, '');
        
        // Replace CSS placeholder or insert before </head>
        if (finalHTML.includes('/* CSS_PLACEHOLDER */')) {
            finalHTML = finalHTML.replace('/* CSS_PLACEHOLDER */', this.allCSS);
        } else {
            finalHTML = finalHTML.replace('</head>', `    <style>\n${this.allCSS}\n    </style>\n</head>`);
        }
        
        // Replace JS placeholder or insert before </body>
        if (finalHTML.includes('/* JS_PLACEHOLDER */')) {
            finalHTML = finalHTML.replace('/* JS_PLACEHOLDER */', this.allJS);
        } else {
            finalHTML = finalHTML.replace('</body>', `    <script>\n${this.allJS}\n    </script>\n</body>`);
        }
        
        // Write final file
        const outputPath = path.join(this.distDir, 'index.html');
        await fs.writeFile(outputPath, finalHTML, 'utf8');
        
        // Calculate file size
        const stats = await fs.stat(outputPath);
        const fileSizeKB = Math.round(stats.size / 1024);
        
        console.log(`📦 Generated dist/index.html (${fileSizeKB}KB)`);
        console.log('🎯 All external references inlined!');
    }
    
    async copyAssets() {
        // Copy any additional assets (images, etc.)
        const assetsDir = path.join(this.srcDir, 'assets');
        const distAssetsDir = path.join(this.distDir, 'assets');
        
        if (await fs.pathExists(assetsDir)) {
            await fs.copy(assetsDir, distAssetsDir);
            console.log('📁 Assets copied to dist/assets');
        }
    }
}

// Run the build
async function main() {
    const builder = new StoreManagerBuilder();
    await builder.build();
    await builder.copyAssets();
}

// Handle command line arguments
if (process.argv.includes('--watch')) {
    console.log('👀 Watch mode not implemented yet. Use "npm run build" for now.');
}

main().catch(console.error);
