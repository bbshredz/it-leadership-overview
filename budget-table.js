// ==================== BUDGET PLANNER TABLE VIEW ====================

function initBudgetPlannerTable() {
    renderTableView();
    setupTableControls();
}

let tableComparisonMode = false;

function setupTableControls() {
    // Toggle data sources
    window.toggleDataSources = function() {
        const content = document.getElementById('data-sources-content');
        const toggle = document.getElementById('data-sources-toggle');
        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggle.textContent = 'Hide Details ▲';
        } else {
            content.style.display = 'none';
            toggle.textContent = 'Show Details ▼';
        }
    };

    // Configure Current Budget
    document.getElementById('table-configure-current')?.addEventListener('click', () => {
        openConfigureModal();
    });

    // Add new line item
    document.getElementById('table-add-line-item')?.addEventListener('click', () => {
        openAddItemModal();
    });

    // Load current budget
    document.getElementById('table-load-current')?.addEventListener('click', () => {
        Object.keys(subcategoryData).forEach(categoryKey => {
            Object.keys(subcategoryData[categoryKey]).forEach(subKey => {
                proposedSubBudgets[categoryKey][subKey] = subcategoryData[categoryKey][subKey].current;
            });
        });
        renderTableView();
        alert('📋 Current budget loaded. This shows your actual spending today vs. optimal levels.');
    });

    // Toggle comparison
    document.getElementById('table-compare-toggle')?.addEventListener('click', (e) => {
        tableComparisonMode = !tableComparisonMode;
        e.target.textContent = tableComparisonMode ? '👁️ Hide Current Comparison' : '👁️ Show Current Comparison';
        document.getElementById('table-current-card').style.display = 
            tableComparisonMode ? 'block' : 'none';
        document.getElementById('current-budget-explanation').style.display = 
            tableComparisonMode ? 'block' : 'none';
        renderTableView();
    });

    // Reset to optimal
    document.getElementById('table-reset-optimal')?.addEventListener('click', () => {
        if (confirm('Reset all line items to optimal (sweet spot) levels?')) {
            Object.keys(subcategoryData).forEach(categoryKey => {
                Object.keys(subcategoryData[categoryKey]).forEach(subKey => {
                    proposedSubBudgets[categoryKey][subKey] = subcategoryData[categoryKey][subKey].sweetSpot;
                });
            });
            renderTableView();
        }
    });

    // Save to 2026 Budget
    document.getElementById('table-save-2026')?.addEventListener('click', () => {
        if (confirm('Save this budget configuration as the official 2026 IT Budget?')) {
            // Update the 2026 IT Budget tab with new values
            updateBudgetTab();
            alert('✅ Budget saved! Changes are now reflected in the "2026 IT Budget" tab.');
            document.getElementById('table-save-2026').style.display = 'none';
        }
    });
}

