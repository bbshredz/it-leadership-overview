// ==================== BUDGET PLANNER ====================

// ==================== SAVE BUDGET TO GOOGLE SHEETS ====================
// This was MISSING — budget had loadBudgetFromSheets but no save counterpart

async function saveBudgetToSheets() {
    console.log('💾 Saving budget data to Google Sheets...');

    // 1. Build category-level rows
    const categoryRows = [['category_id', 'name', 'current', 'market_low', 'market_mid', 'market_high', 'sweet_spot', 'max_recommended']];
    Object.keys(budgetMarketData).forEach(id => {
        const d = budgetMarketData[id];
        categoryRows.push([
            id,
            d.name,
            d.current,
            d.marketLow,
            d.marketMid,
            d.marketHigh,
            d.sweetSpot,
            d.maxRecommended
        ]);
    });

    // 2. Build subcategory-level rows
    const subRows = [['parent_category', 'subcategory_id', 'name', 'current', 'market_low', 'market_mid', 'market_high', 'sweet_spot', 'max_recommended']];
    Object.keys(subcategoryData).forEach(parent => {
        Object.keys(subcategoryData[parent]).forEach(id => {
            const d = subcategoryData[parent][id];
            subRows.push([
                parent,
                id,
                d.name,
                d.current,
                d.marketLow,
                d.marketMid,
                d.marketHigh,
                d.sweetSpot,
                d.maxRecommended
            ]);
        });
    });

    // 3. Build proposed budget rows (separate sheet for what the user has configured)
    const proposedRows = [['parent_category', 'subcategory_id', 'proposed_value']];
    Object.keys(proposedSubBudgets).forEach(parent => {
        Object.keys(proposedSubBudgets[parent]).forEach(id => {
            proposedRows.push([parent, id, proposedSubBudgets[parent][id]]);
        });
    });

    const catSuccess = await writeToSheet('budget_categories', categoryRows);
    const subSuccess = await writeToSheet('budget_subcategories', subRows);
    const propSuccess = await writeToSheet('budget_proposed', proposedRows);

    if (catSuccess && subSuccess && propSuccess) {
        console.log('✅ Budget data saved to Google Sheets (categories + subcategories + proposed)');
        showSaveNotification('Budget saved to Google Sheets');
        return true;
    } else if (catSuccess || subSuccess || propSuccess) {
        console.log('⚠️ Partial budget save — some sheets updated');
        showSaveNotification('Partially saved');
        return true;
    } else {
        console.log('💾 Saved to browser (sign in to sync with Google Sheets)');
        showSaveNotification('Saved locally');
        return false;
    }
}

// Make globally accessible
window.saveBudgetToSheets = saveBudgetToSheets;


// ==================== LOAD BUDGET FROM GOOGLE SHEETS ====================

async function loadBudgetFromSheets() {
    console.log('📥 Loading budget data from Google Sheets...');
    
    const categoriesData = await readFromSheet('budget_categories');
    const subcategoriesData = await readFromSheet('budget_subcategories');
    const proposedData = await readFromSheet('budget_proposed');
    
    if (categoriesData && categoriesData.length > 1) {
        // Parse categories: category_id | name | current | market_low | market_mid | market_high | sweet_spot | max_recommended
        for (let i = 1; i < categoriesData.length; i++) {
            const [id, name, current, marketLow, marketMid, marketHigh, sweetSpot, maxRecommended] = categoriesData[i];
            if (id && budgetMarketData[id]) {
                budgetMarketData[id].current = parseFloat(current) || budgetMarketData[id].current;
                budgetMarketData[id].marketLow = parseFloat(marketLow) || budgetMarketData[id].marketLow;
                budgetMarketData[id].marketMid = parseFloat(marketMid) || budgetMarketData[id].marketMid;
                budgetMarketData[id].marketHigh = parseFloat(marketHigh) || budgetMarketData[id].marketHigh;
                budgetMarketData[id].sweetSpot = parseFloat(sweetSpot) || budgetMarketData[id].sweetSpot;
                budgetMarketData[id].maxRecommended = parseFloat(maxRecommended) || budgetMarketData[id].maxRecommended;
            }
        }
        console.log('✅ Budget categories loaded from Google Sheets');
    }
    
    if (subcategoriesData && subcategoriesData.length > 1) {
        // Parse subcategories: parent_category | subcategory_id | name | current | market_low | market_mid | market_high | sweet_spot | max_recommended
        for (let i = 1; i < subcategoriesData.length; i++) {
            const [parent, id, name, current, marketLow, marketMid, marketHigh, sweetSpot, maxRecommended] = subcategoriesData[i];
            if (parent && id && subcategoryData[parent] && subcategoryData[parent][id]) {
                subcategoryData[parent][id].current = parseFloat(current) || subcategoryData[parent][id].current;
                subcategoryData[parent][id].marketLow = parseFloat(marketLow) || subcategoryData[parent][id].marketLow;
                subcategoryData[parent][id].marketMid = parseFloat(marketMid) || subcategoryData[parent][id].marketMid;
                subcategoryData[parent][id].marketHigh = parseFloat(marketHigh) || subcategoryData[parent][id].marketHigh;
                subcategoryData[parent][id].sweetSpot = parseFloat(sweetSpot) || subcategoryData[parent][id].sweetSpot;
                subcategoryData[parent][id].maxRecommended = parseFloat(maxRecommended) || subcategoryData[parent][id].maxRecommended;
            }
        }
        console.log('✅ Budget subcategories loaded from Google Sheets');
    }

    // Load proposed values if they exist
    if (proposedData && proposedData.length > 1) {
        for (let i = 1; i < proposedData.length; i++) {
            const [parent, id, proposed] = proposedData[i];
            if (parent && id && proposedSubBudgets[parent]) {
                proposedSubBudgets[parent][id] = parseFloat(proposed) || proposedSubBudgets[parent][id];
            }
        }
        console.log('✅ Proposed budget values loaded from Google Sheets');
    }
    
    // Refresh budget displays if they're visible
    if (document.getElementById('budget-line-items')) {
        renderBudgetItems();
        updateSummary();
    }
}


