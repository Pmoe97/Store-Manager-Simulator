// Product AI Generator System - Phase 4B
class ProductAIGenerator {
    constructor() {
        this.aiHooks = null;
        this.initialized = false;
        this.generationQueue = [];
        this.isGenerating = false;
        this.categories = this.initializeCategories();
        this.productTemplates = this.initializeProductTemplates();
        this.seasonalTrends = this.initializeSeasonalTrends();
        this.rarityLevels = this.initializeRarityLevels();
        this.pricingAlgorithms = this.initializePricingAlgorithms();
    }

    // Initialize the generator system
    initialize(aiHooks) {
        this.aiHooks = aiHooks;
        this.initialized = true;
        console.log('🎯 Product AI Generator initialized');
    }

    // Product categories with AI generation templates
    initializeCategories() {
        return {
            'clothing': {
                name: 'Clothing & Apparel',
                icon: '👕',
                templates: ['lingerie', 'costumes', 'accessories', 'footwear'],
                ageRestriction: 18,
                trends: ['vintage', 'modern', 'luxury', 'casual'],
                materials: ['silk', 'cotton', 'leather', 'lace', 'satin'],
                colors: ['black', 'red', 'white', 'purple', 'pink', 'blue']
            },
            'toys': {
                name: 'Adult Toys & Accessories',
                icon: '🎭',
                templates: ['personal', 'couples', 'accessories', 'novelty'],
                ageRestriction: 18,
                trends: ['smart-tech', 'eco-friendly', 'luxury', 'beginner-friendly'],
                materials: ['silicone', 'glass', 'metal', 'fabric'],
                colors: ['black', 'purple', 'pink', 'clear', 'gold']
            },
            'media': {
                name: 'Media & Entertainment',
                icon: '📚',
                templates: ['books', 'magazines', 'digital', 'games'],
                ageRestriction: 18,
                trends: ['romance', 'fantasy', 'educational', 'interactive'],
                materials: ['paperback', 'hardcover', 'digital', 'audio'],
                colors: ['varied', 'colorful', 'black-white', 'full-color']
            },
            'wellness': {
                name: 'Health & Wellness',
                icon: '💊',
                templates: ['supplements', 'care', 'massage', 'aromatherapy'],
                ageRestriction: 18,
                trends: ['natural', 'organic', 'therapeutic', 'luxury'],
                materials: ['natural', 'synthetic', 'herbal', 'mineral'],
                colors: ['neutral', 'natural', 'clear', 'amber']
            },
            'gifts': {
                name: 'Gifts & Novelties',
                icon: '🎁',
                templates: ['romantic', 'humorous', 'luxury', 'personalized'],
                ageRestriction: 18,
                trends: ['personalized', 'experience', 'subscription', 'themed'],
                materials: ['mixed', 'premium', 'eco-friendly', 'durable'],
                colors: ['gift-wrapped', 'elegant', 'fun', 'romantic']
            }
        };
    }

