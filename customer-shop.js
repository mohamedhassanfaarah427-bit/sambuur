/**
 * CUSTOMER-SHOP.JS - Bogga Macmiilka (Customer Portal)
 * Macmiilku wuxuu:
 *   - Arki karaa alaabta oo dhan sawiro wanaagsan
 *   - Dalab u soo gudbin karaa (Pending Order → Admin ayaa fuliya)
 *   - Rasiidka Pending-ka printa karaa
 *   - Waxba ka beddeli karaa nidaamka (read-only + order submit only)
 */

const CustomerShop = {
    cart: [],
    currentCategory: "",
    searchQuery: "",

    init() {
        this.renderCategoryBar();
        this.renderProducts();
        this.updateCartBadge();
    },

    // ─── Category Bar ────────────────────────────────────────────────────────
    renderCategoryBar() {
        const bar = document.getElementById("customerCatBar");
        if (!bar) return;

        const cats = StorageService.getCategories();
        // First button is "All" — keep it
        const firstBtn = bar.querySelector(".cust-cat-btn");
        bar.innerHTML = "";
        if (firstBtn) bar.appendChild(firstBtn);

        cats.forEach(c => {
            const btn = document.createElement("button");
            btn.className = "cust-cat-btn";
            btn.onclick = () => this.filterByCategory(c.id);
            btn.innerHTML = `<span>${c.icon}</span> ${c.name}`;
            bar.appendChild(btn);
        });
    },

    filterByCategory(catId, btnEl) {
        this.currentCategory = catId;
        // Update active button
        document.querySelectorAll(".cust-cat-btn").forEach(btn => btn.classList.remove("active"));
        if (btnEl) {
            btnEl.classList.add("active");
        } else {
            // Mark the "All" button if catId is empty
            const firstBtn = document.querySelector(".cust-cat-btn");
            if (firstBtn) firstBtn.classList.add("active");
        }
        this.renderProducts();
    },

    // ─── Products Grid ───────────────────────────────────────────────────────
    search(q) {
        this.searchQuery = q.toLowerCase().trim();
        this.renderProducts();
    },

    renderProducts() {
        const grid = document.getElementById("customerProductsGrid");
        if (!grid) return;

        const settings = StorageService.getSettings();
        const currency = settings.currency || "$";
        let products = StorageService.getProducts();

        // Filter by category
        if (this.currentCategory) {
            products = products.filter(p => p.category === this.currentCategory);
        }

        // Filter by search
        if (this.searchQuery) {
            products = products.filter(p => {
                const str = `${p.name} ${p.brand||""} ${p.model||""} ${p.spec||""}`.toLowerCase();
                return str.includes(this.searchQuery);
            });
        }

        if (products.length === 0) {
            grid.innerHTML = `
                <div class="cust-empty-state">
                    <div style="font-size:60px;">🔍</div>
                    <h3>Alaab lama helin</h3>
                    <p>Raadi magac kale ama dooro qaybta kale</p>
                </div>
            `;
            return;
        }

        const fallback = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&auto=format&fit=crop&q=80";

        grid.innerHTML = products.map(p => {
            const imgSrc = p.image || fallback;
            const inStock = p.stock > 0;
            const stockClass = !inStock ? "danger" : p.stock <= (p.minStockAlert || 5) ? "warning" : "success";
            const stockLabel = !inStock ? "❌ Ma Jiro" : `✅ ${p.stock} ${p.unitType||"pcs"}`;

            return `
                <div class="cust-prod-card ${!inStock ? 'oos' : ''}">
                    <div class="cust-prod-img-wrap">
                        <img src="${imgSrc}" alt="${p.name}" class="cust-prod-img"
                             onerror="this.onerror=null;this.src='${fallback}';" loading="lazy">
                        <span class="cust-brand-pill">${p.brand || "Electronics"}</span>
                        ${!inStock ? `<span class="cust-oos-badge">Dhammaatay</span>` : ""}
                    </div>
                    <div class="cust-prod-body">
                        <div class="cust-prod-name" title="${p.name}">${p.name}</div>
                        <div class="cust-prod-model">${p.model || ""}</div>
                        ${p.spec ? `<div class="cust-prod-spec">${p.spec.substring(0, 80)}${p.spec.length>80?"…":""}</div>` : ""}
                        <div class="cust-prod-warranty">🛡️ ${p.warranty || "—"}</div>
                    </div>
                    <div class="cust-prod-footer">
                        <div class="cust-prod-price">${currency}${p.wholesalePrice.toLocaleString()}</div>
                        <div class="cust-prod-stock text-${stockClass}">${stockLabel}</div>
                        ${inStock ? `
                        <button class="btn btn-sm btn-primary cust-add-btn" onclick="CustomerShop.addToCart('${p.id}')">
                            🛒 Ku dar Basket
                        </button>` : `
                        <button class="btn btn-sm btn-secondary" disabled style="width:100%;opacity:0.5;">
                            Dhammaatay
                        </button>`}
                    </div>
                </div>
            `;
        }).join("");
    },

    // ─── Cart ────────────────────────────────────────────────────────────────
    addToCart(productId) {
        const products = StorageService.getProducts();
        const p = products.find(x => x.id === productId);
        if (!p || p.stock <= 0) {
            App.showToast("Alaabtan hadda bakhaarka kuma jirto!", "warning");
            return;
        }

        const existing = this.cart.find(x => x.productId === productId);
        if (existing) {
            if (existing.qty + 1 > p.stock) {
                App.showToast(`Tirada bakhaarka ayaa go'an (${p.stock} ${p.unitType||"pcs"})`, "warning");
                return;
            }
            existing.qty++;
            existing.subtotal = existing.qty * existing.unitPrice;
        } else {
            this.cart.push({
                productId: p.id,
                name: p.name,
                brand: p.brand,
                model: p.model,
                unitType: p.unitType || "xabbo",
                unitPrice: p.wholesalePrice,
                qty: 1,
                subtotal: p.wholesalePrice,
                image: p.image,
                maxStock: p.stock
            });
        }

        this.updateCartBadge();
        App.showToast(`✅ "${p.name}" basket-ka ayaa lagu daray!`, "success");
    },

    removeFromCart(productId) {
        this.cart = this.cart.filter(x => x.productId !== productId);
        this.updateCartBadge();
        this.renderCartModal();
    },

    changeQty(productId, delta) {
        const item = this.cart.find(x => x.productId === productId);
        if (!item) return;
        const newQty = item.qty + delta;
        if (newQty <= 0) {
            this.removeFromCart(productId);
            return;
        }
        if (newQty > item.maxStock) {
            App.showToast(`Ugu badan ${item.maxStock} ${item.unitType}!`, "warning");
            return;
        }
        item.qty = newQty;
        item.subtotal = item.qty * item.unitPrice;
        this.renderCartModal();
        this.updateCartBadge();
    },

    updateCartBadge() {
        const total = this.cart.reduce((s, i) => s + i.qty, 0);
        const btn = document.getElementById("custCartFloatBtn");
        const badge = document.getElementById("custCartCount");
        if (btn) btn.style.display = total > 0 ? "flex" : "none";
        if (badge) badge.textContent = total;
    },

    openCart() {
        const modal = document.getElementById("customerCartModal");
        if (modal) {
            this.renderCartModal();
            modal.classList.add("active");
        }
    },

    closeCart() {
        const modal = document.getElementById("customerCartModal");
        if (modal) modal.classList.remove("active");
    },

    renderCartModal() {
        const settings = StorageService.getSettings();
        const currency = settings.currency || "$";
        const itemsDiv = document.getElementById("customerCartItems");
        const totalsDiv = document.getElementById("customerCartTotals");
        if (!itemsDiv) return;

        if (this.cart.length === 0) {
            itemsDiv.innerHTML = `
                <div class="cust-empty-state" style="padding: 30px 0;">
                    <div style="font-size:48px;">🛒</div>
                    <p>Basket-kaagu wuu madhan yahay. Ka dooro alaab!</p>
                </div>`;
            if (totalsDiv) totalsDiv.innerHTML = "";
            return;
        }

        const fallback = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=80&auto=format&fit=crop&q=70";

        itemsDiv.innerHTML = `
            <table class="table">
                <thead><tr>
                    <th>Alaabta</th>
                    <th class="text-center">Tirada</th>
                    <th class="text-end">Qiimaha</th>
                    <th class="text-end">Isugeyn</th>
                    <th></th>
                </tr></thead>
                <tbody>
                ${this.cart.map(item => `
                    <tr>
                        <td>
                            <div style="display:flex;align-items:center;gap:10px;">
                                <img src="${item.image||fallback}" style="width:42px;height:42px;border-radius:6px;object-fit:cover;"
                                     onerror="this.src='${fallback}'">
                                <div>
                                    <strong style="font-size:12px;">${item.name}</strong>
                                    <div style="font-size:11px;color:#64748b;">${item.brand||""} ${item.model||""}</div>
                                </div>
                            </div>
                        </td>
                        <td class="text-center">
                            <div class="qty-control" style="justify-content:center;">
                                <button class="btn-qty" onclick="CustomerShop.changeQty('${item.productId}', -1)">−</button>
                                <span style="min-width:28px;text-align:center;font-weight:700;">${item.qty}</span>
                                <button class="btn-qty" onclick="CustomerShop.changeQty('${item.productId}', 1)">+</button>
                            </div>
                        </td>
                        <td class="text-end">${currency}${item.unitPrice.toLocaleString()}</td>
                        <td class="text-end font-bold">${currency}${item.subtotal.toLocaleString()}</td>
                        <td><button class="btn btn-xs btn-outline-danger" onclick="CustomerShop.removeFromCart('${item.productId}')">🗑️</button></td>
                    </tr>
                `).join("")}
                </tbody>
            </table>
        `;

        const grandTotal = this.cart.reduce((s, i) => s + i.subtotal, 0);
        if (totalsDiv) {
            totalsDiv.innerHTML = `
                <div class="cust-cart-total-row">
                    <span>Wadarta Guud:</span>
                    <span class="cust-total-big">${currency}${grandTotal.toLocaleString()}</span>
                </div>
                <p style="font-size:11px;color:#64748b;margin-top:6px;">
                    ⚠️ Qiimaha waa kan jumlada. Admin-ku wuxuu xaqiijin doonaa dalbashada ka hor inta aan la fulin.
                </p>
            `;
        }
    },

    // ─── Submit Order ────────────────────────────────────────────────────────
    submitOrder() {
        if (this.cart.length === 0) {
            App.showToast("Basket-kaagu wuu madhan yahay! Alaab ku dar marka hore.", "warning");
            return;
        }

        const phone = document.getElementById("custOrderPhone")?.value.trim() || "";
        const city  = document.getElementById("custOrderCity")?.value.trim() || "";
        const notes = document.getElementById("custOrderNotes")?.value.trim() || "";

        const settings = StorageService.getSettings();
        const currency = settings.currency || "$";
        const sales = StorageService.getSales();
        const nextNum = `DALB-${new Date().getFullYear()}-${String(sales.length + 1).padStart(3, "0")}`;
        const grandTotal = this.cart.reduce((s, i) => s + i.subtotal, 0);

        const newOrder = {
            id: nextNum,
            invoiceNumber: nextNum,
            type: "customer_order",           // Nooca dalbashada (Pending)
            status: "pending",                 // Admin ayaa baddeli doona "fulfilled"
            customerId: "CUST-PORTAL",
            customerName: "Macmiil (Customer Portal)" + (phone ? ` — ${phone}` : ""),
            customerPhone: phone,
            customerCity: city,
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            items: this.cart.map(i => ({
                productId: i.productId,
                productName: i.name,
                brand: i.brand,
                model: i.model,
                unitType: i.unitType,
                qty: i.qty,
                unitPrice: i.unitPrice,
                costPrice: 0,
                subtotal: i.subtotal,
                warranty: ""
            })),
            subtotal: grandTotal,
            discount: 0,
            grandTotal,
            amountPaid: 0,
            balanceDue: grandTotal,
            paymentMethod: "Dalbaasho — Admin ayaa xaqiijiya",
            paymentStatus: "Dalbaasho Socota (Pending)",
            notes,
            cashier: "Customer Portal"
        };

        // Save the order to sales (pending)
        sales.unshift(newOrder);
        StorageService.saveSales(sales);

        // Show receipt / confirmation
        this.closeCart();
        this.showOrderConfirmation(newOrder, currency);

        // Reset cart
        this.cart = [];
        this.updateCartBadge();
        this.renderProducts();
    },

    showOrderConfirmation(order, currency) {
        const modal = document.getElementById("customerOrderConfirmModal");
        const body  = document.getElementById("customerOrderConfirmBody");
        if (!modal || !body) return;

        body.innerHTML = `
            <div style="padding: 20px 0;">
                <div style="font-size:64px;margin-bottom:12px;">🎉</div>
                <h3 style="color:#059669;margin-bottom:6px;">Dalbashada waa la Helay!</h3>
                <p style="color:#475569;margin-bottom:20px;">Nambarka dalbashada keydi: <strong>${order.invoiceNumber}</strong></p>

                <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px;text-align:left;margin-bottom:16px;">
                    <div style="font-weight:700;margin-bottom:8px;">📋 Kooban:</div>
                    ${order.items.map(i => `
                        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;">
                            <span>${i.productName} × ${i.qty}</span>
                            <strong>${currency}${i.subtotal.toLocaleString()}</strong>
                        </div>
                    `).join("")}
                    <hr style="margin:10px 0;border-color:#86efac;">
                    <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;">
                        <span>Wadarta:</span>
                        <span style="color:#059669;">${currency}${order.grandTotal.toLocaleString()}</span>
                    </div>
                </div>

                <p style="font-size:12px;color:#64748b;line-height:1.6;">
                    📞 Admin-ku wuxuu xaqiijin doonaa dalbashada oo kuu soo diri doonaa rasiidka.
                    <br>Haddii aad qabto su'aal, la xiriir: <strong>${StorageService.getSettings().phone}</strong>
                </p>

                <button class="btn btn-sm btn-outline-primary" onclick="CustomerShop.printOrder('${order.invoiceNumber}')" style="margin-top:10px;">
                    🖨️ Daabac Rasiidka (Pending)
                </button>
            </div>
        `;

        modal.classList.add("active");
    },

    closeConfirm() {
        const modal = document.getElementById("customerOrderConfirmModal");
        if (modal) modal.classList.remove("active");
    },

    printOrder(invoiceNumber) {
        const sales = StorageService.getSales();
        const order = sales.find(s => s.invoiceNumber === invoiceNumber);
        if (!order) return;
        // Open POS invoice print for this order
        POSModule.openInvoiceModal(order);
    }
};
