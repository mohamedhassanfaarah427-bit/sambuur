/**
 * CUSTOMERS.JS - Maamulka Macaamiisha & Xisaabinta Daymaha (Customer Directory & Debt Ledger)
 * Allows managing dealers, credit tracking, debt repayment, and purchase history.
 */

const CustomerModule = {
    searchQuery: "",
    debtFilter: "all",

    init() {
        this.renderCustomers();
        this.bindEvents();
    },

    bindEvents() {
        const searchInput = document.getElementById("custSearchInput");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderCustomers();
            });
        }

        const debtSelect = document.getElementById("custDebtFilter");
        if (debtSelect) {
            debtSelect.addEventListener("change", (e) => {
                this.debtFilter = e.target.value;
                this.renderCustomers();
            });
        }
    },

    getFilteredCustomers() {
        let customers = StorageService.getCustomers();

        if (this.searchQuery) {
            customers = customers.filter(c => {
                const searchStr = `${c.name} ${c.phone || ''} ${c.city || ''} ${c.tier || ''}`.toLowerCase();
                return searchStr.includes(this.searchQuery);
            });
        }

        if (this.debtFilter === "has_debt") {
            customers = customers.filter(c => (c.currentDebt || 0) > 0);
        } else if (this.debtFilter === "no_debt") {
            customers = customers.filter(c => (c.currentDebt || 0) === 0);
        }

        return customers;
    },

    renderCustomers() {
        const tbody = document.getElementById("customersTableBody");
        const countBadge = document.getElementById("customersCountBadge");
        if (!tbody) return;

        const customers = this.getFilteredCustomers();
        const settings = StorageService.getSettings();
        const currency = settings.currency || "$";
        const isAdmin = typeof AuthService !== 'undefined' ? AuthService.isAdmin() : true;

        if (countBadge) {
            countBadge.textContent = `${customers.length} Macmiil`;
        }

        if (customers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                        Wax macmiil ah oo u dhigma baadi-goobka lama helin.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = customers.map(c => {
            const debt = c.currentDebt || 0;
            const debtBadge = debt > 0 
                ? `<span class="badge badge-danger font-bold">${currency}${debt.toLocaleString()}</span>` 
                : `<span class="badge badge-success">Ma qabo ($0)</span>`;

            return `
                <tr>
                    <td class="font-mono text-muted">${c.id}</td>
                    <td>
                        <strong>${c.name}</strong>
                        <div class="font-xs text-muted">${c.notes || ''}</div>
                    </td>
                    <td>${c.phone || '-'}</td>
                    <td>📍 ${c.city || '-'}</td>
                    <td><span class="badge-cat">${c.tier || 'Wholesale Regular'}</span></td>
                    <td class="text-end font-semibold text-primary">${currency}${(c.totalPurchases || 0).toLocaleString()}</td>
                    <td class="text-end">${debtBadge}</td>
                    <td class="text-end action-col">
                        <div class="btn-group">
                            ${debt > 0 ? `
                            <button class="btn btn-sm btn-success" title="Ka qaad Deyn / Bixi Lacag" onclick="CustomerModule.openPayDebtModal('${c.id}')">
                                💵 Bixi Deyn
                            </button>` : ''}
                            <button class="btn btn-sm btn-icon btn-outline-info" title="Taariikhda Rasiidhada" onclick="CustomerModule.viewCustomerInvoices('${c.id}')">
                                📜
                            </button>
                            ${isAdmin ? `
                                <button class="btn btn-sm btn-icon btn-outline-primary" title="Wax ka bedel" onclick="CustomerModule.openEditCustomerModal('${c.id}')">
                                    ✏️
                                </button>
                                <button class="btn btn-sm btn-icon btn-outline-danger" title="Tir" onclick="CustomerModule.deleteCustomer('${c.id}')">
                                    🗑️
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    },

    openAddCustomerModal() {
        const modal = document.getElementById("customerModal");
        const form = document.getElementById("customerForm");
        const title = document.getElementById("customerModalTitle");
        if (!modal || !form) return;

        form.reset();
        document.getElementById("custIdInput").value = "";
        if (title) title.textContent = "Diiwaangeli Macmiil / Ganacsade Cusub";
        modal.classList.add("active");
    },

    openEditCustomerModal(id) {
        if (typeof AuthService !== 'undefined' && !AuthService.checkPermission('edit_customer')) return;

        const customer = StorageService.getCustomers().find(c => c.id === id);
        if (!customer) return;

        const modal = document.getElementById("customerModal");
        const form = document.getElementById("customerForm");
        const title = document.getElementById("customerModalTitle");
        if (!modal || !form) return;

        document.getElementById("custIdInput").value = customer.id;
        document.getElementById("custNameInput").value = customer.name;
        document.getElementById("custPhoneInput").value = customer.phone || "";
        document.getElementById("custCityInput").value = customer.city || "";
        document.getElementById("custTierInput").value = customer.tier || "Wholesale Regular";
        document.getElementById("custNotesInput").value = customer.notes || "";

        if (title) title.textContent = `Wax ka bedel (${customer.name})`;
        modal.classList.add("active");
    },

    saveCustomerFromForm(e) {
        if (e) e.preventDefault();

        const idField = document.getElementById("custIdInput").value.trim();
        const name = document.getElementById("custNameInput").value.trim();
        const phone = document.getElementById("custPhoneInput").value.trim();
        const city = document.getElementById("custCityInput").value.trim();
        const tier = document.getElementById("custTierInput").value;
        const notes = document.getElementById("custNotesInput").value.trim();

        if (!name) {
            App.showToast("Fadlan qor magaca macmiilka!", "error");
            return;
        }

        let customers = StorageService.getCustomers();

        if (idField) {
            if (typeof AuthService !== 'undefined' && !AuthService.checkPermission('edit_customer')) return;
            const index = customers.findIndex(c => c.id === idField);
            if (index !== -1) {
                customers[index] = {
                    ...customers[index],
                    name,
                    phone,
                    city,
                    tier,
                    notes
                };
                StorageService.saveCustomers(customers);
                App.showToast("Xogta macmiilka waa la cusboonaysiiyay!", "success");
            }
        } else {
            const newId = "CUST-" + String(customers.length + 1).padStart(3, "0");
            const newCustomer = {
                id: newId,
                name,
                phone,
                city,
                tier,
                totalPurchases: 0,
                currentDebt: 0,
                notes
            };
            customers.push(newCustomer);
            StorageService.saveCustomers(customers);
            App.showToast("Macmiil cusub ayaa lagu daray!", "success");
        }

        InventoryModule.closeModal("customerModal");
        this.renderCustomers();
        POSModule.renderCustomerSelect();
    },

    deleteCustomer(id) {
        if (typeof AuthService !== 'undefined' && !AuthService.checkPermission('delete_customer')) return;

        const customer = StorageService.getCustomers().find(c => c.id === id);
        if (!customer) return;

        if (confirm(`Ma hubtaa inaad tirtirto macmiilka "${customer.name}"?`)) {
            let customers = StorageService.getCustomers();
            customers = customers.filter(c => c.id !== id);
            StorageService.saveCustomers(customers);
            App.showToast("Macmiilka waa la tirtiray!", "info");
            this.renderCustomers();
            POSModule.renderCustomerSelect();
        }
    },

    openPayDebtModal(id) {
        const customer = StorageService.getCustomers().find(c => c.id === id);
        if (!customer) return;

        const modal = document.getElementById("payDebtModal");
        if (!modal) return;

        const settings = StorageService.getSettings();
        const currency = settings.currency || "$";

        document.getElementById("debtCustId").value = customer.id;
        document.getElementById("debtCustName").textContent = customer.name;
        document.getElementById("debtAmountDisplay").textContent = `${currency}${(customer.currentDebt || 0).toLocaleString()}`;
        document.getElementById("debtPaymentInput").value = customer.currentDebt || 0;
        document.getElementById("debtPayMethod").value = "EVC Plus / Zaad";
        document.getElementById("debtPayNote").value = "Bixinta deynta";

        modal.classList.add("active");
    },

    saveDebtPayment() {
        const id = document.getElementById("debtCustId").value;
        const amount = parseFloat(document.getElementById("debtPaymentInput").value);
        const method = document.getElementById("debtPayMethod").value;
        const note = document.getElementById("debtPayNote").value.trim();

        let customers = StorageService.getCustomers();
        const customer = customers.find(c => c.id === id);
        if (!customer) return;

        if (isNaN(amount) || amount <= 0) {
            App.showToast("Fadlan gali lacag sax ah!", "error");
            return;
        }

        if (amount > (customer.currentDebt || 0)) {
            App.showToast(`Lacagta aad galisay waxay ka badantahay deynta lagu leeyahay ($${customer.currentDebt})!`, "warning");
            return;
        }

        customer.currentDebt = Math.max(0, (customer.currentDebt || 0) - amount);
        StorageService.saveCustomers(customers);

        InventoryModule.closeModal("payDebtModal");
        this.renderCustomers();
        POSModule.renderCustomerSelect();
        DashboardModule.renderStats();

        App.showToast(`Lacagta $${amount} ee ${customer.name} si guul leh ayaa loo qabtay! Deynta dhiman: $${customer.currentDebt}`, "success");
    },

    viewCustomerInvoices(customerId) {
        const customer = StorageService.getCustomers().find(c => c.id === customerId);
        if (!customer) return;

        const sales = StorageService.getSales().filter(s => s.customerId === customerId);
        const settings = StorageService.getSettings();
        const currency = settings.currency || "$";

        const modal = document.getElementById("customerInvoicesModal");
        const listContainer = document.getElementById("customerInvoicesList");
        const nameHeader = document.getElementById("customerInvoicesHeader");

        if (nameHeader) nameHeader.textContent = `Rasiidhada: ${customer.name} (${sales.length} iib)`;

        if (!listContainer) return;

        if (sales.length === 0) {
            listContainer.innerHTML = `<div class="p-3 text-muted text-center">Macmiilkani wax rasiid iib ah ma laha wali.</div>`;
        } else {
            listContainer.innerHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nooca Rasiidka</th>
                            <th>Taariikhda</th>
                            <th>Alaabaha</th>
                            <th class="text-end">Isugeyn</th>
                            <th class="text-end">La Bixiyey</th>
                            <th class="text-end">Hadh/Deyn</th>
                            <th class="text-center">Falka</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sales.map(s => `
                            <tr>
                                <td><strong>${s.invoiceNumber}</strong></td>
                                <td><small>${s.date}</small></td>
                                <td><small>${s.items.map(i => `${i.qty}x ${i.productName}`).join(", ")}</small></td>
                                <td class="text-end font-bold text-primary">${currency}${s.grandTotal.toLocaleString()}</td>
                                <td class="text-end text-success">${currency}${s.amountPaid.toLocaleString()}</td>
                                <td class="text-end ${s.balanceDue > 0 ? 'text-danger font-bold' : ''}">${currency}${s.balanceDue.toLocaleString()}</td>
                                <td class="text-center">
                                    <button class="btn btn-sm btn-outline-primary" onclick="POSModule.openInvoiceModal(StorageService.getSales().find(x => x.id === '${s.id}'))">
                                        🖨️ Eeg / Daabac
                                    </button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            `;
        }

        modal.classList.add("active");
    }
};
