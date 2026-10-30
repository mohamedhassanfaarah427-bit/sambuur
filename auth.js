/**
 * AUTH.JS - Nidaamka Gelitaanka & Xakameynta Awoodaha (Authentication & RBAC)
 * Maamula login-ka, hubinta admin-ka (password: 9090), cashier-ka (1234), iyo customer-ka (shop2026).
 */

const AuthService = {
    selectedRole: "admin",

    init() {
        // Hubi haddii user hore u galay fadhigan (active session)
        const user = this.getCurrentUser();
        if (user) {
            this.hideLoginScreen();
            this.applyRolePermissions();
        } else {
            this.showLoginScreen();
        }

        this.bindEvents();
    },

    bindEvents() {
        // Login form submit
        const loginForm = document.getElementById("loginForm");
        if (loginForm) {
            loginForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const username = document.getElementById("loginUsername").value.trim();
                const password = document.getElementById("loginPassword").value.trim();
                const remember = document.getElementById("loginRemember") ? document.getElementById("loginRemember").checked : false;
                this.login(username, password, remember);
            });
        }

        // Toggle password visibility
        const toggleBtn = document.getElementById("togglePasswordBtn");
        const passwordInput = document.getElementById("loginPassword");
        if (toggleBtn && passwordInput) {
            toggleBtn.addEventListener("click", () => {
                const isPassword = passwordInput.getAttribute("type") === "password";
                passwordInput.setAttribute("type", isPassword ? "text" : "password");
                toggleBtn.textContent = isPassword ? "🙈" : "👁️";
            });
        }
    },

    selectRoleTab(role) {
        this.selectedRole = role;
        document.querySelectorAll(".login-role-tab").forEach(tab => {
            tab.classList.toggle("active", tab.getAttribute("data-role") === role);
        });

        const hintEl = document.getElementById("loginRoleHint");
        const userGroup = document.getElementById("loginUsernameGroup");
        const passGroup = document.getElementById("loginPasswordGroup");
        const rememberRow = document.getElementById("loginRememberRow");
        const submitBtn = document.getElementById("loginSubmitBtn");
        const quickCust = document.getElementById("loginCustomerQuick");
        const usernameInput = document.getElementById("loginUsername");
        const passwordInput = document.getElementById("loginPassword");
        const errorMsg = document.getElementById("loginErrorMsg");

        if (errorMsg) errorMsg.style.display = "none";
        if (passwordInput) passwordInput.value = "";

        if (role === "admin") {
            if (usernameInput) usernameInput.value = "admin";
            if (hintEl) hintEl.innerHTML = `👑 <strong>Maamulaha Guud (Admin):</strong> Awood buuxda — wax ka beddelka alaabta, qiimaha, daymaha & warbixinada.`;
            if (userGroup) userGroup.style.display = "block";
            if (passGroup) passGroup.style.display = "block";
            if (rememberRow) rememberRow.style.display = "flex";
            if (submitBtn) { submitBtn.style.display = "block"; submitBtn.innerHTML = `🚀 Gal Nidaamka (Admin Log In)`; }
            if (quickCust) quickCust.style.display = "none";
            if (passwordInput) setTimeout(() => passwordInput.focus(), 80);
        } else if (role === "cashier") {
            if (usernameInput) usernameInput.value = "cashier";
            if (hintEl) hintEl.innerHTML = `👤 <strong>Kaashiyaha (Cashier):</strong> Iibka jumlada & soo saarista rasiidka (POS kaliya).`;
            if (userGroup) userGroup.style.display = "block";
            if (passGroup) passGroup.style.display = "block";
            if (rememberRow) rememberRow.style.display = "flex";
            if (submitBtn) { submitBtn.style.display = "block"; submitBtn.innerHTML = `🛒 Gal Nidaamka Iibka (Cashier Log In)`; }
            if (quickCust) quickCust.style.display = "none";
            if (passwordInput) setTimeout(() => passwordInput.focus(), 80);
        } else if (role === "customer") {
            if (usernameInput) usernameInput.value = "customer";
            if (hintEl) hintEl.innerHTML = `🛍️ <strong>Bogga Macmiilka:</strong> Eeg alaabta dhabta ah oo dhan (Mobiles, AC, Qasaalado...), oo toos u dalbo.`;
            if (userGroup) userGroup.style.display = "none";
            if (passGroup) passGroup.style.display = "none";
            if (rememberRow) rememberRow.style.display = "none";
            if (submitBtn) submitBtn.style.display = "none";
            if (quickCust) quickCust.style.display = "block";
        }
    },

    loginAsCustomerDirect() {
        this.login("customer", "shop2026", false);
    },

    login(username, password, remember = false) {
        if (!username || !password) {
            App.showToast("Fadlan gali username-ka iyo password-ka!", "warning");
            return false;
        }

        const users = StorageService.getUsers();
        const found = users.find(u => 
            u.username.toLowerCase() === username.toLowerCase() && 
            String(u.password) === String(password)
        );

        if (found) {
            StorageService.setCurrentUser(found, remember);
            this.hideLoginScreen();
            this.applyRolePermissions();

            const roleName = found.role === "admin" ? "Maamule (Awood Buuxda)" : found.role === "customer" ? "Macmiil (Customer)" : "Kaashiye (Iibka Kaliya)";
            App.showToast(`Ku soo dhowaw nidaamka, ${found.name}! (${roleName})`, "success");

            // Role-based landing view
            if (found.role === "admin") {
                App.switchTab("dashboard");
            } else if (found.role === "customer") {
                App.switchTab("customer-shop");
            } else {
                App.switchTab("pos");
            }

            // Refresh view components
            InventoryModule.renderProducts();
            DashboardModule.renderStats();
            CustomerModule.renderCustomers();
            SupplierModule.renderSuppliers();
            return true;
        } else {
            const errorMsg = document.getElementById("loginErrorMsg");
            if (errorMsg) {
                errorMsg.textContent = "Username-ka ama Password-ka waa khalad! Fadlan dib u hubi.";
                errorMsg.style.display = "block";
            }
            const card = document.querySelector(".login-card");
            if (card) {
                card.classList.add("shake-animation");
                setTimeout(() => card.classList.remove("shake-animation"), 500);
            }
            App.showToast("Username-ka ama Password-ka waa khalad!", "error");
            return false;
        }
    },

    logout() {
        if (confirm("Ma hubtaa inaad ka baxdo nidaamka (Log out)?")) {
            StorageService.clearCurrentUser();
            this.showLoginScreen();
            this.applyRolePermissions();
            App.showToast(`Waad ka baxday nidaamka. Nabadgelyo!`, "info");
        }
    },

    getCurrentUser() {
        return StorageService.getCurrentUser();
    },

    isLoggedIn() {
        return !!this.getCurrentUser();
    },

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === "admin";
    },

    /**
     * Hubi haddii qofku awood u leeyahay wax ka beddelka (Admin Only)
     */
    checkPermission(action = "modify") {
        if (!this.isLoggedIn()) {
            this.showLoginScreen();
            App.showToast("Fadlan marka hore gal nidaamka (Login)!", "warning");
            return false;
        }

        if (!this.isAdmin()) {
            App.showToast("❌ DIGNIIN: Awood uma lihid wax ka beddelka! Kaliya Admin-ka ayaa wax ka beddeli kara nidaamka.", "error");
            return false;
        }

        return true;
    },

    showLoginScreen() {
        const overlay = document.getElementById("loginOverlay");
        if (overlay) {
            overlay.classList.add("active");
            document.body.classList.add("auth-locked");
            const err = document.getElementById("loginErrorMsg");
            if (err) err.style.display = "none";
            const pwdInput = document.getElementById("loginPassword");
            if (pwdInput) pwdInput.value = "";
            this.selectRoleTab(this.selectedRole || "admin");
        }
    },

    hideLoginScreen() {
        const overlay = document.getElementById("loginOverlay");
        if (overlay) {
            overlay.classList.remove("active");
            document.body.classList.remove("auth-locked");
        }
    },

    /**
     * Xakamee muuqaalka guud ee nidaamka iyadoo la eegayo Role-ka user-ka (Admin vs Cashier vs Customer)
     */
    applyRolePermissions() {
        const user = this.getCurrentUser();
        const isAdmin = this.isAdmin();
        const isCustomer = user && user.role === "customer";
        const isCashier = user && user.role === "cashier";

        // Update body state classes
        document.body.classList.remove("role-admin", "role-cashier", "role-customer");
        if (isAdmin)    document.body.classList.add("role-admin");
        else if (isCustomer) document.body.classList.add("role-customer");
        else             document.body.classList.add("role-cashier");

        // Header user info
        const userBadge = document.getElementById("headerUserBadge");
        if (userBadge) {
            if (user) {
                const roleLabel = isAdmin ? "Awood Buuxda (Admin)" : isCustomer ? "Macmiil (Customer)" : "Iibka Kaliya (Cashier)";
                const roleIcon  = isAdmin ? "👑" : isCustomer ? "🛍️" : "👤";
                const roleClass = isAdmin ? "admin" : isCustomer ? "customer" : "cashier";
                userBadge.innerHTML = `
                    <div class="user-pill ${roleClass}">
                        <span class="user-pill-icon">${roleIcon}</span>
                        <div class="user-pill-text">
                            <strong>${user.name}</strong>
                            <small>${roleLabel}</small>
                        </div>
                        <button class="btn btn-xs btn-outline-danger btn-logout" onclick="AuthService.logout()" title="Ka bax nidaamka">
                            🚪 Ka bax
                        </button>
                    </div>
                `;
            } else {
                userBadge.innerHTML = `
                    <button class="btn btn-sm btn-primary" onclick="AuthService.showLoginScreen()">
                        🔑 Gal (Login)
                    </button>
                `;
            }
        }

        // Customer Portal: Hide all sidebar nav items except Customer Shop
        const allNavLinks = document.querySelectorAll(".sidebar-nav .nav-link");
        const customerShopNav = document.querySelector('.nav-link[data-tab="customer-shop"]');

        if (isCustomer) {
            // Customer can only see the Customer Shop page
            allNavLinks.forEach(link => {
                const tab = link.getAttribute("data-tab");
                link.style.display = (tab === "customer-shop") ? "flex" : "none";
            });
            // Also hide the top header quick-add-sale button
            const quickSaleBtn = document.querySelector('.header-right .btn-primary');
            if (quickSaleBtn) quickSaleBtn.style.display = "none";
            // Redirect to customer shop
            App.switchTab("customer-shop");
            return; // No further permission logic needed
        }

        // For Admin & Cashier: show all standard nav items, hide customer-shop nav
        allNavLinks.forEach(link => {
            const tab = link.getAttribute("data-tab");
            if (tab === "customer-shop") {
                link.style.display = "none";
            } else {
                link.style.display = "flex";
            }
        });

        // Sidebar: hide Settings and QuickBooks for cashier / non-admin
        const settingsNav = document.querySelector('.nav-link[data-tab="settings"]');
        const quickbooksNav = document.querySelector('.nav-link[data-tab="quickbooks"]');
        if (settingsNav) {
            settingsNav.style.display = isAdmin ? "flex" : "none";
        }
        if (quickbooksNav) {
            quickbooksNav.style.display = isAdmin ? "flex" : "none";
        }
        if (!isAdmin && (App.currentTab === "settings" || App.currentTab === "quickbooks")) {
            App.switchTab("pos");
        }

        // Show/hide quick sale button for cashier
        const quickSaleBtn = document.querySelector('.header-right .btn-primary');
        if (quickSaleBtn) quickSaleBtn.style.display = "";

        // Add Product button on Dashboard & Inventory
        document.querySelectorAll(".admin-only-action").forEach(el => {
            el.style.display = isAdmin ? "" : "none";
        });

        // Mask gross profit & stock capital for cashier
        const elTotalStockVal = document.getElementById("statStockCostValue");
        const elGrossProfit   = document.getElementById("statGrossProfit");
        if (elTotalStockVal && !isAdmin) elTotalStockVal.innerHTML = `<span class="text-muted font-xs">🔒 Admin Kaliya</span>`;
        if (elGrossProfit   && !isAdmin) elGrossProfit.innerHTML   = `<span class="text-muted font-xs">🔒 Admin Kaliya</span>`;

        // Render Users table in Settings tab if Admin
        if (isAdmin) this.renderUsersTable();
    },

    // USER MANAGEMENT (Inside Settings Tab - Admin Only)
    renderUsersTable() {
        const tbody = document.getElementById("settingsUsersTableBody");
        if (!tbody) return;

        const users = StorageService.getUsers();
        tbody.innerHTML = users.map(u => {
            const isMainAdmin = u.username === "admin";
            return `
                <tr>
                    <td><strong>${u.name}</strong></td>
                    <td class="font-mono">${u.username}</td>
                    <td>
                        <span class="badge ${u.role === 'admin' ? 'badge-success' : 'badge-warning'}">
                            ${u.role === 'admin' ? '👑 Admin (Full)' : '👤 Cashier (Iib)'}
                        </span>
                    </td>
                    <td><small class="text-muted">${u.createdAt || '-'}</small></td>
                    <td class="text-end">
                        ${isMainAdmin ? `
                            <button class="btn btn-xs btn-outline-primary" onclick="AuthService.openChangePasswordModal('${u.id}')">
                                🔑 Beddel Password
                            </button>
                        ` : `
                            <button class="btn btn-xs btn-outline-primary mr-1" onclick="AuthService.openChangePasswordModal('${u.id}')">
                                🔑 Password
                            </button>
                            <button class="btn btn-xs btn-outline-danger" onclick="AuthService.deleteUser('${u.id}')">
                                🗑️ Tir
                            </button>
                        `}
                    </td>
                </tr>
            `;
        }).join("");
    },

    openAddUserModal() {
        if (!this.checkPermission()) return;
        const modal = document.getElementById("userModal");
        if (!modal) return;
        document.getElementById("userForm").reset();
        modal.classList.add("active");
    },

    saveNewUser(e) {
        if (e) e.preventDefault();
        if (!this.checkPermission()) return;

        const name = document.getElementById("newUserName").value.trim();
        const username = document.getElementById("newUserUsername").value.trim().toLowerCase();
        const password = document.getElementById("newUserPassword").value.trim();
        const role = document.getElementById("newUserRole").value;

        if (!name || !username || !password) {
            App.showToast("Fadlan buuxi dhammaan meelaha banaan!", "warning");
            return;
        }

        let users = StorageService.getUsers();
        if (users.some(u => u.username.toLowerCase() === username)) {
            App.showToast(`Username-kan "${username}" hore ayaa loo isticmaalay!`, "error");
            return;
        }

        const newUser = {
            id: "USR-" + String(users.length + 1).padStart(3, "0"),
            name,
            username,
            password,
            role,
            createdAt: new Date().toISOString().split("T")[0]
        };

        users.push(newUser);
        StorageService.saveUsers(users);

        InventoryModule.closeModal("userModal");
        this.renderUsersTable();
        App.showToast(`User cusub "${name}" ayaa lagu daray!`, "success");
    },

    openChangePasswordModal(userId) {
        if (!this.checkPermission()) return;
        const user = StorageService.getUsers().find(u => u.id === userId);
        if (!user) return;

        const newPass = prompt(`Gali password cusub oo loogu talagalay (${user.name}):`, "");
        if (newPass && newPass.trim() !== "") {
            let users = StorageService.getUsers();
            const u = users.find(x => x.id === userId);
            if (u) {
                u.password = newPass.trim();
                StorageService.saveUsers(users);
                this.renderUsersTable();
                App.showToast(`Password-ka ${u.name} si guul leh ayaa loo beddelay!`, "success");
            }
        }
    },

    deleteUser(userId) {
        if (!this.checkPermission()) return;
        let users = StorageService.getUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return;

        if (user.username === "admin") {
            App.showToast("Lama tirtiri karo user-ka ugu weyn ee Admin-ka!", "error");
            return;
        }

        if (confirm(`Ma hubtaa inaad tirtirto user-ka: "${user.name}"?`)) {
            users = users.filter(u => u.id !== userId);
            StorageService.saveUsers(users);
            this.renderUsersTable();
            App.showToast("User-ka waa la tirtiray!", "info");
        }
    }
};