    // Product generation templates
    initializeProductTemplates() {
        return {
            clothing: {
                lingerie: {
                    prefixes: ['Elegant', 'Seductive', 'Comfortable', 'Luxurious', 'Classic', 'Modern'],
                    types: ['Bra Set', 'Teddy', 'Babydoll', 'Robe', 'Chemise', 'Corset'],
                    suffixes: ['Collection', 'Edition', 'Series', 'Line', 'Set'],
                    descriptions: [
                        'Crafted with attention to detail and comfort',
                        'Designed for confidence and allure',
                        'Made with premium materials for lasting quality',
                        'Perfect for special occasions or everyday luxury'
                    ]
                },
                costumes: {
                    prefixes: ['Fantasy', 'Roleplay', 'Themed', 'Professional', 'Vintage', 'Creative'],
                    types: ['Costume', 'Outfit', 'Ensemble', 'Set', 'Collection'],
                    suffixes: ['Fantasy', 'Experience', 'Adventure', 'Story', 'Dream'],
                    descriptions: [
                        'High-quality costume perfect for roleplay',
                        'Detailed outfit with authentic styling',
                        'Complete costume set with accessories',
                        'Professional-grade costume for ultimate fantasy'
                    ]
                }
            },
            toys: {
                personal: {
                    prefixes: ['Premium', 'Luxe', 'Intimate', 'Personal', 'Discrete', 'Advanced'],
                    types: ['Companion', 'Experience', 'Wellness', 'Pleasure', 'Comfort'],
                    suffixes: ['Pro', 'Elite', 'Deluxe', 'Premium', 'Ultimate'],
                    descriptions: [
                        'Designed with body-safe materials and advanced features',
                        'Engineered for comfort and satisfaction',
                        'Premium quality with discretion in mind',
                        'Advanced technology for enhanced experience'
                    ]
                },
                couples: {
                    prefixes: ['Together', 'Connected', 'Shared', 'Intimate', 'Couples', 'Harmony'],
                    types: ['Experience', 'Connection', 'Adventure', 'Journey', 'Discovery'],
                    suffixes: ['Together', 'Duo', 'Partner', 'Unity', 'Bond'],
                    descriptions: [
                        'Designed to enhance intimacy between partners',
                        'Created for shared experiences and connection',
                        'Perfect for exploring together safely',
                        'Brings couples closer through shared adventure'
                    ]
                }
            },
            media: {
                books: {
                    prefixes: ['Passionate', 'Romantic', 'Steamy', 'Intimate', 'Sensual', 'Erotic'],
                    types: ['Romance', 'Fiction', 'Guide', 'Manual', 'Stories', 'Collection'],
                    suffixes: ['Tales', 'Chronicles', 'Adventures', 'Secrets', 'Desires'],
                    descriptions: [
                        'Captivating stories with adult themes',
                        'Well-written romance with mature content',
                        'Educational guide for adult relationships',
                        'Collection of engaging adult fiction'
                    ]
                }
            },
            wellness: {
                supplements: {
                    prefixes: ['Natural', 'Herbal', 'Premium', 'Wellness', 'Vitality', 'Pure'],
                    types: ['Support', 'Enhancement', 'Wellness', 'Vitality', 'Balance'],
                    suffixes: ['Formula', 'Blend', 'Complex', 'Support', 'Plus'],
                    descriptions: [
                        'Natural supplement for adult wellness',
                        'Carefully formulated for optimal results',
                        'Made with high-quality natural ingredients',
                        'Supports overall health and vitality'
                    ]
                }
            }
        };
    }

    // Seasonal trends for product generation
    initializeSeasonalTrends() {
        return {
            spring: {
                themes: ['renewal', 'fresh', 'romantic', 'pastel'],
                colors: ['soft pink', 'lavender', 'mint green', 'cream'],
                modifiers: ['floral', 'light', 'airy', 'delicate']
            },
            summer: {
                themes: ['vibrant', 'bold', 'vacation', 'adventure'],
                colors: ['bright red', 'ocean blue', 'sunny yellow', 'coral'],
                modifiers: ['tropical', 'beach', 'sun-kissed', 'energetic']
            },
            fall: {
                themes: ['cozy', 'warm', 'sophisticated', 'harvest'],
                colors: ['deep burgundy', 'golden amber', 'forest green', 'chocolate'],
                modifiers: ['rich', 'luxurious', 'warm', 'comforting']
            },
            winter: {
                themes: ['elegant', 'intimate', 'holiday', 'luxury'],
                colors: ['deep red', 'royal purple', 'silver', 'black'],
                modifiers: ['velvet', 'festive', 'glamorous', 'indulgent']
            }
        };
    }

    // Product rarity levels affecting generation
    initializeRarityLevels() {
        return {
            common: {
                weight: 60,
                priceMultiplier: 1.0,
                qualityModifiers: ['standard', 'reliable', 'everyday'],
                prefixes: ['Classic', 'Essential', 'Basic', 'Standard']
            },
            uncommon: {
                weight: 25,
                priceMultiplier: 1.5,
                qualityModifiers: ['enhanced', 'improved', 'quality', 'superior'],
                prefixes: ['Premium', 'Enhanced', 'Quality', 'Superior']
            },
            rare: {
                weight: 12,
                priceMultiplier: 2.5,
                qualityModifiers: ['luxury', 'artisan', 'handcrafted', 'exclusive'],
                prefixes: ['Luxury', 'Artisan', 'Exclusive', 'Designer']
            },
            legendary: {
                weight: 3,
                priceMultiplier: 5.0,
                qualityModifiers: ['masterwork', 'legendary', 'one-of-a-kind', 'collector'],
                prefixes: ['Legendary', 'Masterwork', 'Collector', 'Limited Edition']
            }
        };
    }

