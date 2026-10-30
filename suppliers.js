/**
 * SUPPLIERS.JS - Maamulka Shirkadaha & Alaab-qeybiyaasha (Suppliers Management)
 * Handles international & local suppliers where wholesale stock is procured.
 */

const SupplierModule = {
    searchQuery: "",

    init() {
        this.renderSuppliers();
        this.bindEvents();
    },

    bindEvents() {
        const searchInput = document.getElementById("suppSearchInput");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderSuppliers();
            });
        }
    },

    getFilteredSuppliers() {
        let suppliers = StorageService.getSuppliers();
        if (this.searchQuery) {
            suppliers = suppliers.filter(s => {
                const searchStr = `${s.name} ${s.contact || ''} ${s.location || ''} ${s.itemsSupplied || ''}`.toLowerCase();
                return searchStr.includes(this.searchQuery);
            });
        }
        return suppliers;
    },

    renderSuppliers() {
        const tbody = document.getElementById("suppliersTableBody");
        const countBadge = document.getElementById("suppliersCountBadge");
        if (!tbody) return;

        const suppliers = this.getFilteredSuppliers();
        const isAdmin = typeof AuthService !== 'undefined' ? AuthService.isAdmin() : true;

        if (countBadge) {
            countBadge.textContent = `${suppliers.length} Shirkadood`;
        }

        if (suppliers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        Wax shirkad ah oo u dhiganta lama helin.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = suppliers.map(s => `
            <tr>
                <td class="font-mono text-muted">${s.id}</td>
                <td>
                    <strong>${s.name}</strong>
                </td>
                <td>${s.contact || '-'}</td>
                <td>📍 ${s.location || '-'}</td>
                <td><small class="text-secondary">${s.itemsSupplied || '-'}</small></td>
                <td class="text-end action-col">
                    <div class="btn-group">
                        ${isAdmin ? `
                            <button class="btn btn-sm btn-icon btn-outline-primary" title="Wax ka bedel" onclick="SupplierModule.openEditSupplierModal('${s.id}')">
                                ✏️
                            </button>
                            <button class="btn btn-sm btn-icon btn-outline-danger" title="Tir" onclick="SupplierModule.deleteSupplier('${s.id}')">
                                🗑️
                            </button>
                        ` : `<span class="font-xs text-muted">🔒 Kaliya Admin</span>`}
                    </div>
                </td>
            </tr>
        `).join("");
    },

    openAddSupplierModal() {
        if (typeof AuthService !== 'undefined' && !AuthService.checkPermission('add_supplier')) return;

        const modal = document.getElementById("supplierModal");
        const form = document.getElementById("supplierForm");
        const title = document.getElementById("supplierModalTitle");
        if (!modal || !form) return;

        form.reset();
        document.getElementById("suppIdInput").value = "";
        if (title) title.textContent = "Ku dar Shirkad / Alaab-keene Cusub";
        modal.classList.add("active");
    },

    openEditSupplierModal(id) {
        if (typeof AuthService !== 'undefined' && !AuthService.checkPermission('edit_supplier')) return;

        const supplier = StorageService.getSuppliers().find(s => s.id === id);
        if (!supplier) return;

        const modal = document.getElementById("supplierModal");
        const title = document.getElementById("supplierModalTitle");
        if (!modal) return;

        document.getElementById("suppIdInput").value = supplier.id;
        document.getElementById("suppNameInput").value = supplier.name;
        document.getElementById("suppContactInput").value = supplier.contact || "";
        document.getElementById("suppLocationInput").value = supplier.location || "";
        document.getElementById("suppItemsInput").value = supplier.itemsSupplied || "";

        if (title) title.textContent = `Wax ka bedel (${supplier.name})`;
        modal.classList.add("active");
    },

    saveSupplierFromForm(e) {
        if (e) e.preventDefault();
        if (typeof AuthService !== 'undefined' && !AuthService.checkPermission('save_supplier')) return;

        const idField = document.getElementById("suppIdInput").value.trim();
        const name = document.getElementById("suppNameInput").value.trim();
        const contact = document.getElementById("suppContactInput").value.trim();
        const location = document.getElementById("suppLocationInput").value.trim();
        const itemsSupplied = document.getElementById("suppItemsInput").value.trim();

        if (!name) {
            App.showToast("Fadlan qor magaca shirkadda!", "error");
            return;
        }

        let suppliers = StorageService.getSuppliers();

        if (idField) {
            const index = suppliers.findIndex(s => s.id === idField);
            if (index !== -1) {
                suppliers[index] = {
                    ...suppliers[index],
                    name,
                    contact,
                    location,
                    itemsSupplied
                };
                StorageService.saveSuppliers(suppliers);
                App.showToast("Xogta shirkadda waa la cusboonaysiiyay!", "success");
            }
        } else {
            const newId = "SUPP-" + String(suppliers.length + 1).padStart(3, "0");
            suppliers.push({
                id: newId,
                name,
                contact,
                location,
                itemsSupplied,
                balance: 0
            });
            StorageService.saveSuppliers(suppliers);
            App.showToast("Shirkad cusub ayaa lagu daray!", "success");
        }

        InventoryModule.closeModal("supplierModal");
        this.renderSuppliers();
    },

    deleteSupplier(id) {
        if (typeof AuthService !== 'undefined' && !AuthService.checkPermission('delete_supplier')) return;

        const supplier = StorageService.getSuppliers().find(s => s.id === id);
        if (!supplier) return;

        if (confirm(`Ma hubtaa inaad tirtirto shirkadda "${supplier.name}"?`)) {
            let suppliers = StorageService.getSuppliers();
            suppliers = suppliers.filter(s => s.id !== id);
            StorageService.saveSuppliers(suppliers);
            App.showToast("Shirkadda waa la tirtiray!", "info");
            this.renderSuppliers();
        }
    }
};
