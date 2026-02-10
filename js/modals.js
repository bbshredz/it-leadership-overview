// ==================== MODAL FUNCTIONS ====================

// Generate smart tags based on item type and category
function generateSmartTags(categoryKey, name, description) {
    const nameLower = name.toLowerCase();
    const descLower = (description || '').toLowerCase();
    const combined = nameLower + ' ' + descLower;

    // Detect item type
    const isHardware = /ups|hardware|server|switch|router|firewall|device|equipment|workstation|laptop|printer/i.test(combined);
    const isSoftware = /software|license|subscription|saas|platform|tool|application/i.test(combined);
    const isPersonnel = /salary|compensation|staff|employee|headcount|hire|contractor/i.test(combined);
    const isService = /service|support|contract|maintenance|warranty|professional services/i.test(combined);
    const isNetwork = /network|bandwidth|circuit|connectivity|internet|wan|lan/i.test(combined);
    const isSecurity = /security|firewall|protection|antivirus|edr|encryption/i.test(combined);

    // Generate contextual tags
    let tags = {
        risk: [],
        caution: [],
        optimal: [],
        premium: [],
        overspend: []
    };

    if (isHardware) {
        tags.risk = ['Inadequate redundancy', 'Equipment failure risk', 'Downtime exposure', 'No spare capacity'];
        tags.caution = ['Basic redundancy', 'Minimal spares', 'Limited lifecycle budget'];
        tags.optimal = ['N+1 redundancy', 'Proper spare pool', 'Reliable operation', 'Lifecycle funded'];
        tags.premium = ['N+2 redundancy', 'Excessive spares', 'Over-spec\'d'];
        tags.overspend = ['Unnecessary redundancy', 'Unused equipment', 'Capital waste', 'Overbuilt'];
    } else if (isSoftware) {
        tags.risk = ['Feature gaps', 'Manual workarounds', 'Productivity loss', 'User frustration'];
        tags.caution = ['Basic features', 'Limited licenses', 'Some manual work'];
        tags.optimal = ['Full feature set', 'Adequate licenses', 'High productivity', 'User satisfaction'];
        tags.premium = ['Advanced features', 'Generous licensing', 'Nice-to-haves'];
        tags.overspend = ['Unused licenses', 'Feature bloat', 'Shelfware', 'Poor utilization'];
    } else if (isPersonnel) {
        tags.risk = ['Below market rate', 'Turnover risk', 'Recruiting difficulty', 'Understaffed'];
        tags.caution = ['Market competitive', 'Adequate staffing', 'Some turnover'];
        tags.optimal = ['Strong compensation', 'Proper staffing', 'Low turnover', 'Attracts talent'];
        tags.premium = ['Above market pay', 'Generous benefits', 'Premium talent'];
        tags.overspend = ['Excessive compensation', 'Overstaffed', 'Margin pressure', 'Unsustainable'];
    } else if (isService) {
        tags.risk = ['Limited support', 'Slow response', 'Extended downtime', 'Warranty gaps'];
        tags.caution = ['Basic support', 'Standard SLAs', 'Some delays'];
        tags.optimal = ['24/7 support', 'Fast response', 'Vendor partnership', 'Minimal downtime'];
        tags.premium = ['White-glove service', 'Dedicated support', 'Premium SLAs'];
        tags.overspend = ['Redundant contracts', 'Overlapping support', 'Excessive coverage'];
    } else if (isNetwork) {
        tags.risk = ['Bandwidth constraints', 'Poor performance', 'Can\'t support growth', 'User complaints'];
        tags.caution = ['Adequate bandwidth', 'Some congestion', 'Limited headroom'];
        tags.optimal = ['Ample bandwidth', 'Good performance', 'Growth ready', 'User satisfaction'];
        tags.premium = ['Premium bandwidth', 'Maximum performance', 'Excess capacity'];
        tags.overspend = ['Unused bandwidth', 'Over-provisioned', 'Poor ROI'];
    } else if (isSecurity) {
        tags.risk = ['Security gaps', 'Breach exposure', 'Compliance risk', 'Inadequate protection'];
        tags.caution = ['Basic protection', 'Compliance maintained', 'Some gaps'];
        tags.optimal = ['Strong security', 'Proactive defense', 'Compliance solid', 'Low risk'];
        tags.premium = ['Maximum security', 'Advanced threat protection', 'Extensive coverage'];
        tags.overspend = ['Security theater', 'Overlapping tools', 'Diminishing returns'];
    } else {
        // Generic fallback for unknown types
        tags.risk = ['Underfunded', 'Service gaps', 'Operational risk', 'Limited capability'];
        tags.caution = ['Baseline functional', 'Some limitations', 'Growth constrained'];
        tags.optimal = ['Well-funded', 'Reliable service', 'Supports growth', 'Best value'];
        tags.premium = ['Premium tier', 'Advanced features', 'Excess capacity'];
        tags.overspend = ['Overbuilt', 'Underutilized', 'Poor ROI', 'Budget waste'];
    }

    return tags;
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('config-modal')) {
        e.target.classList.remove('active');
    }
});

