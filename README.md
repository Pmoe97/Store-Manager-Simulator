# Store Manager Simulator - Development Guide

## 🏗️ Build System Overview

This project uses a **compilation-based architecture** designed specifically for Perchance.org deployment.

### Key Concepts

- **Source Development**: All code is written in separate files under `/src/`
- **Compiled Output**: Everything gets compiled into a single `dist/index.html`
- **Perchance Ready**: Only `dist/index.html` needs to be uploaded to Perchance.org

## 📁 Project Structure

```
StoreManagerSimulator/
├── src/                    # Source files (DEVELOP HERE)
│   ├── html/              # HTML templates  
│   ├── scripts/           # JavaScript modules
│   ├── styles/            # CSS files
│   └── data/              # Game data files
├── build/                 # Build system
│   ├── compiler.js        # Main compilation script
│   └── config.json        # Build configuration
├── dist/                  # Compiled output
│   └── index.html         # FINAL GAME (upload to Perchance)
└── package.json
```

## ⚙️ Development Workflow

### 1. Setup
```bash
cd StoreManagerSimulator
npm install
```

### 2. Development
```bash
# Build once
npm run build

# Auto-rebuild on file changes (recommended)
npm run watch
```

### 3. Deployment
- Upload only `dist/index.html` to Perchance.org
- Test the game on Perchance platform

## 🔧 Build Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile all source files into `dist/index.html` |
| `npm run dev` | Development build with console output |
| `npm run watch` | Auto-compile when files change |
| `npm run clean` | Clean the dist directory |

## 📝 File Organization Rules

### HTML Templates (`src/html/`)
- `base.html`: Main template with injection points
- `screens/`: Game screen templates
- `components/`: Reusable UI components

### JavaScript (`src/scripts/`)
- `core/`: Core game systems
- `systems/`: Game mechanics
- `ui/`: User interface logic
- `workstation/`: Computer interface

### CSS (`src/styles/`)
- Component-based organization
- Theme support
- Screen-specific styles

## 🎯 Development Best Practices

1. **Never edit `dist/index.html` manually**
2. **Always run build after changes**
3. **Use the watch command during development**
4. **Test compiled output before deployment**
5. **Keep Perchance plugin imports in `base.html`**

## 🔍 Debugging

- Check build console output for missing files
- Verify file paths match `build/config.json`
- Test compiled game in browser before Perchance upload
- Use browser DevTools to debug the compiled version

## 📦 Perchance Integration

The build system automatically:
- Inlines all CSS and JavaScript
- Preserves Perchance plugin imports
- Creates a single-file game ready for upload
- Maintains all functionality in the compiled version