// ==================== MARKET DATA ====================

// Market data for SNF/Post-Acute IT in Orange County, CA
const budgetMarketData = {
    infrastructure: {
        name: 'Infrastructure & Operations',
        current: 650000,
        marketLow: 720000,
        marketMid: 840000,
        marketHigh: 980000,
        sweetSpot: 860000,
        maxRecommended: 1050000,
        impacts: {
            low: '⚠️ RISK: Aging infrastructure, frequent outages, inability to support growth. Technical debt accumulates. Security vulnerabilities increase. Staff frustration high.',
            mid: '✓ ADEQUATE: Baseline operations maintained. Some modernization possible. Can support current facilities but growth limited.',
            sweet: '⭐ OPTIMAL: Modern, scalable infrastructure. Zero-downtime operations. Ready for rapid expansion. Best cost-to-value ratio.',
            high: '💰 PREMIUM: Top-tier infrastructure. Maximum redundancy. May exceed current needs. Consider if rapid growth is certain.',
            excessive: '⚠️ OVERSPEND: Diminishing returns. Resources better allocated elsewhere. Gold-plating beyond organizational needs.'
        }
    },
    personnel: {
        name: 'Personnel & Team',
        current: 840000,
        marketLow: 880000,
        marketMid: 960000,
        marketHigh: 1100000,
        sweetSpot: 980000,
        maxRecommended: 1150000,
        impacts: {
            low: '⚠️ RISK: Below-market compensation causes turnover. Difficulty attracting talent. Understaffing leads to burnout. Knowledge loss during transitions.',
            mid: '✓ ADEQUATE: Competitive salaries. Team stability maintained. Limited training budget. Some turnover expected.',
            sweet: '⭐ OPTIMAL: Premium talent retention. Continuous training investment. Low turnover. Team grows with organization.',
            high: '💰 PREMIUM: Top-tier compensation. Excellent training programs. Very low turnover. May exceed market needs.',
            excessive: '⚠️ OVERSPEND: Compensation significantly above market. ROI diminishes. Budget better spent on tools/infrastructure.'
        }
    },
    software: {
        name: 'Software & Licenses',
        current: 320000,
        marketLow: 420000,
        marketMid: 480000,
        marketHigh: 580000,
        sweetSpot: 500000,
        maxRecommended: 650000,
        impacts: {
            low: '⚠️ RISK: Missing critical tools. Manual processes. Compliance gaps. Shadow IT emerges. Productivity suffers.',
            mid: '✓ ADEQUATE: Core systems covered. Some automation. Basic productivity tools. Compliance maintained.',
            sweet: '⭐ OPTIMAL: Best-in-class tools. Full automation. AI-powered efficiency. Strong competitive advantage.',
            high: '💰 PREMIUM: Enterprise-grade everything. Maximum automation. Cutting-edge AI. May exceed needs.',
            excessive: '⚠️ OVERSPEND: Tool bloat. License waste. Features unused. Complexity without benefit.'
        }
    },
    security: {
        name: 'Security & Compliance',
        current: 90000,
        marketLow: 180000,
        marketMid: 240000,
        marketHigh: 320000,
        sweetSpot: 260000,
        maxRecommended: 380000,
        impacts: {
            low: '🚨 CRITICAL: Severe breach risk. Regulatory non-compliance. Inadequate monitoring. Potential fines. Reputation damage.',
            mid: '✓ ADEQUATE: Basic security posture. Compliance maintained. Some gaps remain. Incident response possible.',
            sweet: '⭐ OPTIMAL: Enterprise-grade security. Zero-trust architecture. Proactive threat hunting. Insurance discounts.',
            high: '💰 PREMIUM: Maximum security controls. 24/7 SOC. Advanced threat intelligence. May exceed SNF risk profile.',
            excessive: '⚠️ OVERSPEND: Over-engineered for healthcare setting. Budget better spent on operational improvements.'
        }
    }
};

let proposedBudget = {};
let proposedSubBudgets = {};
let comparisonMode = false;
let granularView = false;

