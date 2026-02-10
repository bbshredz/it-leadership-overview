// ==================== KANBAN BOARD ====================

// Responsibility data structure with comprehensive IT tasks
const responsibilities = {
    current: {
        anthony: [
            "Defining and governing the lifecycle strategy for enterprise business applications (ERP, MDM, eFax, and core SaaS platforms)",
            "Aligning technology initiatives with the '30 by 30' growth strategy and executive financial objectives",
            "Leading vendor strategy, contract governance, and oversight of the Software Asset Management (SAM) program",
            "Establishing enterprise standards, operating models, and success metrics across all IT domains"
        ],
        geremia: [
            "Architecting and maintaining the SD-WAN and bandwidth backbone for all facilities",
            "Leading virtualization strategy and data center consolidation initiatives",
            "Executing the security roadmap, including network hardening, NDR, and Zero-Trust implementation"
        ],
        francis: [
            "Owning the full service desk lifecycle and service performance outcomes",
            "Implementing AI Tier-0 support systems to scale service delivery",
            "Managing end-user adoption during system changes and upgrades"
        ],
        tom: [
            "Managing hardware lifecycle and standardization across facilities",
            "Executing after-hours maintenance and patching to avoid business disruption",
            "Leading asset recovery and environmental sustainability initiatives"
        ],
        rogi: [
            "Serving as SME for PointClickCare (PCC) and clinical SaaS platforms",
            "Developing clinical documentation and training resources",
            "Identifying and resolving workflow bottlenecks through system configuration and education"
        ],
        jon: [],
        backlog: [
            "Database backup and recovery operations",
            "Performance monitoring and query optimization",
            "Database maintenance tasks and patching",
            "Identity and access management (Active Directory, Azure AD administration)",
            "User provisioning and deprovisioning workflows",
            "Multi-factor authentication (MFA) deployment and support",
            "Email security and anti-phishing initiatives",
            "Endpoint detection and response (EDR) management",
            "Security awareness training program development",
            "Vulnerability scanning and patch prioritization",
            "Network monitoring and alerting configuration",
            "VPN and remote access support",
            "Firewall rule management and documentation",
            "Cloud cost optimization and monitoring",
            "Backup verification and disaster recovery testing",
            "IT asset inventory and lifecycle tracking",
            "Software license compliance auditing",
            "Technology refresh planning (desktop, laptops, mobile devices)",
            "Printer and peripheral device management",
            "Conference room technology support",
            "Telecom and phone system administration",
            "Internet and ISP vendor management",
            "IT documentation and knowledge base maintenance",
            "Change management and CAB processes",
            "Incident management and root cause analysis",
            "IT metrics and KPI dashboard development",
            "Business continuity and disaster recovery planning",
            "Compliance documentation (HIPAA, SOC 2, state regulations)",
            "Internal IT project management",
            "Cross-training and knowledge transfer initiatives"
        ]
    },
    future: {
        anthony: [
            "Defining and governing the lifecycle strategy for enterprise business applications (ERP, MDM, eFax, and core SaaS platforms)",
            "Aligning technology initiatives with the '30 by 30' growth strategy and executive financial objectives",
            "Leading vendor strategy, contract governance, and oversight of the Software Asset Management (SAM) program",
            "Establishing enterprise standards, operating models, and success metrics across all IT domains",
            "Strategic cybersecurity architecture and risk governance",
            "Business continuity and disaster recovery planning",
            "IT metrics and KPI dashboard development",
            "Cloud cost optimization and monitoring"
        ],
        geremia: [
            "Architecting and maintaining the SD-WAN and bandwidth backbone for all facilities",
            "Leading virtualization strategy and data center consolidation initiatives",
            "Executing the security roadmap, including network hardening, NDR, and Zero-Trust implementation",
            "Security operations and incident response",
            "Firewall rule management and documentation",
            "Network monitoring and alerting configuration",
            "Vulnerability scanning and patch prioritization",
            "Endpoint detection and response (EDR) management",
            "Email security and anti-phishing initiatives"
        ],
        francis: [
            "Owning the full service desk lifecycle and service performance outcomes",
            "Implementing AI Tier-0 support systems to scale service delivery",
            "Managing end-user adoption during system changes and upgrades",
            "ITIL process design and optimization",
            "Change management and CAB processes",
            "Incident management and root cause analysis",
            "IT documentation and knowledge base maintenance",
            "Conference room technology support",
            "VPN and remote access support"
        ],
        tom: [
            "Managing hardware lifecycle and standardization across facilities",
            "Executing after-hours maintenance and patching to avoid business disruption",
            "Leading asset recovery and environmental sustainability initiatives",
            "Network closets and access point management",
            "Identity and access management (Active Directory, Azure AD administration)",
            "User provisioning and deprovisioning workflows",
            "Multi-factor authentication (MFA) deployment and support",
            "IT asset inventory and lifecycle tracking",
            "Technology refresh planning (desktop, laptops, mobile devices)",
            "Printer and peripheral device management",
            "Telecom and phone system administration"
        ],
        rogi: [
            "Serving as SME for PointClickCare (PCC) and clinical SaaS platforms",
            "Developing clinical documentation and training resources",
            "Identifying and resolving workflow bottlenecks through system configuration and education",
            "Clinical system integrations and vendor management",
            "Compliance documentation (HIPAA, SOC 2, state regulations)",
            "Security awareness training program development"
        ],
        jon: [
            "Database backup and recovery operations",
            "Performance monitoring and query optimization",
            "Database maintenance tasks and patching",
            "Backup verification and disaster recovery testing"
        ],
        backlog: [
            "Software license compliance auditing",
            "Internet and ISP vendor management",
            "Internal IT project management",
            "Cross-training and knowledge transfer initiatives"
        ]
    }
};

