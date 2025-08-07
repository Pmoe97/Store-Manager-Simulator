/**
 * Dialogue Component - UI for displaying conversations and player choices
 * Handles conversation interface, response options, and customer interaction display
 */

class DialogueComponent {
    constructor() {
        this.container = null;
        this.eventBus = null;
        this.currentConversation = null;
        this.isVisible = false;
        this.typingAnimation = null;
        this.responseTimeout = null;
    }

    initialize(eventBus) {
        this.eventBus = eventBus;
        this.createDialogueInterface();
        this.setupEventListeners();
        
        // Listen for conversation events
        this.eventBus.on('conversation.started', (data) => this.showConversation(data.conversation));
        this.eventBus.on('conversation.npcResponse', (data) => this.displayNPCMessage(data));
        this.eventBus.on('conversation.playerResponseProcessed', (data) => this.displayPlayerMessage(data));
        this.eventBus.on('conversation.ended', () => this.hideConversation());
        this.eventBus.on('customerService.customerEntered', (data) => this.showCustomerCard(data));
        this.eventBus.on('customerService.browsingOpportunity', (data) => this.showActionSuggestions(data));
        this.eventBus.on('customerService.questionOpportunity', (data) => this.showQuestionInterface(data));
        this.eventBus.on('customerService.complaintReceived', (data) => this.showComplaintInterface(data));
        
        console.log('💬 Dialogue Component initialized');
    }