function openConfigureModal() {
    const modal = document.getElementById('configure-current-modal');
    const form = document.getElementById('current-budget-form');
    
    let html = '';
    Object.keys(subcategoryData).forEach(categoryKey => {
        html += `<div style="margin-bottom: var(--space-6);"><h3 style="font-size: 16px; font-weight: 700; color: var(--navy-900); margin-bottom: var(--space-4); padding-bottom: var(--space-3); border-bottom: 2px solid var(--navy-800);">${budgetMarketData[categoryKey].name}</h3>`;
        
        Object.keys(subcategoryData[categoryKey]).forEach(subKey => {
            const subItem = subcategoryData[categoryKey][subKey];
            html += `
                <div class="config-item">
                    <div class="config-item-label">${subItem.name}</div>
                    <input 
                        type="number" 
                        class="config-item-input" 
                        id="current-${categoryKey}-${subKey}"
                        value="${subItem.current}"
                        min="0"
                        placeholder="Current spending">
                </div>
            `;
        });
        
        html += '</div>';
    });
    
    form.innerHTML = html;
    modal.classList.add('active');
}

window.closeConfigureModal = function() {
    document.getElementById('configure-current-modal').classList.remove('active');
};

// FIX: saveCurrentBudget now writes to Google Sheets
window.saveCurrentBudget = async function() {
    // 1. Update in-memory values
    Object.keys(subcategoryData).forEach(categoryKey => {
        Object.keys(subcategoryData[categoryKey]).forEach(subKey => {
            const input = document.getElementById(`current-${categoryKey}-${subKey}`);
            if (input) {
                subcategoryData[categoryKey][subKey].current = parseInt(input.value) || 0;
            }
        });
    });

    // 2. Also update parent category current totals
    Object.keys(budgetMarketData).forEach(categoryKey => {
        let categoryTotal = 0;
        if (subcategoryData[categoryKey]) {
            Object.keys(subcategoryData[categoryKey]).forEach(subKey => {
                categoryTotal += subcategoryData[categoryKey][subKey].current;
            });
        }
        budgetMarketData[categoryKey].current = categoryTotal;
    });
    
    // 3. Close modal
    closeConfigureModal();

    // 4. Save to Google Sheets
    const saved = await saveBudgetToSheets();

    if (saved) {
        alert('✅ Current budget values saved to Google Sheets!\n\nUse "Load Current Budget" to apply these values as proposed, or "Show Current Comparison" to see the gap.');
    } else {
        alert('✅ Current budget values saved locally.\n\nSign in with Google to sync to Sheets.\nUse "Load Current Budget" to apply these values.');
    }

    // 5. Re-render if comparison mode is on
    if (typeof renderTableView === 'function') {
        renderTableView();
    }
};

function openAddItemModal() {
    const modal = document.getElementById('add-item-modal');
    modal.classList.add('active');
    
    // Add click listener to submit button instead of form submit
    const submitBtn = document.getElementById('submit-new-line-item');
    submitBtn.onclick = async function() {
        const categoryKey = document.getElementById('new-item-category').value;
        const name = document.getElementById('new-item-name').value;
        const currentValue = parseInt(document.getElementById('new-item-current').value) || 0;
        const proposed = parseInt(document.getElementById('new-item-proposed').value);
        const description = document.getElementById('new-item-description').value || name;

        console.log('Button clicked:', { categoryKey, name, currentValue, proposed, description });

        if (!categoryKey) {
            alert('Please select a category');
            return;
        }
        
        if (!name) {
            alert('Please enter a line item name');
            return;
        }
        
        if (!proposed || proposed <= 0) {
            alert('Please enter a valid proposed cost');
            return;
        }

        // Create new subcategory with intelligent tag generation
        const newKey = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        
        // Check if key already exists
        if (subcategoryData[categoryKey] && subcategoryData[categoryKey][newKey]) {
            if (!confirm(`A line item with this name already exists. Overwrite it?`)) {
                return;
            }
        }

        // Ensure subcategoryData[categoryKey] exists
        if (!subcategoryData[categoryKey]) {
            subcategoryData[categoryKey] = {};
        }

        // Auto-generate market ranges with proposed as sweet spot
        subcategoryData[categoryKey][newKey] = {
            name: name,
            current: currentValue || Math.round(proposed * 0.70),
            marketLow: Math.round(proposed * 0.75),
            marketMid: Math.round(proposed * 0.90),
            sweetSpot: proposed,
            marketHigh: Math.round(proposed * 1.15),
            maxRecommended: Math.round(proposed * 1.35),
            description: description,
            tags: generateSmartTags(categoryKey, name, description)
        };

        // Initialize proposedSubBudgets[categoryKey] if needed
        if (!proposedSubBudgets[categoryKey]) {
            proposedSubBudgets[categoryKey] = {};
        }

        proposedSubBudgets[categoryKey][newKey] = proposed;

        // Store custom description
        if (!window.customDescriptions) window.customDescriptions = {};
        window.customDescriptions[`${categoryKey}-${newKey}`] = description;

        console.log('Line item added successfully');

        // Close modal and refresh
        closeAddItemModal();
        renderTableView();

        // FIX: Save to Google Sheets after adding line item
        await saveBudgetToSheets();
        
        alert(`✅ Added "${name}" to ${budgetMarketData[categoryKey].name} and saved to Google Sheets.\n\nNew line item appears at the bottom of the ${budgetMarketData[categoryKey].name} section.`);
    };
}

window.closeAddItemModal = function() {
    const modal = document.getElementById('add-item-modal');
    modal.classList.remove('active');
    
    // Reset form
    const form = modal.querySelector('form');
    if (form) form.reset();
    
    // Clear individual fields as backup
    document.getElementById('new-item-category').value = '';
    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-current').value = '';
    document.getElementById('new-item-proposed').value = '';
    document.getElementById('new-item-description').value = '';
};