let currentState = 'current';
let kanbanData = JSON.parse(JSON.stringify(responsibilities)); // Deep copy - will be replaced if sheets load
let keyResponsibilities = {
    current: {
        anthony: [],
        geremia: [],
        francis: [],
        tom: [],
        rogi: [],
        jon: []
    },
    future: {
        anthony: [],
        geremia: [],
        francis: [],
        tom: [],
        rogi: [],
        jon: []
    }
}; // Tracks which responsibilities are marked as "key"
let responsibilityTasks = {
    current: {},
    future: {}
}; // Maps responsibility title to array of tasks

let engagementsData = {
    current: {
        anthony: [],
        geremia: [],
        francis: [],
        tom: [],
        rogi: [],
        jon: []
    },
    future: {
        anthony: [],
        geremia: [],
        francis: [],
        tom: [],
        rogi: [],
        jon: []
    }
}; // Stores engagements for each person and state

let hasUnsavedChanges = false; // Track if changes need to be applied to bios

// Mark that changes need to be applied to bios
function markUnsavedChanges() {
    hasUnsavedChanges = true;
    const banner = document.getElementById('unsaved-changes-banner');
    const applyBtn = document.getElementById('apply-changes');
    if (banner) {
        banner.style.display = 'block';
    }
    if (applyBtn) {
        // Change to blue primary button (no animation)
        applyBtn.classList.add('primary');
    }
}

// Clear unsaved changes indicator
function clearUnsavedChanges() {
    hasUnsavedChanges = false;
    const banner = document.getElementById('unsaved-changes-banner');
    const applyBtn = document.getElementById('apply-changes');
    if (banner) {
        banner.style.display = 'none';
    }
    if (applyBtn) {
        // Change back to gray button
        applyBtn.classList.remove('primary');
    }
}

// Initialize Google Auth when library loads
window.onload = function() {
    if (typeof google !== 'undefined') {
        initializeGoogleAuth();
    }
};

// Initialize: Try to load from Google Sheets
(async function initializeKanbanData() {
    const sheetsData = await loadKanbanFromSheets();
    if (sheetsData) {
        kanbanData = sheetsData;
        console.log('📊 Using data from Google Sheets');
        // Re-render if kanban board is visible
        if (document.getElementById('kanban-board')) {
            renderKanban();
        }
        // Update all bios with loaded data
        const people = ['anthony', 'geremia', 'francis', 'tom', 'rogi', 'jon'];
        people.forEach(person => {
            if (document.getElementById(`profile-${person}`)) {
                updateBioContent(person, 'current');
            }
        });
    } else {
        console.log('📋 Using default data');
    }
    
    // Load engagements data
    await loadEngagementsFromSheets();
    
    // Load budget data
    await loadBudgetFromSheets();
})();