    // Pricing algorithms for AI-generated products
    initializePricingAlgorithms() {
        return {
            basePricing: {
                clothing: { min: 15, max: 200 },
                toys: { min: 25, max: 300 },
                media: { min: 10, max: 50 },
                wellness: { min: 20, max: 150 },
                gifts: { min: 30, max: 250 }
            },
            qualityMultipliers: {
                'budget': 0.7,
                'standard': 1.0,
                'premium': 1.8,
                'luxury': 3.0,
                'exclusive': 5.0
            },
            trendMultipliers: {
                'declining': 0.8,
                'stable': 1.0,
                'growing': 1.3,
                'viral': 2.0
            }
        };
    }

    // Generate a new product using AI
    async generateProduct(options = {}) {
        if (!this.initialized || !this.aiHooks) {
            console.warn('⚠️ Product AI Generator not initialized');
            return this.generateFallbackProduct(options);
        }

        const {
            category = this.selectRandomCategory(),
            rarity = this.selectRarity(),
            seasonal = true,
            trending = false
        } = options;

        console.log(`🎯 Generating ${rarity} ${category} product`);

        try {
            // Generate product concept
            const concept = await this.generateProductConcept(category, rarity, seasonal, trending);
            
            // Generate detailed description
            const description = await this.generateProductDescription(concept);
            
            // Generate product image prompt
            const imagePrompt = await this.generateProductImagePrompt(concept);
            
            // Calculate pricing
            const pricing = this.calculateProductPricing(concept);
            
            // Generate product name
            const name = await this.generateProductName(concept);

            // Compile final product
            const product = {
                id: this.generateProductId(),
                name: name,
                description: description,
                category: category,
                rarity: rarity,
                price: pricing.basePrice,
                cost: pricing.cost,
                profit: pricing.profit,
                margin: pricing.margin,
                imagePrompt: imagePrompt,
                image: null, // Will be generated separately
                ageRestriction: this.categories[category].ageRestriction,
                tags: concept.tags,
                features: concept.features,
                materials: concept.materials,
                colors: concept.colors,
                seasonal: seasonal ? this.getCurrentSeason() : null,
                trending: trending,
                aiGenerated: true,
                generationDate: new Date().toISOString(),
                concept: concept
            };

            console.log(`✅ Generated product: ${product.name}`);
            return product;

        } catch (error) {
            console.error('❌ Product generation failed:', error);
            return this.generateFallbackProduct(options);
        }
    }