// Function to update the 2026 IT Budget tab with new values
function updateBudgetTab() {
    // Calculate category totals from subcategories
    const categoryTotals = {
        infrastructure: 0,
        personnel: 0,
        software: 0,
        security: 0
    };
    
    Object.keys(subcategoryData).forEach(categoryKey => {
        Object.keys(subcategoryData[categoryKey]).forEach(subKey => {
            categoryTotals[categoryKey] += proposedSubBudgets[categoryKey][subKey];
        });
    });

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    // Update summary cards at top
    const budgetCards = document.querySelectorAll('#profile-budget .budget-card');
    if (budgetCards[0]) { // Total
        const valueDiv = budgetCards[0].querySelector('.budget-card-value');
        if (valueDiv) valueDiv.textContent = `$${(total / 1000000).toFixed(1)}M`;
    }
    if (budgetCards[1]) { // Infrastructure
        const valueDiv = budgetCards[1].querySelector('.budget-card-value');
        if (valueDiv) valueDiv.textContent = `$${(categoryTotals.infrastructure / 1000).toFixed(0)}K`;
        const changeDiv = budgetCards[1].querySelector('.budget-card-change');
        if (changeDiv) changeDiv.textContent = `${Math.round((categoryTotals.infrastructure / total) * 100)}% of budget`;
    }
    if (budgetCards[2]) { // Personnel
        const valueDiv = budgetCards[2].querySelector('.budget-card-value');
        if (valueDiv) valueDiv.textContent = `$${(categoryTotals.personnel / 1000).toFixed(0)}K`;
        const changeDiv = budgetCards[2].querySelector('.budget-card-change');
        if (changeDiv) changeDiv.textContent = `${Math.round((categoryTotals.personnel / total) * 100)}% of budget`;
    }
    if (budgetCards[3]) { // Software
        const valueDiv = budgetCards[3].querySelector('.budget-card-value');
        if (valueDiv) valueDiv.textContent = `$${(categoryTotals.software / 1000).toFixed(0)}K`;
        const changeDiv = budgetCards[3].querySelector('.budget-card-change');
        if (changeDiv) changeDiv.textContent = `${Math.round((categoryTotals.software / total) * 100)}% of budget`;
    }

    // Update category headers in table
    const tableRows = document.querySelectorAll('#profile-budget .budget-table tbody tr');
    tableRows.forEach(row => {
        const categoryCell = row.querySelector('.budget-category');
        if (categoryCell) {
            const text = categoryCell.textContent;
            if (text.includes('Infrastructure & Operations')) {
                categoryCell.textContent = `Infrastructure & Operations — $${(categoryTotals.infrastructure / 1000).toFixed(0)},000`;
            } else if (text.includes('Personnel')) {
                categoryCell.textContent = `Personnel — $${(categoryTotals.personnel / 1000).toFixed(0)},000`;
            } else if (text.includes('Software & Licenses')) {
                categoryCell.textContent = `Software & Licenses — $${(categoryTotals.software / 1000).toFixed(0)},000`;
            } else if (text.includes('Strategic Initiatives')) {
                // Map security to strategic initiatives or keep separate
                categoryCell.textContent = `Strategic Initiatives — $${(categoryTotals.security / 1000).toFixed(0)},000`;
            }
        }
    });

    // Update total row
    const totalRow = document.querySelector('#profile-budget .budget-total-row td:last-child');
    if (totalRow) {
        totalRow.textContent = `$${(total / 1000000).toFixed(1)}M`;
    }

    console.log('✅ Budget tab updated:', {
        total: `$${(total / 1000000).toFixed(1)}M`,
        infrastructure: `$${(categoryTotals.infrastructure / 1000).toFixed(0)}K`,
        personnel: `$${(categoryTotals.personnel / 1000).toFixed(0)}K`,
        software: `$${(categoryTotals.software / 1000).toFixed(0)}K`,
        security: `$${(categoryTotals.security / 1000).toFixed(0)}K`
    });
}

