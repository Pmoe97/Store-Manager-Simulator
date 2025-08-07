/**
 * Cash Register Component - Point of Sale interface
 * Handles transaction processing, customer checkout, and payment methods
 */

class CashRegister {
    constructor() {
        this.eventBus = null;
        this.financialSystem = null;
        this.productSystem = null;
        this.customerSystem = null;
        this.currentTransaction = null;
        this.isOpen = false;
        this.container = null;
        
        this.state = {
            isProcessing: false,
            currentCustomer: null,
            cart: [],
            subtotal: 0,
            tax: 0,
            total: 0,
            discounts: [],
            paymentMethod: 'cash',
            cashTendered: 0,
            change: 0
        };
    }

    initialize(eventBus, financialSystem, productSystem, customerSystem) {
        this.eventBus = eventBus;
        this.financialSystem = financialSystem;
        this.productSystem = productSystem;
        this.customerSystem = customerSystem;

        // Listen for register events
        this.eventBus.on('checkout.startTransaction', (data) => this.startTransaction(data));
        this.eventBus.on('checkout.addItem', (data) => this.addItemToCart(data));
        this.eventBus.on('checkout.removeItem', (data) => this.removeItemFromCart(data));
        this.eventBus.on('checkout.applyDiscount', (data) => this.applyDiscount(data));
        this.eventBus.on('checkout.processPayment', (data) => this.processPayment(data));
        this.eventBus.on('checkout.cancelTransaction', () => this.cancelTransaction());
        this.eventBus.on('ui.showCashRegister', () => this.show());
        this.eventBus.on('ui.hideCashRegister', () => this.hide());

        console.log('💳 Cash Register initialized');
    }

