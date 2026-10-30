/**
 * STORAGE.JS - Maamulka Kaydka LocalStorage & Backup/Restore
 * Handles all persistent storage operations, imports, exports, and data resets.
 */

const STORAGE_KEYS = {
    PRODUCTS: "elec_ws_products",
    CUSTOMERS: "elec_ws_customers",
    SUPPLIERS: "elec_ws_suppliers",
    SALES: "elec_ws_sales",
    SETTINGS: "elec_ws_settings",
    CATEGORIES: "elec_ws_categories",
    USERS: "elec_ws_users",
    CURRENT_USER: "elec_ws_current_user",
    EXPENSES: "elec_ws_expenses"
};

const StorageService = {
    /**
     * Initialize LocalStorage if empty
     */
    init() {
        if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
            this.resetToDefault();
        } else {
            // Sync realistic product images if missing
            try {
                const prods = this.getProducts();
                let needsUpdate = false;
                DEFAULT_DATA.products.forEach(dp => {
                    const found = prods.find(p => p.id === dp.id);
                    if (found && (!found.image || found.image !== dp.image)) {
                        found.image = dp.image;
                        needsUpdate = true;
                    }
                });
                if (needsUpdate) {
                    this.saveProducts(prods);
                }
            } catch(e) {}
        }

        // Clear old demo sales so sales history starts at 0 (eber) until user orders
        try {
            const currentSales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES) || "[]");
            const hasOldDemoSales = currentSales.some(s => s.id === "INV-2026-001" || s.id === "INV-2026-002");
            if (hasOldDemoSales) {
                localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
            }
        } catch(e) {}

        // Clear any old persistent session so system starts at the Login Screen
        try {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        } catch(e) {}

        // Ensure users exist even if products already initialized
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_DATA.users));
        } else {
            // Ensure all default users (admin, cashier, customer portal) are present with exact credentials
            try {
                let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
                let changed = false;
                DEFAULT_DATA.users.forEach(du => {
                    const idx = users.findIndex(u => u.username.toLowerCase() === du.username.toLowerCase());
                    if (idx === -1) {
                        users.push(du);
                        changed = true;
                    } else {
                        if (users[idx].password !== du.password || users[idx].role !== du.role) {
                            users[idx].password = du.password;
                            users[idx].role = du.role;
                            changed = true;
                        }
                    }
                });
                if (changed) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            } catch(e) {}
        }

        // Add any NEW products from DEFAULT_DATA not yet in storage (e.g. PROD-405, PROD-406)
        try {
            const prods = this.getProducts();
            const ids = prods.map(p => p.id);
            const newProds = DEFAULT_DATA.products.filter(dp => !ids.includes(dp.id));
            if (newProds.length > 0) {
                this.saveProducts([...prods, ...newProds]);
            }
        } catch(e) {}
    },

    resetToDefault() {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_DATA.products));
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(DEFAULT_DATA.customers));
        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(DEFAULT_DATA.suppliers));
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(DEFAULT_DATA.sales));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_DATA.settings));
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_DATA.categories));
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_DATA.users));
    },

    // PRODUCTS
    getProducts() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || [];
        } catch (e) {
            console.error("Error reading products:", e);
            return [];
        }
    },

    saveProducts(products) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    },

    // CUSTOMERS
    getCustomers() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) || [];
        } catch (e) {
            console.error("Error reading customers:", e);
            return [];
        }
    },

    saveCustomers(customers) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    },

    // SUPPLIERS
    getSuppliers() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) || [];
        } catch (e) {
            console.error("Error reading suppliers:", e);
            return [];
        }
    },

    saveSuppliers(suppliers) {
        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
    },

    // SALES & INVOICES
    getSales() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES)) || [];
        } catch (e) {
            console.error("Error reading sales:", e);
            return [];
        }
    },

    saveSales(sales) {
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    },

    // SETTINGS
    getSettings() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || DEFAULT_DATA.settings;
        } catch (e) {
            console.error("Error reading settings:", e);
            return DEFAULT_DATA.settings;
        }
    },

    saveSettings(settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },

    // CATEGORIES
    getCategories() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES)) || DEFAULT_DATA.categories;
        } catch (e) {
            console.error("Error reading categories:", e);
            return DEFAULT_DATA.categories;
        }
    },

    // USERS & SESSIONS
    getUsers() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || DEFAULT_DATA.users;
        } catch (e) {
            console.error("Error reading users:", e);
            return DEFAULT_DATA.users;
        }
    },

    saveUsers(users) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    },

    getCurrentUser() {
        try {
            return JSON.parse(sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null;
        } catch (e) {
            return null;
        }
    },

    setCurrentUser(user, remember = false) {
        const userStr = JSON.stringify(user);
        sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, userStr);
    },

    clearCurrentUser() {
        sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    },

    // EXPENSES (QUICKBOOKS ACCOUNTING)
    getExpenses() {
        try {
            const exp = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES));
            if (exp && Array.isArray(exp)) return exp;
            const defExp = (typeof DEFAULT_DATA !== 'undefined' && DEFAULT_DATA.expenses) ? DEFAULT_DATA.expenses : [];
            localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(defExp));
            return defExp;
        } catch (e) {
            console.error("Error reading expenses:", e);
            return [];
        }
    },

    saveExpenses(expenses) {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    },

    getExpenseCategories() {
        if (typeof DEFAULT_DATA !== 'undefined' && DEFAULT_DATA.expenseCategories) {
            return DEFAULT_DATA.expenseCategories;
        }
        return [
            { id: "rent", name: "Kirada Bakhaarka (Warehouse Rent)", icon: "🏬" },
            { id: "salaries", name: "Mushaaraadka Shaqaalaha (Salaries & Wages)", icon: "👥" },
            { id: "utilities", name: "Korontada, Biyaha & Shidaalka (Utilities & Fuel)", icon: "⚡" },
            { id: "transport", name: "Gaadiidka & Rarka (Logistics & Freight)", icon: "🚚" },
            { id: "maintenance", name: "Dayactirka & Qalabka Xafiiska (Office & Maintenance)", icon: "🛠️" },
            { id: "marketing", name: "Suuqgeynta & Xayeysiiska (Marketing & Ads)", icon: "📢" },
            { id: "other", name: "Kharashyo Kale (Miscellaneous & Taxes)", icon: "📑" }
        ];
    },

    // BACKUP & EXPORT
    exportFullDatabase() {
        const fullBackup = {
            exportDate: new Date().toISOString(),
            version: "1.0.0",
            appName: "Electronics Wholesale ERP",
            data: {
                products: this.getProducts(),
                customers: this.getCustomers(),
                suppliers: this.getSuppliers(),
                sales: this.getSales(),
                settings: this.getSettings(),
                categories: this.getCategories(),
                users: this.getUsers(),
                expenses: this.getExpenses()
            }
        };

        const jsonStr = JSON.stringify(fullBackup, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const dateStr = new Date().toISOString().split("T")[0];
        a.href = url;
        a.download = `Electronics_Wholesale_Backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // IMPORT & RESTORE
    importFullDatabase(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (!parsed.data || !parsed.data.products) {
                throw new Error("Faylka la soo galiyey maaha kayd sax ah oo nidaamkan leeyahay.");
            }

            if (parsed.data.products) this.saveProducts(parsed.data.products);
            if (parsed.data.customers) this.saveCustomers(parsed.data.customers);
            if (parsed.data.suppliers) this.saveSuppliers(parsed.data.suppliers);
            if (parsed.data.sales) this.saveSales(parsed.data.sales);
            if (parsed.data.settings) this.saveSettings(parsed.data.settings);
            if (parsed.data.categories) localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(parsed.data.categories));
            if (parsed.data.users) this.saveUsers(parsed.data.users);
            if (parsed.data.expenses) this.saveExpenses(parsed.data.expenses);

            return { success: true, message: "Xogtii si guul leh ayaa dib loogu soo celiyey!" };
        } catch (err) {
            return { success: false, message: "Khalad: " + err.message };
        }
    },

    // EXPORT TO CSV
    exportProductsCSV() {
        const products = this.getProducts();
        if (!products.length) return;

        const headers = ["ID", "Magaca Alaabta", "Qeybta", "Shirkadda", "Model", "Barcode", "Nooca", "Qiimaha Soo Iibsiga ($)", "Qiimaha Jumlada ($)", "Qiimaha Tafaariiqda ($)", "Tirada Jirta", "Damaanad", "Faahfaahin"];
        
        const rows = products.map(p => [
            `"${p.id}"`,
            `"${p.name.replace(/"/g, '""')}"`,
            `"${p.category}"`,
            `"${p.brand || ''}"`,
            `"${p.model || ''}"`,
            `"${p.barcode || ''}"`,
            `"${p.unitType || 'Xabbo'}"`,
            p.costPrice,
            p.wholesalePrice,
            p.retailPrice,
            p.stock,
            `"${p.warranty || ''}"`,
            `"${(p.spec || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Alaabta_Bakhaarka_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// Initialize immediately
StorageService.init();