// Load engagements from Google Sheets
async function loadEngagementsFromSheets() {
    console.log('📥 Loading engagements from Google Sheets...');
    
    const data = await readFromSheet('engagements');
    
    if (!data || data.length <= 1) {
        console.log('⚠️ No engagements data in sheets.');
        return;
    }

    // Reset engagements data
    engagementsData = {
        current: { anthony: [], geremia: [], francis: [], tom: [], rogi: [], jon: [] },
        future: { anthony: [], geremia: [], francis: [], tom: [], rogi: [], jon: [] }
    };

    // Parse engagements: person | title | description | metric | state
    for (let i = 1; i < data.length; i++) {
        const [person, title, description, metric, state] = data[i];
        if (person && title && state) {
            const personKey = person.toLowerCase();
            const stateKey = state.toLowerCase() === 'future' ? 'future' : 'current';
            
            if (engagementsData[stateKey][personKey] !== undefined) {
                engagementsData[stateKey][personKey].push({
                    title: title || '',
                    description: description || '',
                    metric: metric || ''
                });
            }
        }
    }

    console.log('✅ Engagements loaded from Google Sheets');
    
    // Update all bio pages with engagement data
    const people = ['anthony', 'geremia', 'francis', 'tom', 'rogi', 'jon'];
    people.forEach(person => {
        updateEngagementsDisplay(person, 'current');
    });
}