    createDialogueInterface() {
        this.container = document.createElement('div');
        this.container.className = 'dialogue-container';
        this.container.style.display = 'none';
        
        this.container.innerHTML = `
            <div class="dialogue-overlay"></div>
            <div class="dialogue-panel">
                <div class="dialogue-header">
                    <div class="customer-info">
                        <div class="customer-avatar">
                            <img id="customer-avatar" src="" alt="Customer" />
                            <div class="customer-mood" id="customer-mood"></div>
                        </div>
                        <div class="customer-details">
                            <h3 id="customer-name">Customer Name</h3>
                            <div class="customer-status">
                                <span id="customer-relationship" class="relationship-badge">Stranger</span>
                                <span id="customer-satisfaction" class="satisfaction-meter">
                                    <span class="meter-fill"></span>
                                    <span class="meter-text">50%</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="dialogue-controls">
                        <button id="end-conversation" class="control-btn">End Chat</button>
                        <button id="quick-checkout" class="control-btn checkout-btn">Quick Checkout</button>
                    </div>
                </div>
                
                <div class="dialogue-content">
                    <div class="conversation-area">
                        <div id="message-history" class="message-history"></div>
                        <div id="typing-indicator" class="typing-indicator" style="display: none;">
                            <span class="typing-dots">
                                <span></span><span></span><span></span>
                            </span>
                            <span class="typing-text">Customer is typing...</span>
                        </div>
                    </div>
                    
                    <div class="response-area">
                        <div id="response-options" class="response-options"></div>
                        <div class="custom-response">
                            <input type="text" id="custom-response-input" 
                                   placeholder="Type a custom response..." maxlength="200">
                            <button id="send-custom" class="send-btn">Send</button>
                        </div>
                    </div>
                </div>
                
                <div class="action-suggestions" id="action-suggestions" style="display: none;">
                    <h4>Suggested Actions:</h4>
                    <div class="suggestion-buttons" id="suggestion-buttons"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.container);
    }

    setupEventListeners() {
        // Response option clicks
        this.container.addEventListener('click', (e) => {
            if (e.target.matches('.response-option')) {
                this.selectResponseOption(e.target.dataset.optionId);
            } else if (e.target.matches('.suggestion-btn')) {
                this.executeSuggestion(e.target.dataset.action, e.target.dataset.data);
            } else if (e.target.id === 'end-conversation') {
                this.eventBus.emit('conversation.end');
            } else if (e.target.id === 'quick-checkout') {
                this.startQuickCheckout();
            }
        });
        
        // Custom response handling
        const customInput = this.container.querySelector('#custom-response-input');
        const sendButton = this.container.querySelector('#send-custom');
        
        sendButton.addEventListener('click', () => this.sendCustomResponse());
        customInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendCustomResponse();
        });
        
        // Close on overlay click
        this.container.querySelector('.dialogue-overlay').addEventListener('click', () => {
            this.hideConversation();
        });
    }

    // Main Display Methods
    showConversation(conversation) {
        this.currentConversation = conversation;
        this.isVisible = true;
        
        // Update customer info
        this.updateCustomerInfo(conversation.npc);
        
        // Clear message history
        const messageHistory = this.container.querySelector('#message-history');
        messageHistory.innerHTML = '';
        
        // Show the dialogue panel
        this.container.style.display = 'flex';
        this.container.classList.add('active');
        
        // Add initial system message if needed
        if (conversation.scenario === 'greeting') {
            this.addSystemMessage(`${conversation.npc.name} has entered your store.`);
        }
    }

    hideConversation() {
        this.isVisible = false;
        this.currentConversation = null;
        
        this.container.classList.remove('active');
        setTimeout(() => {
            this.container.style.display = 'none';
        }, 300);
        
        // Clear any ongoing animations
        if (this.typingAnimation) {
            clearTimeout(this.typingAnimation);
            this.typingAnimation = null;
        }
    }

    updateCustomerInfo(npc) {
        // Avatar
        const avatar = this.container.querySelector('#customer-avatar');
        if (npc.avatar) {
            avatar.src = npc.avatar;
            avatar.style.display = 'block';
        } else {
            avatar.style.display = 'none';
        }
        
        // Name
        this.container.querySelector('#customer-name').textContent = npc.name;
        
        // Relationship badge
        const relationshipBadge = this.container.querySelector('#customer-relationship');
        relationshipBadge.textContent = this.formatRelationshipLevel(npc.relationshipLevel);
        relationshipBadge.className = `relationship-badge ${npc.relationshipLevel}`;
        
        // Mood indicator
        const moodIndicator = this.container.querySelector('#customer-mood');
        moodIndicator.className = `customer-mood ${npc.mood}`;
        moodIndicator.title = `Customer is ${npc.mood}`;
        
        // Satisfaction meter (start at 50% if no conversation data)
        this.updateSatisfactionMeter(50);
    }

    updateSatisfactionMeter(satisfaction) {
        const meter = this.container.querySelector('#customer-satisfaction');
        const fill = meter.querySelector('.meter-fill');
        const text = meter.querySelector('.meter-text');
        
        fill.style.width = `${satisfaction}%`;
        text.textContent = `${satisfaction}%`;
        
        // Color coding
        meter.className = 'satisfaction-meter';
        if (satisfaction >= 80) meter.classList.add('excellent');
        else if (satisfaction >= 60) meter.classList.add('good');
        else if (satisfaction >= 40) meter.classList.add('neutral');
        else if (satisfaction >= 20) meter.classList.add('poor');
        else meter.classList.add('terrible');
    }

    // Message Display
    displayNPCMessage(data) {
        const { message, options, conversation } = data;
        
        // Show typing indicator first
        this.showTypingIndicator();
        
        // Delay before showing actual message (simulate typing)
        this.typingAnimation = setTimeout(() => {
            this.hideTypingIndicator();
            this.addMessage('npc', message.text, message.emotion);
            this.showResponseOptions(options);
            
            // Update satisfaction if available
            if (conversation && conversation.playerSatisfaction !== undefined) {
                this.updateSatisfactionMeter(conversation.playerSatisfaction);
            }
        }, 1000 + Math.random() * 1500); // 1-2.5 second delay
    }

    displayPlayerMessage(data) {
        const { response, tone, impact } = data;
        
        this.addMessage('player', response, tone);
        this.clearResponseOptions();
        
        // Show impact feedback briefly
        if (impact.relationshipChange !== 0 || impact.satisfactionChange !== 0) {
            this.showImpactFeedback(impact);
        }
    }

    addMessage(sender, text, emotion = 'neutral') {
        const messageHistory = this.container.querySelector('#message-history');
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender} ${emotion}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(text)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        messageHistory.appendChild(messageElement);
        
        // Auto-scroll to bottom
        messageHistory.scrollTop = messageHistory.scrollHeight;
        
        // Add message animation
        requestAnimationFrame(() => {
            messageElement.classList.add('visible');
        });
    }

    addSystemMessage(text) {
        const messageHistory = this.container.querySelector('#message-history');
        
        const systemElement = document.createElement('div');
        systemElement.className = 'message system';
        systemElement.innerHTML = `
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(text)}</div>
            </div>
        `;
        
        messageHistory.appendChild(systemElement);
        messageHistory.scrollTop = messageHistory.scrollHeight;
    }

    showTypingIndicator() {
        const indicator = this.container.querySelector('#typing-indicator');
        indicator.style.display = 'flex';
        
        // Auto-scroll to show typing indicator
        const messageHistory = this.container.querySelector('#message-history');
        messageHistory.scrollTop = messageHistory.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = this.container.querySelector('#typing-indicator');
        indicator.style.display = 'none';
    }

    // Response Options
    showResponseOptions(options) {
        const container = this.container.querySelector('#response-options');
        container.innerHTML = '';
        
        if (!options || options.length === 0) {
            container.innerHTML = '<div class="no-options">Waiting for customer response...</div>';
            return;
        }
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = `response-option ${option.tone || 'neutral'}`;
            button.dataset.optionId = option.id;
            button.innerHTML = `
                <span class="option-text">${this.escapeHtml(option.text)}</span>
                ${option.requiresRelationship ? `<span class="requirement">Requires: ${option.requiresRelationship} relationship</span>` : ''}
            `;
            
            // Disable if requirements not met
            if (option.requiresRelationship && this.currentConversation) {
                if (this.currentConversation.npc.relationship < option.requiresRelationship) {
                    button.disabled = true;
                    button.classList.add('disabled');
                }
            }
            
            container.appendChild(button);
        });
    }

    clearResponseOptions() {
        const container = this.container.querySelector('#response-options');
        container.innerHTML = '';
    }

    selectResponseOption(optionId) {
        this.eventBus.emit('conversation.playerResponse', { optionId });
        this.clearResponseOptions();
    }

    sendCustomResponse() {
        const input = this.container.querySelector('#custom-response-input');
        const text = input.value.trim();
        
        if (text) {
            this.eventBus.emit('conversation.playerResponse', { customText: text });
            input.value = '';
            this.clearResponseOptions();
        }
    }

    // Special Interfaces
    showCustomerCard(data) {
        const { customer, behavior, suggestedActions } = data;
        
        // Show floating customer card when they enter
        this.showActionSuggestions({
            customer: customer,
            suggestedActions: suggestedActions,
            context: 'customer_entered'
        });
    }

    showActionSuggestions(data) {
        const { suggestedActions, context } = data;
        const container = this.container.querySelector('#action-suggestions');
        const buttonsContainer = this.container.querySelector('#suggestion-buttons');
        
        buttonsContainer.innerHTML = '';
        
        suggestedActions.forEach(action => {
            const button = document.createElement('button');
            button.className = `suggestion-btn ${action.priority || 'medium'}`;
            button.dataset.action = action.action;
            button.dataset.data = JSON.stringify(action.data || {});
            button.innerHTML = `
                <span class="action-text">${action.text}</span>
                ${action.relationshipImpact ? `<span class="impact">${action.relationshipImpact}</span>` : ''}
            `;
            
            buttonsContainer.appendChild(button);
        });
        
        container.style.display = 'block';
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            container.style.display = 'none';
        }, 10000);
    }

    showQuestionInterface(data) {
        const { customer, question, suggestedResponses } = data;
        
        this.addSystemMessage(`${customer.name} has a question: "${question}"`);
        
        // Convert responses to dialogue options format
        const options = suggestedResponses.map(response => ({
            id: response.type,
            text: response.text,
            tone: response.type,
            impact: response.impact
        }));
        
        this.showResponseOptions(options);
    }

    showComplaintInterface(data) {
        const { customer, complaint, severity, suggestedResolutions } = data;
        
        this.addSystemMessage(`${customer.name} has a complaint: "${complaint}" (Severity: ${severity}/3)`);
        
        // Convert resolutions to dialogue options format
        const options = suggestedResolutions.map(resolution => ({
            id: resolution.type,
            text: resolution.text,
            tone: resolution.type,
            cost: resolution.cost,
            impact: resolution.impact
        }));
        
        this.showResponseOptions(options);
    }

    // Action Execution
    executeSuggestion(action, dataString) {
        const data = JSON.parse(dataString || '{}');
        
        switch (action) {
            case 'greet':
                this.eventBus.emit('player.greetCustomer', { quality: 'friendly' });
                break;
            case 'offer_help':
                this.eventBus.emit('player.helpCustomer', { approach: 'helpful' });
                break;
            case 'start_checkout':
                this.eventBus.emit('player.startCheckout', {});
                break;
            case 'personal_greeting':
                this.eventBus.emit('player.greetCustomer', { quality: 'personal' });
                break;
            case 'quick_service':
                this.eventBus.emit('player.helpCustomer', { approach: 'efficient' });
                break;
            default:
                console.log(`Unknown action: ${action}`);
        }
        
        // Hide suggestions after action
        this.container.querySelector('#action-suggestions').style.display = 'none';
    }

    startQuickCheckout() {
        if (this.currentConversation) {
            this.eventBus.emit('player.startCheckout', {
                approach: 'quick'
            });
        }
    }

    // Feedback and Effects
    showImpactFeedback(impact) {
        const feedback = document.createElement('div');
        feedback.className = 'impact-feedback';
        
        let feedbackText = '';
        if (impact.relationshipChange > 0) {
            feedbackText += `+${impact.relationshipChange} Relationship `;
        } else if (impact.relationshipChange < 0) {
            feedbackText += `${impact.relationshipChange} Relationship `;
        }
        
        if (impact.satisfactionChange > 0) {
            feedbackText += `+${impact.satisfactionChange} Satisfaction`;
        } else if (impact.satisfactionChange < 0) {
            feedbackText += `${impact.satisfactionChange} Satisfaction`;
        }
        
        feedback.textContent = feedbackText;
        
        // Position near customer info
        const customerInfo = this.container.querySelector('.customer-info');
        customerInfo.appendChild(feedback);
        
        // Animate and remove
        setTimeout(() => feedback.classList.add('visible'), 100);
        setTimeout(() => {
            feedback.classList.remove('visible');
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
    }

    // Utility Methods
    formatRelationshipLevel(level) {
        const levels = {
            'stranger': 'Stranger',
            'regular': 'Regular',
            'friend': 'Friend',
            'vip': 'VIP'
        };
        return levels[level] || level;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public Interface
    isDialogueVisible() {
        return this.isVisible;
    }

    getCurrentConversation() {
        return this.currentConversation;
    }

    forceClose() {
        this.hideConversation();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DialogueComponent;
} else if (typeof window !== 'undefined') {
    window.DialogueComponent = DialogueComponent;
}
