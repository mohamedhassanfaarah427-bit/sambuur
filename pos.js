/**
 * POS.JS - Iibka Jumlada & Soo Saarista Rasiidka (Wholesale POS & Invoicing)
 * Handles customer checkout, cart calculation, inventory decrement, and invoice printing.
 */

const POSModule = {
    cart: [],
    selectedCustomer: null,
    discountAmount: 0,
    amountPaid: 0,
    paymentMethod: "EVC Plus / Kaash",
    notes: "",

    init() {
        this.renderCustomerSelect();
        this.renderProductGrid();
        this.renderCart();
        this.bindEvents();
    },

    bindEvents() {
        // POS Search
        const searchInput = document.getElementById("posProductSearch");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.renderProductGrid(e.target.value.trim().toLowerCase());
            });
        }

        // Barcode reader simulation (Enter key triggers instant add)
        const barcodeInput = document.getElementById("posBarcodeScanner");
        if (barcodeInput) {
            barcodeInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    this.scanBarcode(barcodeInput.value.trim());
                    barcodeInput.value = "";
                }
            });
        }

        // Customer change
        const customerSelect = document.getElementById("posCustomerSelect");
        if (customerSelect) {
            customerSelect.addEventListener("change", (e) => {
                const customerId = e.target.value;
                this.selectedCustomer = StorageService.getCustomers().find(c => c.id === customerId) || null;
                this.updateCustomerInfoDisplay();
            });
        }

        // Discount input
        const discountInput = document.getElementById("posDiscountInput");
        if (discountInput) {
            discountInput.addEventListener("input", (e) => {
                this.discountAmount = parseFloat(e.target.value) || 0;
                this.renderCartSummary();
            });
        }

        // Amount paid input
        const paidInput = document.getElementById("posAmountPaid");
        if (paidInput) {
            paidInput.addEventListener("input", (e) => {
                this.amountPaid = parseFloat(e.target.value) || 0;
                this.updateBalanceDisplay();
            });
        }

        // Payment method change
        const paymentSelect = document.getElementById("posPaymentMethod");
        if (paymentSelect) {
            paymentSelect.addEventListener("change", (e) => {
                this.paymentMethod = e.target.value;
            });
        }
    },

    scanBarcode(barcode) {
        if (!barcode) return;
        const products = StorageService.getProducts();
        const found = products.find(p => p.barcode === barcode || p.id.toLowerCase() === barcode.toLowerCase());
        if (found) {
            this.addToCart(found.id);
            App.showToast(`Waa la helay: ${found.name}`, "success");
        } else {
            App.showToast(`Alaab leh Barcode-kan '${barcode}' lama helin!`, "error");
        }
    },

    renderCustomerSelect() {
        const select = document.getElementById("posCustomerSelect");
        if (!select) return;

        const customers = StorageService.getCustomers();
        let options = `<option value="">-- Dooro Macmiilka Jumlada --</option>`;
        options += customers.map(c => `
            <option value="${c.id}">${c.name} (${c.city || 'Suuqa'}) - Deyn: $${c.currentDebt || 0}</option>
        `).join("");

        select.innerHTML = options;

        if (this.selectedCustomer) {
            select.value = this.selectedCustomer.id;
        } else if (customers.length > 0) {
            // Default to first customer or cash
            select.value = customers[0].id;
            this.selectedCustomer = customers[0];
        }
        this.updateCustomerInfoDisplay();
    },

    updateCustomerInfoDisplay() {
        const infoDiv = document.getElementById("posCustomerDetailBadge");
        if (!infoDiv) return;

        if (!this.selectedCustomer) {
            infoDiv.innerHTML = `<span class="text-muted font-xs">Macmiil lama dooran</span>`;
            return;
        }

        const c = this.selectedCustomer;
        const debtBadge = (c.currentDebt && c.currentDebt > 0) 
            ? `<span class="badge badge-warning">Deyn Hore: $${c.currentDebt.toLocaleString()}</span>` 
            : `<span class="badge badge-success">Deyn Ma Qabo ($0)</span>`;

        infoDiv.innerHTML = `
            <div class="cust-info-card">
                <div><strong>${c.name}</strong> <small class="text-muted">(${c.tier || 'Wholesale'})</small></div>
                <div class="font-xs text-muted">📞 ${c.phone || '-'} | 📍 ${c.city || '-'}</div>
                <div class="mt-1">${debtBadge}</div>
            </div>
        `;
    },

    renderProductGrid(query = "") {
        const container = document.getElementById("posProductsContainer");
        if (!container) return;

        let products = StorageService.getProducts();

        if (query) {
            products = products.filter(p => {
                const searchStr = `${p.name} ${p.brand || ''} ${p.model || ''} ${p.barcode || ''}`.toLowerCase();
                return searchStr.includes(query);
            });
        }

        const settings = StorageService.getSettings();
        const currency = settings.currency || "$";

        if (products.length === 0) {
            container.innerHTML = `<div class="p-3 text-muted">Wax alaab ah oo u dhiganta lama helin.</div>`;
            return;
        }

        container.innerHTML = products.map(p => {
            const isOutOfStock = p.stock <= 0;
            const stockColor = isOutOfStock ? 'text-danger' : (p.stock <= (p.minStockAlert || 5) ? 'text-warning' : 'text-success');
            const fallbackImg = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&auto=format&fit=crop&q=80";
            const imgSrc = p.image || fallbackImg;

            return `
                <div class="pos-prod-card ${isOutOfStock ? 'out-of-stock' : ''}" onclick="POSModule.addToCart('${p.id}')">
                    <div class="pos-prod-img-box">
                        <img src="${imgSrc}" alt="${p.name}" class="pos-prod-img" onerror="this.onerror=null; this.src='${fallbackImg}';" loading="lazy">
                        <span class="pos-brand-tag">${p.brand || 'Electronics'}</span>
                    </div>
                    <div class="pos-prod-details">
                        <div class="pos-prod-name" title="${p.name}">${p.name}</div>
                        <div class="pos-prod-model">${p.model || ''}</div>
                    </div>
                    <div class="pos-prod-footer">
                        <span class="pos-prod-price">${currency}${p.wholesalePrice.toLocaleString()}</span>
                        <span class="pos-prod-stock ${stockColor}">${p.stock} ${p.unitType || 'pcs'}</span>
                    </div>
                </div>
            `;
        }).join("");
    },

    addToCart(productId) {
        const product = StorageService.getProducts().find(p => p.id === productId);
        if (!product) return;

        if (product.stock <= 0) {
            App.showToast(`Alaabtan "${product.name}" hadda bakhaarka waa ay ka go'antahay!`, "warning");
            return;
        }

        const existing = this.cart.find(item => item.productId === productId);
        if (existing) {
            if (existing.qty + 1 > product.stock) {
                App.showToast(`Tirada aad rabto waxay ka badantahay inta bakhaarka taal (${product.stock})!`, "warning");
                return;
            }
            existing.qty += 1;
            existing.subtotal = existing.qty * existing.unitPrice;
        } else {
            this.cart.push({
                productId: product.id,
                name: product.name,
                brand: product.brand,
                model: product.model,
                unitType: product.unitType || "Xabbo",
                unitPrice: product.wholesalePrice,
                costPrice: product.costPrice,
                warranty: product.warranty || "Damaanad Guud",
                qty: 1,
                maxStock: product.stock,
                subtotal: product.wholesalePrice
            });
        }

        this.renderCart();
        App.showToast(`+1 ${product.name} lagu daray gaadhiga!`, "info");
    },

    updateCartQty(index, newQty) {
        newQty = parseInt(newQty);
        if (isNaN(newQty) || newQty <= 0) {
            this.removeFromCart(index);
            return;
        }

        const item = this.cart[index];
        if (newQty > item.maxStock) {
            App.showToast(`Stock-ga yaala waa ${item.maxStock} kaliya!`, "warning");
            item.qty = item.maxStock;
        } else {
            item.qty = newQty;
        }

        item.subtotal = item.qty * item.unitPrice;
        this.renderCart();
    },

    updateCartPrice(index, newPrice) {
        newPrice = parseFloat(newPrice);
        if (isNaN(newPrice) || newPrice < 0) return;

        const item = this.cart[index];
        item.unitPrice = newPrice;
        item.subtotal = item.qty * item.unitPrice;
        this.renderCart();
    },

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.renderCart();
    },

    clearCart() {
        if (this.cart.length === 0) return;
        if (confirm("Ma hubtaa inaad tirtirto dhammaan alaabta gaadhiga iibka ku jirta?")) {
            this.cart = [];
            this.discountAmount = 0;
            this.amountPaid = 0;
            const discInput = document.getElementById("posDiscountInput");
            if (discInput) discInput.value = "";
            const paidInput = document.getElementById("posAmountPaid");
            if (paidInput) paidInput.value = "";
            this.renderCart();
        }
    },

    renderCart() {
        const tbody = document.getElementById("posCartTableBody");
        const countSpan = document.getElementById("posCartCount");
        if (!tbody) return;

        if (countSpan) countSpan.textContent = this.cart.reduce((s, i) => s + i.qty, 0);

        const settings = StorageService.getSettings();
        const currency = settings.currency || "$";

        if (this.cart.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        <span style="font-size: 2rem;">🛒</span>
                        <p class="mt-2 mb-0">Gaadhigu waa madhan yahay. Guji alaabta si aad ugu darto.</p>
                    </td>
                </tr>
            `;
            this.renderCartSummary();
            return;
        }

        tbody.innerHTML = this.cart.map((item, idx) => `
            <tr>
                <td>
                    <strong>${item.name}</strong>
                    <div class="font-xs text-muted">${item.brand || ''} ${item.model || ''}</div>
                </td>
                <td style="width: 120px;">
                    <div class="qty-control">
                        <button class="btn-qty" onclick="POSModule.updateCartQty(${idx}, ${item.qty - 1})">-</button>
                        <input type="number" min="1" max="${item.maxStock}" class="form-control form-control-sm qty-input" value="${item.qty}" onchange="POSModule.updateCartQty(${idx}, this.value)">
                        <button class="btn-qty" onclick="POSModule.updateCartQty(${idx}, ${item.qty + 1})">+</button>
                    </div>
                    <div class="font-xs text-center text-muted">${item.unitType}</div>
                </td>
                <td style="width: 110px;">
                    <input type="number" step="0.5" class="form-control form-control-sm text-end" value="${item.unitPrice}" onchange="POSModule.updateCartPrice(${idx}, this.value)">
                </td>
                <td class="text-end font-bold text-primary">
                    ${currency}${item.subtotal.toLocaleString()}
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-icon btn-outline-danger" onclick="POSModule.removeFromCart(${idx})" title="Ka saar">✕</button>
                </td>
            </tr>
        `).join("");

        this.renderCartSummary();
    },

    calculateTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + item.subtotal, 0);
        const grandTotal = Math.max(0, subtotal - this.discountAmount);
        
        // Auto calculate paid if not set or user clicked full paid
        const balanceDue = Math.max(0, grandTotal - this.amountPaid);
        return { subtotal, grandTotal, balanceDue };
    },

    renderCartSummary() {
        const { subtotal, grandTotal, balanceDue } = this.calculateTotals();
        const settings = StorageService.getSettings();
        const currency = settings.currency || "$";

        const subtotalEl = document.getElementById("posSubtotalDisplay");
        const grandTotalEl = document.getElementById("posGrandTotalDisplay");
        if (subtotalEl) subtotalEl.textContent = `${currency}${subtotal.toLocaleString()}`;
        if (grandTotalEl) grandTotalEl.textContent = `${currency}${grandTotal.toLocaleString()}`;

        this.updateBalanceDisplay();
    },

    updateBalanceDisplay() {
        const { grandTotal, balanceDue } = this.calculateTotals();
        const settings = StorageService.getSettings();
        const currency = settings.currency || "$";

        const balanceEl = document.getElementById("posBalanceDisplay");
        if (balanceEl) {
            if (balanceDue > 0) {
                balanceEl.innerHTML = `<span class="text-danger font-bold">Deyn: ${currency}${balanceDue.toLocaleString()}</span>`;
            } else if (this.amountPaid > grandTotal) {
                const change = this.amountPaid - grandTotal;
                balanceEl.innerHTML = `<span class="text-success font-bold">Hadh (Change): ${currency}${change.toLocaleString()}</span>`;
            } else {
                balanceEl.innerHTML = `<span class="text-success font-bold">Wada Bixiyey (${currency}0)</span>`;
            }
        }
    },

    setFullPayment() {
        const { grandTotal } = this.calculateTotals();
        this.amountPaid = grandTotal;
        const paidInput = document.getElementById("posAmountPaid");
        if (paidInput) paidInput.value = grandTotal;
        this.updateBalanceDisplay();
        App.showToast("Lacagta oo dhan ayaa la xisaabiyay!", "info");
    },

    completeWholesaleSale() {
        if (this.cart.length === 0) {
            App.showToast("Fadlan marka hore alaab ku dar gaadhiga!", "error");
            return;
        }

        const customerSelect = document.getElementById("posCustomerSelect");
        const customerId = customerSelect ? customerSelect.value : "";
        let customer = StorageService.getCustomers().find(c => c.id === customerId);

        if (!customer) {
            App.showToast("Fadlan dooro macmiilka iibsanaya jumlada!", "error");
            return;
        }

        const { subtotal, grandTotal, balanceDue } = this.calculateTotals();
        const notesInput = document.getElementById("posSaleNotes");
        const notes = notesInput ? notesInput.value.trim() : "";

        // Check stock availability again
        const currentProducts = StorageService.getProducts();
        for (const item of this.cart) {
            const p = currentProducts.find(prod => prod.id === item.productId);
            if (!p || p.stock < item.qty) {
                App.showToast(`Alaabta "${item.name}" stock-geedu kuma filna! Waxaa yaal ${p ? p.stock : 0}`, "error");
                return;
            }
        }

        // Generate Invoice ID & Sequential Number
        const sales = StorageService.getSales();
        const nextInvNum = "INV-" + (1000 + sales.length + 1);
        const invId = "INV-" + new Date().getFullYear() + "-" + String(sales.length + 1).padStart(3, "0");

        const paymentStatus = balanceDue === 0 ? "Wada Bixiyey (Cash)" : (this.amountPaid === 0 ? "Deyn Buuxda" : "Deyn (Qeyb)");

        const newSale = {
            id: invId,
            invoiceNumber: nextInvNum,
            customerId: customer.id,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerCity: customer.city,
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            items: this.cart.map(i => ({
                productId: i.productId,
                productName: i.name,
                brand: i.brand,
                model: i.model,
                unitType: i.unitType,
                qty: i.qty,
                unitPrice: i.unitPrice,
                costPrice: i.costPrice,
                subtotal: i.subtotal,
                warranty: i.warranty
            })),
            subtotal,
            discount: this.discountAmount,
            grandTotal,
            amountPaid: this.amountPaid,
            balanceDue,
            paymentMethod: this.paymentMethod,
            paymentStatus,
            notes,
            cashier: "Maamulaha Bakhaarka"
        };

        // 1. Decrement Stock
        for (const item of this.cart) {
            const p = currentProducts.find(prod => prod.id === item.productId);
            if (p) {
                p.stock -= item.qty;
            }
        }
        StorageService.saveProducts(currentProducts);

        // 2. Update Customer Debt & Purchases
        let customers = StorageService.getCustomers();
        const custIdx = customers.findIndex(c => c.id === customer.id);
        if (custIdx !== -1) {
            customers[custIdx].totalPurchases = (customers[custIdx].totalPurchases || 0) + grandTotal;
            if (balanceDue > 0) {
                customers[custIdx].currentDebt = (customers[custIdx].currentDebt || 0) + balanceDue;
            }
            StorageService.saveCustomers(customers);
        }

        // 3. Save Sale
        sales.unshift(newSale);
        StorageService.saveSales(sales);

        // Success Feedback
        App.showToast(`Iibka waa la dhammaystiray! Rasiidka: ${nextInvNum}`, "success");

        // Open Printable Invoice Modal
        this.openInvoiceModal(newSale);

        // Reset POS Form
        this.cart = [];
        this.discountAmount = 0;
        this.amountPaid = 0;
        if (document.getElementById("posDiscountInput")) document.getElementById("posDiscountInput").value = "";
        if (document.getElementById("posAmountPaid")) document.getElementById("posAmountPaid").value = "";
        if (document.getElementById("posSaleNotes")) document.getElementById("posSaleNotes").value = "";
        
        this.renderCart();
        this.renderProductGrid();
        InventoryModule.renderProducts();
        DashboardModule.renderStats();
    },

    openInvoiceModal(sale) {
        const modal = document.getElementById("invoiceModal");
        const container = document.getElementById("invoicePrintContent");
        if (!modal || !container) return;

        const settings = StorageService.getSettings();
        const currency = settings.currency || "$";

        container.innerHTML = `
            <div class="invoice-box" id="printableInvoiceArea">
                <!-- Header -->
                <div class="inv-header">
                    <div class="inv-brand">
                        <h2>${settings.storeName}</h2>
                        <p class="inv-subtitle">${settings.subTitle}</p>
                        <p class="inv-contact">📍 ${settings.address} | 📞 ${settings.phone} | ✉️ ${settings.email}</p>
                    </div>
                    <div class="inv-meta">
                        <div class="inv-badge">RASIIDKA JUMLADA</div>
                        <h3>${sale.invoiceNumber}</h3>
                        <div>Taariikhda: <strong>${sale.date}</strong></div>
                        <div>Xaaladda: <span class="badge ${sale.balanceDue > 0 ? 'badge-warning' : 'badge-success'}">${sale.paymentStatus}</span></div>
                    </div>
                </div>

                <hr class="inv-divider" />

                <!-- Customer Details -->
                <div class="inv-customer-grid">
                    <div class="inv-cust-block">
                        <span class="inv-label">LOO IIBIYEY (MACMIILKA JUMLADA):</span>
                        <h4>${sale.customerName}</h4>
                        <div>Magaalada/Goobta: ${sale.customerCity || '-'}</div>
                        <div>Telefoonka: ${sale.customerPhone || '-'}</div>
                    </div>
                    <div class="inv-cust-block text-end">
                        <span class="inv-label">HABKA BIXINTA:</span>
                        <h4>${sale.paymentMethod}</h4>
                        <div>Kaashiyaha: ${sale.cashier}</div>
                        ${sale.notes ? `<div class="text-muted font-xs">Xusuusin: ${sale.notes}</div>` : ''}
                    </div>
                </div>

                <!-- Products Table -->
                <table class="inv-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Magaca Alaabta & Nooca</th>
                            <th>Damaanad</th>
                            <th class="text-center">Tirada</th>
                            <th class="text-end">Qiimaha Xabbada</th>
                            <th class="text-end">Isugeyn</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sale.items.map((it, idx) => `
                            <tr>
                                <td>${idx + 1}</td>
                                <td>
                                    <strong>${it.productName}</strong>
                                    <div class="font-xs text-muted">${it.brand || ''} ${it.model || ''}</div>
                                </td>
                                <td><small>${it.warranty || '-'}</small></td>
                                <td class="text-center"><strong>${it.qty}</strong> <small>${it.unitType || 'pcs'}</small></td>
                                <td class="text-end">${currency}${it.unitPrice.toLocaleString()}</td>
                                <td class="text-end font-bold">${currency}${it.subtotal.toLocaleString()}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>

                <!-- Summary Breakdown -->
                <div class="inv-summary-row">
                    <div class="inv-terms">
                        <h5>Shuruudaha & Damaanadda:</h5>
                        <p>${settings.invoiceFooter}</p>
                    </div>
                    <div class="inv-totals-box">
                        <div class="inv-tot-line">
                            <span>Wadarta Guud:</span>
                            <span>${currency}${sale.subtotal.toLocaleString()}</span>
                        </div>
                        ${sale.discount > 0 ? `
                        <div class="inv-tot-line text-danger">
                            <span>Qiimo Dhimis (Discount):</span>
                            <span>-${currency}${sale.discount.toLocaleString()}</span>
                        </div>` : ''}
                        <div class="inv-tot-line grand">
                            <span>WADARTA LA RABO:</span>
                            <span>${currency}${sale.grandTotal.toLocaleString()}</span>
                        </div>
                        <div class="inv-tot-line text-success">
                            <span>Lacagta La Bixiyey:</span>
                            <span>${currency}${sale.amountPaid.toLocaleString()}</span>
                        </div>
                        <div class="inv-tot-line ${sale.balanceDue > 0 ? 'text-danger font-bold' : 'text-muted'}">
                            <span>Hadhka (Deynta):</span>
                            <span>${currency}${sale.balanceDue.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <!-- Signatures -->
                <div class="inv-signatures">
                    <div class="sig-block">
                        <div class="sig-line"></div>
                        <span>Saxiixa Macmiilka</span>
                    </div>
                    <div class="sig-block">
                        <div class="sig-stamp-box">Shaabadda Bakhaarka (Stamp)</div>
                    </div>
                    <div class="sig-block">
                        <div class="sig-line"></div>
                        <span>Saxiixa Maamulka / Kaashiyaha</span>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add("active");
    },

    printCurrentInvoice() {
        window.print();
    }
};