// Granular subcategories with tag-based impacts
const subcategoryData = {
    infrastructure: {
        network: {
            name: 'Network & Connectivity',
            current: 140000,
            marketLow: 160000,
            marketMid: 180000,
            sweetSpot: 185000,
            marketHigh: 210000,
            maxRecommended: 240000,
            tags: {
                risk: ['Frequent outages', 'Slow connectivity', 'Can\'t support growth', 'User complaints'],
                caution: ['Baseline reliable', 'Limited bandwidth', 'Growth constrained'],
                optimal: ['99.9% uptime', '10Gb backbone', 'Expansion ready', 'High satisfaction'],
                premium: ['Maximum redundancy', 'Future-proofed', 'Premium SLAs'],
                overspend: ['Unused capacity', 'Over-engineered', 'Wasted budget']
            }
        },
        cloud: {
            name: 'Cloud & Data Center',
            current: 190000,
            marketLow: 210000,
            marketMid: 240000,
            sweetSpot: 245000,
            marketHigh: 280000,
            maxRecommended: 330000,
            tags: {
                risk: ['Performance issues', 'Limited scaling', 'High $/unit', 'Technical debt'],
                caution: ['Baseline capacity', 'Manual scaling', 'Cost concerns'],
                optimal: ['Auto-scaling', 'Cost optimized', 'Predictable spend', 'Growth ready'],
                premium: ['Premium tiers', 'Reserved capacity', 'Global availability'],
                overspend: ['Over-provisioned', 'Underutilized', 'Poor ROI']
            }
        },
        virtualization: {
            name: 'Virtualization & Servers',
            current: 95000,
            marketLow: 110000,
            marketMid: 120000,
            sweetSpot: 125000,
            marketHigh: 145000,
            maxRecommended: 170000,
            tags: {
                risk: ['Aging hardware', 'Limited redundancy', 'Recovery risk', 'Bottlenecks'],
                caution: ['Basic HA', 'Older platform', 'Manual failover'],
                optimal: ['Modern Nutanix', 'Full HA', 'Fast recovery', 'Capacity buffer'],
                premium: ['Latest hardware', 'Maximum resilience', 'Premium support'],
                overspend: ['Over-spec\'d', 'Expensive licensing', 'Idle capacity']
            }
        },
        hardware: {
            name: 'Hardware & Endpoints',
            current: 130000,
            marketLow: 120000,
            marketMid: 150000,
            sweetSpot: 155000,
            marketHigh: 180000,
            maxRecommended: 210000,
            tags: {
                risk: ['Aging devices', 'Slow systems', 'Support issues', 'Security risk'],
                caution: ['Mixed fleet', 'Some old devices', 'Basic standards'],
                optimal: ['3-4yr lifecycle', 'Standardized', 'User productive', 'Secure'],
                premium: ['Premium devices', 'Short lifecycle', 'Top specs'],
                overspend: ['Excessive refresh', 'Over-spec\'d', 'Budget waste']
            }
        },
        maintenance: {
            name: 'Maintenance & Support',
            current: 95000,
            marketLow: 120000,
            marketMid: 150000,
            sweetSpot: 150000,
            marketHigh: 165000,
            maxRecommended: 200000,
            tags: {
                risk: ['Expired warranties', 'No support', 'Slow repairs', 'Downtime risk'],
                caution: ['Basic support', 'Business hours only', 'Some gaps'],
                optimal: ['24/7 coverage', 'Fast response', 'Vendor partnerships', 'Reliable'],
                premium: ['White-glove service', 'Dedicated TAMs', 'Premium SLAs'],
                overspend: ['Redundant contracts', 'Overlapping coverage', 'Overbuilt']
            }
        }
    },
    personnel: {
        leadership: {
            name: 'Leadership (Anthony, Geremia)',
            current: 310000,
            marketLow: 340000,
            marketMid: 380000,
            sweetSpot: 390000,
            marketHigh: 430000,
            maxRecommended: 480000,
            tags: {
                risk: ['Below market', 'Flight risk', 'Can\'t attract talent', 'Morale issues'],
                caution: ['Market competitive', 'Stable but watchful', 'Limited growth room'],
                optimal: ['Above market', 'Strong retention', 'Talent magnet', 'Low flight risk'],
                premium: ['Top 10% comp', 'Excellent benefits', 'Golden handcuffs'],
                overspend: ['Significantly above market', 'Diminishing ROI', 'Budget pressure']
            }
        },
        technical: {
            name: 'Technical Staff (Francis, Tom, Rogi)',
            current: 360000,
            marketLow: 350000,
            marketMid: 400000,
            sweetSpot: 405000,
            marketHigh: 450000,
            maxRecommended: 500000,
            tags: {
                risk: ['Below market', 'High turnover risk', 'Can\'t backfill', 'Knowledge loss'],
                caution: ['Market rate', 'Adequate', 'Some turnover expected'],
                optimal: ['Competitive pay', 'Good benefits', 'Team stability', 'Retention strong'],
                premium: ['Premium compensation', 'Top talent retained', 'Recruiting advantage'],
                overspend: ['Well above market', 'Unsustainable', 'Budget strain']
            }
        },
        database: {
            name: 'Database Admin (Jon)',
            current: 110000,
            marketLow: 110000,
            marketMid: 120000,
            sweetSpot: 125000,
            marketHigh: 140000,
            maxRecommended: 160000,
            tags: {
                risk: ['Below market', 'Flight risk', 'Hard to replace', 'Specialized skill'],
                caution: ['At market', 'Adequate', 'Monitor satisfaction'],
                optimal: ['Above market', 'Strong retention', 'Skill investment', 'Career path'],
                premium: ['Top compensation', 'Extensive training', 'Specialized certs'],
                overspend: ['Significantly above market', 'Diminishing returns']
            }
        },
        training: {
            name: 'Training & Development',
            current: 60000,
            marketLow: 80000,
            marketMid: 60000,
            sweetSpot: 60000,
            marketHigh: 80000,
            maxRecommended: 110000,
            tags: {
                risk: ['No certifications', 'Stale skills', 'Can\'t adopt new tech', 'Team stagnation'],
                caution: ['Basic training', 'Some certs', 'Limited conferences'],
                optimal: ['Regular certs', 'Conferences', 'Skill growth', 'Team advancement'],
                premium: ['Premium programs', 'Executive coaching', 'Full cert coverage'],
                overspend: ['Excessive programs', 'Time away from work', 'Diminishing returns']
            }
        }
    },
    software: {
        clinical: {
            name: 'Clinical Systems (PCC)',
            current: 140000,
            marketLow: 170000,
            marketMid: 180000,
            sweetSpot: 185000,
            marketHigh: 210000,
            maxRecommended: 250000,
            tags: {
                risk: ['Limited modules', 'Manual workflows', 'Integration gaps', 'User frustration'],
                caution: ['Core modules only', 'Some automation', 'Basic integrations'],
                optimal: ['Full module suite', 'Automated workflows', 'Strong integrations', 'User satisfaction'],
                premium: ['Premium modules', 'Advanced analytics', 'Custom development'],
                overspend: ['Unused features', 'Over-licensed', 'Shelfware']
            }
        },
        business: {
            name: 'Business Systems (ERP, MDM)',
            current: 85000,
            marketLow: 110000,
            marketMid: 120000,
            sweetSpot: 125000,
            marketHigh: 140000,
            maxRecommended: 170000,
            tags: {
                risk: ['Legacy systems', 'Manual processes', 'Error-prone', 'Inefficiency'],
                caution: ['Basic automation', 'Some integration', 'Manual workarounds'],
                optimal: ['Modern platforms', 'Fully automated', 'Integrated', 'Efficient'],
                premium: ['Enterprise features', 'Advanced workflows', 'Premium support'],
                overspend: ['Over-engineered', 'Complex licensing', 'Poor utilization']
            }
        },
        productivity: {
            name: 'Microsoft 365 & Productivity',
            current: 72000,
            marketLow: 85000,
            marketMid: 96000,
            sweetSpot: 98000,
            marketHigh: 115000,
            maxRecommended: 135000,
            tags: {
                risk: ['Basic licenses', 'Limited collaboration', 'Security gaps', 'Productivity loss'],
                caution: ['E1/E3 licenses', 'Basic collaboration', 'Some security'],
                optimal: ['E3/E5 licenses', 'Full collaboration', 'Security included', 'High productivity'],
                premium: ['E5 universal', 'Premium features', 'Advanced security'],
                overspend: ['Unused premium features', 'Over-licensed users']
            }
        },
        servicedesk: {
            name: 'Service Desk & ITSM',
            current: 23000,
            marketLow: 40000,
            marketMid: 48000,
            sweetSpot: 50000,
            marketHigh: 60000,
            maxRecommended: 75000,
            tags: {
                risk: ['Manual ticketing', 'No automation', 'Slow response', 'User dissatisfaction'],
                caution: ['Basic ITSM', 'Limited automation', 'Some delays'],
                optimal: ['Modern ITSM', 'AI Tier-0', 'Fast resolution', 'User satisfaction'],
                premium: ['Enterprise platform', 'Full automation', 'Premium features'],
                overspend: ['Platform underutilized', 'Overbuilt for size']
            }
        }
    },
    security: {
        infrastructure_security: {
            name: 'Infrastructure Security',
            current: 35000,
            marketLow: 70000,
            marketMid: 90000,
            sweetSpot: 95000,
            marketHigh: 110000,
            maxRecommended: 135000,
            tags: {
                risk: ['Basic firewalls', 'No segmentation', 'Limited monitoring', 'Breach risk'],
                caution: ['Standard firewalls', 'Some segmentation', 'Basic monitoring'],
                optimal: ['Next-gen firewalls', 'Zero trust ready', 'Full monitoring', 'Protected'],
                premium: ['Advanced threat protection', '24/7 SOC', 'Threat intelligence'],
                overspend: ['Over-engineered', 'Redundant systems', 'Complex management']
            }
        },
        endpoint_security: {
            name: 'Endpoint & Email Security',
            current: 28000,
            marketLow: 55000,
            marketMid: 72000,
            sweetSpot: 75000,
            marketHigh: 90000,
            maxRecommended: 115000,
            tags: {
                risk: ['Basic antivirus', 'No EDR', 'Phishing risk', 'Ransomware exposure'],
                caution: ['Standard AV', 'Basic email filtering', 'Some protection'],
                optimal: ['EDR deployed', 'Email protection', 'Threat hunting', 'Secure endpoints'],
                premium: ['XDR platform', 'Advanced email security', 'Behavioral analysis'],
                overspend: ['Overlapping tools', 'Complex stack', 'Management overhead']
            }
        },
        compliance: {
            name: 'Compliance & Auditing',
            current: 15000,
            marketLow: 30000,
            marketMid: 42000,
            sweetSpot: 45000,
            marketHigh: 60000,
            maxRecommended: 80000,
            tags: {
                risk: ['Manual compliance', 'Audit gaps', 'Fine risk', 'Reputation risk'],
                caution: ['Basic compliance', 'Manual processes', 'Some gaps'],
                optimal: ['Automated compliance', 'Audit ready', 'Documentation current', 'Low risk'],
                premium: ['Continuous compliance', 'Advanced GRC platform', 'Consultant support'],
                overspend: ['Excessive auditing', 'Consultant overuse', 'Diminishing returns']
            }
        },
        training_awareness: {
            name: 'Security Training & Awareness',
            current: 12000,
            marketLow: 25000,
            marketMid: 36000,
            sweetSpot: 35000,
            marketHigh: 45000,
            maxRecommended: 60000,
            tags: {
                risk: ['No training', 'User errors common', 'Phishing success', 'Weak link'],
                caution: ['Annual training', 'Basic awareness', 'Some progress'],
                optimal: ['Regular training', 'Simulated phishing', 'Security culture', 'Human firewall'],
                premium: ['Executive coaching', 'Advanced simulations', 'Gamification'],
                overspend: ['Excessive training', 'Diminishing engagement', 'Time waste']
            }
        }
    }
};

