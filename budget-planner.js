// ==================== BUDGET PLANNER ====================

// Load budget data from Google Sheets
async function loadBudgetFromSheets() {
    console.log('📥 Loading budget data from Google Sheets...');
    
    const categoriesData = await readFromSheet('budget_categories');
    const subcategoriesData = await readFromSheet('budget_subcategories');
    
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
    
    // Refresh budget displays if they're visible
    if (document.getElementById('budget-line-items')) {
        renderBudgetItems();
        updateSummary();
    }
}

// ==================== BUDGET PLANNER ====================

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
                overspend: ['Excess capacity', 'Premature refresh', 'Budget waste']
            }
        },
        hardware: {
            name: 'Hardware & Endpoints',
            current: 105000,
            marketLow: 120000,
            marketMid: 135000,
            sweetSpot: 140000,
            marketHigh: 155000,
            maxRecommended: 180000,
            tags: {
                risk: ['Old equipment', 'Slow performance', 'Security risk', 'User frustration'],
                caution: ['Aging fleet', 'Refresh needed', 'Some complaints'],
                optimal: ['Modern devices', 'Reliable performance', 'Secure', 'High productivity'],
                premium: ['Premium models', 'Latest hardware', 'Executive-grade'],
                overspend: ['Unnecessary upgrades', 'Over-specced', 'Budget surplus']
            }
        },
        maintenance: {
            name: 'Maintenance & Support',
            current: 120000,
            marketLow: 120000,
            marketMid: 165000,
            sweetSpot: 165000,
            marketHigh: 190000,
            maxRecommended: 220000,
            tags: {
                risk: ['Warranty gaps', 'Slow response', 'Extended downtime', 'DIY fixes'],
                caution: ['Basic support', 'Limited hours', 'Some delays'],
                optimal: ['24/7 support', 'Fast response', 'Vendor partnerships', 'Minimal downtime'],
                premium: ['White-glove service', 'Dedicated TAMs', 'Instant response'],
                overspend: ['Redundant contracts', 'Overlapping coverage', 'Wasted spend']
            }
        }
    },
    personnel: {
        leadership: {
            name: 'Leadership (Anthony, Geremia)',
            current: 320000,
            marketLow: 340000,
            marketMid: 360000,
            sweetSpot: 370000,
            marketHigh: 400000,
            maxRecommended: 450000,
            tags: {
                risk: ['Below market', 'Turnover risk', 'Recruiting difficult', 'Experience loss'],
                caution: ['Market competitive', 'Some retention risk', 'Limited growth budget'],
                optimal: ['Competitive pay', 'Stable leadership', 'Attract talent', 'Continuity'],
                premium: ['Top quartile pay', 'Executive perks', 'Very stable'],
                overspend: ['Above market premium', 'Inflated costs', 'Compensation imbalance']
            }
        },
        technical: {
            name: 'Technical Staff (Francis, Tom, Rogi)',
            current: 380000,
            marketLow: 390000,
            marketMid: 420000,
            sweetSpot: 430000,
            marketHigh: 460000,
            maxRecommended: 520000,
            tags: {
                risk: ['Retention issues', 'Skill gaps', 'Burnout risk', 'Quality concerns'],
                caution: ['Market rate', 'Some turnover', 'Limited training'],
                optimal: ['Competitive pay', 'Strong retention', 'Quality work', 'High morale'],
                premium: ['Premium salaries', 'Excellent benefits', 'Very low turnover'],
                overspend: ['Premium unsustainable', 'Compressed margins', 'Budget pressure']
            }
        },
        database: {
            name: 'Database Admin (Jon)',
            current: 110000,
            marketLow: 115000,
            marketMid: 120000,
            sweetSpot: 122000,
            marketHigh: 135000,
            maxRecommended: 150000,
            tags: {
                risk: ['Below market', 'Flight risk', 'Specialized role', 'Hard to replace'],
                caution: ['Market rate', 'Some risk', 'Specialist premium'],
                optimal: ['Competitive rate', 'Role stability', 'Knowledge retained'],
                premium: ['Premium specialist rate', 'Very stable', 'Senior level'],
                overspend: ['Premium excessive', 'Budget pressure']
            }
        },
        training: {
            name: 'Training & Development',
            current: 30000,
            marketLow: 35000,
            marketMid: 60000,
            sweetSpot: 58000,
            marketHigh: 75000,
            maxRecommended: 95000,
            tags: {
                risk: ['Stagnant skills', 'No certifications', 'Limited growth', 'Outdated knowledge'],
                caution: ['Basic training', 'Some conferences', 'Slow progress'],
                optimal: ['Continuous learning', 'Current certs', 'Career paths', 'Innovation'],
                premium: ['Executive coaching', 'Premium programs', 'Conference travel'],
                overspend: ['Excessive training', 'Underutilized', 'Budget inefficiency']
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
            <div class="planner-item">
                <div class="planner-item-header">
                    <div class="planner-item-info">
                        <div class="planner-item-title">${item.name}</div>
                        <div class="planner-item-values">
                            <div class="planner-value">
                                <div class="planner-value-label">Proposed</div>
                                <div class="planner-value-amount" data-item="${key}-proposed">
                                    $${(value / 1000).toFixed(0)}K
                                </div>
                            </div>
                            ${comparisonMode ? `
                            <div class="planner-value">
                                <div class="planner-value-label">Current</div>
                                <div class="planner-value-amount current">
                                    $${(item.current / 1000).toFixed(0)}K
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <div id="risk-${key}">
                        ${getRiskIndicator(key, value)}
                    </div>
                </div>

                <div id="tags-${key}">
                    ${renderTags(tags, zone)}
                </div>

                <div class="planner-slider-container">
                    <div class="planner-slider-wrapper">
                        <div class="planner-slider-sweetspot" style="left: ${((item.sweetSpot - item.marketLow) / (item.maxRecommended - item.marketLow)) * 100}%"></div>
                        <input 
                            type="range" 
                            class="planner-slider" 
                            id="slider-${key}"
                            min="${item.marketLow}" 
                            max="${item.maxRecommended}" 
                            value="${value}"
                            step="10000"
                            data-item="${key}">
                    </div>
                    <div class="planner-slider-header">
                        <div class="planner-slider-labels">
                            <span class="planner-slider-label">$${(item.marketLow / 1000).toFixed(0)}K</span>
                            <span class="planner-slider-label">⭐ $${(item.sweetSpot / 1000).toFixed(0)}K</span>
                            <span class="planner-slider-label">$${(item.maxRecommended / 1000).toFixed(0)}K</span>
                        </div>
                    </div>
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
                            <input 
                                type="range" 
                                class="planner-slider" 
                                id="slider-${key}-${subKey}"
                                min="${subItem.marketLow}" 
                                max="${subItem.maxRecommended}" 
                                value="${subValue}"
                                step="5000"
                                data-category="${key}"
                                data-subcategory="${subKey}">
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--gray-500); margin-top: var(--space-1);">
                            <span>$${(subItem.marketLow / 1000).toFixed(0)}K</span>
                            <span>⭐ $${(subItem.sweetSpot / 1000).toFixed(0)}K</span>
                            <span>$${(subItem.maxRecommended / 1000).toFixed(0)}K</span>
                        </div>
                    </div>
                `;
            });

            html += `
                <div class="planner-add-item-form" id="add-form-${key}" style="display: none;">
                    <input type="text" placeholder="Line item name" id="new-name-${key}">
                    <input type="number" placeholder="Amount" id="new-amount-${key}">
                    <button class="kanban-btn primary" onclick="addSubcategory('${key}')">Add</button>
                    <button class="kanban-btn" onclick="cancelAddSubcategory('${key}')">Cancel</button>
                </div>
                <button class="kanban-btn" onclick="showAddForm('${key}')" style="width: 100%; margin-top: var(--space-3);">
                    + Add Line Item
                </button>
            </div>`;
        }

        html += `</div>`;
        return html;
    }).join('');

    // Add event listeners to main sliders
    Object.keys(budgetMarketData).forEach(key => {
        const slider = document.getElementById(`slider-${key}`);
        if (slider) {
            slider.addEventListener('input', (e) => {
                updateBudgetItem(key, parseInt(e.target.value));
            });
        }
    });

    // Add event listeners to subcategory sliders
    if (granularView) {
        Object.keys(subcategoryData).forEach(category => {
            Object.keys(subcategoryData[category]).forEach(subKey => {
                const slider = document.getElementById(`slider-${category}-${subKey}`);
                if (slider) {
                    slider.addEventListener('input', (e) => {
                        updateSubcategoryItem(category, subKey, parseInt(e.target.value));
                    });
                }
            });
        });
    }
}

