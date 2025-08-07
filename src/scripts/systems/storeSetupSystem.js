/**
 * Store Setup System - Handles initial store configuration
 */

class StoreSetupSystem {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.aiHooks = null;
        this.currentStep = 'type';
        this.storeData = {};
        this.storeTypes = this.getStoreTypes();
        this.environments = this.getEnvironments();
        this.isGeneratingBackground = false;
    }

    initialize(gameState, eventBus, aiHooks) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        this.aiHooks = aiHooks;
        
        this.eventBus.on('store.setup', (data) => this.setupStore(data));
        this.eventBus.on('store.generateBackground', () => this.generateBackground());
        this.eventBus.on('store.selectType', (type) => this.selectStoreType(type));
        this.eventBus.on('store.selectEnvironment', (env) => this.selectEnvironment(env));
        this.eventBus.on('store.updateBasics', (data) => this.updateBasicInfo(data));
        this.eventBus.on('store.updateProducts', (data) => this.updateProducts(data));
        
        console.log('🏪 Store Setup System initialized');
    }

    getStoreTypes() {
        return {
            general: {
                name: "General Store",
                description: "A traditional general store serving the local community with everyday essentials.",
                products: ["food", "drinks", "snacks", "household", "personal care", "basic electronics"],
                customerTypes: ["families", "locals", "workers", "elderly"],
                startingProducts: 50,
                difficulty: "normal",
                initialCash: 5000,
                rent: 200,
                size: "medium",
                advantages: ["Broad customer appeal", "Steady demand", "Easy to manage"],
                challenges: ["High competition", "Low margins", "Inventory complexity"]
            },
            convenience: {
                name: "Convenience Store",
                description: "A 24/7 convenience store focusing on quick purchases and impulse buys.",
                products: ["snacks", "drinks", "cigarettes", "lottery", "quick meals", "fuel"],
                customerTypes: ["commuters", "night workers", "teenagers", "travelers"],
                startingProducts: 30,
                difficulty: "hard",
                initialCash: 3000,
                rent: 300,
                size: "small",
                advantages: ["High turnover", "Late hours premium", "Impulse purchases"],
                challenges: ["Crime risk", "Long hours", "Licensing requirements"]
            },
            boutique: {
                name: "Fashion Boutique",
                description: "An upscale boutique selling trendy clothing and accessories.",
                products: ["clothing", "accessories", "jewelry", "bags", "shoes"],
                customerTypes: ["fashion-conscious", "young adults", "professionals"],
                startingProducts: 25,
                difficulty: "hard",
                initialCash: 8000,
                rent: 400,
                size: "small",
                advantages: ["High margins", "Loyal customers", "Unique products"],
                challenges: ["Seasonal demand", "Fashion trends", "Expensive inventory"]
            },
            electronics: {
                name: "Electronics Store",
                description: "A tech-focused store selling gadgets, computers, and electronic accessories.",
                products: ["computers", "phones", "accessories", "games", "cables", "batteries"],
                customerTypes: ["tech enthusiasts", "students", "professionals", "gamers"],
                startingProducts: 40,
                difficulty: "normal",
                initialCash: 10000,
                rent: 350,
                size: "medium",
                advantages: ["High value items", "Tech-savvy customers", "Rapid innovation"],
                challenges: ["Fast obsolescence", "High theft risk", "Technical support"]
            },
            adult: {
                name: "Adult Novelty Store",
                description: "A discreet adult store catering to mature customers with specialized products.",
                products: ["adult toys", "lingerie", "books", "games", "accessories"],
                customerTypes: ["adults", "couples", "curious", "regulars"],
                startingProducts: 35,
                difficulty: "very hard",
                initialCash: 6000,
                rent: 250,
                size: "small",
                advantages: ["High margins", "Loyal customers", "Unique market"],
                challenges: ["Social stigma", "Regulatory issues", "Discreet operations"],
                requiresAdultContent: true
            },
            custom: {
                name: "Custom Store",
                description: "Create your own unique store concept with AI assistance.",
                products: [],
                customerTypes: [],
                startingProducts: 0,
                difficulty: "variable",
                initialCash: 5000,
                rent: 200,
                size: "medium",
                advantages: ["Complete customization", "Unique concept", "AI assistance"],
                challenges: ["Unknown market", "Planning required", "Experimental"]
            }
        };
    }

    getEnvironments() {
        return {
            city: {
                name: "Urban City",
                description: "Busy downtown area with high foot traffic and diverse customers.",
                footTrafficMultiplier: 1.5,
                rentMultiplier: 1.3,
                crimeRate: 0.7,
                customerDiversity: 0.9,
                advantages: ["High foot traffic", "Diverse customers", "Public transport access"],
                challenges: ["High rent", "Competition", "Crime risk"],
                weatherEvents: ["storms", "heat waves"],
                demographics: ["young professionals", "tourists", "students", "business people"]
            },
            suburban: {
                name: "Suburban Area",
                description: "Family-friendly neighborhood with steady local customer base.",
                footTrafficMultiplier: 1.0,
                rentMultiplier: 1.0,
                crimeRate: 0.3,
                customerDiversity: 0.6,
                advantages: ["Family customers", "Lower crime", "Parking available"],
                challenges: ["Limited foot traffic", "Car-dependent", "Seasonal variation"],
                weatherEvents: ["snow", "storms"],
                demographics: ["families", "middle-aged", "children", "retirees"]
            },
            rural: {
                name: "Rural Town",
                description: "Small town setting with tight-knit community and loyal customers.",
                footTrafficMultiplier: 0.6,
                rentMultiplier: 0.7,
                crimeRate: 0.1,
                customerDiversity: 0.3,
                advantages: ["Low rent", "Community loyalty", "Low crime"],
                challenges: ["Limited customers", "Seasonal economy", "Supply challenges"],
                weatherEvents: ["snow", "drought", "storms"],
                demographics: ["locals", "farmers", "elderly", "families"]
            }
        };
    }

    startStoreSetup() {
        this.currentStep = 'type';
        this.storeData = {
            name: "",
            type: "general",
            description: "",
            environment: "city",
            address: "",
            phone: "",
            customConcept: "",
            productCategories: [],
            targetCustomers: [],
            hours: {
                monday: { open: "09:00", close: "21:00", closed: false },
                tuesday: { open: "09:00", close: "21:00", closed: false },
                wednesday: { open: "09:00", close: "21:00", closed: false },
                thursday: { open: "09:00", close: "21:00", closed: false },
                friday: { open: "09:00", close: "21:00", closed: false },
                saturday: { open: "10:00", close: "22:00", closed: false },
                sunday: { open: "11:00", close: "20:00", closed: false }
            },
            layout: {
                size: "medium",
                sections: ["entrance", "checkout", "shelves"],
                upgrades: []
            },
            background: {
                image: null,
                prompt: ""
            }
        };

        this.eventBus.emit('ui.showScreen', 'storeSetup');
        this.eventBus.emit('store.stepChanged', { step: this.currentStep, data: this.storeData });
        
        console.log('🏪 Store setup started');
    }

    selectStoreType(type) {
        if (!this.storeTypes[type]) {
            console.error('Unknown store type:', type);
            return;
        }

        const storeType = this.storeTypes[type];
        
        // Check if adult content is required and enabled
        if (storeType.requiresAdultContent && !this.gameState.data.meta.adultContentEnabled) {
            this.eventBus.emit('store.error', {
                message: 'Adult content must be enabled to select this store type.',
                action: 'enableAdultContent'
            });
            return;
        }

        this.storeData.type = type;
        this.storeData.productCategories = [...storeType.products];
        this.storeData.targetCustomers = [...storeType.customerTypes];
        
        // Update financial starting conditions
        this.gameState.data.finances.cash = storeType.initialCash;
        this.gameState.data.finances.dailyExpenses.rent = storeType.rent;
        this.storeData.layout.size = storeType.size;

        this.eventBus.emit('store.typeSelected', { 
            type, 
            data: storeType,
            storeData: this.storeData 
        });
        
        console.log('🏪 Store type selected:', type);
    }

    selectEnvironment(environment) {
        if (!this.environments[environment]) {
            console.error('Unknown environment:', environment);
            return;
        }

        const env = this.environments[environment];
        this.storeData.environment = environment;
        
        // Apply environment modifiers
        const baseRent = this.gameState.data.finances.dailyExpenses.rent;
        this.gameState.data.finances.dailyExpenses.rent = Math.floor(baseRent * env.rentMultiplier);

        this.eventBus.emit('store.environmentSelected', { 
            environment, 
            data: env,
            storeData: this.storeData 
        });
        
        console.log('🏪 Environment selected:', environment);
    }

    updateBasicInfo(data) {
        Object.assign(this.storeData, {
            name: data.name || this.storeData.name,
            description: data.description || this.storeData.description,
            address: data.address || this.storeData.address,
            phone: data.phone || this.storeData.phone,
            customConcept: data.customConcept || this.storeData.customConcept
        });

        // Update store hours if provided
        if (data.hours) {
            Object.assign(this.storeData.hours, data.hours);
        }

        this.eventBus.emit('store.dataUpdated', { section: 'basic', data: this.storeData });
    }

    updateProducts(data) {
        if (data.productCategories) {
            this.storeData.productCategories = [...data.productCategories];
        }
        
        if (data.targetCustomers) {
            this.storeData.targetCustomers = [...data.targetCustomers];
        }

        this.eventBus.emit('store.dataUpdated', { section: 'products', data: this.storeData });
    }

    async generateBackground() {
        if (this.isGeneratingBackground) return;
        
        this.isGeneratingBackground = true;
        this.eventBus.emit('store.backgroundGenerating', true);
        
        try {
            const prompt = this.buildBackgroundPrompt();
            
            const backgroundUrl = await this.aiHooks.generateImage(prompt, {
                style: 'architectural',
                quality: 'high',
                aspectRatio: '16:9'
            });
            
            if (backgroundUrl) {
                this.storeData.background.image = backgroundUrl;
                this.eventBus.emit('store.backgroundGenerated', { url: backgroundUrl });
                console.log('🏪 Store background generated successfully');
            } else {
                throw new Error('Failed to generate background');
            }
            
        } catch (error) {
            console.error('Background generation failed:', error);
            this.eventBus.emit('store.backgroundError', { error: error.message });
        } finally {
            this.isGeneratingBackground = false;
            this.eventBus.emit('store.backgroundGenerating', false);
        }
    }

    buildBackgroundPrompt() {
        const storeType = this.storeTypes[this.storeData.type];
        const environment = this.environments[this.storeData.environment];
        
        let prompt = "";
        
        if (this.storeData.background.prompt) {
            prompt = this.storeData.background.prompt;
        } else {
            // Generate default prompt
            prompt = `${storeType.name} storefront in ${environment.name.toLowerCase()}`;
            
            // Add environment-specific details
            if (this.storeData.environment === 'city') {
                prompt += ", urban street, modern buildings, pedestrians";
            } else if (this.storeData.environment === 'suburban') {
                prompt += ", suburban street, parking lot, family-friendly";
            } else if (this.storeData.environment === 'rural') {
                prompt += ", small town main street, simple buildings";
            }
            
            // Add store type specific details
            if (this.storeData.type === 'boutique') {
                prompt += ", stylish storefront, fashion displays";
            } else if (this.storeData.type === 'electronics') {
                prompt += ", tech store, electronic displays in windows";
            } else if (this.storeData.type === 'convenience') {
                prompt += ", 24/7 convenience store, bright lighting";
            }
        }
        
        prompt += ", professional photography, daytime, clear weather, inviting entrance";
        
        return prompt;
    }

    async generateInitialInventory() {
        const storeType = this.storeTypes[this.storeData.type];
        
        if (this.storeData.type === 'custom') {
            // For custom stores, generate based on concept
            return this.generateCustomInventory();
        }
        
        // Generate products for each category
        const inventory = new Map();
        let totalProducts = 0;
        
        for (const category of this.storeData.productCategories) {
            const productsInCategory = Math.floor(storeType.startingProducts / this.storeData.productCategories.length);
            
            for (let i = 0; i < productsInCategory && totalProducts < storeType.startingProducts; i++) {
                const product = await this.generateProduct(category);
                if (product) {
                    inventory.set(product.id, product);
                    totalProducts++;
                }
            }
        }
        
        return inventory;
    }

    async generateProduct(category) {
        try {
            const productData = await this.aiHooks.generateProduct({
                category,
                storeType: this.storeData.type,
                environment: this.storeData.environment
            });
            
            return {
                id: this.generateId(),
                ...productData,
                category,
                stock: Math.floor(Math.random() * 20) + 10,
                lastRestocked: 0,
                salesCount: 0
            };
        } catch (error) {
            console.error('Failed to generate product:', error);
            return null;
        }
    }

    async generateCustomInventory() {
        try {
            const products = await this.aiHooks.generateCustomProducts({
                concept: this.storeData.customConcept,
                targetCustomers: this.storeData.targetCustomers,
                productCategories: this.storeData.productCategories,
                count: 30
            });
            
            const inventory = new Map();
            products.forEach(product => {
                inventory.set(product.id, {
                    ...product,
                    stock: Math.floor(Math.random() * 15) + 5,
                    lastRestocked: 0,
                    salesCount: 0
                });
            });
            
            return inventory;
        } catch (error) {
            console.error('Failed to generate custom inventory:', error);
            return new Map();
        }
    }

    nextStep() {
        const steps = ['type', 'environment', 'basic', 'products', 'review'];
        const currentIndex = steps.indexOf(this.currentStep);
        
        if (currentIndex < steps.length - 1) {
            this.currentStep = steps[currentIndex + 1];
            this.eventBus.emit('store.stepChanged', { 
                step: this.currentStep, 
                data: this.storeData 
            });
        }
    }

    previousStep() {
        const steps = ['type', 'environment', 'basic', 'products', 'review'];
        const currentIndex = steps.indexOf(this.currentStep);
        
        if (currentIndex > 0) {
            this.currentStep = steps[currentIndex - 1];
            this.eventBus.emit('store.stepChanged', { 
                step: this.currentStep, 
                data: this.storeData 
            });
        }
    }

    validateStep(step) {
        switch (step) {
            case 'type':
                return this.validateType();
            case 'environment':
                return this.validateEnvironment();
            case 'basic':
                return this.validateBasicInfo();
            case 'products':
                return this.validateProducts();
            case 'review':
                return this.validateComplete();
            default:
                return false;
        }
    }

    validateType() {
        const isValid = this.storeData.type && this.storeTypes[this.storeData.type];
        
        this.eventBus.emit('store.validationResult', {
            step: 'type',
            isValid,
            errors: isValid ? [] : ['Please select a store type']
        });
        
        return isValid;
    }

    validateEnvironment() {
        const isValid = this.storeData.environment && this.environments[this.storeData.environment];
        
        this.eventBus.emit('store.validationResult', {
            step: 'environment',
            isValid,
            errors: isValid ? [] : ['Please select an environment']
        });
        
        return isValid;
    }

    validateBasicInfo() {
        const { name, description } = this.storeData;
        const errors = [];
        
        if (!name || name.trim().length < 3) {
            errors.push('Store name must be at least 3 characters');
        }
        
        if (!description || description.trim().length < 10) {
            errors.push('Store description must be at least 10 characters');
        }
        
        const isValid = errors.length === 0;
        
        this.eventBus.emit('store.validationResult', {
            step: 'basic',
            isValid,
            errors
        });
        
        return isValid;
    }

    validateProducts() {
        const { productCategories, targetCustomers } = this.storeData;
        const errors = [];
        
        if (productCategories.length === 0) {
            errors.push('Select at least one product category');
        }
        
        if (targetCustomers.length === 0) {
            errors.push('Select at least one target customer type');
        }
        
        if (this.storeData.type === 'custom' && (!this.storeData.customConcept || this.storeData.customConcept.trim().length < 20)) {
            errors.push('Custom store concept must be at least 20 characters');
        }
        
        const isValid = errors.length === 0;
        
        this.eventBus.emit('store.validationResult', {
            step: 'products',
            isValid,
            errors
        });
        
        return isValid;
    }

    validateComplete() {
        return this.validateType() && 
               this.validateEnvironment() && 
               this.validateBasicInfo() && 
               this.validateProducts();
    }

    async finishStoreSetup() {
        if (!this.validateComplete()) {
            this.eventBus.emit('store.error', { 
                message: 'Please complete all required fields before continuing' 
            });
            return false;
        }

        try {
            // Apply store data to game state
            Object.assign(this.gameState.data.store, this.storeData);
            
            // Generate initial inventory
            this.eventBus.emit('ui.showLoading', { message: 'Generating initial inventory...' });
            const inventory = await this.generateInitialInventory();
            this.gameState.data.inventory.products = inventory;
            
            // Calculate initial inventory value
            let totalValue = 0;
            inventory.forEach(product => {
                totalValue += product.cost * product.stock;
            });
            this.gameState.data.inventory.totalValue = totalValue;
            
            // Deduct inventory cost from starting cash
            this.gameState.data.finances.cash -= totalValue;
            
            // Initialize store reputation
            this.gameState.data.store.reputation = {
                overall: 50,
                cleanliness: 50,
                service: 50,
                prices: 50,
                selection: 50
            };

            this.eventBus.emit('store.created', { 
                store: this.storeData,
                inventory: inventory.size,
                initialCost: totalValue
            });
            this.eventBus.emit('setup.storeComplete');
            
            console.log('🏪 Store setup completed:', this.storeData.name);
            return true;
            
        } catch (error) {
            console.error('Store setup failed:', error);
            this.eventBus.emit('store.error', { 
                message: 'Failed to complete store setup. Please try again.' 
            });
            return false;
        } finally {
            this.eventBus.emit('ui.hideLoading');
        }
    }

    // Helper methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    getAvailableProductCategories() {
        return [
            'food', 'drinks', 'snacks', 'household', 'personal care', 'electronics',
            'clothing', 'accessories', 'books', 'toys', 'tools', 'automotive',
            'health', 'beauty', 'sports', 'garden', 'pet supplies', 'office'
        ];
    }

    getAvailableCustomerTypes() {
        return [
            'families', 'young adults', 'teenagers', 'elderly', 'professionals',
            'students', 'tourists', 'locals', 'commuters', 'night workers',
            'tech enthusiasts', 'fashion-conscious', 'health-conscious', 'bargain hunters'
        ];
    }

    // Reset store setup
    reset() {
        this.currentStep = 'type';
        this.storeData = {};
        this.isGeneratingBackground = false;
        this.eventBus.emit('store.reset');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoreSetupSystem;
} else if (typeof window !== 'undefined') {
    window.StoreSetupSystem = StoreSetupSystem;
}
