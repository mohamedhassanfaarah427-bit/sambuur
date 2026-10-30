/**
 * REPORTS.JS - Warbixinada, Xisaabaadka & Dashboard (Analytics & Reports)
 * Provides comprehensive statistics, profit/loss calculations, stock valuation, and chart visualization.
 */

const DashboardModule = {
    renderStats() {
        const products = StorageService.getProducts();
        const sales = StorageService.getSales();
        const customers = StorageService.getCustomers();
        const settings = StorageService.getSettings();
        const currency = settings.currency || "$";

        // 1. Stock Valuation
        let totalCostValue = 0;
        let totalWholesaleValue = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;

        products.forEach(p => {
            totalCostValue += (p.costPrice || 0) * (p.stock || 0);
            totalWholesaleValue += (p.wholesalePrice || 0) * (p.stock || 0);
            if (p.stock <= 0) outOfStockCount++;
            else if (p.stock <= (p.minStockAlert || 5)) lowStockCount++;
        });

        // 2. Sales Totals
        let totalSalesRevenue = 0;
        let totalSalesCost = 0;
        let totalDebtOutstanding = 0;

        sales.forEach(s => {
            totalSalesRevenue += (s.grandTotal || 0);
            // Calculate cost of items in this sale
            if (s.items) {
                s.items.forEach(it => {
                    totalSalesCost += (it.costPrice || 0) * (it.qty || 0);
                });
            }
        });

        const grossProfit = totalSalesRevenue - totalSalesCost;

        // Customer Total Debt
        customers.forEach(c => {
            totalDebtOutstanding += (c.currentDebt || 0);
        });

        // Update Dashboard DOM Elements
        const elTotalStockVal = document.getElementById("statStockCostValue");
        const elTotalWholesaleVal = document.getElementById("statStockWholesaleValue");
        const elTotalRevenue = document.getElementById("statTotalRevenue");
        const elGrossProfit = document.getElementById("statGrossProfit");
        const elTotalDebt = document.getElementById("statTotalDebt");
        const elLowStock = document.getElementById("statLowStockAlert");
        const elTotalProducts = document.getElementById("statTotalProducts");

        const isAdmin = typeof AuthService !== 'undefined' ? AuthService.isAdmin() : true;

        if (elTotalStockVal) {
            elTotalStockVal.innerHTML = isAdmin 
                ? `${currency}${Math.round(totalCostValue).toLocaleString()}` 
                : `<span class="text-muted font-xs">🔒 Admin Kaliya</span>`;
        }
        if (elTotalWholesaleVal) elTotalWholesaleVal.textContent = `${currency}${Math.round(totalWholesaleValue).toLocaleString()}`;
        if (elTotalRevenue) elTotalRevenue.textContent = `${currency}${Math.round(totalSalesRevenue).toLocaleString()}`;
        if (elGrossProfit) {
            elGrossProfit.innerHTML = isAdmin 
                ? `${currency}${Math.round(grossProfit).toLocaleString()}` 
                : `<span class="text-muted font-xs">🔒 Admin Kaliya</span>`;
        }
        if (elTotalDebt) elTotalDebt.textContent = `${currency}${Math.round(totalDebtOutstanding).toLocaleString()}`;
        if (elTotalProducts) elTotalProducts.textContent = `${products.length} nooc`;
        if (elLowStock) {
            elLowStock.textContent = `${lowStockCount + outOfStockCount} alaab`;
            if (lowStockCount + outOfStockCount > 0) {
                elLowStock.classList.add("text-danger");
            } else {
                elLowStock.classList.remove("text-danger");
            }
        }

        // Render Recent Sales on Dashboard
        this.renderRecentSalesTable();

        // Render Low Stock Widget
        this.renderLowStockWidget();

        // Draw Canvas Charts
        ReportsModule.drawCategoryChart();
    },

    renderRecentSalesTable() {
        const tbody = document.getElementById("dashRecentSalesBody");
        if (!tbody) return;

        const sales = StorageService.getSales().slice(0, 5); // top 5 recent
        const settings = StorageService.getSettings();
        const currency = settings.currency || "$";

        if (sales.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-3 text-muted">Iib dhowaan ma jiro.</td></tr>`;
            return;
        }

        tbody.innerHTML = sales.map(s => `
            <tr>
                <td><strong>${s.invoiceNumber}</strong></td>
                <td>${s.customerName}</td>
                <td><small class="text-muted">${s.date}</small></td>
                <td class="text-end font-bold text-primary">${currency}${s.grandTotal.toLocaleString()}</td>
                <td class="text-center">
                    <span class="badge ${s.balanceDue > 0 ? 'badge-warning' : 'badge-success'}">${s.paymentStatus}</span>
                </td>
            </tr>
        `).join("");
    },

    renderLowStockWidget() {
        const container = document.getElementById("dashLowStockList");
        if (!container) return;

        const products = StorageService.getProducts();
        const alertProducts = products.filter(p => p.stock <= (p.minStockAlert || 5));

        if (alertProducts.length === 0) {
            container.innerHTML = `<div class="p-3 text-center text-success">✅ Dhammaan alaabta bakhaarka stock-geedu waa buuxaa!</div>`;
            return;
        }

        container.innerHTML = alertProducts.slice(0, 6).map(p => `
            <div class="low-stock-item">
                <div>
                    <strong>${p.name}</strong>
                    <div class="font-xs text-muted">${p.brand || ''} • ${p.category}</div>
                </div>
                <div>
                    <span class="badge ${p.stock <= 0 ? 'badge-danger' : 'badge-warning'}">
                        ${p.stock <= 0 ? "Go'ay (0)" : `${p.stock} yaal`}
                    </span>
                    <button class="btn btn-xs btn-outline-info ml-1" onclick="InventoryModule.openStockAdjustModal('${p.id}')">
                        + Kudar
                    </button>
                </div>
            </div>
        `).join("");
    }
};