function initBudgetPlanner() {
    // Initialize with optimal (sweet spot) values
    Object.keys(budgetMarketData).forEach(key => {
        proposedBudget[key] = budgetMarketData[key].sweetSpot;
        
        // Initialize subcategories
        if (subcategoryData[key]) {
            proposedSubBudgets[key] = {};
            Object.keys(subcategoryData[key]).forEach(subKey => {
                proposedSubBudgets[key][subKey] = subcategoryData[key][subKey].sweetSpot;
            });
        }
    });

    renderBudgetItems();
    updateSummary();
    setupBudgetControls();
}

function renderBudgetItems() {
    const container = document.getElementById('budget-line-items');
    if (!container) return;

    container.innerHTML = Object.keys(budgetMarketData).map(key => {
        const item = budgetMarketData[key];
        const value = proposedBudget[key] || item.sweetSpot;
        const zone = getZone(item, value);
        const tags = budgetMarketData[key].tags ? budgetMarketData[key].tags[zone] : [];
        
        let html = `
            <div class="planner-category" data-category="${key}">
                <div class="planner-category-header">
                    <div class="planner-category-title">${item.name}</div>
                    <div class="planner-category-value">$${(value / 1000).toFixed(0)}K</div>
                </div>
                <div class="planner-impact">${getImpactText(key, value)}</div>
                ${renderTags(tags, zone)}
                <div class="planner-slider-wrapper">
                    <div class="planner-slider-sweetspot" style="left: ${((item.sweetSpot - item.marketLow) / (item.maxRecommended - item.marketLow)) * 100}%"></div>
                    <input type="range" 
                        class="planner-slider" 
                        id="slider-${key}"
                        min="${item.marketLow}" 
                        max="${item.maxRecommended}" 
                        value="${value}"
                        data-category="${key}">
                    <div class="planner-slider-labels">
                        <span>$${(item.marketLow / 1000).toFixed(0)}K</span>
                        ${comparisonMode ? `<span class="planner-current-marker">Current: $${(item.current / 1000).toFixed(0)}K</span>` : ''}
                        <span>$${(item.maxRecommended / 1000).toFixed(0)}K</span>
                    </div>
                </div>
                <div class="planner-risk-row">
                    ${getRiskIndicator(key, value)}
                    <span class="planner-market-position">Market: $${(item.marketMid / 1000).toFixed(0)}K mid</span>
                </div>
                <div class="planner-manual-input">
                    <label style="font-size: 13px; font-weight: 600; color: var(--gray-600);">Manual Entry:</label>
                    <input 
                        type="number" 
                        id="manual-${key}"
                        placeholder="Enter amount"
                        data-item="${key}">
                    <button class="kanban-btn" onclick="applyManualValue('${key}')">Apply</button>
                </div>
        `;

        // Add granular subcategories if enabled
        if (granularView && subcategoryData[key]) {
            html += `<div class="planner-subcategories" id="subcategories-${key}">`;
            
            Object.keys(subcategoryData[key]).forEach(subKey => {
                const subItem = subcategoryData[key][subKey];
                const subValue = proposedSubBudgets[key][subKey] || subItem.sweetSpot;
                const subZone = getZone(subItem, subValue);
                const subTags = subItem.tags ? subItem.tags[subZone] : [];
                
                html += `
                    <div class="planner-subcategory-item">
                        <div class="planner-subcategory-header">
                            <div class="planner-subcategory-title">${subItem.name}</div>
                            <div class="planner-subcategory-actions">
                                <button class="planner-icon-btn" onclick="editSubcategory('${key}', '${subKey}')" title="Edit">✏️</button>
                                <button class="planner-icon-btn danger" onclick="removeSubcategory('${key}', '${subKey}')" title="Remove">🗑️</button>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3);">
                            <span style="font-size: 18px; font-weight: 700; color: var(--navy-900);">$${(subValue / 1000).toFixed(0)}K</span>
                            <span class="planner-risk-indicator ${subZone}">${subZone.toUpperCase()}</span>
                        </div>
                        ${renderTags(subTags, subZone)}
                        <div class="planner-slider-wrapper" style="margin-top: var(--space-3);">
                            <div class="planner-slider-sweetspot" style="left: ${((subItem.sweetSpot - subItem.marketLow) / (subItem.maxRecommended - subItem.marketLow)) * 100}%"></div>
                            <input type="range" 
                                class="planner-slider subcategory-slider" 
                                id="sub-slider-${key}-${subKey}"
                                min="${subItem.marketLow}" 
                                max="${subItem.maxRecommended}" 
                                value="${subValue}"
                                data-category="${key}"
                                data-subcategory="${subKey}">
                        </div>
                    </div>
                `;
            });
            
            // Add subcategory button
            html += `
                <div class="planner-add-subcategory">
                    <button class="kanban-btn" onclick="showAddForm('${key}')">+ Add Line Item</button>
                    <div id="add-form-${key}" style="display: none; gap: var(--space-3); margin-top: var(--space-3);">
                        <input type="text" id="new-name-${key}" placeholder="Name" class="table-manual-input" style="width: 150px;">
                        <input type="number" id="new-amount-${key}" placeholder="Amount" class="table-manual-input">
                        <button class="kanban-btn primary" onclick="addSubcategory('${key}')">Add</button>
                        <button class="kanban-btn" onclick="cancelAddSubcategory('${key}')">Cancel</button>
                    </div>
                </div>
            `;
            
            html += '</div>';
        }

        html += '</div>';
        return html;
    }).join('');

    // Add slider event listeners
    container.querySelectorAll('.planner-slider:not(.subcategory-slider)').forEach(slider => {
        slider.addEventListener('input', (e) => {
            const key = e.target.dataset.category;
            const value = parseInt(e.target.value);
            proposedBudget[key] = value;
            updateBudgetItem(key, value);
        });
    });

    // Add subcategory slider listeners
    container.querySelectorAll('.subcategory-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
            const catKey = e.target.dataset.category;
            const subKey = e.target.dataset.subcategory;
            const value = parseInt(e.target.value);
            proposedSubBudgets[catKey][subKey] = value;
            
            // Update display
            const item = subcategoryData[catKey][subKey];
            const zone = getZone(item, value);
            const parentEl = e.target.closest('.planner-subcategory-item');
            if (parentEl) {
                parentEl.querySelector('span[style*="font-size: 18px"]').textContent = `$${(value / 1000).toFixed(0)}K`;
                parentEl.querySelector('.planner-risk-indicator').className = `planner-risk-indicator ${zone}`;
                parentEl.querySelector('.planner-risk-indicator').textContent = zone.toUpperCase();
            }
            
            // Update parent total
            let total = 0;
            Object.keys(subcategoryData[catKey]).forEach(sk => {
                total += proposedSubBudgets[catKey][sk] || subcategoryData[catKey][sk].sweetSpot;
            });
            proposedBudget[catKey] = total;
            
            // Update parent display
            const catEl = document.querySelector(`.planner-category[data-category="${catKey}"]`);
            if (catEl) {
                catEl.querySelector('.planner-category-value').textContent = `$${(total / 1000).toFixed(0)}K`;
            }
            
            updateSummary();
        });
    });
}

