/**
 * INVENTORY.JS - Maamulka Alaabta Bakhaarka (Products & Stock Management)
 * Handles CRUD for products, stock adjustments, filtering, and table rendering.
 */

const InventoryModule = {
    currentCategory: "all",
    searchQuery: "",
    stockFilter: "all",
    sortBy: "newest",

    init() {
        this.renderCategoryPills();
        this.renderProducts();
        this.bindEvents();
    },

    bindEvents() {
        const searchInput = document.getElementById("invSearchInput");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderProducts();
            });
        }

        const stockFilterSelect = document.getElementById("invStockFilter");
        if (stockFilterSelect) {
            stockFilterSelect.addEventListener("change", (e) => {
                this.stockFilter = e.target.value;
                this.renderProducts();
            });
        }

        const sortSelect = document.getElementById("invSortBy");
        if (sortSelect) {
            sortSelect.addEventListener("change", (e) => {
                this.sortBy = e.target.value;
                this.renderProducts();
            });
        }
    },

    renderCategoryPills() {
        const container = document.getElementById("categoryFilterPills");
        if (!container) return;

        const categories = StorageService.getCategories();
        let html = `
            <button class="cat-pill ${this.currentCategory === 'all' ? 'active' : ''}" data-cat="all">
                🌐 Dhammaan (${StorageService.getProducts().length})
            </button>
        `;

        const products = StorageService.getProducts();

        categories.forEach(cat => {
            const count = products.filter(p => p.category === cat.id).length;
            const isActive = this.currentCategory === cat.id ? 'active' : '';
            html += `
                <button class="cat-pill ${isActive}" data-cat="${cat.id}">
                    ${cat.icon} ${cat.name} (${count})
                </button>
            `;
        });

        container.innerHTML = html;

        container.querySelectorAll(".cat-pill").forEach(btn => {
            btn.addEventListener("click", () => {
                this.currentCategory = btn.getAttribute("data-cat");
                this.renderCategoryPills();
                this.renderProducts();
            });
        });
    },

    getFilteredProducts() {
        let products = StorageService.getProducts();

        // Filter Category
        if (this.currentCategory !== "all") {
            products = products.filter(p => p.category === this.currentCategory);
        }

        // Search Query (Name, Brand, Model, Barcode, Spec)
        if (this.searchQuery) {
            products = products.filter(p => {
                const searchStr = `${p.name} ${p.brand || ''} ${p.model || ''} ${p.barcode || ''} ${p.spec || ''}`.toLowerCase();
                return searchStr.includes(this.searchQuery);
            });
        }

        // Stock Status Filter
        if (this.stockFilter === "low") {
            products = products.filter(p => p.stock > 0 && p.stock <= (p.minStockAlert || 5));
        } else if (this.stockFilter === "out") {
            products = products.filter(p => p.stock <= 0);
        } else if (this.stockFilter === "in_stock") {
            products = products.filter(p => p.stock > (p.minStockAlert || 5));
        }

        // Sorting
        products.sort((a, b) => {
            if (this.sortBy === "name_asc") return a.name.localeCompare(b.name);
            if (this.sortBy === "name_desc") return b.name.localeCompare(a.name);
            if (this.sortBy === "price_asc") return a.wholesalePrice - b.wholesalePrice;
            if (this.sortBy === "price_desc") return b.wholesalePrice - a.wholesalePrice;
            if (this.sortBy === "stock_asc") return a.stock - b.stock;
            if (this.sortBy === "stock_desc") return b.stock - a.stock;
            // Default newest
            return (b.createdAt || "").localeCompare(a.createdAt || "");
        });

        return products;
    },

    renderProducts() {
        const tbody = document.getElementById("productsTableBody");
        const countBadge = document.getElementById("productsCountBadge");
        if (!tbody) return;

        const products = this.getFilteredProducts();

        if (countBadge) {
            countBadge.textContent = `${products.length} alaab ah`;
        }

        if (products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center py-5">
                        <div class="empty-state">
                            <span class="empty-icon">📦</span>
                            <h4>Wax alaab ah lama helin</h4>
                            <p class="text-muted">Isku day inaad bedesho shaandhada (filter) ama baadi-goobka, ama ku dar alaab cusub.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const settings = StorageService.getSettings();
        const currency = settings.currency || "$";
        const isAdmin = typeof AuthService !== 'undefined' ? AuthService.isAdmin() : true;

        tbody.innerHTML = products.map((p, index) => {
            // Determine stock badge
            let stockBadge = "";
            const minAlert = p.minStockAlert || 5;
            if (p.stock <= 0) {
                stockBadge = `<span class="badge badge-danger">Go'an (0)</span>`;
            } else if (p.stock <= minAlert) {
                stockBadge = `<span class="badge badge-warning">Digniin (${p.stock} yaal)</span>`;
            } else {
                stockBadge = `<span class="badge badge-success">Buuxa (${p.stock} yaal)</span>`;
            }

            // Category Icon
            const catObj = StorageService.getCategories().find(c => c.id === p.category);
            const catName = catObj ? `${catObj.icon} ${catObj.name}` : p.category;

            // Margin %
            const profit = p.wholesalePrice - p.costPrice;
            const marginPct = p.costPrice > 0 ? Math.round((profit / p.costPrice) * 100) : 0;

            const fallbackImg = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100&auto=format&fit=crop&q=80";
            const imgSrc = p.image || fallbackImg;

            return `
                <tr>
                    <td class="text-muted font-mono">${p.id}</td>
                    <td>
                        <div class="product-cell-flex">
                            <img src="${imgSrc}" alt="${p.name}" class="table-prod-img" onerror="this.onerror=null; this.src='${fallbackImg}';" loading="lazy">
                            <div class="product-cell-name">
                                <strong class="prod-title">${p.name}</strong>
                                <div class="prod-sub">${p.brand ? `<b>${p.brand}</b> • ` : ''}${p.model || ''}</div>
                                ${p.barcode ? `<div class="prod-barcode font-mono"><small>Barcode: ${p.barcode}</small></div>` : ''}
                            </div>
                        </div>
                    </td>
                    <td><span class="badge-cat">${catName}</span></td>
                    <td class="text-end font-semibold text-secondary">
                        ${isAdmin ? `${currency}${p.costPrice.toLocaleString()}` : `<span class="text-muted font-xs">🔒 Qarsoon</span>`}
                    </td>
                    <td class="text-end font-bold text-primary">
                        ${currency}${p.wholesalePrice.toLocaleString()}
                        ${isAdmin ? `<div class="font-xs text-success">+${marginPct}% Faa'iido</div>` : ''}
                    </td>
                    <td class="text-end font-semibold text-muted">${currency}${p.retailPrice.toLocaleString()}</td>
                    <td class="text-center">
                        <span class="badge-unit">${p.unitType || 'Xabbo'}</span>
                        ${p.itemsPerCarton > 1 ? `<div class="font-xs text-muted">(${p.itemsPerCarton} pcs/ctn)</div>` : ''}
                    </td>
                    <td class="text-center">
                        ${stockBadge}
                    </td>
                    <td><small class="text-muted">${p.warranty || 'Damaanad la\'aan'}</small></td>
                    <td class="text-end action-col">
                        <div class="btn-group">
                            ${isAdmin ? `
                                <button class="btn btn-sm btn-icon btn-outline-info" title="Hagaaji Stock-ga (Stock In / Out)" onclick="InventoryModule.openStockAdjustModal('${p.id}')">
                                    🔄
                                </button>
                                <button class="btn btn-sm btn-icon btn-outline-primary" title="Wax ka bedel" onclick="InventoryModule.openEditModal('${p.id}')">
                                    ✏️
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-icon btn-outline-success" title="Ku dar Iibka POS" onclick="POSModule.addToCart('${p.id}'); App.switchTab('pos');">
                                🛒
                            </button>
                            ${isAdmin ? `
                                <button class="btn btn-sm btn-icon btn-outline-danger" title="Tir" onclick="InventoryModule.deleteProduct('${p.id}')">
                                    🗑️
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    },

    openAddModal() {
        if (typeof AuthService !== 'undefined' && !AuthService.checkPermission('add_product')) return;

        const modal = document.getElementById("productModal");
        const form = document.getElementById("productForm");
        const title = document.getElementById("productModalTitle");
        if (!modal || !form) return;

        form.reset();
        document.getElementById("prodIdInput").value = "";
        if (document.getElementById("prodImageInput")) document.getElementById("prodImageInput").value = "";
        
        // Populate category dropdown
        this.populateCategorySelect("prodCategoryInput");

        if (title) title.textContent = "Ku dar Alaab Cusub Bakhaarka";
        modal.classList.add("active");
    },

    openEditModal(id) {
        if (typeof AuthService !== 'undefined' && !AuthService.checkPermission('edit_product')) return;

        const product = StorageService.getProducts().find(p => p.id === id);
        if (!product) return;

        const modal = document.getElementById("productModal");
        const form = document.getElementById("productForm");
        const title = document.getElementById("productModalTitle");
        if (!modal || !form) return;

        this.populateCategorySelect("prodCategoryInput");

        document.getElementById("prodIdInput").value = product.id;
        document.getElementById("prodNameInput").value = product.name;
        document.getElementById("prodCategoryInput").value = product.category;
        document.getElementById("prodBrandInput").value = product.brand || "";
        document.getElementById("prodModelInput").value = product.model || "";
        document.getElementById("prodBarcodeInput").value = product.barcode || "";
        if (document.getElementById("prodImageInput")) document.getElementById("prodImageInput").value = product.image || "";
        document.getElementById("prodUnitTypeInput").value = product.unitType || "Xabbo";
        document.getElementById("prodItemsPerCartonInput").value = product.itemsPerCarton || 1;
        document.getElementById("prodCostPriceInput").value = product.costPrice;
        document.getElementById("prodWholesalePriceInput").value = product.wholesalePrice;
        document.getElementById("prodRetailPriceInput").value = product.retailPrice;
        document.getElementById("prodStockInput").value = product.stock;
        document.getElementById("prodMinStockInput").value = product.minStockAlert || 5;
        document.getElementById("prodWarrantyInput").value = product.warranty || "";
        document.getElementById("prodSpecInput").value = product.spec || "";

        if (title) title.textContent = `Wax ka bedel Alaabta (${product.name})`;
        modal.classList.add("active");
    },

    populateCategorySelect(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;
        const categories = StorageService.getCategories();
        select.innerHTML = categories.map(c => `
            <option value="${c.id}">${c.icon} ${c.name}</option>
        `).join("");
    },

    saveProductFromForm(e) {
        if (e) e.preventDefault();
        if (typeof AuthService !== 'undefined' && !AuthService.checkPermission('save_product')) return;

        const idField = document.getElementById("prodIdInput").value.trim();
        const name = document.getElementById("prodNameInput").value.trim();
        const category = document.getElementById("prodCategoryInput").value;
        const brand = document.getElementById("prodBrandInput").value.trim();
        const model = document.getElementById("prodModelInput").value.trim();
        const barcode = document.getElementById("prodBarcodeInput").value.trim();
        const image = document.getElementById("prodImageInput") ? document.getElementById("prodImageInput").value.trim() : "";
        const unitType = document.getElementById("prodUnitTypeInput").value;
        const itemsPerCarton = parseInt(document.getElementById("prodItemsPerCartonInput").value) || 1;
        const costPrice = parseFloat(document.getElementById("prodCostPriceInput").value) || 0;
        const wholesalePrice = parseFloat(document.getElementById("prodWholesalePriceInput").value) || 0;
        const retailPrice = parseFloat(document.getElementById("prodRetailPriceInput").value) || 0;
        const stock = parseInt(document.getElementById("prodStockInput").value) || 0;
        const minStockAlert = parseInt(document.getElementById("prodMinStockInput").value) || 5;
        const warranty = document.getElementById("prodWarrantyInput").value.trim();
        const spec = document.getElementById("prodSpecInput").value.trim();

        if (!name) {
            App.showToast("Fadlan qor magaca alaabta!", "error");
            return;
        }

        if (wholesalePrice <= 0) {
            App.showToast("Fadlan gali qiimaha jumlada oo sax ah!", "error");
            return;
        }

        let products = StorageService.getProducts();

        if (idField) {
            // Edit existing
            const index = products.findIndex(p => p.id === idField);
            if (index !== -1) {
                products[index] = {
                    ...products[index],
                    name,
                    category,
                    brand,
                    model,
                    barcode,
                    image: image || products[index].image || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80",
                    unitType,
                    itemsPerCarton,
                    costPrice,
                    wholesalePrice,
                    retailPrice,
                    stock,
                    minStockAlert,
                    warranty,
                    spec,
                    updatedAt: new Date().toISOString()
                };
                StorageService.saveProducts(products);
                App.showToast("Alaabta si guul leh ayaa wax looga beddelay!", "success");
            }
        } else {
            // Create New
            const newId = "PROD-" + (Math.floor(100 + Math.random() * 900));
            const newProduct = {
                id: newId,
                name,
                category,
                brand,
                model,
                barcode: barcode || Math.floor(100000000000 + Math.random() * 900000000000).toString(),
                image: image || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80",
                unitType,
                itemsPerCarton,
                costPrice,
                wholesalePrice,
                retailPrice,
                stock,
                minStockAlert,
                warranty,
                spec,
                createdAt: new Date().toISOString().split("T")[0]
            };
            products.unshift(newProduct);
            StorageService.saveProducts(products);
            App.showToast("Alaab cusub ayaa si guul leh loogu daray!", "success");
        }

        this.closeModal("productModal");
        this.renderCategoryPills();
        this.renderProducts();
        DashboardModule.renderStats();
    },

    deleteProduct(id) {
        if (typeof AuthService !== 'undefined' && !AuthService.checkPermission('delete_product')) return;

        const product = StorageService.getProducts().find(p => p.id === id);
        if (!product) return;

        if (confirm(`Ma hubtaa inaad tirtirto alaabta: "${product.name}"?`)) {
            let products = StorageService.getProducts();
            products = products.filter(p => p.id !== id);
            StorageService.saveProducts(products);
            App.showToast("Alaabta waa la tirtiray!", "info");
            this.renderCategoryPills();
            this.renderProducts();
            DashboardModule.renderStats();
        }
    },

    openStockAdjustModal(id) {
        if (typeof AuthService !== 'undefined' && !AuthService.checkPermission('adjust_stock')) return;

        const product = StorageService.getProducts().find(p => p.id === id);
        if (!product) return;

        const modal = document.getElementById("stockAdjustModal");
        if (!modal) return;

        document.getElementById("adjProdId").value = product.id;
        document.getElementById("adjProdName").textContent = product.name;
        document.getElementById("adjCurrentStock").textContent = `${product.stock} ${product.unitType || 'xabbo'}`;
        document.getElementById("adjQtyInput").value = "";
        document.getElementById("adjReasonInput").value = "Soo dejin cusub oo kunteenar ka timid";

        modal.classList.add("active");
    },

    saveStockAdjustment() {
        if (typeof AuthService !== 'undefined' && !AuthService.checkPermission('save_adjustment')) return;

        const id = document.getElementById("adjProdId").value;
        const type = document.getElementById("adjTypeSelect").value; // 'add' or 'subtract'
        const qty = parseInt(document.getElementById("adjQtyInput").value);
        const reason = document.getElementById("adjReasonInput").value.trim();

        if (isNaN(qty) || qty <= 0) {
            App.showToast("Fadlan gali tiro sax ah oo ka weyn 0!", "error");
            return;
        }

        let products = StorageService.getProducts();
        const product = products.find(p => p.id === id);
        if (!product) return;

        if (type === "subtract" && qty > product.stock) {
            App.showToast(`Stock-gu kuma filna! Waxaa yaal kaliya ${product.stock}`, "error");
            return;
        }

        const oldStock = product.stock;
        if (type === "add") {
            product.stock += qty;
        } else {
            product.stock -= qty;
        }

        StorageService.saveProducts(products);
        this.closeModal("stockAdjustModal");
        this.renderProducts();
        DashboardModule.renderStats();

        App.showToast(`Stock-ga ${product.name} waxaa laga dhigay ${product.stock} (${type === 'add' ? '+' : '-'}${qty})!`, "success");
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove("active");
    }
};
