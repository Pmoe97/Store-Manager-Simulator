# Store Manager Simulator - Build & Deployment Guide

## 🏗️ Single-File Build System

This build system combines all CSS and JavaScript files into a single `index.html` file for easy deployment and testing.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Project
```bash
npm run build
```
This creates `dist/index.html` with everything embedded.

### 3. Test Locally
```bash
npm run serve
```
Opens the built game at `http://localhost:3000`

### 4. Deploy Anywhere
Simply upload `dist/index.html` to any web server!

## 📁 Build Output

- **`dist/index.html`** - Complete game in a single file (~257KB)
- **`dist/assets/`** - Any additional assets (images, etc.)

## 🎯 What Gets Included

### CSS Files
- `styles/main.css` - Core game styling
- `styles/automation.css` - Phase 5C automation interface styles

### JavaScript Files
- `scripts/core/eventBus.js` - Event system
- `scripts/core/gameState.js` - Game state management
- `systems/automationSystem.js` - Phase 5C automation core
- `systems/aiAssistantManager.js` - AI assistant logic
- `systems/automatedCashierSystem.js` - Automated cashier
- `systems/automatedInventorySystem.js` - Smart inventory
- `interfaces/automationInterface.js` - Automation UI
- `scripts/workstation/workstationManager.js` - Computer interface
- `scripts/main.js` - Game initialization

## 🔧 Build Configuration

Edit `build.js` to:
- Add/remove files from the build
- Change file order (important for dependencies)
- Modify output format
- Add custom build steps

## 📦 Deployment Options

### Static Web Hosting
Upload `dist/index.html` to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

### Perchance Integration
The single HTML file can be easily integrated into Perchance generators.

### Local Testing
Double-click `dist/index.html` to run locally (some features may need a server).

## 🛠️ Development Workflow

1. **Make changes** to source files in `src/`
2. **Run build** with `npm run build`
3. **Test** with `npm run serve`
4. **Deploy** `dist/index.html`

## 📊 Current Build Stats

- **File Size**: ~257KB (all-in-one)
- **Files Combined**: 11 JavaScript + 2 CSS
- **Features**: Complete Phase 5C automation system
- **Compatibility**: Modern browsers with ES6+ support

## 🎮 What's Included in This Build

### Phase 5C: Complete Automation Systems
- 🧠 **AI Assistant Manager** - Strategic decision support
- 🤖 **Automated Cashier** - AI customer service  
- 📦 **Smart Inventory** - Predictive restocking
- 🛡️ **Security & Maintenance** - Automated monitoring
- 📊 **Performance Analytics** - Real-time metrics

### Workstation Computer Interface
- Desktop environment with window management
- Multiple business applications
- Professional management tools

### Core Game Systems
- Event-driven architecture
- State management
- UI framework

## 🔄 Rebuilding

Whenever you modify source files, run:
```bash
npm run build
```

The build system will automatically:
1. Combine all CSS into embedded styles
2. Combine all JavaScript with proper dependency order
3. Generate a single HTML file with everything inlined
4. Optimize for deployment

## 🚀 Ready to Deploy!

Your Store Manager Simulator is now ready for deployment as a single HTML file. Perfect for:
- Web hosting
- Game portals  
- Educational platforms
- Portfolio demonstrations
- Quick prototyping

Happy building! 🎯