function updateBudgetItem(key, value) {
    const catEl = document.querySelector(`.planner-category[data-category="${key}"]`);
    if (!catEl) return;
    
    catEl.querySelector('.planner-category-value').textContent = `$${(value / 1000).toFixed(0)}K`;
    catEl.querySelector('.planner-impact').textContent = getImpactText(key, value);
    
    const zone = getZone(budgetMarketData[key], value);
    const tags = budgetMarketData[key].tags ? budgetMarketData[key].tags[zone] : [];
    const tagsContainer = catEl.querySelector('.planner-tags');
    if (tagsContainer) {
        tagsContainer.outerHTML = renderTags(tags, zone);
    }
    
    catEl.querySelector('.planner-risk-row').innerHTML = `
        ${getRiskIndicator(key, value)}
        <span class="planner-market-position">Market: $${(budgetMarketData[key].marketMid / 1000).toFixed(0)}K mid</span>
    `;
    
    updateSummary();
}

function renderTags(tags, zone) {
    if (!tags || tags.length === 0) return '<div class="planner-tags"></div>';
    
    const tagClass = {
        'risk': 'tag-risk',
        'caution': 'tag-caution',
        'optimal': 'tag-optimal',
        'premium': 'tag-premium',
        'overspend': 'tag-overspend'
    }[zone] || 'tag-neutral';
    
    return `<div class="planner-tags">${tags.map(t => 
        `<span class="planner-tag ${tagClass}">${t}</span>`
    ).join('')}</div>`;
}