const ReportsModule = {
    init() {
        this.renderSalesHistory();
        this.bindEvents();
    },

    bindEvents() {
        const searchSales = document.getElementById("reportsSalesSearch");
        if (searchSales) {
            searchSales.addEventListener("input", () => {
                this.renderSalesHistory();
            });
        }
    },

    renderSalesHistory() {
        const tbody = document.getElementById("reportsSalesTableBody");
        if (!tbody) return;

        const searchInput = document.getElementById("reportsSalesSearch");
        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

        let sales = StorageService.getSales();

        if (query) {
            sales = sales.filter(s => {
                const searchStr = `${s.invoiceNumber} ${s.customerName} ${s.date} ${s.paymentMethod}`.toLowerCase();
                return searchStr.includes(query);
            });
        }

        const settings = StorageService.getSettings();
        const currency = settings.currency || "$";

        if (sales.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">Wax iib ah oo diiwaangashan lama helin.</td></tr>`;
            return;
        }

        tbody.innerHTML = sales.map(s => {
            const itemCount = (s.items || []).reduce((sum, it) => sum + it.qty, 0);

            return `
                <tr>
                    <td class="font-bold text-primary">${s.invoiceNumber}</td>
                    <td>${s.customerName}</td>
                    <td><small class="text-muted">${s.date}</small></td>
                    <td class="text-center"><span class="badge badge-unit">${itemCount} xabbo</span></td>
                    <td class="text-end font-bold">${currency}${s.grandTotal.toLocaleString()}</td>
                    <td class="text-end text-success">${currency}${s.amountPaid.toLocaleString()}</td>
                    <td class="text-end ${s.balanceDue > 0 ? 'text-danger font-bold' : 'text-muted'}">${currency}${s.balanceDue.toLocaleString()}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-primary" onclick="POSModule.openInvoiceModal(StorageService.getSales().find(x => x.id === '${s.id}'))">
                            🖨️ Rasiid
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    },

    exportSalesCSV() {
        const sales = StorageService.getSales();
        if (!sales.length) {
            App.showToast("Wax iib ah ma jiraan oo la dhoofin karo!", "warning");
            return;
        }

        const headers = ["Invoice #", "Macmiilka", "Taariikhda", "Tirada Alaabta", "Wadarta ($)", "La Bixiyey ($)", "Deyn ($)", "Habka Bixinta", "Xaaladda"];
        const rows = sales.map(s => [
            `"${s.invoiceNumber}"`,
            `"${s.customerName}"`,
            `"${s.date}"`,
            (s.items || []).reduce((sum, it) => sum + it.qty, 0),
            s.grandTotal,
            s.amountPaid,
            s.balanceDue,
            `"${s.paymentMethod}"`,
            `"${s.paymentStatus}"`
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Warbixinta_Iibka_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    drawCategoryChart() {
        const canvas = document.getElementById("categoryChartCanvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Resize canvas for sharp rendering
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width || 480;
        canvas.height = 240;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const products = StorageService.getProducts();
        const categories = StorageService.getCategories();

        // Calculate value per category
        const catData = categories.map(cat => {
            const catProds = products.filter(p => p.category === cat.id);
            const totalVal = catProds.reduce((sum, p) => sum + (p.wholesalePrice * p.stock), 0);
            const count = catProds.reduce((sum, p) => sum + p.stock, 0);
            return {
                name: cat.name.split(" ")[0], // first word for clean label
                fullName: cat.name,
                value: totalVal,
                count: count
            };
        });

        const maxVal = Math.max(...catData.map(d => d.value), 1000);
        const colors = ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

        const padding = 40;
        const barWidth = Math.max(25, (canvas.width - padding * 2) / catData.length - 20);
        const chartHeight = canvas.height - 70;

        catData.forEach((d, i) => {
            const x = padding + i * (barWidth + 20);
            const barHeight = (d.value / maxVal) * chartHeight;
            const y = canvas.height - 40 - barHeight;

            // Bar background shadow
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]);
            } else {
                ctx.rect(x, y, barWidth, barHeight);
            }
            ctx.fill();

            // Value text above bar
            ctx.fillStyle = "#334155";
            ctx.font = "bold 11px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`$${(d.value / 1000).toFixed(1)}k`, x + barWidth / 2, y - 6);

            // Category Label below bar
            ctx.font = "11px sans-serif";
            ctx.fillStyle = "#64748b";
            ctx.fillText(d.name, x + barWidth / 2, canvas.height - 20);
            ctx.fillText(`(${d.count})`, x + barWidth / 2, canvas.height - 6);
        });
    }
};
