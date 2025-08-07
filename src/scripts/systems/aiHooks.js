// AI Hooks for Perchance Plugin Integration
class AIHooks {
    constructor() {
        this.initialized = false;
        this.generationQueue = [];
        this.cache = new Map();
        this.isGenerating = false;
    }

    // Initialize AI systems
    initialize() {
        if (this.initialized) return;

        console.log('🤖 Initializing AI Hooks...');
        
        // Check for Perchance plugins
        this.checkPluginAvailability();
        
        this.initialized = true;
        console.log('✅ AI Hooks initialized');
    }

    // Check if Perchance plugins are available
    checkPluginAvailability() {
        this.plugins = {
            textGeneration: typeof generateText !== 'undefined' || typeof ai !== 'undefined',
            imageGeneration: typeof generateImage !== 'undefined',
            textToSpeech: typeof speak !== 'undefined',
            storage: typeof kv !== 'undefined',
            remember: typeof remember !== 'undefined'
        };

        console.log('🔌 Plugin availability:', this.plugins);
    }

    // Generate text using AI
    async generateText(prompt, options = {}) {
        const cacheKey = `text_${this.hashString(prompt)}`;
        
        // Check cache first
        if (this.cache.has(cacheKey) && !options.skipCache) {
            console.log('📚 Using cached text generation');
            return this.cache.get(cacheKey);
        }

        if (!this.plugins.textGeneration) {
            console.warn('⚠️ Text generation plugin not available');
            return this.getFallbackText(prompt, options);
        }

        try {
            console.log('🤖 Generating text...', { prompt: prompt.substring(0, 50) + '...' });
            
            // Use available text generation plugin
            let result;
            if (typeof ai !== 'undefined') {
                result = await ai(prompt, options);
            } else if (typeof generateText !== 'undefined') {
                result = await generateText(prompt, options);
            }

            // Cache the result
            this.cache.set(cacheKey, result);
            
            return result;
        } catch (error) {
            console.error('❌ Text generation failed:', error);
            return this.getFallbackText(prompt, options);
        }
    }

    // Generate image using AI
    async generateImage(prompt, options = {}) {
        const cacheKey = `image_${this.hashString(prompt)}`;
        
        // Check cache first
        if (this.cache.has(cacheKey) && !options.skipCache) {
            console.log('📚 Using cached image generation');
            return this.cache.get(cacheKey);
        }

        if (!this.plugins.imageGeneration) {
            console.warn('⚠️ Image generation plugin not available');
            return this.getFallbackImage(prompt, options);
        }

        try {
            console.log('🎨 Generating image...', { prompt: prompt.substring(0, 50) + '...' });
            
            const result = await generateImage(prompt, options);
            
            // Cache the result
            this.cache.set(cacheKey, result);
            
            return result;
        } catch (error) {
            console.error('❌ Image generation failed:', error);
            return this.getFallbackImage(prompt, options);
        }
    }

    // Generate NPC data
    async generateNPC(archetype, context = {}) {
        const prompt = this.buildNPCPrompt(archetype, context);
        
        try {
            const result = await this.generateText(prompt, {
                maxLength: 500,
                temperature: 0.8
            });

            return this.parseNPCData(result, archetype);
        } catch (error) {
            console.error('❌ NPC generation failed:', error);
            return this.getFallbackNPC(archetype);
        }
    }

    // Generate product data
    async generateProduct(category, context = {}) {
        const prompt = this.buildProductPrompt(category, context);
        
        try {
            const textResult = await this.generateText(prompt, {
                maxLength: 200,
                temperature: 0.7
            });

            const productData = this.parseProductData(textResult, category);
            
            // Generate product image if needed
            if (productData && !productData.image) {
                const imagePrompt = `Product photo: ${productData.name}, ${productData.description}, clean white background, professional lighting`;
                productData.image = await this.generateImage(imagePrompt, {
                    style: 'product-photo',
                    aspectRatio: '1:1'
                });
            }

            return productData;
        } catch (error) {
            console.error('❌ Product generation failed:', error);
            return this.getFallbackProduct(category);
        }
    }

    // Generate dialogue response
    async generateDialogue(context) {
        const prompt = this.buildDialoguePrompt(context);
        
        try {
            const result = await this.generateText(prompt, {
                maxLength: 150,
                temperature: 0.9
            });

            return this.parseDialogueResponse(result, context);
        } catch (error) {
            console.error('❌ Dialogue generation failed:', error);
            return this.getFallbackDialogue(context);
        }
    }