function updateSummary() {
    const total = Object.values(proposedBudget).reduce((sum, val) => sum + val, 0);
    
    document.getElementById('proposed-total').textContent = `$${(total / 1000000).toFixed(1)}M`;
    
    // Market position
    const totalMid = Object.values(budgetMarketData).reduce((sum, item) => sum + item.marketMid, 0);
    const totalHigh = Object.values(budgetMarketData).reduce((sum, item) => sum + item.marketHigh, 0);
    const totalLow = Object.values(budgetMarketData).reduce((sum, item) => sum + item.marketLow, 0);
    
    const range = totalHigh - totalLow;
    const position = range > 0 ? Math.round(((total - totalLow) / range) * 100) : 50;
    const percentile = Math.min(99, Math.max(1, position));
    
    document.getElementById('market-position').textContent = `${percentile}th Percentile`;
    
    let positionDetail = 'Mid-Market';
    if (percentile < 25) positionDetail = 'Below Market';
    else if (percentile < 40) positionDetail = 'Lower Mid-Market';
    else if (percentile < 60) positionDetail = 'Mid-Market';
    else if (percentile < 75) positionDetail = 'Upper Mid-Market';
    else positionDetail = 'Premium';
    
    document.getElementById('market-position-detail').textContent = positionDetail;
    
    // Current total
    const currentTotal = Object.values(budgetMarketData).reduce((sum, item) => sum + item.current, 0);
    document.getElementById('current-total').textContent = `$${(currentTotal / 1000000).toFixed(1)}M`;
    
    // Risk count
    let riskCount = 0;
    Object.keys(budgetMarketData).forEach(key => {
        const item = budgetMarketData[key];
        const value = proposedBudget[key];
        const rcRange = item.maxRecommended - item.marketLow;
        const rcPct = rcRange > 0 ? ((value - item.marketLow) / rcRange) * 100 : 50;
        if (rcPct < 20) riskCount++;
    });
    
    document.getElementById('risk-count').textContent = riskCount > 0 ? `${riskCount} Critical` : '0 Critical';
    document.getElementById('risk-summary').textContent = riskCount > 0 ? 'Action needed' : 'All systems nominal';
    
    // Proposed status
    const statusEl = document.getElementById('proposed-status');
    if (percentile < 25) {
        statusEl.textContent = 'Underfunded';
        statusEl.className = 'budget-card-change negative';
    } else if (percentile < 75) {
        statusEl.textContent = 'Optimal Range';
        statusEl.className = 'budget-card-change positive';
    } else {
        statusEl.textContent = 'Premium';
        statusEl.className = 'budget-card-change neutral';
    }
    
    checkForChanges();
}

