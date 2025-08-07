const fs = require('fs');
const path = require('path');

class GameCompiler {
    constructor(configPath) {
        this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.srcPath = path.resolve(__dirname, '../src');
        this.outputPath = path.resolve(__dirname, this.config.outputPath);
    }

    compile() {
        console.log('🏗️  Starting Store Manager Simulator compilation...');
        
        // Read base template
        const basePath = path.resolve(__dirname, this.config.templatePath);
        let template = fs.readFileSync(basePath, 'utf8');
        
        // Compile HTML
        const htmlContent = this.compileHTML();
        template = template.replace('{{CONTENT_INJECTION_POINT}}', htmlContent);
        
        // Compile CSS
        const cssContent = this.compileCSS();
        template = template.replace('{{CSS_INJECTION_POINT}}', `<style>\n${cssContent}\n</style>`);
        
        // Compile JavaScript
        const jsContent = this.compileJS();
        template = template.replace('{{JS_INJECTION_POINT}}', `<script>\n${jsContent}\n</script>`);
        
        // Write final file
        fs.writeFileSync(this.outputPath, template);
        
        console.log('✅ Compilation complete!');
        console.log(`📁 Output: ${this.outputPath}`);
        console.log(`📊 Size: ${this.formatBytes(fs.statSync(this.outputPath).size)}`);
    }

    compileHTML() {
        console.log('📄 Compiling HTML files...');
        let htmlContent = '';
        
        this.config.buildOrder.html.forEach(file => {
            const filePath = path.join(this.srcPath, 'html', file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                htmlContent += content + '\n';
                console.log(`  ✓ ${file}`);
            } else {
                console.log(`  ⚠️  Missing: ${file}`);
            }
        });
        
        return htmlContent;
    }

    compileCSS() {
        console.log('🎨 Compiling CSS files...');
        let cssContent = '';
        
        this.config.buildOrder.css.forEach(file => {
            const filePath = path.join(this.srcPath, 'styles', file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                cssContent += content + '\n';
                console.log(`  ✓ ${file}`);
            } else {
                console.log(`  ⚠️  Missing: ${file}`);
            }
        });
        
        return this.config.minify ? this.minifyCSS(cssContent) : cssContent;
    }

    compileJS() {
        console.log('⚙️  Compiling JavaScript files...');
        let jsContent = '';
        
        this.config.buildOrder.js.forEach(file => {
            const filePath = path.join(this.srcPath, 'scripts', file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                jsContent += content + '\n';
                console.log(`  ✓ ${file}`);
            } else {
                console.log(`  ⚠️  Missing: ${file}`);
            }
        });
        
        return jsContent;
    }

    minifyCSS(css) {
        // Basic CSS minification
        return css
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/;\s*}/g, '}') // Remove last semicolon in blocks
            .replace(/\s*{\s*/g, '{') // Clean up braces
            .replace(/;\s*/g, ';') // Clean up semicolons
            .trim();
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// CLI usage
if (require.main === module) {
    const configPath = path.join(__dirname, 'config.json');
    const compiler = new GameCompiler(configPath);
    compiler.compile();
}

module.exports = GameCompiler;
