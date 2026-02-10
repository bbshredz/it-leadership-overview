// ==================== BIO STATE MANAGEMENT ====================

// Title mapping (current vs future)
const titleData = {
    anthony: {
        current: "IT Director, South",
        future: "Vice President, Business Systems & Technology"
    },
    geremia: {
        current: "IT Director, North",
        future: "Director, IT Infrastructure & Security"
    },
    francis: {
        current: "Network Administrator",
        future: "IT Service Delivery Manager"
    },
    tom: {
        current: "Network Administrator",
        future: "Systems Administrator"
    },
    rogi: {
        current: "Clinical Project Specialist",
        future: "Clinical Systems Specialist"
    },
    jon: {
        current: "Database Administrator",
        future: "Database Administrator"
    }
};

function initBioStates() {
    // Set up state toggle for all profiles
    const people = ['anthony', 'geremia', 'francis', 'tom', 'rogi', 'jon'];
    
    people.forEach(person => {
        const profile = document.getElementById(`profile-${person}`);
        if (!profile) return;

        // Add state toggle if it doesn't exist
        const content = profile.querySelector('.profile-content');
        if (content && !content.querySelector('.profile-state-toggle')) {
            const toggle = createStateToggle(person);
            content.insertBefore(toggle, content.firstChild);
        }

        // Update title with data attributes
        const titleElement = profile.querySelector('.profile-title');
        if (titleElement && titleData[person]) {
            titleElement.dataset.current = titleData[person].current;
            titleElement.dataset.future = titleData[person].future;
            titleElement.textContent = titleData[person].current;
        }
    });

    // Set up click handlers for state buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('profile-state-btn')) {
            const person = e.target.dataset.person;
            const state = e.target.dataset.state;
            switchBioState(person, state);
        }
    });

    // Initialize all bios to current state
    people.forEach(person => updateBioContent(person, 'current'));
}

function createStateToggle(person) {
    const toggle = document.createElement('div');
    toggle.className = 'profile-state-toggle';
    toggle.innerHTML = `
        <span class="profile-state-label">Viewing</span>
        <div class="profile-state-buttons">
            <button class="profile-state-btn active current" data-state="current" data-person="${person}">
                <span class="profile-state-dot current"></span>
                Current State
            </button>
            <button class="profile-state-btn future" data-state="future" data-person="${person}">
                <span class="profile-state-dot future"></span>
                Future State
            </button>
        </div>
    `;
    return toggle;
}

function switchBioState(person, state) {
    const profile = document.getElementById(`profile-${person}`);
    if (!profile) return;

    // Update button states
    const buttons = profile.querySelectorAll('.profile-state-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.state === state) {
            btn.classList.add('active');
        }
    });

    // Add/remove future-mode class for visual treatment
    if (state === 'future') {
        profile.classList.add('future-mode');
    } else {
        profile.classList.remove('future-mode');
    }

    // Update content
    updateBioContent(person, state);
}

function updateBioContent(person, state) {
    const profile = document.getElementById(`profile-${person}`);
    if (!profile) return;

    // Update title
    const titleElement = profile.querySelector('.profile-title');
    if (titleElement && titleElement.dataset[state]) {
        titleElement.textContent = titleElement.dataset[state];
    }

    // Update summary
    const summaryElement = profile.querySelector('.profile-summary');
    if (summaryElement && summaryElement.dataset[state]) {
        summaryElement.textContent = summaryElement.dataset[state];
    }

    // Update accountability
    const accountabilityElement = profile.querySelector('.accountability-text');
    if (accountabilityElement && accountabilityElement.dataset[state]) {
        accountabilityElement.textContent = accountabilityElement.dataset[state];
    }

    // Update responsibilities from kanban data
    const responsibilities = kanbanData[state][person] || [];
    const keyResps = keyResponsibilities[state][person] || [];
    const responsibilitiesList = profile.querySelector('.responsibilities-list');
    
    if (responsibilitiesList) {
        responsibilitiesList.innerHTML = '';
        
        if (responsibilities.length > 0) {
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

    // Update engagements section label
    updateEngagementsSection(person, state);
    
    // Update engagements display
    updateEngagementsDisplay(person, state);
}

// Update engagements section based on state
function updateEngagementsSection(person, state) {
    const profile = document.getElementById(`profile-${person}`);
    if (!profile) return;

    // Find the engagements section label
    const sections = profile.querySelectorAll('.section-label');
    sections.forEach(section => {
        const labelText = section.textContent.trim();
        if (labelText.includes('Engagements') || labelText.includes('Example')) {
            const labelDiv = section.querySelector('.section-label');
            if (!labelDiv) {
                // Update the text directly
                const icon = section.querySelector('.section-label-icon');
                section.innerHTML = '';
                if (icon) section.appendChild(icon.cloneNode(true));
                const textNode = document.createTextNode(state === 'current' ? 'Past Engagements' : 'Future Engagements');
                section.appendChild(textNode);
            }
        }
    });
}

// Initialize bio states when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBioStates);
} else {
    initBioStates();
}