// Zone and risk calculation functions
function getRiskClass(key, value) {
    const item = budgetMarketData[key];
    const rcRange = item.maxRecommended - item.marketLow;
    const rcPos = value - item.marketLow;
    const rcPct = rcRange > 0 ? (rcPos / rcRange) * 100 : 50;
    
    if (rcPct < 20) return 'risk-high';
    if (value < item.sweetSpot) return 'risk-medium';
    if (value <= item.marketHigh) return 'risk-low';
    if (value <= item.maxRecommended) return 'risk-medium';
    return 'risk-high';
}

function getRiskIndicator(key, value) {
    const item = budgetMarketData[key];
    const riRange = item.maxRecommended - item.marketLow;
    const riPos = value - item.marketLow;
    const riPct = riRange > 0 ? (riPos / riRange) * 100 : 50;
    
    if (riPct < 20) return '<span class="planner-risk-indicator high">HIGH RISK</span>';
    if (value < item.sweetSpot) return '<span class="planner-risk-indicator medium">CAUTION</span>';
    if (value <= item.marketHigh) return '<span class="planner-risk-indicator low">⭐ OPTIMAL</span>';
    if (value <= item.maxRecommended) return '<span class="planner-risk-indicator medium">PREMIUM</span>';
    return '<span class="planner-risk-indicator high">OVERSPEND</span>';
}

function getImpactText(key, value) {
    const item = budgetMarketData[key];
    const itRange = item.maxRecommended - item.marketLow;
    const itPos = value - item.marketLow;
    const itPct = itRange > 0 ? (itPos / itRange) * 100 : 50;
    
    if (itPct < 20) return item.impacts.low;
    if (value < item.sweetSpot) return item.impacts.mid;
    if (value <= item.marketHigh) return item.impacts.sweet;
    if (value <= item.maxRecommended) return item.impacts.high;
    return item.impacts.excessive;
}

// Get zone for a given value
function getZone(item, value) {
    const range = item.maxRecommended - item.marketLow;
    const position = value - item.marketLow;
    const percent = range > 0 ? (position / range) * 100 : 50;
    if (percent < 20) return 'risk';
    if (percent < 40) return 'caution';
    if (percent < 65) return 'optimal';
    if (percent < 85) return 'premium';
    return 'overspend';
}

// Get tags for display based on value and zone
function getTags(categoryKey, subcategoryKey, value) {
    const data = subcategoryKey ? 
        subcategoryData[categoryKey]?.[subcategoryKey] : 
        budgetMarketData[categoryKey];
    
    if (!data || !data.tags) return [];
    
    const zone = getZone(data, value);
    return data.tags[zone] || [];
}