function renderTableView() {
    const tbody = document.getElementById('table-budget-items');
    if (!tbody) return;

    let html = '';
    let totalProposed = 0;
    let totalCurrent = 0;
    let criticalCount = 0;

    // Update table headers if comparison mode
    const thead = tbody.parentElement.querySelector('thead tr');
    if (thead) {
        if (tableComparisonMode) {
            thead.innerHTML = `
                <th>Category</th>
                <th>Description</th>
                <th>Current</th>
                <th>Proposed</th>
            `;
        } else {
            thead.innerHTML = `
                <th>Category</th>
                <th>Description</th>
                <th>Annual Cost</th>
            `;
        }
    }

    Object.keys(subcategoryData).forEach(categoryKey => {
        const category = budgetMarketData[categoryKey];
        let categoryTotal = 0;

        // Category header row
        html += `
            <tr class="category-row">
                <td colspan="${tableComparisonMode ? 4 : 3}">${category.name}</td>
            </tr>
        `;

        // Subcategory rows
        Object.keys(subcategoryData[categoryKey]).forEach(subKey => {
            const subItem = subcategoryData[categoryKey][subKey];
            const value = proposedSubBudgets[categoryKey]?.[subKey] || subItem.sweetSpot;
            const zone = getZone(subItem, value);
            const tags = subItem.tags ? subItem.tags[zone] : [];
            
            categoryTotal += value;
            totalProposed += value;
            totalCurrent += subItem.current;

            // Determine risk class for row styling (proportional zones)
            let riskClass = '';
            const rtvRange = subItem.maxRecommended - subItem.marketLow;
            const rtvPct = rtvRange > 0 ? ((value - subItem.marketLow) / rtvRange) * 100 : 50;
            if (rtvPct < 10) {
                riskClass = 'risk-severe';
                criticalCount++;
            } else if (rtvPct < 20) {
                riskClass = 'risk-critical';
                criticalCount++;
            }

            html += `
                <tr class="subcategory-row ${riskClass}">
                    <td class="category-cell">${subItem.name}</td>
                    <td class="description-cell">
                        <div class="table-description">${getTableDescription(categoryKey, subKey)}</div>
                        <div class="planner-tags-container" id="table-tags-${categoryKey}-${subKey}">
                            ${renderTags(tags, zone)}
                        </div>
                    </td>
                    ${tableComparisonMode ? `
                        <td style="padding: var(--space-3) var(--space-5);">
                            <div style="font-size: 14px; font-weight: 600; color: var(--gray-500);">
                                $${(subItem.current / 1000).toFixed(0)}K
                            </div>
                        </td>
                    ` : ''}
                    <td class="slider-cell">
                        <div class="table-slider-wrapper">
                            <div class="table-slider-container">
                                <input 
                                    type="range" 
                                    class="table-slider" 
                                    id="table-slider-${categoryKey}-${subKey}"
                                    min="${subItem.marketLow}" 
                                    max="${subItem.maxRecommended}" 
                                    value="${value}"
                                    step="5000"
                                    data-category="${categoryKey}"
                                    data-subcategory="${subKey}">
                            </div>
                            <div class="table-value-display" id="table-value-${categoryKey}-${subKey}">
                                $${(value / 1000).toFixed(0)}K
                            </div>
                            <input 
                                type="number" 
                                class="table-manual-input"
                                id="table-manual-${categoryKey}-${subKey}"
                                placeholder="$"
                                data-category="${categoryKey}"
                                data-subcategory="${subKey}">
                        </div>
                    </td>
                </tr>
            `;
        });
    });

    tbody.innerHTML = html;

    // Update summary cards
    updateTableSummary(totalProposed, totalCurrent, criticalCount);

    // Add event listeners
    Object.keys(subcategoryData).forEach(categoryKey => {
        Object.keys(subcategoryData[categoryKey]).forEach(subKey => {
            const slider = document.getElementById(`table-slider-${categoryKey}-${subKey}`);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    updateTableItem(categoryKey, subKey, parseInt(e.target.value));
                });
            }

            const input = document.getElementById(`table-manual-${categoryKey}-${subKey}`);
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const value = parseInt(input.value) * 1000; // Convert K to actual
                        if (!isNaN(value)) {
                            updateTableItem(categoryKey, subKey, value);
                            input.value = '';
                        }
                    }
                });
            }
        });
    });
}

function getTableDescription(categoryKey, subKey) {
    // Check for custom user-added descriptions first
    if (window.customDescriptions && window.customDescriptions[`${categoryKey}-${subKey}`]) {
        return window.customDescriptions[`${categoryKey}-${subKey}`];
    }

    // Check if subcategory has description property
    if (subcategoryData[categoryKey][subKey].description) {
        return subcategoryData[categoryKey][subKey].description;
    }

    // Default descriptions
    const descriptions = {
        infrastructure: {
            network: 'SD-WAN circuits, switches, cabling, bandwidth - all facilities',
            cloud: 'Azure/AWS hosting, data center colocation, cloud storage & compute',
            virtualization: 'Nutanix platform, server hardware, hypervisor licensing (VMware/Hyper-V)',
            hardware: 'Workstations, laptops, tablets, printers, peripheral equipment',
            maintenance: '24/7 vendor support contracts, warranties, professional services'
        },
        personnel: {
            leadership: 'IT Director/VP compensation, benefits, bonuses (Anthony, Geremia)',
            technical: 'Network admins, service delivery specialists, clinical IT staff (Francis, Tom, Rogi)',
            database: 'Database administrator compensation and benefits (Jon)',
            training: 'Certifications (CompTIA, Microsoft, Cisco), conferences, continuing education'
        },
        software: {
            clinical: 'PointClickCare EHR/billing platform and ancillary clinical SaaS subscriptions',
            business: 'ERP (financial/operations), MDM (Jamf/MaaS360), eFax, business applications',
            productivity: 'Microsoft 365 E3/E5 licenses, email, Teams, OneDrive, identity (Azure AD)',
            servicedesk: 'ITSM platform (ticketing, asset management), monitoring tools, AI Tier-0 bot'
        },
        security: {
            infrastructure_security: 'Next-gen firewalls (Fortinet/Palo Alto), network segmentation, Zero Trust components',
            endpoint_security: 'EDR (CrowdStrike/SentinelOne), antivirus, email security (Proofpoint/Mimecast)',
            compliance: 'Audit support, GRC tools, documentation management, consultant fees',
            training_awareness: 'KnowBe4/similar platform, phishing simulations, security awareness campaigns'
        }
    };

    return descriptions[categoryKey]?.[subKey] || '';
}

