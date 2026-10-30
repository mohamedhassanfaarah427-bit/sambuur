/**
 * APP.JS - Qalfoofka Guud ee Nidaamka (Main App Controller & Navigation)
 * Coordinates tabs, modals, notifications, settings, and life-cycle events.
 */

const App = {
    currentTab: "dashboard",

    init() {
        console.log("⚡ Nidaamka Maamulka Jumlada Elektarooniga ayaa shaqo bilaabay...");
        
        // 1. Initialize Authentication & Sub-modules
        AuthService.init();
        InventoryModule.init();
        POSModule.init();
        CustomerModule.init();
        SupplierModule.init();
        ReportsModule.init();
        DashboardModule.renderStats();
        // QuickBooks Accounting Module
        if (typeof QuickBooksModule !== "undefined") QuickBooksModule.init();
        // Customer Shop Portal (for customer role)
        if (typeof CustomerShop !== "undefined") CustomerShop.init();

        // 2. Setup Navigation
        this.setupNavigation();

        // 3. Setup Modals
        this.setupModals();

        // 4. Setup Settings view
        this.loadSettingsForm();

        // 5. Setup Live Clock
        this.startLiveClock();

        // 6. Setup Keyboard Shortcuts
        this.setupKeyboardShortcuts();

        // 7. Responsive Mobile Menu
        this.setupMobileMenu();
    },

    setupNavigation() {
        const navLinks = document.querySelectorAll(".nav-link");
        navLinks.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const targetTab = link.getAttribute("data-tab");
                if (targetTab) {
                    this.switchTab(targetTab);
                }
            });
        });
    },

    switchTab(tabId) {
        // Protect Settings & QuickBooks tabs for Admin only
        if ((tabId === "settings" || tabId === "quickbooks") && typeof AuthService !== 'undefined' && !AuthService.isAdmin()) {
            this.showToast("❌ Qeybtaan waxaa geli kara kaliya Maamulaha Guud (Admin)!", "error");
            return;
        }

        this.currentTab = tabId;

        // Update active nav link
        document.querySelectorAll(".nav-link").forEach(link => {
            if (link.getAttribute("data-tab") === tabId) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });

        // Hide all views, show targeted view
        document.querySelectorAll(".view-section").forEach(sec => {
            sec.classList.remove("active");
        });

        const activeSec = document.getElementById(`view-${tabId}`);
        if (activeSec) {
            activeSec.classList.add("active");
        }

        // Close mobile drawer if open
        const sidebar = document.getElementById("mainSidebar");
        if (sidebar && sidebar.classList.contains("mobile-open")) {
            sidebar.classList.remove("mobile-open");
        }

        // Sub-module specific refresh
        if (tabId === "dashboard") {
            DashboardModule.renderStats();
        } else if (tabId === "inventory") {
            InventoryModule.renderCategoryPills();
            InventoryModule.renderProducts();
        } else if (tabId === "pos") {
            POSModule.renderProductGrid();
            POSModule.renderCustomerSelect();
            POSModule.renderCart();
        } else if (tabId === "customers") {
            CustomerModule.renderCustomers();
        } else if (tabId === "suppliers") {
            SupplierModule.renderSuppliers();
        } else if (tabId === "reports") {
            ReportsModule.renderSalesHistory();
            ReportsModule.drawCategoryChart();
        } else if (tabId === "settings") {
            this.loadSettingsForm();
        } else if (tabId === "customer-shop") {
            if (typeof CustomerShop !== "undefined") {
                CustomerShop.renderCategoryBar();
                CustomerShop.renderProducts();
            }
        } else if (tabId === "quickbooks") {
            if (typeof QuickBooksModule !== "undefined") {
                QuickBooksModule.render();
            }
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    },

    setupModals() {
        // Modal close buttons
        document.querySelectorAll(".modal-close-btn, .btn-modal-cancel").forEach(btn => {
            btn.addEventListener("click", () => {
                const modal = btn.closest(".modal-backdrop");
                if (modal) modal.classList.remove("active");
            });
        });

        // Click outside modal dialog to close
        document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
            backdrop.addEventListener("click", (e) => {
                if (e.target === backdrop) {
                    backdrop.classList.remove("active");
                }
            });
        });
    },

    setupKeyboardShortcuts() {
        window.addEventListener("keydown", (e) => {
            // Close any open modal on ESC
            if (e.key === "Escape") {
                document.querySelectorAll(".modal-backdrop.active").forEach(m => m.classList.remove("active"));
            }

            // Quick function keys
            if (e.key === "F2") {
                e.preventDefault();
                this.switchTab("pos");
                const search = document.getElementById("posProductSearch");
                if (search) search.focus();
            } else if (e.key === "F3") {
                e.preventDefault();
                this.switchTab("inventory");
            } else if (e.key === "F1") {
                e.preventDefault();
                this.switchTab("dashboard");
            }
        });
    },

    setupMobileMenu() {
        const toggleBtn = document.getElementById("mobileMenuToggle");
        const sidebar = document.getElementById("mainSidebar");
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener("click", () => {
                sidebar.classList.toggle("mobile-open");
            });
        }
    },

    startLiveClock() {
        const clockEl = document.getElementById("liveClock");
        if (!clockEl) return;

        const updateTime = () => {
            const now = new Date();
            const dateStr = now.toLocaleDateString('so-SO', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            clockEl.textContent = `${dateStr} • ${timeStr}`;
        };

        updateTime();
        setInterval(updateTime, 1000);
    },

    // TOAST NOTIFICATIONS
    showToast(message, type = "info") {
        const container = document.getElementById("toastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        
        let icon = "ℹ️";
        if (type === "success") icon = "✅";
        if (type === "error") icon = "❌";
        if (type === "warning") icon = "⚠️";

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-text">${message}</span>
            <button class="toast-close">&times;</button>
        `;

        toast.querySelector(".toast-close").addEventListener("click", () => {
            toast.remove();
        });

        container.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add("visible"), 10);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove("visible");
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    // SETTINGS MANAGEMENT
    loadSettingsForm() {
        const settings = StorageService.getSettings();
        if (!settings) return;

        if (document.getElementById("setStoreName")) document.getElementById("setStoreName").value = settings.storeName || "";
        if (document.getElementById("setSubTitle")) document.getElementById("setSubTitle").value = settings.subTitle || "";
        if (document.getElementById("setPhone")) document.getElementById("setPhone").value = settings.phone || "";
        if (document.getElementById("setEmail")) document.getElementById("setEmail").value = settings.email || "";
        if (document.getElementById("setAddress")) document.getElementById("setAddress").value = settings.address || "";
        if (document.getElementById("setCurrency")) document.getElementById("setCurrency").value = settings.currency || "$";
        if (document.getElementById("setInvoiceFooter")) document.getElementById("setInvoiceFooter").value = settings.invoiceFooter || "";

        // Also update brand in header
        const headerBrand = document.getElementById("headerBrandName");
        if (headerBrand) headerBrand.textContent = settings.storeName || "HORN ELECTRONICS";
    },

    saveSettingsFromForm(e) {
        if (e) e.preventDefault();
        if (typeof AuthService !== 'undefined' && !AuthService.checkPermission('save_settings')) return;

        const updated = {
            storeName: document.getElementById("setStoreName").value.trim() || "ELECTRONICS WHOLESALE",
            subTitle: document.getElementById("setSubTitle").value.trim(),
            phone: document.getElementById("setPhone").value.trim(),
            email: document.getElementById("setEmail").value.trim(),
            address: document.getElementById("setAddress").value.trim(),
            currency: document.getElementById("setCurrency").value.trim() || "$",
            invoiceFooter: document.getElementById("setInvoiceFooter").value.trim()
        };

        StorageService.saveSettings(updated);
        this.loadSettingsForm();
        DashboardModule.renderStats();
        this.showToast("Habaynta nidaamka si guul leh ayaa loo keydiyay!", "success");
    },

    resetToDemoData() {
        if (typeof AuthService !== 'undefined' && !AuthService.checkPermission('reset_data')) return;

        if (confirm("Ma hubtaa inaad dib ugu noqoto xogtii tusaalaha ahayd (Demo Data)? Xog kasta oo cusub waa la beddelayaa.")) {
            StorageService.resetToDefault();
            this.showToast("Xogtii tusaalaha ahayd ayaa dib loogu soo celiyay!", "success");
            setTimeout(() => window.location.reload(), 600);
        }
    },

    wipeAllData() {
        if (typeof AuthService !== 'undefined' && !AuthService.checkPermission('wipe_data')) return;

        if (confirm("DIGNIIN! Ma hubtaa inaad tirtirto dhammaan xogta bakhaarka, iibka iyo macaamiisha?")) {
            if (confirm("Fadlan xaqiiji mar labaad: Xogtan dib looma soo celin karo haddii aadan backup heysan!")) {
                localStorage.clear();
                StorageService.init();
                this.showToast("Dhammaan xogtii waa la masaxay!", "warning");
                setTimeout(() => window.location.reload(), 600);
            }
        }
    },

    handleImportFile(input) {
        if (typeof AuthService !== 'undefined' && !AuthService.checkPermission('import_data')) return;

        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const res = StorageService.importFullDatabase(content);
            if (res.success) {
                this.showToast(res.message, "success");
                setTimeout(() => window.location.reload(), 800);
            } else {
                this.showToast(res.message, "error");
            }
        };
        reader.readAsText(file);
        input.value = "";
    }
};

// Start when document loaded
document.addEventListener("DOMContentLoaded", () => {
    App.init();
});