function getRiskClass(key, value) {
    const item = budgetMarketData[key];
    const rcRange = item.maxRecommended - item.marketLow;
    const rcPos = value - item.marketLow;
    const rcPct = rcRange > 0 ? (rcPos / rcRange) * 100 : 50;
    
    if (rcPct < 20) return 'risk-high';
    if (value < item.sweetSpot) return 'risk-medium';
    if (value <= item.marketHigh) return 'risk-low';
    if (value <= item.maxRecommended) return 'risk-medium'; // Premium but acceptable
    return 'risk-high'; // Overspend
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
    // Proportional zone calculation across full slider range
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
        subcategoryData[categoryKey][subcategoryKey] : 
        budgetMarketData[categoryKey];
    
    if (!data || !data.tags) return [];
    
    const zone = getZone(data, value);
    return data.tags[zone] || [];
}

// Render tags HTML
function renderTags(tags, zone) {
    if (!tags || tags.length === 0) return '';
    
    return `<div class="planner-tags-container">
        ${tags.map(tag => `<span class="planner-tag ${zone}">${tag}</span>`).join('')}
    </div>`;
}

function updateBudgetItem(key, value) {
    proposedBudget[key] = value;
    
    // Update display
    const proposedElement = document.querySelector(`[data-item="${key}-proposed"]`);
    if (proposedElement) {
        proposedElement.textContent = `$${(value / 1000).toFixed(0)}K`;
    }
    
    // Update risk indicator
    const riskElement = document.getElementById(`risk-${key}`);
    if (riskElement) {
        riskElement.innerHTML = getRiskIndicator(key, value);
    }
    
    // Update tags without full re-render
    const tagsContainer = document.getElementById(`tags-${key}`);
    if (tagsContainer) {
        const item = budgetMarketData[key];
        const zone = getZone(item, value);
        const tags = budgetMarketData[key].tags ? budgetMarketData[key].tags[zone] : [];
        tagsContainer.innerHTML = renderTags(tags, zone);
    }
    
    updateSummary();
    checkForChanges();
}

