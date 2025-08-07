/**
 * Character Creation System - Handles player character setup
 */

class CharacterCreationSystem {
    constructor() {
        this.gameState = null;
        this.eventBus = null;
        this.aiHooks = null;
        this.currentStep = 'basic';
        this.characterData = {};
        this.presets = this.getCharacterPresets();
        this.isGeneratingAvatar = false;
    }

    initialize(gameState, eventBus, aiHooks) {
        this.gameState = gameState;
        this.eventBus = eventBus;
        this.aiHooks = aiHooks;
        
        this.eventBus.on('character.create', (data) => this.createCharacter(data));
        this.eventBus.on('character.generateAvatar', () => this.generateAvatar());
        this.eventBus.on('character.usePreset', (preset) => this.usePreset(preset));
        this.eventBus.on('character.validateStep', (step) => this.validateStep(step));
        
        console.log('👤 Character Creation System initialized');
    }

    getCharacterPresets() {
        return {
            ambitious: {
                name: "Alex Rivera",
                age: 28,
                gender: "non-binary",
                pronouns: "they/them",
                personality: {
                    traits: ["ambitious", "charismatic", "competitive"],
                    backstory: "Former corporate executive who quit to follow their dream of owning a business.",
                    motivation: "To build a retail empire and prove that independent businesses can thrive."
                },
                stats: {
                    charisma: 70,
                    business: 80,
                    energy: 90,
                    stress: 20,
                    reputation: 60
                },
                appearance: {
                    description: "Sharp-dressed with confident posture, expressive eyes, and a determined smile.",
                    customPrompt: "Professional business person, confident expression, modern casual business attire"
                }
            },
            friendly: {
                name: "Jordan Martinez",
                age: 24,
                gender: "female",
                pronouns: "she/her",
                personality: {
                    traits: ["friendly", "optimistic", "helpful"],
                    backstory: "Recent college graduate who inherited a small store from their grandmother.",
                    motivation: "To continue their family legacy and serve the local community."
                },
                stats: {
                    charisma: 90,
                    business: 50,
                    energy: 80,
                    stress: 10,
                    reputation: 70
                },
                appearance: {
                    description: "Warm smile, approachable demeanor, casual comfortable clothing.",
                    customPrompt: "Friendly young woman, warm smile, casual clothing, approachable appearance"
                }
            },
            experienced: {
                name: "Morgan Chen",
                age: 35,
                gender: "male",
                pronouns: "he/him",
                personality: {
                    traits: ["experienced", "practical", "patient"],
                    backstory: "Former retail manager starting their own store after years of working for others.",
                    motivation: "To apply years of retail experience to build a sustainable business."
                },
                stats: {
                    charisma: 60,
                    business: 90,
                    energy: 70,
                    stress: 30,
                    reputation: 50
                },
                appearance: {
                    description: "Practical clothing, confident but relaxed posture, knowing expression.",
                    customPrompt: "Middle-aged man, practical clothing, confident but relaxed, experienced look"
                }
            },
            creative: {
                name: "Riley Kim",
                age: 26,
                gender: "non-binary",
                pronouns: "ze/zir",
                personality: {
                    traits: ["creative", "artistic", "unconventional"],
                    backstory: "Artist and designer looking to create a unique retail experience.",
                    motivation: "To combine creativity with commerce and build something truly original."
                },
                stats: {
                    charisma: 80,
                    business: 40,
                    energy: 85,
                    stress: 15,
                    reputation: 45
                },
                appearance: {
                    description: "Unique style, creative accessories, expressive clothing, artistic flair.",
                    customPrompt: "Creative person, unique artistic style, colorful expressive clothing, artistic flair"
                }
            }
        };
    }

    startCharacterCreation() {
        this.currentStep = 'basic';
        this.characterData = {
            name: "",
            age: 25,
            gender: "non-binary",
            pronouns: "they/them",
            appearance: {
                description: "",
                avatar: null,
                customPrompt: ""
            },
            personality: {
                traits: [],
                backstory: "",
                motivation: ""
            },
            stats: {
                charisma: 50,
                business: 50,
                energy: 100,
                stress: 0,
                reputation: 50
            }
        };

        this.eventBus.emit('ui.showScreen', 'characterCreation');
        this.eventBus.emit('character.stepChanged', { step: this.currentStep, data: this.characterData });
        
        console.log('👤 Character creation started');
    }

    usePreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) {
            console.error('Unknown character preset:', presetName);
            return;
        }

        this.characterData = JSON.parse(JSON.stringify(preset)); // Deep copy
        this.currentStep = 'appearance';
        
        this.eventBus.emit('character.presetApplied', { preset: presetName, data: this.characterData });
        this.eventBus.emit('character.stepChanged', { step: this.currentStep, data: this.characterData });
        
        console.log('👤 Applied character preset:', presetName);
    }

    updateBasicInfo(data) {
        Object.assign(this.characterData, {
            name: data.name || this.characterData.name,
            age: Math.max(18, Math.min(99, data.age || this.characterData.age)),
            gender: data.gender || this.characterData.gender,
            pronouns: data.pronouns || this.characterData.pronouns
        });

        this.eventBus.emit('character.dataUpdated', { section: 'basic', data: this.characterData });
    }

    updateAppearance(data) {
        Object.assign(this.characterData.appearance, {
            description: data.description || this.characterData.appearance.description,
            customPrompt: data.customPrompt || this.characterData.appearance.customPrompt
        });

        this.eventBus.emit('character.dataUpdated', { section: 'appearance', data: this.characterData });
    }

    updatePersonality(data) {
        if (data.traits) {
            this.characterData.personality.traits = [...data.traits];
        }
        
        Object.assign(this.characterData.personality, {
            backstory: data.backstory || this.characterData.personality.backstory,
            motivation: data.motivation || this.characterData.personality.motivation
        });

        // Adjust stats based on personality traits
        this.adjustStatsFromTraits();

        this.eventBus.emit('character.dataUpdated', { section: 'personality', data: this.characterData });
    }

    adjustStatsFromTraits() {
        // Reset stats to baseline
        this.characterData.stats = {
            charisma: 50,
            business: 50,
            energy: 100,
            stress: 0,
            reputation: 50
        };

        // Apply trait modifiers
        this.characterData.personality.traits.forEach(trait => {
            const modifier = this.getTraitModifier(trait);
            Object.entries(modifier).forEach(([stat, value]) => {
                this.characterData.stats[stat] = Math.max(0, Math.min(100, 
                    this.characterData.stats[stat] + value));
            });
        });
    }

    getTraitModifier(trait) {
        const modifiers = {
            // Positive traits
            ambitious: { business: +20, charisma: +10, stress: +10 },
            charismatic: { charisma: +25, reputation: +10 },
            friendly: { charisma: +15, reputation: +15, stress: -5 },
            optimistic: { energy: +15, stress: -10, charisma: +5 },
            patient: { stress: -15, business: +10 },
            creative: { charisma: +10, energy: +10, business: -5 },
            experienced: { business: +25, reputation: +5, charisma: -5 },
            practical: { business: +15, stress: -5, energy: +5 },
            hardworking: { business: +10, energy: +10, stress: +5 },
            confident: { charisma: +15, reputation: +10, stress: -5 },
            
            // Neutral/balanced traits
            artistic: { charisma: +10, business: -10, energy: +5 },
            analytical: { business: +15, charisma: -5 },
            competitive: { business: +10, stress: +10, charisma: +5 },
            independent: { business: +5, charisma: -5, stress: +5 },
            curious: { energy: +5, charisma: +5 },
            
            // Challenging traits (provide interesting gameplay)
            anxious: { stress: +20, charisma: -10, energy: -5 },
            perfectionist: { business: +10, stress: +15, energy: -5 },
            impatient: { stress: +10, charisma: -5, business: +5 },
            stubborn: { business: +5, charisma: -10, stress: +5 },
            introverted: { charisma: -15, stress: -5, business: +5 }
        };

        return modifiers[trait] || {};
    }

    async generateAvatar() {
        if (this.isGeneratingAvatar) return;
        
        this.isGeneratingAvatar = true;
        this.eventBus.emit('character.avatarGenerating', true);
        
        try {
            // Create AI prompt for avatar generation
            const prompt = this.buildAvatarPrompt();
            
            // Generate avatar using AI hooks
            const avatarUrl = await this.aiHooks.generateImage(prompt, {
                style: 'portrait',
                quality: 'high',
                aspectRatio: '1:1'
            });
            
            if (avatarUrl) {
                this.characterData.appearance.avatar = avatarUrl;
                this.eventBus.emit('character.avatarGenerated', { url: avatarUrl });
                console.log('👤 Avatar generated successfully');
            } else {
                throw new Error('Failed to generate avatar');
            }
            
        } catch (error) {
            console.error('Avatar generation failed:', error);
            this.eventBus.emit('character.avatarError', { error: error.message });
        } finally {
            this.isGeneratingAvatar = false;
            this.eventBus.emit('character.avatarGenerating', false);
        }
    }

    buildAvatarPrompt() {
        const { name, age, gender, appearance, personality } = this.characterData;
        
        let prompt = "";
        
        // Basic description
        if (appearance.customPrompt) {
            prompt = appearance.customPrompt;
        } else if (appearance.description) {
            prompt = appearance.description;
        } else {
            // Generate default prompt
            prompt = `${age} year old ${gender} person`;
            
            // Add personality-based appearance traits
            if (personality.traits.includes('friendly')) {
                prompt += ", warm smile, approachable";
            }
            if (personality.traits.includes('confident')) {
                prompt += ", confident expression, good posture";
            }
            if (personality.traits.includes('creative')) {
                prompt += ", unique style, artistic flair";
            }
            if (personality.traits.includes('professional')) {
                prompt += ", business attire, professional appearance";
            }
        }
        
        // Add technical specifications
        prompt += ", portrait photo, high quality, professional lighting, neutral background";
        
        return prompt;
    }

    nextStep() {
        const steps = ['basic', 'appearance', 'personality', 'review'];
        const currentIndex = steps.indexOf(this.currentStep);
        
        if (currentIndex < steps.length - 1) {
            this.currentStep = steps[currentIndex + 1];
            this.eventBus.emit('character.stepChanged', { 
                step: this.currentStep, 
                data: this.characterData 
            });
        }
    }

    previousStep() {
        const steps = ['basic', 'appearance', 'personality', 'review'];
        const currentIndex = steps.indexOf(this.currentStep);
        
        if (currentIndex > 0) {
            this.currentStep = steps[currentIndex - 1];
            this.eventBus.emit('character.stepChanged', { 
                step: this.currentStep, 
                data: this.characterData 
            });
        }
    }

    validateStep(step) {
        switch (step) {
            case 'basic':
                return this.validateBasicInfo();
            case 'appearance':
                return this.validateAppearance();
            case 'personality':
                return this.validatePersonality();
            case 'review':
                return this.validateComplete();
            default:
                return false;
        }
    }

    validateBasicInfo() {
        const { name, age } = this.characterData;
        const isValid = name.trim().length >= 2 && age >= 18 && age <= 99;
        
        this.eventBus.emit('character.validationResult', {
            step: 'basic',
            isValid,
            errors: isValid ? [] : ['Name must be at least 2 characters', 'Age must be between 18-99']
        });
        
        return isValid;
    }

    validateAppearance() {
        const { description, customPrompt } = this.characterData.appearance;
        const isValid = description.trim().length >= 10 || customPrompt.trim().length >= 10;
        
        this.eventBus.emit('character.validationResult', {
            step: 'appearance',
            isValid,
            errors: isValid ? [] : ['Please provide an appearance description (at least 10 characters)']
        });
        
        return isValid;
    }

    validatePersonality() {
        const { traits, backstory, motivation } = this.characterData.personality;
        const isValid = traits.length >= 1 && backstory.trim().length >= 20 && motivation.trim().length >= 10;
        
        this.eventBus.emit('character.validationResult', {
            step: 'personality',
            isValid,
            errors: isValid ? [] : [
                'Select at least 1 personality trait',
                'Backstory must be at least 20 characters',
                'Motivation must be at least 10 characters'
            ]
        });
        
        return isValid;
    }

    validateComplete() {
        return this.validateBasicInfo() && 
               this.validateAppearance() && 
               this.validatePersonality();
    }

    finishCharacterCreation() {
        if (!this.validateComplete()) {
            this.eventBus.emit('character.error', { 
                message: 'Please complete all required fields before continuing' 
            });
            return false;
        }

        // Apply character data to game state
        Object.assign(this.gameState.data.player, this.characterData);
        
        // Initialize relationships
        this.gameState.data.player.relationships = {};
        this.gameState.data.player.romance = {
            currentPartner: null,
            history: []
        };

        this.eventBus.emit('character.created', { character: this.characterData });
        this.eventBus.emit('setup.characterComplete');
        
        console.log('👤 Character creation completed:', this.characterData.name);
        return true;
    }

    // Get available traits for UI
    getAvailableTraits() {
        return [
            // Positive traits
            { id: 'ambitious', name: 'Ambitious', description: 'Driven to succeed, +Business +Charisma +Stress' },
            { id: 'charismatic', name: 'Charismatic', description: 'Natural charm, +Charisma +Reputation' },
            { id: 'friendly', name: 'Friendly', description: 'Easy to get along with, +Charisma +Reputation -Stress' },
            { id: 'optimistic', name: 'Optimistic', description: 'Always sees the bright side, +Energy -Stress +Charisma' },
            { id: 'patient', name: 'Patient', description: 'Takes time to make good decisions, -Stress +Business' },
            { id: 'creative', name: 'Creative', description: 'Thinks outside the box, +Charisma +Energy -Business' },
            { id: 'experienced', name: 'Experienced', description: 'Has done this before, +Business +Reputation -Charisma' },
            { id: 'practical', name: 'Practical', description: 'Focuses on what works, +Business -Stress +Energy' },
            { id: 'hardworking', name: 'Hardworking', description: 'Puts in extra effort, +Business +Energy +Stress' },
            { id: 'confident', name: 'Confident', description: 'Believes in themselves, +Charisma +Reputation -Stress' },
            
            // Neutral traits
            { id: 'artistic', name: 'Artistic', description: 'Appreciates beauty and design, +Charisma -Business +Energy' },
            { id: 'analytical', name: 'Analytical', description: 'Thinks through problems carefully, +Business -Charisma' },
            { id: 'competitive', name: 'Competitive', description: 'Wants to be the best, +Business +Stress +Charisma' },
            { id: 'independent', name: 'Independent', description: 'Prefers to work alone, +Business -Charisma +Stress' },
            { id: 'curious', name: 'Curious', description: 'Always learning new things, +Energy +Charisma' },
            
            // Challenging traits
            { id: 'anxious', name: 'Anxious', description: 'Worries about everything, +Stress -Charisma -Energy' },
            { id: 'perfectionist', name: 'Perfectionist', description: 'Everything must be perfect, +Business +Stress -Energy' },
            { id: 'impatient', name: 'Impatient', description: 'Wants results now, +Stress -Charisma +Business' },
            { id: 'stubborn', name: 'Stubborn', description: 'Sticks to their guns, +Business -Charisma +Stress' },
            { id: 'introverted', name: 'Introverted', description: 'Prefers quiet environments, -Charisma -Stress +Business' }
        ];
    }

    // Get gender options for UI
    getGenderOptions() {
        return [
            { id: 'female', name: 'Female', pronouns: 'she/her' },
            { id: 'male', name: 'Male', pronouns: 'he/him' },
            { id: 'non-binary', name: 'Non-binary', pronouns: 'they/them' },
            { id: 'genderfluid', name: 'Genderfluid', pronouns: 'they/them' },
            { id: 'custom', name: 'Custom', pronouns: 'custom' }
        ];
    }

    // Reset character creation
    reset() {
        this.currentStep = 'basic';
        this.characterData = {};
        this.isGeneratingAvatar = false;
        this.eventBus.emit('character.reset');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterCreationSystem;
} else if (typeof window !== 'undefined') {
    window.CharacterCreationSystem = CharacterCreationSystem;
}