// Update engagements display for a person
function updateEngagementsDisplay(person, state) {
    const profile = document.getElementById(`profile-${person}`);
    if (!profile) return;

    const engagementsGrid = profile.querySelector('.engagements-grid');
    if (!engagementsGrid) return;

    // Clear existing engagements
    engagementsGrid.innerHTML = '';

    let engagements = engagementsData[state][person] || [];
    
    // Randomize past/current state engagements if more than 3
    if (state === 'current' && engagements.length > 3) {
        engagements = shuffleArray([...engagements]).slice(0, 3);
    }

    // Display engagements (max 3)
    engagements.slice(0, 3).forEach(engagement => {
        const card = document.createElement('div');
        card.className = 'engagement-card';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'engagement-title';
        titleDiv.textContent = engagement.title;
        
        const descDiv = document.createElement('div');
        descDiv.className = 'engagement-description';
        descDiv.textContent = engagement.description;
        
        const metricSpan = document.createElement('span');
        metricSpan.className = 'engagement-metric';
        metricSpan.innerHTML = `<span class="engagement-metric-icon">✓</span> ${engagement.metric}`;
        
        card.appendChild(titleDiv);
        card.appendChild(descDiv);
        card.appendChild(metricSpan);
        engagementsGrid.appendChild(card);
    });

    // Show empty state if no engagements
    if (engagements.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.style.padding = 'var(--space-8)';
        emptyDiv.style.textAlign = 'center';
        emptyDiv.style.color = 'var(--gray-500)';
        emptyDiv.textContent = state === 'current' ? 'No past engagements recorded' : 'No future engagements planned';
        engagementsGrid.appendChild(emptyDiv);
    }
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Future Engagements / Upcoming Projects data
const futureEngagements = {
    anthony: [
        {
            title: "Enterprise AI Strategy",
            description: "Develop comprehensive AI adoption roadmap including Tier-0 helpdesk automation, predictive analytics for resource planning, and RPA for routine administrative tasks.",
            metric: "Est. $240K Annual Savings"
        },
        {
            title: "Cloud Cost Optimization Initiative",
            description: "Implement FinOps practices, right-size cloud resources, and negotiate enterprise agreements to reduce cloud spend while supporting growth.",
            metric: "Target: 25% Cost Reduction"
        },
        {
            title: "Strategic Vendor Consolidation",
            description: "Consolidate 40+ vendor relationships into 15 strategic partnerships, improving leverage, reducing management overhead, and streamlining procurement.",
            metric: "Projected: $180K Savings"
        }
    ],
    geremia: [
        {
            title: "Zero Trust Architecture Completion",
            description: "Complete implementation of zero trust security model across all facilities, including micro-segmentation, continuous verification, and enhanced monitoring.",
            metric: "Target: Q3 2025"
        },
        {
            title: "Network Infrastructure Modernization",
            description: "Upgrade core switching infrastructure, implement 10Gb backbone, and deploy next-gen firewalls to support 30-facility growth strategy.",
            metric: "12-Month Initiative"
        },
        {
            title: "SOC 2 Type II Certification",
            description: "Achieve SOC 2 Type II certification to meet enterprise customer requirements and enhance competitive positioning in the market.",
            metric: "Certification Target: Q4 2025"
        }
    ],
    francis: [
        {
            title: "AI-Powered Service Desk (Tier-0)",
            description: "Deploy AI chatbot handling 60% of routine requests autonomously, dramatically reducing response times and freeing technical staff for complex issues.",
            metric: "Target: 60% Ticket Deflection"
        },
        {
            title: "ITIL Process Maturity",
            description: "Elevate service delivery to ITIL v4 practices, implementing formal change advisory board, problem management, and service catalog.",
            metric: "Maturity Level 3 by EOY"
        },
        {
            title: "User Experience Dashboard",
            description: "Launch real-time UX monitoring dashboard tracking system performance, user satisfaction, and service quality metrics accessible to leadership.",
            metric: "Real-Time Visibility"
        }
    ],
    tom: [
        {
            title: "Hardware Lifecycle Automation",
            description: "Implement automated asset tracking, predictive replacement scheduling, and streamlined procurement workflows to support rapid facility expansion.",
            metric: "100% Asset Visibility"
        },
        {
            title: "Identity Management Modernization",
            description: "Migrate to Azure AD-native identity management with automated provisioning, self-service password reset, and enhanced security controls.",
            metric: "90% Automation Rate"
        },
        {
            title: "Wireless Infrastructure Expansion",
            description: "Deploy enterprise-grade wireless across all facilities with capacity for 30-facility future state, including IoT device support and guest networks.",
            metric: "12-Facility Deployment"
        }
    ],
    rogi: [
        {
            title: "Clinical Workflow Optimization Program",
            description: "Partner with clinical leadership to identify and resolve EHR workflow bottlenecks, reducing documentation time and improving clinician satisfaction.",
            metric: "Target: 15% Time Savings"
        },
        {
            title: "Clinical System Integration Hub",
            description: "Implement integration platform connecting PCC with pharmacy, labs, and ancillary systems for seamless data flow and reduced manual entry.",
            metric: "8 System Integrations"
        },
        {
            title: "Clinician Technology Training Academy",
            description: "Establish ongoing training program with video library, quick reference guides, and hands-on sessions to maximize clinical system adoption.",
            metric: "Quarterly Training Cycles"
        }
    ],
    jon: [
        {
            title: "Database Performance Optimization",
            description: "Comprehensive query optimization, index tuning, and database consolidation initiative to support 30-facility data growth.",
            metric: "Target: 40% Faster Queries"
        },
        {
            title: "Automated Backup Verification",
            description: "Implement automated backup testing and recovery validation ensuring 100% data recoverability across all critical systems.",
            metric: "100% Backup Confidence"
        },
        {
            title: "Database Monitoring Dashboard",
            description: "Deploy real-time database health monitoring with predictive alerts for capacity, performance, and availability issues.",
            metric: "Proactive Monitoring"
        }
    ]
};

// Initialize Kanban Board
function initKanban() {
    renderKanban();
    setupDragAndDrop();
    setupStateToggle();
    setupButtons();
}

// Render Kanban Cards
function renderKanban() {
    const columns = ['backlog', 'anthony', 'geremia', 'francis', 'tom', 'rogi', 'jon'];
    
    columns.forEach(columnName => {
        const column = document.querySelector(`[data-column="${columnName}"]`);
        const cardsContainer = column.querySelector('.kanban-cards');
        const countElement = column.querySelector('.count');
        
        cardsContainer.innerHTML = '';
        
        const items = kanbanData[currentState][columnName] || [];
        
        items.forEach((item, index) => {
            const card = createCard(item, columnName, index);
            cardsContainer.appendChild(card);
        });

        // Update count
        countElement.textContent = items.length;

        // Show empty state if no items
        if (items.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'kanban-empty';
            emptyState.textContent = 'Drop responsibilities here';
            cardsContainer.appendChild(emptyState);
        }
    });
}

// Create Card Element
function createCard(text, column, index) {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.draggable = true;
    card.dataset.column = column;
    card.dataset.index = index;
    card.dataset.text = text;

    const title = document.createElement('div');
    title.className = 'kanban-card-title';
    
    // Check if this responsibility has tasks (Future State grouped view)
    const tasks = responsibilityTasks[currentState]?.[text] || [];
    const hasTasks = tasks.length > 0 && currentState === 'future';

    if (hasTasks) {
        // Future State: Grouped responsibility with expandable tasks
        title.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <span>${text}</span>
                <span class="expand-icon" style="font-size: 12px; color: var(--gray-500); cursor: pointer;">▼</span>
            </div>
        `;
        
        // Make title clickable to expand
        title.style.cursor = 'pointer';
        title.onclick = (e) => {
            e.stopPropagation();
            toggleCardExpansion(card, text);
        };
    } else {
        // Current State: Simple flat task
        title.textContent = text;
    }

    const meta = document.createElement('div');
    meta.className = 'kanban-card-meta';

    const badge = document.createElement('span');
    badge.className = `kanban-card-badge ${currentState}`;
    badge.textContent = currentState === 'current' ? 'Current' : 'Future';
    
    meta.appendChild(badge);

    // Add key button for team member columns (not backlog)
    if (column !== 'backlog') {
        const isKey = keyResponsibilities[currentState][column]?.includes(text) || false;
        const starBtn = document.createElement('button');
        starBtn.className = `kanban-card-star ${isKey ? 'active' : ''}`;
        starBtn.innerHTML = '🗝️';
        starBtn.style.filter = isKey ? 'none' : 'grayscale(100%) opacity(0.3)';
        starBtn.title = isKey ? 'Remove from key responsibilities' : 'Mark as key responsibility';
        starBtn.onclick = (e) => {
            e.stopPropagation();
            toggleKeyResponsibility(text, column);
        };
        meta.appendChild(starBtn);
    }

    card.appendChild(title);
    card.appendChild(meta);

    return card;
}

// Toggle card expansion for Future State grouped responsibilities
function toggleCardExpansion(card, respTitle) {
    const tasks = responsibilityTasks[currentState]?.[respTitle] || [];
    if (tasks.length === 0) return;

    // Check if already expanded
    let tasksList = card.querySelector('.tasks-list');
    const expandIcon = card.querySelector('.expand-icon');

    if (tasksList) {
        // Collapse
        tasksList.remove();
        expandIcon.textContent = '▼';
    } else {
        // Expand
        tasksList = document.createElement('div');
        tasksList.className = 'tasks-list';
        tasksList.style.cssText = 'margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--gray-200); font-size: 12px; color: var(--gray-600);';
        
        const ul = document.createElement('ul');
        ul.style.cssText = 'margin: 0; padding-left: 16px; list-style: disc;';
        
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = task;
            li.style.marginBottom = '4px';
            ul.appendChild(li);
        });
        
        tasksList.appendChild(ul);
        card.appendChild(tasksList);
        expandIcon.textContent = '▲';
    }
}

// Drag and Drop Setup
function setupDragAndDrop() {
    let draggedCard = null;
    let sourceColumn = null;

    // Drag start
    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('kanban-card')) {
            draggedCard = e.target;
            sourceColumn = e.target.dataset.column;
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }
    });

    // Drag end
    document.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('kanban-card')) {
            e.target.classList.remove('dragging');
            document.querySelectorAll('.drag-over').forEach(el => {
                el.classList.remove('drag-over');
            });
        }
    });

    // Drag over
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        const dropZone = e.target.closest('[data-droppable="true"]');
        if (dropZone) {
            const column = dropZone.closest('.kanban-column');
            column.classList.add('drag-over');
        }
    });

    // Drag leave
    document.addEventListener('dragleave', (e) => {
        const column = e.target.closest('.kanban-column');
        if (column && !column.contains(e.relatedTarget)) {
            column.classList.remove('drag-over');
        }
    });

    // Drop
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        const dropZone = e.target.closest('[data-droppable="true"]');
        
        if (dropZone && draggedCard) {
            const targetColumn = dropZone.closest('.kanban-column').dataset.column;
            const cardText = draggedCard.dataset.text;
            const cardIndex = parseInt(draggedCard.dataset.index);

            // Remove from source
            kanbanData[currentState][sourceColumn].splice(cardIndex, 1);

            // Add to target
            if (!kanbanData[currentState][targetColumn]) {
                kanbanData[currentState][targetColumn] = [];
            }
            kanbanData[currentState][targetColumn].push(cardText);

            // Re-render
            renderKanban();

            // Mark unsaved changes
            markUnsavedChanges();

            // Auto-save to sheets
            saveKanbanToSheets();

            // Remove drag-over class
            document.querySelectorAll('.drag-over').forEach(el => {
                el.classList.remove('drag-over');
            });
        }
    });
}

// State Toggle
function setupStateToggle() {
    const toggleButtons = document.querySelectorAll('.state-toggle-btn');
    const indicator = document.querySelector('.comparison-indicator span strong');
    const dot = document.querySelector('.comparison-dot');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const newState = btn.dataset.state;
            
            if (newState !== currentState) {
                currentState = newState;
                
                // Update UI
                toggleButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                indicator.textContent = newState === 'current' ? 'Current State' : 'Future State';
                dot.classList.toggle('future', newState === 'future');
                
                // Re-render board
                renderKanban();
            }
        });
    });
}

// Button Actions
function setupButtons() {
    // Reset button
    // Save as default button
    document.getElementById('save-as-default').addEventListener('click', () => {
        if (confirm('Save current assignments as the new default? This will overwrite the existing default state.')) {
            responsibilities = JSON.parse(JSON.stringify(kanbanData));
            alert('✅ Current state saved as default!\n\nThe "Reset to Default" button will now restore to this configuration.');
        }
    });

    document.getElementById('reset-kanban').addEventListener('click', () => {
        if (confirm('Reset to default assignments? This will discard your changes.')) {
            kanbanData = JSON.parse(JSON.stringify(responsibilities));
            renderKanban();
        }
    });

    // Clear all assignments button
    document.getElementById('clear-all-assignments').addEventListener('click', () => {
        const currentState = document.querySelector('.state-toggle-btn.active').dataset.state;
        const stateLabel = currentState === 'current' ? 'Current State' : 'Future State';
        
        if (confirm(`Clear all assignments for ${stateLabel}? All responsibilities will move to Unassigned.`)) {
            clearAllAssignments(currentState);
        }
    });

    // Apply changes button
    document.getElementById('apply-changes').addEventListener('click', () => {
        applyToBios();
    });

    // Add responsibility button
    document.getElementById('add-responsibility-btn').addEventListener('click', () => {
        addNewResponsibility();
    });

    // Allow Enter key to submit (with Shift+Enter for new line)
    document.getElementById('new-responsibility-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addNewResponsibility();
        }
    });
}

// Toggle key responsibility status
function toggleKeyResponsibility(text, column) {
    if (!keyResponsibilities[currentState][column]) {
        keyResponsibilities[currentState][column] = [];
    }

    const keyList = keyResponsibilities[currentState][column];
    const index = keyList.indexOf(text);

    if (index > -1) {
        // Remove from key responsibilities
        keyList.splice(index, 1);
    } else {
        // Add to key responsibilities
        keyList.push(text);
    }

    // Re-render to update star
    renderKanban();
    
    // Mark unsaved changes
    markUnsavedChanges();
    
    // Save to sheets
    saveKanbanToSheets();
}

// Clear all assignments for the current view
function clearAllAssignments(state) {
    const stateData = kanbanData[state];
    const allResponsibilities = [];
    
    // Collect all responsibilities from all team members
    Object.keys(stateData).forEach(key => {
        if (key !== 'backlog' && Array.isArray(stateData[key])) {
            allResponsibilities.push(...stateData[key]);
            stateData[key] = []; // Empty the column
        }
    });
    
    // Add existing backlog items
    if (!stateData.backlog) {
        stateData.backlog = [];
    }
    allResponsibilities.push(...stateData.backlog);
    
    // Set all responsibilities to backlog
    stateData.backlog = allResponsibilities;
    
    // Re-render
    renderKanban();
    
    // Auto-save
    saveKanbanToSheets();
}

// Add new responsibility to backlog
function addNewResponsibility() {
    const input = document.getElementById('new-responsibility-input');
    const text = input.value.trim();

    if (text) {
        // Add to both current and future states
        if (!kanbanData.current.backlog) {
            kanbanData.current.backlog = [];
        }
        if (!kanbanData.future.backlog) {
            kanbanData.future.backlog = [];
        }

        kanbanData.current.backlog.push(text);
        kanbanData.future.backlog.push(text);

        // Clear input
        input.value = '';

        // Re-render
        renderKanban();

        // Mark unsaved changes
        markUnsavedChanges();

        // Auto-save to sheets
        saveKanbanToSheets();

        // Show feedback
        input.placeholder = '✅ Added & Saved! Enter another...';
        setTimeout(() => {
            input.placeholder = 'Enter a new responsibility to add to the backlog...';
        }, 2000);
    }
}

// Apply Kanban changes to bio pages
function applyToBios() {
    const people = ['anthony', 'geremia', 'francis', 'tom', 'rogi', 'jon'];
    
    people.forEach(person => {
        const responsibilities = kanbanData[currentState][person] || [];
        const keyResps = keyResponsibilities[currentState][person] || [];
        const profileCard = document.getElementById(`profile-${person}`);
        
        if (profileCard && responsibilities.length > 0) {
            const responsibilitiesList = profileCard.querySelector('.responsibilities-list');
            
            if (responsibilitiesList) {
                // Clear existing
                responsibilitiesList.innerHTML = '';
                
                // Add Key Responsibilities section if there are any
                if (keyResps.length > 0) {
                    const keyHeader = document.createElement('li');
                    keyHeader.style.fontWeight = '700';
                    keyHeader.style.marginTop = '12px';
                    keyHeader.style.marginBottom = '4px';
                    keyHeader.style.color = 'var(--navy-900)';
                    keyHeader.textContent = '🗝️ Key Responsibilities:';
                    responsibilitiesList.appendChild(keyHeader);
                    
                    keyResps.forEach(resp => {
                        const li = document.createElement('li');
                        li.className = 'responsibility-item';
                        li.style.fontWeight = '600';
                        li.textContent = resp;
                        responsibilitiesList.appendChild(li);
                    });
                    
                    // Add divider
                    const divider = document.createElement('li');
                    divider.style.fontWeight = '700';
                    divider.style.marginTop = '12px';
                    divider.style.marginBottom = '4px';
                    divider.style.color = 'var(--navy-900)';
                    divider.textContent = 'All Responsibilities:';
                    responsibilitiesList.appendChild(divider);
                }
                
                // Add all responsibilities EXCEPT the ones marked as key
                responsibilities.forEach(resp => {
                    // Skip if this responsibility is already listed as key
                    if (!keyResps.includes(resp)) {
                        const li = document.createElement('li');
                        li.className = 'responsibility-item';
                        li.textContent = resp;
                        responsibilitiesList.appendChild(li);
                    }
                });
            }
        }
    });

    // Clear unsaved changes indicator
    clearUnsavedChanges();

    alert(`✅ Successfully applied ${currentState === 'current' ? 'Current' : 'Future'} State responsibilities to bio pages!\n\n${getTotalKeyCount()} key responsibilities highlighted.`);
}

// Helper to count total key responsibilities
function getTotalKeyCount() {
    const people = ['anthony', 'geremia', 'francis', 'tom', 'rogi', 'jon'];
    let total = 0;
    people.forEach(person => {
        total += (keyResponsibilities[currentState][person] || []).length;
    });
    return total;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKanban);
} else {
    initKanban();
}