    // Generate event or news
    async generateEvent(type, context = {}) {
        const prompt = this.buildEventPrompt(type, context);
        
        try {
            const result = await this.generateText(prompt, {
                maxLength: 300,
                temperature: 0.8
            });

            return this.parseEventData(result, type);
        } catch (error) {
            console.error('❌ Event generation failed:', error);
            return this.getFallbackEvent(type);
        }
    }

    // Text-to-speech
    async speakText(text, options = {}) {
        if (!this.plugins.textToSpeech) {
            console.warn('⚠️ Text-to-speech plugin not available');
            return false;
        }

        try {
            await speak(text, options);
            return true;
        } catch (error) {
            console.error('❌ Text-to-speech failed:', error);
            return false;
        }
    }

    // Store data persistently
    async storeData(key, value) {
        if (this.plugins.storage) {
            try {
                await kv.set(key, value);
                return true;
            } catch (error) {
                console.error('❌ KV storage failed:', error);
            }
        }
        
        // Fallback to localStorage
        try {
            localStorage.setItem(`ai_${key}`, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('❌ localStorage failed:', error);
            return false;
        }
    }

    // Retrieve stored data
    async retrieveData(key) {
        if (this.plugins.storage) {
            try {
                return await kv.get(key);
            } catch (error) {
                console.error('❌ KV retrieval failed:', error);
            }
        }
        
        // Fallback to localStorage
        try {
            const data = localStorage.getItem(`ai_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('❌ localStorage retrieval failed:', error);
            return null;
        }
    }

    // Build prompts (these will be enhanced in later phases)
    buildNPCPrompt(archetype, context) {
        return `Generate a realistic NPC for a store simulation game:
Archetype: ${archetype}
Context: ${JSON.stringify(context)}
Include: name, age, appearance, personality, background, spending habits
Format as JSON.`;
    }

    buildProductPrompt(category, context) {
        return `Generate a product for a ${category} store:
Context: ${JSON.stringify(context)}
Include: name, description, price, rarity
Format as JSON.`;
    }

    buildDialoguePrompt(context) {
        return `Generate dialogue for a store customer:
Customer: ${context.customerName}
Mood: ${context.mood}
Situation: ${context.situation}
Respond naturally and realistically.`;
    }

    buildEventPrompt(type, context) {
        return `Generate a ${type} event for a store simulation:
Context: ${JSON.stringify(context)}
Make it realistic and engaging.`;
    }

    // Parse generated content (basic implementations)
    parseNPCData(text, archetype) {
        try {
            return JSON.parse(text);
        } catch {
            return this.getFallbackNPC(archetype);
        }
    }

    parseProductData(text, category) {
        try {
            return JSON.parse(text);
        } catch {
            return this.getFallbackProduct(category);
        }
    }

    parseDialogueResponse(text, context) {
        return {
            text: text.trim(),
            mood: context.mood,
            choices: []
        };
    }

    parseEventData(text, type) {
        return {
            type: type,
            title: 'Random Event',
            description: text.trim(),
            effects: {}
        };
    }

    // Fallback content when AI fails
    getFallbackText(prompt, options) {
        return "I'm thinking about what to say...";
    }

    getFallbackImage(prompt, options) {
        return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+SW1hZ2U8L3RleHQ+PC9zdmc+";
    }

    getFallbackNPC(archetype) {
        return {
            name: 'Mystery Customer',
            age: 30,
            archetype: archetype,
            appearance: 'A regular person',
            personality: 'Friendly',
            background: 'Lives in the neighborhood',
            spendingPower: 50
        };
    }

    getFallbackProduct(category) {
        return {
            name: 'Generic Item',
            category: category,
            description: 'A useful product',
            price: 10,
            cost: 5,
            rarity: 'common'
        };
    }

    getFallbackDialogue(context) {
        return {
            text: "Hello! I'm looking around your store.",
            mood: context.mood || 'neutral',
            choices: ['Welcome! Let me know if you need help.', 'Feel free to browse.']
        };
    }

    getFallbackEvent(type) {
        return {
            type: type,
            title: 'Something Happened',
            description: 'An event occurred at your store.',
            effects: {}
        };
    }

    // Utility functions
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('🧹 AI cache cleared');
    }

    // Get cache size
    getCacheSize() {
        return this.cache.size;
    }
}

// Create global AI hooks instance
const aiHooks = new AIHooks();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIHooks, aiHooks };
}
