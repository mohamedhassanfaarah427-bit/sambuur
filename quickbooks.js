/**
 * QUICKBOOKS.JS - Nidaamka Xisaabaadka & Warbixinta Faa'iidada & Qasaarada (P&L 6 Bilood)
 * Professional QuickBooks-style 6-Month Profit & Loss Financial Statement
 * Calculates: Net Revenue, Cost of Goods Sold (COGS), Gross Profit, Operating Expenses, and Net Profit/Loss.
 */

const QuickBooksModule = {
    currentPeriod: "last6", // "last6", "sem1", "sem2"
    showSimulatedSales: false,

    init() {
        this.render();
        this.bindEvents();
    },

    bindEvents() {
        const periodSelect = document.getElementById("qbPeriodSelect");
        if (periodSelect) {
            periodSelect.addEventListener("change", (e) => {
                this.currentPeriod = e.target.value;
                this.render();
            });
        }
    },

    /**
     * Define the 6 months based on selected period (2026 - 2030)
     */
    getPeriodMonths() {
        const months = [];
        const p = this.currentPeriod || "last6";

        if (p === "last6") {
            // Rolling 6 months ending October 2026: May 2026 to October 2026
            const monthList = [5, 6, 7, 8, 9, 10];
            monthList.forEach(m => {
                const key = `2026-${String(m).padStart(2, "0")}`;
                const nameEn = new Date(2026, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
                months.push({ key, label: nameEn });
            });
            return months;
        }

        // H1 (Months 1 - 6: January - June) for any year 2026-2030
        const matchH1 = p.match(/^(\d{4})-(?:h1|sem1)$/) || (p === "sem1" ? [null, "2026"] : null);
        if (matchH1) {
            const yr = parseInt(matchH1[1], 10);
            for (let m = 1; m <= 6; m++) {
                const key = `${yr}-${String(m).padStart(2, "0")}`;
                const nameEn = new Date(yr, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
                months.push({ key, label: nameEn });
            }
            return months;
        }

        // H2 (Months 7 - 12: July - December) for any year 2026-2030
        const matchH2 = p.match(/^(\d{4})-(?:h2|sem2)$/) || (p === "sem2" ? [null, "2026"] : null);
        if (matchH2) {
            const yr = parseInt(matchH2[1], 10);
            for (let m = 7; m <= 12; m++) {
                const key = `${yr}-${String(m).padStart(2, "0")}`;
                const nameEn = new Date(yr, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
                months.push({ key, label: nameEn });
            }
            return months;
        }

        // Default fallback (May - Oct 2026)
        for (let m = 5; m <= 10; m++) {
            const key = `2026-${String(m).padStart(2, "0")}`;
            const nameEn = new Date(2026, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
            months.push({ key, label: nameEn });
        }
        return months;
    },

    /**
     * Period Title for Financial Statement Header
     */
    getPeriodTitle() {
        const p = this.currentPeriod || "last6";
        if (p === "last6") {
            return "6-dii Bilood ee Ugu Dambeeyey (May 2026 – Oct 2026)";
        }
        const matchH1 = p.match(/^(\d{4})-(?:h1|sem1)$/) || (p === "sem1" ? [null, "2026"] : null);
        if (matchH1) {
            const yr = matchH1[1];
            return `Sannadka ${yr}: 6-da Bilood ee Hore (Janaayo – Juun ${yr})`;
        }
        const matchH2 = p.match(/^(\d{4})-(?:h2|sem2)$/) || (p === "sem2" ? [null, "2026"] : null);
        if (matchH2) {
            const yr = matchH2[1];
            return `Sannadka ${yr}: 6-da Bilood ee Dambe (Luulyo – Diseembar ${yr})`;
        }
        return "Muddada Xisaabta (6 Bilood)";
    },

    /**
     * Compute full 6-month financial matrix
     */
    computeFinancials() {
        const months = this.getPeriodMonths();
        const settings = StorageService.getSettings();
        const currency = settings.currency || "$";
        const realSales = StorageService.getSales();
        const expenses = StorageService.getExpenses();
        const expenseCategories = StorageService.getExpenseCategories();

        // Matrix structures for 6 months
        const matrix = {
            months: months,
            currency: currency,
            periodTitle: this.getPeriodTitle(),
            revenue: {},
            discount: {},
            netRevenue: {},
            cogs: {},
            grossProfit: {},
            expensesByCategory: {},
            totalExpenses: {},
            netIncome: {}
        };

        // Initialize 0 for each month
        months.forEach(m => {
            matrix.revenue[m.key] = 0;
            matrix.discount[m.key] = 0;
            matrix.netRevenue[m.key] = 0;
            matrix.cogs[m.key] = 0;
            matrix.grossProfit[m.key] = 0;
            matrix.totalExpenses[m.key] = 0;
            matrix.netIncome[m.key] = 0;
        });

        expenseCategories.forEach(cat => {
            matrix.expensesByCategory[cat.id] = {
                name: cat.name,
                icon: cat.icon || "•",
                byMonth: {},
                total: 0
            };
            months.forEach(m => {
                matrix.expensesByCategory[cat.id].byMonth[m.key] = 0;
            });
        });

        // 1. Process Actual Sales
        realSales.forEach(s => {
            if (!s.date) return;
            // Month key: YYYY-MM
            const monthKey = s.date.substring(0, 7);
            if (matrix.revenue[monthKey] !== undefined) {
                const subtotal = s.subtotal || s.grandTotal || 0;
                const discount = s.discount || 0;
                const grandTotal = s.grandTotal || 0;

                matrix.revenue[monthKey] += subtotal;
                matrix.discount[monthKey] += discount;
                matrix.netRevenue[monthKey] += grandTotal;

                // COGS calculation
                let saleCogs = 0;
                if (s.items && Array.isArray(s.items)) {
                    s.items.forEach(it => {
                        saleCogs += (it.costPrice || 0) * (it.qty || 1);
                    });
                }
                matrix.cogs[monthKey] += saleCogs;
            }
        });

        // Simulated sales baseline if user enabled demonstration mode
        if (this.showSimulatedSales) {
            const baseMonthRev = [11500, 12800, 14500, 15200, 14200, 18500, 16800, 21400, 19600, 15300, 17800, 22400];
            const baseMonthCogs = [9500, 10500, 11900, 12400, 11800, 15200, 13900, 17600, 16100, 12500, 14600, 18300];

            months.forEach(m => {
                const parts = m.key.split("-");
                const yr = parseInt(parts[0], 10);
                const mIdx = parseInt(parts[1], 10) - 1;
                const yrFactor = 1 + Math.max(0, (yr - 2026) * 0.05);

                const simRev = Math.round((baseMonthRev[mIdx] || 15000) * yrFactor);
                const simCogs = Math.round((baseMonthCogs[mIdx] || 12000) * yrFactor);

                if (matrix.netRevenue[m.key] === 0) {
                    matrix.revenue[m.key] += simRev;
                    matrix.netRevenue[m.key] += simRev;
                    matrix.cogs[m.key] += simCogs;
                }
            });
        }

        // Compute Gross Profit per month
        months.forEach(m => {
            matrix.grossProfit[m.key] = matrix.netRevenue[m.key] - matrix.cogs[m.key];
        });

        // 2. Process Operating Expenses
        expenses.forEach(exp => {
            if (!exp.date) return;
            const monthKey = exp.date.substring(0, 7);
            if (months.some(m => m.key === monthKey)) {
                const catId = exp.category || "other";
                const amount = parseFloat(exp.amount) || 0;

                if (!matrix.expensesByCategory[catId]) {
                    matrix.expensesByCategory[catId] = {
                        name: exp.categoryName || "Kharashyo Kale",
                        icon: "📑",
                        byMonth: {},
                        total: 0
                    };
                    months.forEach(m => {
                        matrix.expensesByCategory[catId].byMonth[m.key] = 0;
                    });
                }

                matrix.expensesByCategory[catId].byMonth[monthKey] += amount;
                matrix.totalExpenses[monthKey] += amount;
            }
        });

        // Baseline operating expenses for demonstration mode
        if (this.showSimulatedSales) {
            months.forEach(m => {
                if (matrix.totalExpenses[m.key] === 0) {
                    const parts = m.key.split("-");
                    const yr = parseInt(parts[0], 10);
                    const yrFactor = 1 + Math.max(0, (yr - 2026) * 0.04);

                    const demoExpList = [
                        { catId: "rent", amount: Math.round(650 * yrFactor) },
                        { catId: "salaries", amount: Math.round(900 * yrFactor) },
                        { catId: "utilities", amount: Math.round(150 * yrFactor) }
                    ];

                    demoExpList.forEach(de => {
                        if (matrix.expensesByCategory[de.catId]) {
                            matrix.expensesByCategory[de.catId].byMonth[m.key] += de.amount;
                            matrix.totalExpenses[m.key] += de.amount;
                        }
                    });
                }
            });
        }

        // 3. Compute Net Income (Net Profit / Loss)
        months.forEach(m => {
            matrix.netIncome[m.key] = matrix.grossProfit[m.key] - matrix.totalExpenses[m.key];
        });

        // 4. Compute Totals across all 6 months
        matrix.totals = {
            revenue: months.reduce((s, m) => s + matrix.revenue[m.key], 0),
            discount: months.reduce((s, m) => s + matrix.discount[m.key], 0),
            netRevenue: months.reduce((s, m) => s + matrix.netRevenue[m.key], 0),
            cogs: months.reduce((s, m) => s + matrix.cogs[m.key], 0),
            grossProfit: months.reduce((s, m) => s + matrix.grossProfit[m.key], 0),
            totalExpenses: months.reduce((s, m) => s + matrix.totalExpenses[m.key], 0),
            netIncome: months.reduce((s, m) => s + matrix.netIncome[m.key], 0)
        };

        // Totals per expense category
        Object.keys(matrix.expensesByCategory).forEach(catId => {
            const catObj = matrix.expensesByCategory[catId];
            catObj.total = months.reduce((s, m) => s + catObj.byMonth[m.key], 0);
        });

        // Margins %
        matrix.totals.grossMarginPct = matrix.totals.netRevenue > 0 
            ? ((matrix.totals.grossProfit / matrix.totals.netRevenue) * 100).toFixed(1) 
            : "0.0";
        matrix.totals.netMarginPct = matrix.totals.netRevenue > 0 
            ? ((matrix.totals.netIncome / matrix.totals.netRevenue) * 100).toFixed(1) 
            : "0.0";
        matrix.totals.expenseRatioPct = matrix.totals.netRevenue > 0 
            ? ((matrix.totals.totalExpenses / matrix.totals.netRevenue) * 100).toFixed(1) 
            : "0.0";

        return matrix;
    },

    /**
     * Render the entire QuickBooks screen
     */
    render() {
        const matrix = this.computeFinancials();
        this.renderKPIs(matrix);
        this.renderStatementTable(matrix);
        this.renderExpensesTable();
    },

    renderKPIs(matrix) {
        const container = document.getElementById("qbKpiGrid");
        if (!container) return;

        const cur = matrix.currency;
        const netInc = matrix.totals.netIncome;
        const isProfit = netInc >= 0;
        const statusBadge = isProfit 
            ? `<span class="badge badge-success font-xs">✅ FAA'IIDO (PROFIT)</span>` 
            : `<span class="badge badge-danger font-xs">⚠️ QASAARO (LOSS)</span>`;

        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon-wrapper stat-icon-blue">💵</div>
                <div class="stat-info">
                    <div class="stat-label">Dakhliga Saafiga (6 Bilood)</div>
                    <div class="stat-value text-primary">${cur}${Math.round(matrix.totals.netRevenue).toLocaleString()}</div>
                    <div class="stat-sub">Net Sales Revenue</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon-wrapper stat-icon-amber">📦</div>
                <div class="stat-info">
                    <div class="stat-label">Kharashka Alaabta (COGS)</div>
                    <div class="stat-value text-secondary">${cur}${Math.round(matrix.totals.cogs).toLocaleString()}</div>
                    <div class="stat-sub">Raasumaalka Iibka Baxay</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon-wrapper stat-icon-green">📈</div>
                <div class="stat-info">
                    <div class="stat-label">Faa'iidada Guud (Gross Profit)</div>
                    <div class="stat-value text-success">${cur}${Math.round(matrix.totals.grossProfit).toLocaleString()}</div>
                    <div class="stat-sub">Margin: <strong>${matrix.totals.grossMarginPct}%</strong></div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon-wrapper stat-icon-purple">🏢</div>
                <div class="stat-info">
                    <div class="stat-label">Kharashka Howlgalka (OpEx)</div>
                    <div class="stat-value text-danger">${cur}${Math.round(matrix.totals.totalExpenses).toLocaleString()}</div>
                    <div class="stat-sub">Kiro, Mushaar, Shidaal jumlada</div>
                </div>
            </div>

            <div class="stat-card qb-net-card ${isProfit ? 'qb-card-profit' : 'qb-card-loss'}">
                <div class="stat-icon-wrapper ${isProfit ? 'stat-icon-green' : 'stat-icon-red'}">${isProfit ? '🏆' : '⚠️'}</div>
                <div class="stat-info">
                    <div class="stat-label">FAA'IIDADA SAAFIGA AH (NET)</div>
                    <div class="stat-value ${isProfit ? 'text-success' : 'text-danger'} font-bold">
                        ${cur}${Math.round(netInc).toLocaleString()}
                    </div>
                    <div class="stat-sub mt-1">
                        ${statusBadge} • Net Margin: <strong>${matrix.totals.netMarginPct}%</strong>
                    </div>
                </div>
            </div>
        `;
    },

    renderStatementTable(matrix) {
        const container = document.getElementById("qbStatementContainer");
        if (!container) return;

        const cur = matrix.currency;
        const months = matrix.months;
        const settings = StorageService.getSettings();

        const monthHeaders = months.map(m => `<th class="text-end qb-col-month">${m.label}</th>`).join("");
        const emptyCells = months.map(() => `<td class="text-end text-muted">-</td>`).join("");

        // Expenses breakdown rows
        const catRows = Object.keys(matrix.expensesByCategory).map(catId => {
            const cat = matrix.expensesByCategory[catId];
            if (cat.total === 0 && months.every(m => cat.byMonth[m.key] === 0)) {
                return ""; // Skip categories with zero across all months for neatness
            }
            const monthCells = months.map(m => {
                const val = cat.byMonth[m.key];
                return `<td class="text-end">${val > 0 ? `${cur}${Math.round(val).toLocaleString()}` : '<span class="text-muted">-</span>'}</td>`;
            }).join("");

            return `
                <tr class="qb-row-sub">
                    <td class="qb-indent">${cat.icon} ${cat.name}</td>
                    ${monthCells}
                    <td class="text-end font-semibold">${cur}${Math.round(cat.total).toLocaleString()}</td>
                </tr>
            `;
        }).join("");

        const isNetPositive = matrix.totals.netIncome >= 0;

        container.innerHTML = `
            <div class="qb-statement-wrapper" id="printableQuickBooksArea">
                <!-- QuickBooks Statement Header -->
                <div class="qb-header">
                    <div class="qb-company-title">${settings.storeName}</div>
                    <div class="qb-report-title">WARBIXINTA FAA'IIDADA & QASAARADA (PROFIT AND LOSS STATEMENT)</div>
                    <div class="qb-report-subtitle">Muddada: <strong>${matrix.periodTitle}</strong> (Muddo 6 Bilood ah)</div>
                    <div class="qb-report-meta">Lacagta: <strong>USD (${cur})</strong> • Nooca Xisaabta: <strong>Accrual Basis (Jumlada)</strong></div>
                </div>

                <!-- Financial Statement Table -->
                <table class="qb-table">
                    <thead>
                        <tr class="qb-th-main">
                            <th style="min-width: 240px;">QAYBAHA XISAABTA (ACCOUNT / DESCRIPTION)</th>
                            ${monthHeaders}
                            <th class="text-end qb-col-total">WADARTA 6 BIL (TOTAL)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- 1. REVENUE (DAKHLIGA) -->
                        <tr class="qb-section-head">
                            <td colspan="${months.length + 2}">1. DAKHLIGA IIBKA (INCOME / REVENUE)</td>
                        </tr>
                        <tr class="qb-row-sub">
                            <td class="qb-indent">💰 Iibka Guud ee Jumlada (Gross Wholesale Sales)</td>
                            ${months.map(m => `<td class="text-end">${cur}${Math.round(matrix.revenue[m.key]).toLocaleString()}</td>`).join("")}
                            <td class="text-end font-semibold">${cur}${Math.round(matrix.totals.revenue).toLocaleString()}</td>
                        </tr>
                        ${matrix.totals.discount > 0 ? `
                        <tr class="qb-row-sub text-danger">
                            <td class="qb-indent">📉 Qiimo-dhimis La Siiyey (Sales Discounts Allowed)</td>
                            ${months.map(m => `<td class="text-end text-danger">${matrix.discount[m.key] > 0 ? `-${cur}${Math.round(matrix.discount[m.key]).toLocaleString()}` : '-'}</td>`).join("")}
                            <td class="text-end font-semibold text-danger">-${cur}${Math.round(matrix.totals.discount).toLocaleString()}</td>
                        </tr>` : ''}
                        <tr class="qb-row-subtotal">
                            <td>Wadarta Dakhliga Saafiga ah (Net Sales Revenue)</td>
                            ${months.map(m => `<td class="text-end font-bold text-primary">${cur}${Math.round(matrix.netRevenue[m.key]).toLocaleString()}</td>`).join("")}
                            <td class="text-end font-bold text-primary">${cur}${Math.round(matrix.totals.netRevenue).toLocaleString()}</td>
                        </tr>

                        <!-- 2. COGS (KHARASHKA ALAABTA LA IIBIYEY) -->
                        <tr class="qb-section-head">
                            <td colspan="${months.length + 2}">2. KHARASHKA ALAABTA LA IIBIYEY (COST OF GOODS SOLD - COGS)</td>
                        </tr>
                        <tr class="qb-row-sub">
                            <td class="qb-indent">📦 Raasumaalka Alaabta Jumlada ee Baxday (Cost of Inventory Sold)</td>
                            ${months.map(m => `<td class="text-end">${cur}${Math.round(matrix.cogs[m.key]).toLocaleString()}</td>`).join("")}
                            <td class="text-end font-semibold">${cur}${Math.round(matrix.totals.cogs).toLocaleString()}</td>
                        </tr>
                        <tr class="qb-row-subtotal">
                            <td>Wadarta Kharashka Alaabta (Total COGS)</td>
                            ${months.map(m => `<td class="text-end font-bold">${cur}${Math.round(matrix.cogs[m.key]).toLocaleString()}</td>`).join("")}
                            <td class="text-end font-bold">${cur}${Math.round(matrix.totals.cogs).toLocaleString()}</td>
                        </tr>

                        <!-- 3. GROSS PROFIT (FAA'IIDADA GUUD) -->
                        <tr class="qb-row-highlight">
                            <td>
                                <strong>FAA'IIDADA GUUD (GROSS PROFIT)</strong>
                                <small class="d-block text-muted">Dakhliga − Kharashka Alaabta</small>
                            </td>
                            ${months.map(m => {
                                const gp = matrix.grossProfit[m.key];
                                return `<td class="text-end font-bold ${gp >= 0 ? 'text-success' : 'text-danger'}">${cur}${Math.round(gp).toLocaleString()}</td>`;
                            }).join("")}
                            <td class="text-end font-bold text-success" style="font-size: 15px;">
                                ${cur}${Math.round(matrix.totals.grossProfit).toLocaleString()}
                                <div class="font-xs text-muted">Margin: ${matrix.totals.grossMarginPct}%</div>
                            </td>
                        </tr>

                        <!-- 4. OPERATING EXPENSES (KHARASHAADKA HOWLGALKA) -->
                        <tr class="qb-section-head">
                            <td colspan="${months.length + 2}">3. KHARASHAADKA HOWLGALKA (OPERATING EXPENSES)</td>
                        </tr>
                        ${catRows || `<tr><td colspan="${months.length + 2}" class="text-center text-muted p-2">Wax kharash ah lama gelin mudaddan.</td></tr>`}
                        <tr class="qb-row-subtotal">
                            <td>Wadarta Kharashaadka Howlgalka (Total Operating Expenses)</td>
                            ${months.map(m => `<td class="text-end font-bold text-danger">${cur}${Math.round(matrix.totalExpenses[m.key]).toLocaleString()}</td>`).join("")}
                            <td class="text-end font-bold text-danger">${cur}${Math.round(matrix.totals.totalExpenses).toLocaleString()}</td>
                        </tr>

                        <!-- 5. NET PROFIT / LOSS (FAA'IIDADA / QASAARADA SAAFIGA AH) -->
                        <tr class="qb-row-net ${isNetPositive ? 'net-profit-row' : 'net-loss-row'}">
                            <td>
                                <div class="qb-net-title">${isNetPositive ? 'FAA\'IIDADA SAAFIGA AH (NET PROFIT)' : 'QASAARADA SAAFIGA AH (NET LOSS)'}</div>
                                <div class="font-xs text-muted">Faa'iidada Guud − Kharashka Howlgalka (6 Bilood)</div>
                            </td>
                            ${months.map(m => {
                                const net = matrix.netIncome[m.key];
                                return `<td class="text-end font-bold ${net >= 0 ? 'text-success' : 'text-danger'}" style="font-size: 14px;">
                                    ${net < 0 ? '-' : ''}${cur}${Math.abs(Math.round(net)).toLocaleString()}
                                </td>`;
                            }).join("")}
                            <td class="text-end font-bold ${isNetPositive ? 'text-success' : 'text-danger'} qb-net-grand-cell">
                                ${isNetPositive ? '+' : '-'}${cur}${Math.abs(Math.round(matrix.totals.netIncome)).toLocaleString()}
                                <div class="font-xs ${isNetPositive ? 'text-success' : 'text-danger'}">Net Margin: ${matrix.totals.netMarginPct}%</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- QuickBooks Signatures & Certification Footer (for Print) -->
                <div class="qb-signatures">
                    <div class="qb-sig-col">
                        <div class="qb-sig-line"></div>
                        <div class="qb-sig-title">Diyaariyey (Xisaabiye / Accountant)</div>
                        <div class="font-xs text-muted">Taariikhda: ${new Date().toISOString().substring(0, 10)}</div>
                    </div>
                    <div class="qb-sig-col text-center">
                        <div class="qb-stamp-box">Shaabadda Shirkadda (Company Seal)</div>
                    </div>
                    <div class="qb-sig-col text-end">
                        <div class="qb-sig-line"></div>
                        <div class="qb-sig-title">Ansixiyey (Maamulaha Guud / CEO)</div>
                        <div class="font-xs text-muted">${settings.storeName}</div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render the table of recorded expenses with delete & search
     */
    renderExpensesTable() {
        const tbody = document.getElementById("qbExpensesTableBody");
        if (!tbody) return;

        const expenses = StorageService.getExpenses();
        const settings = StorageService.getSettings();
        const currency = settings.currency || "$";

        if (expenses.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center p-3 text-muted">Wax kharash ah ma diiwaangashana. Guji "+ Ku dar Kharash" si aad ugu darto.</td></tr>`;
            return;
        }

        // Sort latest first
        const sorted = [...expenses].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

        tbody.innerHTML = sorted.map(exp => `
            <tr>
                <td class="font-mono text-muted">${exp.id}</td>
                <td><strong>${exp.date || '-'}</strong></td>
                <td><span class="badge badge-info">${exp.categoryName || exp.category}</span></td>
                <td>${exp.notes || '-'}</td>
                <td class="text-end font-bold text-danger">${currency}${parseFloat(exp.amount || 0).toLocaleString()}</td>
                <td class="text-end">
                    <button class="btn btn-xs btn-outline-danger" onclick="QuickBooksModule.deleteExpense('${exp.id}')">
                        🗑️ Tirtir
                    </button>
                </td>
            </tr>
        `).join("");
    },

    // ─── Modal Actions ───
    openAddExpenseModal() {
        const modal = document.getElementById("qbExpenseModal");
        if (!modal) return;

        const catSelect = document.getElementById("qbExpenseCatInput");
        if (catSelect) {
            const categories = StorageService.getExpenseCategories();
            catSelect.innerHTML = categories.map(c => `
                <option value="${c.id}">${c.icon} ${c.name}</option>
            `).join("");
        }

        const dateInput = document.getElementById("qbExpenseDateInput");
        if (dateInput) {
            dateInput.value = new Date().toISOString().substring(0, 10);
        }

        const amountInput = document.getElementById("qbExpenseAmountInput");
        if (amountInput) amountInput.value = "";

        const notesInput = document.getElementById("qbExpenseNotesInput");
        if (notesInput) notesInput.value = "";

        modal.classList.add("active");
    },

    closeAddExpenseModal() {
        const modal = document.getElementById("qbExpenseModal");
        if (modal) modal.classList.remove("active");
    },

    saveExpenseFromForm(e) {
        if (e) e.preventDefault();

        const catSelect = document.getElementById("qbExpenseCatInput");
        const dateInput = document.getElementById("qbExpenseDateInput");
        const amountInput = document.getElementById("qbExpenseAmountInput");
        const notesInput = document.getElementById("qbExpenseNotesInput");

        const categoryId = catSelect ? catSelect.value : "other";
        const catName = catSelect ? catSelect.options[catSelect.selectedIndex].text : "Kharash";
        const date = dateInput ? dateInput.value : new Date().toISOString().substring(0, 10);
        const amount = parseFloat(amountInput ? amountInput.value : 0);
        const notes = notesInput ? notesInput.value.trim() : "";

        if (isNaN(amount) || amount <= 0) {
            App.showToast("Fadlan gali lacag sax ah!", "warning");
            return;
        }

        const expenses = StorageService.getExpenses();
        const nextId = "EXP-" + new Date().getFullYear() + "-" + String(expenses.length + 1).padStart(3, "0");

        expenses.unshift({
            id: nextId,
            date: date,
            category: categoryId,
            categoryName: catName.replace(/^[^\w\s]+\s*/, ''), // clean icon
            amount: amount,
            notes: notes
        });

        StorageService.saveExpenses(expenses);
        this.closeAddExpenseModal();
        this.render();
        App.showToast(`Kharashka $${amount.toLocaleString()} si guul leh ayaa loo diiwaangeliyey!`, "success");
    },

    deleteExpense(id) {
        if (confirm("Ma hubtaa inaad tirtirto kharashkan?")) {
            let expenses = StorageService.getExpenses();
            expenses = expenses.filter(x => x.id !== id);
            StorageService.saveExpenses(expenses);
            this.render();
            App.showToast("Kharashkii waa la tirtiray!", "info");
        }
    },

    toggleSimulatedSales() {
        this.showSimulatedSales = !this.showSimulatedSales;
        const btn = document.getElementById("qbToggleSimBtn");
        if (btn) {
            btn.classList.toggle("btn-warning", this.showSimulatedSales);
            btn.classList.toggle("btn-outline-secondary", !this.showSimulatedSales);
            btn.innerHTML = this.showSimulatedSales 
                ? "⚡ Xogta Tusaalaha ee 6-ka Bilood: <strong>KOR AH (ON)</strong>" 
                : "💡 Daar Xogta Tusaalaha ee 6-ka Bilood (Demo)";
        }
        this.render();
        App.showToast(this.showSimulatedSales 
            ? "Tusaalaha dakhliga 6-ka bilood waa la daaray!" 
            : "Waxaa dib loogu soo celiyey xogta dhabta ah kaliya.", "info");
    },

    printStatement() {
        document.body.classList.add("printing-qb");
        window.print();
        setTimeout(() => {
            document.body.classList.remove("printing-qb");
        }, 1200);
    },

    exportCSV() {
        const matrix = this.computeFinancials();
        const months = matrix.months;
        const cur = matrix.currency;

        const headers = ["Account / Description", ...months.map(m => m.label), "Total 6 Months"];
        const rows = [];

        // 1. Revenue
        rows.push([
            `"Gross Wholesale Sales"`,
            ...months.map(m => matrix.revenue[m.key]),
            matrix.totals.revenue
        ]);
        if (matrix.totals.discount > 0) {
            rows.push([
                `"Discounts Allowed"`,
                ...months.map(m => -matrix.discount[m.key]),
                -matrix.totals.discount
            ]);
        }
        rows.push([
            `"Net Sales Revenue"`,
            ...months.map(m => matrix.netRevenue[m.key]),
            matrix.totals.netRevenue
        ]);

        // 2. COGS
        rows.push([
            `"Cost of Goods Sold (COGS)"`,
            ...months.map(m => matrix.cogs[m.key]),
            matrix.totals.cogs
        ]);

        // 3. Gross Profit
        rows.push([
            `"GROSS PROFIT"`,
            ...months.map(m => matrix.grossProfit[m.key]),
            matrix.totals.grossProfit
        ]);

        // 4. Expenses
        Object.keys(matrix.expensesByCategory).forEach(catId => {
            const cat = matrix.expensesByCategory[catId];
            rows.push([
                `"Operating Expense: ${cat.name}"`,
                ...months.map(m => cat.byMonth[m.key]),
                cat.total
            ]);
        });
        rows.push([
            `"Total Operating Expenses"`,
            ...months.map(m => matrix.totalExpenses[m.key]),
            matrix.totals.totalExpenses
        ]);

        // 5. Net Profit
        rows.push([
            `"NET PROFIT / LOSS"`,
            ...months.map(m => matrix.netIncome[m.key]),
            matrix.totals.netIncome
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `QuickBooks_Profit_Loss_6_Months_${new Date().toISOString().substring(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};