function updateTableItem(categoryKey, subKey, value) {
    proposedSubBudgets[categoryKey][subKey] = value;

    // Update display
    document.getElementById(`table-value-${categoryKey}-${subKey}`).textContent = 
        `$${(value / 1000).toFixed(0)}K`;

    // Update tags
    const subItem = subcategoryData[categoryKey][subKey];
    const zone = getZone(subItem, value);
    const tags = subItem.tags ? subItem.tags[zone] : [];
    document.getElementById(`table-tags-${categoryKey}-${subKey}`).innerHTML = 
        renderTags(tags, zone);

    // Update row styling based on risk
    const row = document.getElementById(`table-slider-${categoryKey}-${subKey}`)?.closest('tr');
    if (row) {
        row.classList.remove('risk-critical', 'risk-severe');
        const utiRange = subItem.maxRecommended - subItem.marketLow;
        const utiPct = utiRange > 0 ? ((value - subItem.marketLow) / utiRange) * 100 : 50;
        if (utiPct < 10) {
            row.classList.add('risk-severe');
        } else if (utiPct < 20) {
            row.classList.add('risk-critical');
        }
    }

    // Calculate totals and update summary
    let totalProposed = 0;
    let totalCurrent = 0;
    let criticalCount = 0;
    
    Object.keys(subcategoryData).forEach(catKey => {
        Object.keys(subcategoryData[catKey]).forEach(sKey => {
            const val = proposedSubBudgets[catKey][sKey];
            const item = subcategoryData[catKey][sKey];
            totalProposed += val;
            totalCurrent += item.current;
            
            const threshold = (item.marketLow + item.marketMid) / 2;
            if (val < threshold) criticalCount++;
        });
    });

    updateTableSummary(totalProposed, totalCurrent, criticalCount);

    // Show save button
    document.getElementById('table-save-2026').style.display = 'block';
}

function updateTableSummary(totalProposed, totalCurrent, criticalCount) {
    // Update proposed total
    document.getElementById('table-proposed-total').textContent = 
        `$${(totalProposed / 1000000).toFixed(1)}M`;

    // Update current total (if in comparison mode)
    document.getElementById('table-current-total').textContent = 
        `$${(totalCurrent / 1000000).toFixed(1)}M`;

    // Calculate market position (percentile)
    let optimalTotal = 0;
    let lowTotal = 0;
    let highTotal = 0;
    Object.keys(subcategoryData).forEach(catKey => {
        Object.keys(subcategoryData[catKey]).forEach(sKey => {
            const item = subcategoryData[catKey][sKey];
            optimalTotal += item.sweetSpot;
            lowTotal += item.marketLow;
            highTotal += item.maxRecommended;
        });
    });

    const range = highTotal - lowTotal;
    const position = totalProposed - lowTotal;
    const percentile = Math.max(0, Math.min(100, Math.round((position / range) * 100)));

    document.getElementById('table-market-position').textContent = `${percentile}th Percentile`;
    
    let positionLabel = 'Low-Market';
    let positionColor = 'risk-high';
    if (percentile >= 40 && percentile <= 60) {
        positionLabel = 'Mid-Market (Optimal)';
        positionColor = 'risk-low';
    } else if (percentile > 60 && percentile <= 80) {
        positionLabel = 'Above Market';
        positionColor = 'risk-medium';
    } else if (percentile > 80) {
        positionLabel = 'Premium Tier';
        positionColor = 'risk-medium';
    }
    document.getElementById('table-market-detail').textContent = positionLabel;
    
    const marketCard = document.getElementById('table-market-card');
    marketCard.className = `planner-summary-card ${positionColor}`;

    // Update risk assessment
    const totalCard = document.getElementById('table-total-card');
    if (criticalCount > 0) {
        totalCard.className = 'planner-summary-card risk-high';
        document.getElementById('table-proposed-status').textContent = `${criticalCount} areas underfunded`;
    } else if (percentile < 40) {
        totalCard.className = 'planner-summary-card risk-medium';
        document.getElementById('table-proposed-status').textContent = 'Below optimal range';
    } else if (percentile > 80) {
        totalCard.className = 'planner-summary-card risk-medium';
        document.getElementById('table-proposed-status').textContent = 'Above optimal range';
    } else {
        totalCard.className = 'planner-summary-card risk-low';
        document.getElementById('table-proposed-status').textContent = 'Optimal range';
    }

    // Update risk count card
    const riskCard = document.getElementById('table-risk-summary-card');
    if (criticalCount > 5) {
        riskCard.className = 'planner-summary-card risk-high';
        document.getElementById('table-risk-count').textContent = `${criticalCount} Critical`;
        document.getElementById('table-risk-summary').textContent = 'Immediate action required';
    } else if (criticalCount > 0) {
        riskCard.className = 'planner-summary-card risk-medium';
        document.getElementById('table-risk-count').textContent = `${criticalCount} At Risk`;
        document.getElementById('table-risk-summary').textContent = 'Attention needed';
    } else {
        riskCard.className = 'planner-summary-card risk-low';
        document.getElementById('table-risk-count').textContent = '0 Critical';
        document.getElementById('table-risk-summary').textContent = 'All systems nominal';
    }
}