function setupBudgetControls() {
    // Toggle granular view
    document.getElementById('toggle-granular-view')?.addEventListener('click', (e) => {
        granularView = !granularView;
        e.target.textContent = granularView ? '📊 Hide Detailed Breakdown' : '📊 Show Detailed Breakdown';
        renderBudgetItems();
    });

    // Load current budget
    document.getElementById('load-current-budget')?.addEventListener('click', () => {
        Object.keys(budgetMarketData).forEach(key => {
            proposedBudget[key] = budgetMarketData[key].current;
            if (subcategoryData[key]) {
                Object.keys(subcategoryData[key]).forEach(subKey => {
                    proposedSubBudgets[key][subKey] = subcategoryData[key][subKey].current;
                });
            }
        });
        renderBudgetItems();
        updateSummary();
    });

    // Comparison mode
    document.getElementById('compare-mode-toggle')?.addEventListener('click', (e) => {
        comparisonMode = !comparisonMode;
        e.target.textContent = comparisonMode ? '👁️ Hide Comparison' : '👁️ Show Comparison';
        document.getElementById('current-total-card').style.display = 
            comparisonMode ? 'block' : 'none';
        renderBudgetItems();
    });

    // Reset to optimal
    document.getElementById('reset-to-optimal')?.addEventListener('click', () => {
        if (confirm('Reset all values to optimal (sweet spot) levels?')) {
            Object.keys(budgetMarketData).forEach(key => {
                proposedBudget[key] = budgetMarketData[key].sweetSpot;
                
                // Reset subcategories
                if (subcategoryData[key]) {
                    Object.keys(subcategoryData[key]).forEach(subKey => {
                        proposedSubBudgets[key][subKey] = subcategoryData[key][subKey].sweetSpot;
                    });
                }
            });
            renderBudgetItems();
            updateSummary();
        }
    });

    // Save to 2026 — NOW ACTUALLY SAVES TO SHEETS
    document.getElementById('save-to-2026')?.addEventListener('click', async () => {
        if (confirm('Save this budget configuration as the official 2026 IT Budget?')) {
            updateBudgetTab();
            await saveBudgetToSheets();
            alert('✅ Budget saved to Google Sheets and reflected in the "2026 IT Budget" tab.');
            document.getElementById('save-to-2026').style.display = 'none';
        }
    });
}

function checkForChanges() {
    let hasChanges = false;
    Object.keys(budgetMarketData).forEach(key => {
        if (proposedBudget[key] !== budgetMarketData[key].marketMid) {
            hasChanges = true;
        }
    });
    document.getElementById('save-to-2026').style.display = 
        hasChanges ? 'block' : 'none';
}

function applyManualValue(key) {
    const input = document.getElementById(`manual-${key}`);
    const value = parseInt(input.value);
    
    if (isNaN(value) || value < 0) {
        alert('Please enter a valid amount');
        return;
    }

    const item = budgetMarketData[key];
    
    if (value < item.marketLow * 0.7) {
        input.parentElement.classList.add('deep-red');
        if (!confirm(`⚠️ WARNING: This value is ${Math.round((1 - value/item.marketLow) * 100)}% below minimum market rate. This creates severe operational risk. Continue?`)) {
            return;
        }
    } 
    else if (value > item.maxRecommended * 1.2) {
        if (!confirm(`⚠️ WARNING: This value is ${Math.round((value/item.maxRecommended - 1) * 100)}% above recommended maximum. This may indicate overspending with diminishing returns. Continue?`)) {
            return;
        }
    } else {
        input.parentElement.classList.remove('deep-red');
    }

    proposedBudget[key] = value;
    const slider = document.getElementById(`slider-${key}`);
    if (slider) {
        if (value > slider.max) slider.max = value;
        if (value < slider.min) slider.min = value;
        slider.value = value;
    }
    
    updateBudgetItem(key, value);
    input.value = '';
}

// Make applyManualValue globally accessible
window.applyManualValue = applyManualValue;

// Make global helper functions accessible
window.editSubcategory = function(category, subKey) {
    const newName = prompt('Edit name:', subcategoryData[category][subKey].name);
    if (newName) {
        subcategoryData[category][subKey].name = newName;
        renderBudgetItems();
    }
};

window.removeSubcategory = function(category, subKey) {
    if (confirm(`Remove ${subcategoryData[category][subKey].name}?`)) {
        delete subcategoryData[category][subKey];
        delete proposedSubBudgets[category][subKey];
        renderBudgetItems();
        updateSummary();
    }
};

window.showAddForm = function(category) {
    document.getElementById(`add-form-${category}`).style.display = 'flex';
};

window.cancelAddSubcategory = function(category) {
    document.getElementById(`add-form-${category}`).style.display = 'none';
    document.getElementById(`new-name-${category}`).value = '';
    document.getElementById(`new-amount-${category}`).value = '';
};

window.addSubcategory = function(category) {
    const name = document.getElementById(`new-name-${category}`).value;
    const amount = parseInt(document.getElementById(`new-amount-${category}`).value);
    
    if (!name || !amount) {
        alert('Please enter both name and amount');
        return;
    }

    const newKey = name.toLowerCase().replace(/\s+/g, '_');
    subcategoryData[category][newKey] = {
        name: name,
        current: amount,
        marketLow: amount * 0.9,
        marketMid: amount,
        sweetSpot: amount,
        marketHigh: amount * 1.15,
        maxRecommended: amount * 1.35,
        tags: {
            risk: ['Underfunded', 'Service gaps', 'Operational risk'],
            caution: ['Baseline functional', 'Some limitations'],
            optimal: ['Well-funded', 'Reliable service', 'Best value'],
            premium: ['Premium tier', 'Advanced features'],
            overspend: ['Overbuilt', 'Underutilized', 'Poor ROI']
        }
    };
    proposedSubBudgets[category][newKey] = amount;
    
    cancelAddSubcategory(category);
    renderBudgetItems();
    updateSummary();
};

// Initialize budget planner when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBudgetPlanner);
} else {
    initBudgetPlanner();
}