function updateSummary() {
    const total = Object.values(proposedBudget).reduce((sum, val) => sum + val, 0);
    const currentTotal = Object.values(budgetMarketData).reduce((sum, item) => sum + item.current, 0);
    
    document.getElementById('proposed-total').textContent = 
        `$${(total / 1000000).toFixed(1)}M`;
    
    if (comparisonMode) {
        document.getElementById('current-total').textContent = 
            `$${(currentTotal / 1000000).toFixed(1)}M`;
    }

    // Calculate market position
    const optimalTotal = Object.values(budgetMarketData).reduce((sum, item) => sum + item.marketMid, 0);
    const percentile = Math.round((total / optimalTotal) * 50 + 25);
    document.getElementById('market-position').textContent = `${percentile}th Percentile`;

    // Count risks
    let highRisks = 0;
    Object.keys(budgetMarketData).forEach(key => {
        if (getRiskClass(key, proposedBudget[key]) === 'risk-high') highRisks++;
    });

    const riskCard = document.getElementById('risk-card');
    if (highRisks > 0) {
        riskCard.className = 'planner-summary-card risk-high';
        document.getElementById('risk-count').textContent = `${highRisks} Critical`;
        document.getElementById('risk-summary').textContent = 'Action required';
    } else {
        riskCard.className = 'planner-summary-card risk-low';
        document.getElementById('risk-count').textContent = '0 Critical';
        document.getElementById('risk-summary').textContent = 'All systems nominal';
    }
}

function setupBudgetControls() {
    // Toggle granular view
    document.getElementById('toggle-granular-view')?.addEventListener('click', (e) => {
        granularView = !granularView;
        e.target.textContent = granularView ? '📊 Hide Detailed Breakdown' : '📊 Show Detailed Breakdown';
        e.target.classList.toggle('active');
        renderBudgetItems();
    });

    // Load current budget
    document.getElementById('load-current-budget')?.addEventListener('click', () => {
        Object.keys(budgetMarketData).forEach(key => {
            proposedBudget[key] = budgetMarketData[key].current;
            const slider = document.getElementById(`slider-${key}`);
            if (slider) slider.value = budgetMarketData[key].current;
            
            // Load current for subcategories
            if (subcategoryData[key]) {
                Object.keys(subcategoryData[key]).forEach(subKey => {
                    proposedSubBudgets[key][subKey] = subcategoryData[key][subKey].current;
                });
            }
        });
        renderBudgetItems();
        updateSummary();
    });

    // Toggle comparison
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

    // Save to 2026
    document.getElementById('save-to-2026')?.addEventListener('click', () => {
        if (confirm('Save this budget configuration as the official 2026 IT Budget?')) {
            alert('✅ Budget saved! Changes will reflect in the "2026 IT Budget" tab.');
            document.getElementById('save-to-2026').style.display = 'none';
        }
    });
}

function checkForChanges() {
    // Show save button if values differ from optimal
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
    
    // Check if dangerously low (below 70% of market minimum)
    if (value < item.marketLow * 0.7) {
        input.parentElement.classList.add('deep-red');
        if (!confirm(`⚠️ WARNING: This value is ${Math.round((1 - value/item.marketLow) * 100)}% below minimum market rate. This creates severe operational risk. Continue?`)) {
            return;
        }
    } 
    // Check if excessive (above max recommended)
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
        // Extend slider range if needed
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

    // Create new subcategory with estimated market ranges
    const newKey = name.toLowerCase().replace(/\s+/g, '_');
    subcategoryData[category][newKey] = {
        name: name,
        current: amount,
        marketLow: amount * 0.9,
        marketMid: amount,
        sweetSpot: amount * 1.05,
        marketHigh: amount * 1.2,
        maxRecommended: amount * 1.4,
        tags: {
            risk: ['Underfunded'],
            caution: ['Baseline'],
            optimal: ['Well-funded'],
            premium: ['Premium tier'],
            overspend: ['Excessive']
        }
    };

    proposedSubBudgets[category][newKey] = amount;
    
    window.cancelAddSubcategory(category);
    renderBudgetItems();
    updateSummary();
};

function updateSubcategoryItem(category, subKey, value) {
    proposedSubBudgets[category][subKey] = value;
    
    // Recalculate parent category total
    let total = 0;
    Object.keys(proposedSubBudgets[category]).forEach(sk => {
        total += proposedSubBudgets[category][sk];
    });
    proposedBudget[category] = total;
    
    // Update display
    updateSummary();
    renderBudgetItems();
}

// Initialize budget planner when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBudgetPlanner);
} else {
    initBudgetPlanner();
}