    // Generate product concept using AI
    async generateProductConcept(category, rarity, seasonal, trending) {
        const categoryData = this.categories[category];
        const rarityData = this.rarityLevels[rarity];
        const seasonData = seasonal ? this.seasonalTrends[this.getCurrentSeason()] : null;

        const prompt = `Create a unique product concept for an adult store:

Category: ${categoryData.name}
Rarity Level: ${rarity} (${rarityData.qualityModifiers.join(', ')})
${seasonal ? `Season: ${this.getCurrentSeason()} (${seasonData.themes.join(', ')})` : ''}
${trending ? 'Current Trend: Yes' : ''}

Generate a product concept including:
1. Product type and style
2. Key features and benefits
3. Target audience
4. Materials and quality level
5. Unique selling points
6. 3-5 descriptive tags

Focus on:
- Adult audience appropriateness
- Quality matching the rarity level
- ${seasonal ? 'Seasonal relevance' : 'Timeless appeal'}
- Professional, tasteful description
- Commercial viability

Format as JSON: {
  "type": "product type",
  "style": "style description", 
  "features": ["feature1", "feature2"],
  "audience": "target audience",
  "materials": ["material1", "material2"],
  "quality": "quality level",
  "selling_points": ["point1", "point2"],
  "tags": ["tag1", "tag2", "tag3"]
}`;

        try {
            const response = await this.aiHooks.generateText(prompt, {
                maxLength: 600,
                temperature: 0.8
            });

            // Try to parse JSON response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const concept = JSON.parse(jsonMatch[0]);
                return this.enhanceProductConcept(concept, category, rarity, seasonal);
            }

            // Fallback: parse from text
            return this.parseConceptFromText(response, category, rarity);
        } catch (error) {
            console.error('❌ Product concept generation failed:', error);
            return this.getFallbackConcept(category, rarity);
        }
    }

    // Generate product name using AI
    async generateProductName(concept) {
        const prompt = `Create a compelling, professional product name for this adult store item:

Product Type: ${concept.type}
Style: ${concept.style}
Quality: ${concept.quality}
Key Features: ${concept.features.join(', ')}
Target: ${concept.audience}

Requirements:
- Professional and tasteful
- Memorable and appealing
- Appropriate for adult audience
- Commercial/retail friendly
- 2-6 words maximum

Examples of good product names:
- "Silk Elegance Collection"
- "Midnight Romance Set"
- "Premium Comfort Series"
- "Intimate Wellness Kit"

Generate 3 name options and select the best one.`;

        try {
            const response = await this.aiHooks.generateText(prompt, {
                maxLength: 200,
                temperature: 0.7
            });

            // Extract the best name from response
            const names = this.extractNamesFromResponse(response);
            return names[0] || this.generateFallbackName(concept);
        } catch (error) {
            console.error('❌ Product name generation failed:', error);
            return this.generateFallbackName(concept);
        }
    }

    // Generate product description using AI
    async generateProductDescription(concept) {
        const prompt = `Write a professional product description for an adult store item:

Product: ${concept.type} - ${concept.style}
Quality Level: ${concept.quality}
Materials: ${concept.materials.join(', ')}
Key Features: ${concept.features.join(', ')}
Selling Points: ${concept.selling_points.join(', ')}
Target Audience: ${concept.audience}

Create a description that is:
- Professional and tasteful
- Informative about features and benefits
- Appropriate for adult retail
- 2-3 paragraphs maximum
- Focus on quality, comfort, and satisfaction
- Avoid explicit details, keep it classy

Format: Write a cohesive product description ready for e-commerce.`;

        try {
            const response = await this.aiHooks.generateText(prompt, {
                maxLength: 400,
                temperature: 0.6
            });

            return response.trim() || this.getFallbackDescription(concept);
        } catch (error) {
            console.error('❌ Product description generation failed:', error);
            return this.getFallbackDescription(concept);
        }
    }

    // Generate product image prompt for AI image generation
    async generateProductImagePrompt(concept) {
        const prompt = `Create a detailed image generation prompt for a product photo:

Product: ${concept.type} - ${concept.style}
Materials: ${concept.materials.join(', ')}
Quality: ${concept.quality}
Colors: ${concept.colors ? concept.colors.join(', ') : 'neutral tones'}

Requirements:
- Professional product photography style
- Clean, white background
- Good lighting and composition
- Tasteful presentation
- High-quality commercial appearance
- Appropriate for adult retail catalog

Generate a detailed image prompt for AI image generation.`;

        try {
            const response = await this.aiHooks.generateText(prompt, {
                maxLength: 200,
                temperature: 0.5
            });

            return response.trim() || this.getFallbackImagePrompt(concept);
        } catch (error) {
            console.error('❌ Image prompt generation failed:', error);
            return this.getFallbackImagePrompt(concept);
        }
    }

    // Helper methods
    selectRandomCategory() {
        const categories = Object.keys(this.categories);
        return categories[Math.floor(Math.random() * categories.length)];
    }

    selectRarity() {
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (const [rarity, data] of Object.entries(this.rarityLevels)) {
            cumulative += data.weight;
            if (random <= cumulative) {
                return rarity;
            }
        }
        return 'common';
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    }

    calculateProductPricing(concept) {
        const category = concept.category || 'gifts';
        const basePricing = this.pricingAlgorithms.basePricing[category];
        const basePrice = basePricing.min + (Math.random() * (basePricing.max - basePricing.min));
        
        // Apply quality multiplier
        const qualityMultiplier = this.pricingAlgorithms.qualityMultipliers[concept.quality] || 1.0;
        
        // Apply rarity multiplier
        const rarityMultiplier = this.rarityLevels[concept.rarity]?.priceMultiplier || 1.0;
        
        const finalPrice = Math.round(basePrice * qualityMultiplier * rarityMultiplier);
        const cost = Math.round(finalPrice * 0.6); // 40% markup
        const profit = finalPrice - cost;
        const margin = ((profit / finalPrice) * 100).toFixed(1);

        return {
            basePrice: finalPrice,
            cost: cost,
            profit: profit,
            margin: parseFloat(margin)
        };
    }

    generateProductId() {
        return 'prod_ai_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    // Fallback methods
    generateFallbackProduct(options = {}) {
        const category = options.category || this.selectRandomCategory();
        const rarity = options.rarity || this.selectRarity();
        
        return {
            id: this.generateProductId(),
            name: `${this.rarityLevels[rarity].prefixes[0]} ${this.categories[category].name}`,
            description: `A ${rarity} quality item from our ${this.categories[category].name} collection.`,
            category: category,
            rarity: rarity,
            price: 50,
            cost: 30,
            profit: 20,
            margin: 40,
            imagePrompt: `Professional product photo of ${category} item, white background`,
            ageRestriction: this.categories[category].ageRestriction,
            tags: ['fallback', category, rarity],
            aiGenerated: false,
            generationDate: new Date().toISOString()
        };
    }

    enhanceProductConcept(concept, category, rarity, seasonal) {
        const categoryData = this.categories[category];
        const rarityData = this.rarityLevels[rarity];
        
        return {
            ...concept,
            category: category,
            rarity: rarity,
            colors: concept.colors || categoryData.colors,
            seasonal: seasonal,
            qualityLevel: rarityData.qualityModifiers[0]
        };
    }

    getFallbackConcept(category, rarity) {
        const categoryData = this.categories[category];
        const rarityData = this.rarityLevels[rarity];
        
        return {
            type: categoryData.templates[0],
            style: 'classic',
            features: ['quality construction', 'comfortable fit'],
            audience: 'adult consumers',
            materials: categoryData.materials.slice(0, 2),
            quality: rarityData.qualityModifiers[0],
            selling_points: ['premium quality', 'satisfaction guaranteed'],
            tags: [category, rarity, 'classic'],
            category: category,
            rarity: rarity
        };
    }

    generateFallbackName(concept) {
        const rarityData = this.rarityLevels[concept.rarity];
        return `${rarityData.prefixes[0]} ${concept.type}`;
    }

    getFallbackDescription(concept) {
        return `This ${concept.quality} ${concept.type} is crafted with attention to detail and comfort. Made with ${concept.materials.join(' and ')}, it offers ${concept.features.join(' and ')} for the discerning adult consumer.`;
    }

    getFallbackImagePrompt(concept) {
        return `Professional product photography of ${concept.type}, ${concept.materials[0]} material, white background, commercial lighting`;
    }

    extractNamesFromResponse(response) {
        const lines = response.split('\n').filter(line => line.trim());
        const names = [];
        
        for (const line of lines) {
            if (line.includes('"') || line.includes('•') || line.includes('-')) {
                const name = line.replace(/[•\-"']/g, '').trim();
                if (name.length > 0 && names.length < 3) {
                    names.push(name);
                }
            }
        }
        
        return names.length > 0 ? names : ['Premium Product'];
    }

    parseConceptFromText(text, category, rarity) {
        // Simple parsing for when JSON fails
        return {
            type: category,
            style: 'modern',
            features: ['quality', 'comfort'],
            audience: 'adults',
            materials: this.categories[category].materials.slice(0, 2),
            quality: this.rarityLevels[rarity].qualityModifiers[0],
            selling_points: ['premium quality'],
            tags: [category, rarity],
            category: category,
            rarity: rarity
        };
    }

    // Queue management for batch generation
    addToGenerationQueue(request) {
        this.generationQueue.push(request);
        console.log(`📋 Added product generation request to queue`);
    }

    async processGenerationQueue() {
        if (this.isGenerating || this.generationQueue.length === 0) {
            return;
        }

        this.isGenerating = true;
        console.log(`🔄 Processing ${this.generationQueue.length} product generation requests`);

        const results = [];
        while (this.generationQueue.length > 0) {
            const request = this.generationQueue.shift();
            try {
                const product = await this.generateProduct(request);
                results.push(product);

                // Brief pause between generations
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error('❌ Failed to process generation request:', error);
            }
        }

        this.isGenerating = false;
        console.log('✅ Product generation queue processing complete');
        return results;
    }

    // Generate product image
    async generateProductImage(product) {
        if (!this.aiHooks || product.image) return product.image;

        try {
            const imageUrl = await this.aiHooks.generateImage(product.imagePrompt, {
                style: 'product-photo',
                quality: 'high',
                aspectRatio: '1:1'
            });

            product.image = imageUrl;
            return imageUrl;
        } catch (error) {
            console.error(`❌ Failed to generate image for ${product.name}:`, error);
            return null;
        }
    }
}

// Initialize global instance
const productAIGenerator = new ProductAIGenerator();

// Auto-initialize when AI hooks are available
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof aiHooks !== 'undefined') {
            productAIGenerator.initialize(aiHooks);
        }
    }, 1000);
});