    render() {
        return `
            <div id="cash-register" class="cash-register hidden">
                <div class="register-header">
                    <h2>Point of Sale</h2>
                    <div class="register-status">
                        <span class="status-indicator ${this.isOpen ? 'open' : 'closed'}"></span>
                        <span class="status-text">${this.isOpen ? 'Open' : 'Closed'}</span>
                    </div>
                    <div class="register-controls">
                        <button class="btn btn-primary" onclick="cashRegister.openRegister()" ${this.isOpen ? 'disabled' : ''}>
                            Open Register
                        </button>
                        <button class="btn btn-secondary" onclick="cashRegister.closeRegister()" ${!this.isOpen ? 'disabled' : ''}>
                            Close Register
                        </button>
                    </div>
                </div>

                <div class="register-body">
                    <div class="transaction-panel">
                        <div class="customer-info">
                            <div class="customer-display">
                                ${this.state.currentCustomer ? this.renderCustomerInfo() : this.renderNoCustomer()}
                            </div>
                        </div>

                        <div class="cart-section">
                            <div class="cart-header">
                                <h3>Shopping Cart</h3>
                                <button class="btn btn-sm btn-outline" onclick="cashRegister.scanBarcode()">
                                    <i class="icon-barcode"></i> Scan Item
                                </button>
                            </div>
                            <div class="cart-items">
                                ${this.renderCartItems()}
                            </div>
                            <div class="cart-totals">
                                ${this.renderCartTotals()}
                            </div>
                        </div>

                        <div class="payment-section">
                            <div class="payment-method-selector">
                                <h4>Payment Method</h4>
                                <div class="payment-methods">
                                    <label class="payment-method ${this.state.paymentMethod === 'cash' ? 'selected' : ''}">
                                        <input type="radio" name="paymentMethod" value="cash" 
                                               onchange="cashRegister.setPaymentMethod('cash')" 
                                               ${this.state.paymentMethod === 'cash' ? 'checked' : ''}>
                                        <span class="method-icon">💵</span>
                                        <span class="method-name">Cash</span>
                                    </label>
                                    <label class="payment-method ${this.state.paymentMethod === 'credit_card' ? 'selected' : ''}">
                                        <input type="radio" name="paymentMethod" value="credit_card" 
                                               onchange="cashRegister.setPaymentMethod('credit_card')" 
                                               ${this.state.paymentMethod === 'credit_card' ? 'checked' : ''}>
                                        <span class="method-icon">💳</span>
                                        <span class="method-name">Credit Card</span>
                                    </label>
                                    <label class="payment-method ${this.state.paymentMethod === 'debit_card' ? 'selected' : ''}">
                                        <input type="radio" name="paymentMethod" value="debit_card" 
                                               onchange="cashRegister.setPaymentMethod('debit_card')" 
                                               ${this.state.paymentMethod === 'debit_card' ? 'checked' : ''}>
                                        <span class="method-icon">💳</span>
                                        <span class="method-name">Debit Card</span>
                                    </label>
                                </div>
                            </div>

                            ${this.state.paymentMethod === 'cash' ? this.renderCashPayment() : this.renderCardPayment()}
                        </div>

                        <div class="transaction-actions">
                            <button class="btn btn-danger" onclick="cashRegister.cancelTransaction()" 
                                    ${!this.state.currentCustomer ? 'disabled' : ''}>
                                Cancel Transaction
                            </button>
                            <button class="btn btn-success btn-large" onclick="cashRegister.completeTransaction()" 
                                    ${!this.canCompleteTransaction() ? 'disabled' : ''}>
                                Complete Sale
                            </button>
                        </div>
                    </div>

                    <div class="product-lookup-panel">
                        <div class="product-search">
                            <h3>Product Lookup</h3>
                            <div class="search-controls">
                                <input type="text" id="product-search" placeholder="Search products..." 
                                       oninput="cashRegister.searchProducts(this.value)">
                                <button class="btn btn-primary" onclick="cashRegister.searchProducts()">Search</button>
                            </div>
                            <div class="barcode-input">
                                <input type="text" id="barcode-input" placeholder="Scan or enter barcode" 
                                       onkeyup="cashRegister.handleBarcodeInput(event)">
                            </div>
                        </div>

                        <div class="product-results">
                            <div id="product-search-results">
                                ${this.renderProductSearchResults()}
                            </div>
                        </div>

                        <div class="quick-actions">
                            <h4>Quick Actions</h4>
                            <div class="quick-action-buttons">
                                <button class="btn btn-sm btn-outline" onclick="cashRegister.applyStoreDiscount()">
                                    Store Discount
                                </button>
                                <button class="btn btn-sm btn-outline" onclick="cashRegister.applyLoyaltyDiscount()">
                                    Loyalty Discount
                                </button>
                                <button class="btn btn-sm btn-outline" onclick="cashRegister.openCalculator()">
                                    Calculator
                                </button>
                                <button class="btn btn-sm btn-outline" onclick="cashRegister.processReturn()">
                                    Process Return
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="register-footer">
                    <div class="register-info">
                        <div class="info-item">
                            <span class="label">Register:</span>
                            <span class="value">POS-001</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Cashier:</span>
                            <span class="value">Store Owner</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Transaction #:</span>
                            <span class="value">${this.generateTransactionNumber()}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderCustomerInfo() {
        const customer = this.state.currentCustomer;
        return `
            <div class="customer-card">
                <div class="customer-avatar">
                    <img src="${customer.profilePicture || '/assets/default-avatar.png'}" alt="${customer.name}">
                </div>
                <div class="customer-details">
                    <h4>${customer.name}</h4>
                    <p class="customer-type">${customer.archetype}</p>
                    <div class="customer-stats">
                        <span class="loyalty-level">Loyalty: ${customer.loyaltyLevel || 'New'}</span>
                        <span class="total-spent">Spent: $${(customer.totalSpent || 0).toFixed(2)}</span>
                    </div>
                </div>
                <div class="customer-actions">
                    <button class="btn btn-sm btn-outline" onclick="cashRegister.viewCustomerProfile()">
                        View Profile
                    </button>
                </div>
            </div>
        `;
    }

    renderNoCustomer() {
        return `
            <div class="no-customer">
                <div class="no-customer-icon">👤</div>
                <p>No customer selected</p>
                <button class="btn btn-primary" onclick="cashRegister.selectCustomer()">
                    Select Customer
                </button>
            </div>
        `;
    }

    renderCartItems() {
        if (this.state.cart.length === 0) {
            return `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <p>Cart is empty</p>
                    <p class="empty-cart-help">Scan items or search products to add to cart</p>
                </div>
            `;
        }

        return this.state.cart.map((item, index) => `
            <div class="cart-item" data-index="${index}">
                <div class="item-image">
                    <img src="${item.image || '/assets/default-product.png'}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h5>${item.name}</h5>
                    <p class="item-sku">SKU: ${item.sku}</p>
                    <p class="item-price">$${item.price.toFixed(2)} each</p>
                </div>
                <div class="item-quantity">
                    <button class="btn btn-sm" onclick="cashRegister.updateQuantity(${index}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="btn btn-sm" onclick="cashRegister.updateQuantity(${index}, 1)">+</button>
                </div>
                <div class="item-total">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-danger" onclick="cashRegister.removeItem(${index})">
                        <i class="icon-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderCartTotals() {
        return `
            <div class="totals-breakdown">
                <div class="total-line">
                    <span class="label">Subtotal:</span>
                    <span class="value">$${this.state.subtotal.toFixed(2)}</span>
                </div>
                ${this.state.discounts.map(discount => `
                    <div class="total-line discount">
                        <span class="label">${discount.name}:</span>
                        <span class="value">-$${discount.amount.toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="total-line">
                    <span class="label">Tax:</span>
                    <span class="value">$${this.state.tax.toFixed(2)}</span>
                </div>
                <div class="total-line total">
                    <span class="label">Total:</span>
                    <span class="value">$${this.state.total.toFixed(2)}</span>
                </div>
            </div>
        `;
    }

    renderCashPayment() {
        return `
            <div class="cash-payment">
                <div class="cash-input">
                    <label for="cash-tendered">Cash Tendered:</label>
                    <div class="currency-input">
                        <span class="currency-symbol">$</span>
                        <input type="number" id="cash-tendered" step="0.01" min="0" 
                               value="${this.state.cashTendered}" 
                               oninput="cashRegister.updateCashTendered(this.value)">
                    </div>
                </div>
                <div class="change-calculation">
                    <div class="change-amount ${this.state.change < 0 ? 'insufficient' : ''}">
                        <span class="label">Change:</span>
                        <span class="value">$${this.state.change.toFixed(2)}</span>
                    </div>
                </div>
                <div class="quick-cash-buttons">
                    <button class="btn btn-sm" onclick="cashRegister.addCashAmount(1)">+$1</button>
                    <button class="btn btn-sm" onclick="cashRegister.addCashAmount(5)">+$5</button>
                    <button class="btn btn-sm" onclick="cashRegister.addCashAmount(10)">+$10</button>
                    <button class="btn btn-sm" onclick="cashRegister.addCashAmount(20)">+$20</button>
                    <button class="btn btn-sm" onclick="cashRegister.setExactAmount()">Exact</button>
                </div>
            </div>
        `;
    }

    renderCardPayment() {
        return `
            <div class="card-payment">
                <div class="card-terminal">
                    <div class="terminal-display">
                        <p>💳 Card Terminal Ready</p>
                        <p class="amount">Amount: $${this.state.total.toFixed(2)}</p>
                    </div>
                    <div class="terminal-instructions">
                        <p>Please insert, swipe, or tap card</p>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="cashRegister.processCardPayment()">
                        Process Card Payment
                    </button>
                    <button class="btn btn-outline" onclick="cashRegister.simulateCardDecline()">
                        Simulate Decline
                    </button>
                </div>
            </div>
        `;
    }

    renderProductSearchResults() {
        // This would be populated by search results
        return `
            <div class="search-results-placeholder">
                <p>Search for products to add to transaction</p>
            </div>
        `;
    }

    startTransaction(data) {
        if (!this.isOpen) {
            this.showMessage('Cash register must be opened before starting a transaction', 'error');
            return false;
        }

        this.state.currentCustomer = data.customer;
        this.state.cart = [];
        this.state.subtotal = 0;
        this.state.tax = 0;
        this.state.total = 0;
        this.state.discounts = [];
        this.state.paymentMethod = 'cash';
        this.state.cashTendered = 0;
        this.state.change = 0;

        this.currentTransaction = {
            id: this.generateTransactionId(),
            startTime: new Date(),
            customer: data.customer,
            items: [],
            status: 'in_progress'
        };

        this.updateDisplay();
        this.eventBus.emit('checkout.transactionStarted', { transaction: this.currentTransaction });
    }

    addItemToCart(data) {
        const { product, quantity = 1 } = data;
        
        // Check if item already in cart
        const existingItemIndex = this.state.cart.findIndex(item => item.sku === product.sku);
        
        if (existingItemIndex >= 0) {
            this.state.cart[existingItemIndex].quantity += quantity;
        } else {
            this.state.cart.push({
                ...product,
                quantity
            });
        }

        this.calculateTotals();
        this.updateDisplay();
        this.eventBus.emit('checkout.itemAdded', { product, quantity });
    }

    removeItemFromCart(data) {
        const { index } = data;
        
        if (index >= 0 && index < this.state.cart.length) {
            const removedItem = this.state.cart.splice(index, 1)[0];
            this.calculateTotals();
            this.updateDisplay();
            this.eventBus.emit('checkout.itemRemoved', { item: removedItem });
        }
    }

    updateQuantity(index, change) {
        if (index >= 0 && index < this.state.cart.length) {
            const item = this.state.cart[index];
            item.quantity = Math.max(1, item.quantity + change);
            this.calculateTotals();
            this.updateDisplay();
        }
    }

    calculateTotals() {
        this.state.subtotal = this.state.cart.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0);
        
        const discountTotal = this.state.discounts.reduce((sum, discount) => 
            sum + discount.amount, 0);
        
        const taxableAmount = Math.max(0, this.state.subtotal - discountTotal);
        this.state.tax = this.financialSystem.calculateSalesTax(taxableAmount);
        this.state.total = taxableAmount + this.state.tax;
        
        // Update change calculation
        this.state.change = this.state.cashTendered - this.state.total;
    }

    setPaymentMethod(method) {
        this.state.paymentMethod = method;
        this.updateDisplay();
    }

    updateCashTendered(amount) {
        this.state.cashTendered = parseFloat(amount) || 0;
        this.state.change = this.state.cashTendered - this.state.total;
        this.updateDisplay();
    }

    addCashAmount(amount) {
        this.state.cashTendered += amount;
        this.state.change = this.state.cashTendered - this.state.total;
        this.updateDisplay();
    }

    setExactAmount() {
        this.state.cashTendered = this.state.total;
        this.state.change = 0;
        this.updateDisplay();
    }

    processCardPayment() {
        // Simulate card processing
        this.state.isProcessing = true;
        this.updateDisplay();

        setTimeout(() => {
            this.state.isProcessing = false;
            // 95% success rate for card payments
            const success = Math.random() > 0.05;
            
            if (success) {
                this.completeTransaction();
            } else {
                this.showMessage('Card payment declined. Please try another payment method.', 'error');
                this.updateDisplay();
            }
        }, 2000);
    }

    completeTransaction() {
        if (!this.canCompleteTransaction()) {
            this.showMessage('Cannot complete transaction. Check payment amount.', 'error');
            return false;
        }

        try {
            // Process the sale through financial system
            const saleData = {
                items: this.state.cart,
                totalAmount: this.state.total,
                paymentMethod: this.state.paymentMethod,
                customerId: this.state.currentCustomer?.id,
                discounts: this.state.discounts
            };

            const transaction = this.financialSystem.processSale(saleData);
            
            // Update inventory
            this.state.cart.forEach(item => {
                this.eventBus.emit('inventory.sold', {
                    productId: item.id,
                    quantity: item.quantity
                });
            });

            // Update customer data
            if (this.state.currentCustomer) {
                this.eventBus.emit('customer.purchase', {
                    customerId: this.state.currentCustomer.id,
                    amount: this.state.total,
                    items: this.state.cart
                });
            }

            // Generate receipt
            const receipt = this.generateReceipt(transaction);
            
            // Clear transaction
            this.clearTransaction();
            
            // Show success message
            this.showMessage(`Transaction completed successfully! Transaction ID: ${transaction.id}`, 'success');
            
            // Show receipt option
            this.showReceiptOption(receipt);

            this.eventBus.emit('checkout.transactionCompleted', { 
                transaction, 
                receipt, 
                saleData 
            });

            return true;

        } catch (error) {
            console.error('Transaction failed:', error);
            this.showMessage(`Transaction failed: ${error.message}`, 'error');
            return false;
        }
    }

    cancelTransaction() {
        if (this.currentTransaction) {
            this.eventBus.emit('checkout.transactionCancelled', { 
                transaction: this.currentTransaction 
            });
        }

        this.clearTransaction();
        this.showMessage('Transaction cancelled', 'info');
    }

    clearTransaction() {
        this.state.currentCustomer = null;
        this.state.cart = [];
        this.state.subtotal = 0;
        this.state.tax = 0;
        this.state.total = 0;
        this.state.discounts = [];
        this.state.paymentMethod = 'cash';
        this.state.cashTendered = 0;
        this.state.change = 0;
        this.currentTransaction = null;
        this.updateDisplay();
    }

    openRegister() {
        if (this.financialSystem.openCashRegister()) {
            this.isOpen = true;
            this.updateDisplay();
            this.showMessage('Cash register opened', 'success');
        }
    }

    closeRegister() {
        if (this.currentTransaction) {
            this.showMessage('Cannot close register with active transaction', 'error');
            return false;
        }

        const sessionData = this.financialSystem.closeCashRegister();
        if (sessionData) {
            this.isOpen = false;
            this.updateDisplay();
            this.showRegisterCloseDialog(sessionData);
        }
    }

    generateReceipt(transaction) {
        return {
            id: transaction.id,
            timestamp: new Date(),
            customer: this.state.currentCustomer,
            items: [...this.state.cart],
            subtotal: this.state.subtotal,
            discounts: [...this.state.discounts],
            tax: this.state.tax,
            total: this.state.total,
            paymentMethod: this.state.paymentMethod,
            cashTendered: this.state.paymentMethod === 'cash' ? this.state.cashTendered : null,
            change: this.state.paymentMethod === 'cash' ? this.state.change : null
        };
    }

    canCompleteTransaction() {
        return this.state.cart.length > 0 && 
               this.state.total > 0 && 
               (this.state.paymentMethod !== 'cash' || this.state.change >= 0);
    }

    generateTransactionId() {
        return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    generateTransactionNumber() {
        return '#' + (Date.now().toString().slice(-6));
    }

    show() {
        if (this.container) {
            this.container.classList.remove('hidden');
        }
    }

    hide() {
        if (this.container) {
            this.container.classList.add('hidden');
        }
    }

    updateDisplay() {
        if (this.container) {
            this.container.innerHTML = this.render();
        }
    }

    showMessage(message, type = 'info') {
        this.eventBus.emit('ui.showNotification', { message, type });
    }

    showReceiptOption(receipt) {
        this.eventBus.emit('ui.showModal', {
            type: 'receipt',
            title: 'Transaction Complete',
            content: this.renderReceiptModal(receipt),
            buttons: [
                { text: 'Print Receipt', action: () => this.printReceipt(receipt), primary: true },
                { text: 'Email Receipt', action: () => this.emailReceipt(receipt) },
                { text: 'Close', action: () => this.eventBus.emit('ui.closeModal') }
            ]
        });
    }

    showRegisterCloseDialog(sessionData) {
        this.eventBus.emit('ui.showModal', {
            type: 'register-close',
            title: 'Register Closed',
            content: this.renderRegisterCloseModal(sessionData),
            buttons: [
                { text: 'Print Report', action: () => this.printRegisterReport(sessionData) },
                { text: 'Close', action: () => this.eventBus.emit('ui.closeModal'), primary: true }
            ]
        });
    }

    renderReceiptModal(receipt) {
        return `
            <div class="receipt-modal">
                <div class="receipt-preview">
                    ${this.renderReceipt(receipt)}
                </div>
            </div>
        `;
    }

    renderReceipt(receipt) {
        return `
            <div class="receipt">
                <div class="receipt-header">
                    <h3>Your Store Name</h3>
                    <p>123 Main Street</p>
                    <p>City, ST 12345</p>
                    <p>Phone: (555) 123-4567</p>
                </div>
                
                <div class="receipt-transaction">
                    <p><strong>Transaction #:</strong> ${receipt.id}</p>
                    <p><strong>Date:</strong> ${receipt.timestamp.toLocaleString()}</p>
                    ${receipt.customer ? `<p><strong>Customer:</strong> ${receipt.customer.name}</p>` : ''}
                </div>

                <div class="receipt-items">
                    ${receipt.items.map(item => `
                        <div class="receipt-item">
                            <div class="item-line">
                                <span>${item.name}</span>
                                <span>$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            <div class="item-details">
                                ${item.quantity} × $${item.price.toFixed(2)}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="receipt-totals">
                    <div class="total-line">
                        <span>Subtotal:</span>
                        <span>$${receipt.subtotal.toFixed(2)}</span>
                    </div>
                    ${receipt.discounts.map(discount => `
                        <div class="total-line">
                            <span>${discount.name}:</span>
                            <span>-$${discount.amount.toFixed(2)}</span>
                        </div>
                    `).join('')}
                    <div class="total-line">
                        <span>Tax:</span>
                        <span>$${receipt.tax.toFixed(2)}</span>
                    </div>
                    <div class="total-line total">
                        <span><strong>Total:</strong></span>
                        <span><strong>$${receipt.total.toFixed(2)}</strong></span>
                    </div>
                    ${receipt.paymentMethod === 'cash' ? `
                        <div class="total-line">
                            <span>Cash Tendered:</span>
                            <span>$${receipt.cashTendered.toFixed(2)}</span>
                        </div>
                        <div class="total-line">
                            <span>Change:</span>
                            <span>$${receipt.change.toFixed(2)}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="receipt-footer">
                    <p>Thank you for your business!</p>
                    <p>Return policy: 30 days with receipt</p>
                </div>
            </div>
        `;
    }
}

// Initialize global cash register instance
let cashRegister = null;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CashRegister;
}