// Initialize table view when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBudgetPlannerTable);
} else {
    initBudgetPlannerTable();
}


// ==================== DYNAMIC BUDGET OVERVIEW (Fix #3) ====================
// Updates the 2026 IT Budget tab dynamically from planner data

function renderBudgetOverview() {
    const budgetSection = document.getElementById('profile-budget');
    if (!budgetSection) return;
    
    // Calculate totals from subcategoryData
    const categoryTotals = { infrastructure: 0, personnel: 0, software: 0, security: 0 };
    const categoryCurrents = { infrastructure: 0, personnel: 0, software: 0, security: 0 };
    
    Object.keys(subcategoryData).forEach(catKey => {
        Object.keys(subcategoryData[catKey]).forEach(subKey => {
            const proposed = proposedSubBudgets[catKey]?.[subKey] || subcategoryData[catKey][subKey].sweetSpot;
            categoryTotals[catKey] += proposed;
            categoryCurrents[catKey] += subcategoryData[catKey][subKey].current;
        });
    });
    
    const totalProposed = Object.values(categoryTotals).reduce((s, v) => s + v, 0);
    const totalCurrent = Object.values(categoryCurrents).reduce((s, v) => s + v, 0);
    
    // Update summary cards
    const budgetCards = budgetSection.querySelectorAll('.budget-card');
    if (budgetCards.length >= 4) {
        const totalVal = budgetCards[0].querySelector('.budget-card-value');
        if (totalVal) totalVal.textContent = '$' + (totalProposed / 1000000).toFixed(2) + 'M';
        
        const catNames = ['infrastructure', 'personnel', 'software', 'security'];
        for (let i = 1; i < Math.min(budgetCards.length, 5); i++) {
            const ck = catNames[i - 1];
            if (!ck || categoryTotals[ck] === undefined) continue;
            
            const val = budgetCards[i].querySelector('.budget-card-value');
            if (val) val.textContent = '$' + (categoryTotals[ck] / 1000).toFixed(0) + 'K';
            
            const change = budgetCards[i].querySelector('.budget-card-change');
            if (change) {
                const diff = categoryTotals[ck] - categoryCurrents[ck];
                const pct = categoryCurrents[ck] > 0 ? ((diff / categoryCurrents[ck]) * 100).toFixed(1) : 0;
                change.textContent = (diff >= 0 ? '↑' : '↓') + ' ' + Math.abs(pct) + '% from current';
                change.className = 'budget-card-change ' + (diff >= 0 ? 'positive' : 'neutral');
            }
        }
    }
    
    // Update table rows
    const tableRows = budgetSection.querySelectorAll('.budget-table tbody tr');
    tableRows.forEach(row => {
        const catCell = row.querySelector('.budget-category');
        if (catCell) {
            const text = catCell.textContent;
            let ck = null;
            if (text.includes('Infrastructure')) ck = 'infrastructure';
            else if (text.includes('Personnel')) ck = 'personnel';
            else if (text.includes('Software')) ck = 'software';
            else if (text.includes('Security')) ck = 'security';
            if (ck && categoryTotals[ck]) {
                const amountCell = row.querySelector('td:last-child');
                if (amountCell) amountCell.textContent = '$' + categoryTotals[ck].toLocaleString();
            }
        }
    });
    
    const totalRow = budgetSection.querySelector('.budget-total-row td:last-child');
    if (totalRow) totalRow.textContent = '$' + totalProposed.toLocaleString();
}

// Trigger renderBudgetOverview when navigating to budget tab
document.querySelectorAll('.nav-button').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.getAttribute('data-profile') === 'budget') {
            setTimeout(renderBudgetOverview, 100);
        }
    });
});

// Initial render after sheets data loads
setTimeout(renderBudgetOverview, 800);
