// ==================== INTERACTIVE HEAT MAP ====================

let heatmapEditMode = false;

function initHeatmap() {
    const toggleBtn = document.getElementById('toggle-heatmap-edit');
    
    // Load RACI data from sheets
    loadRACIFromSheets();
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            heatmapEditMode = !heatmapEditMode;
            
            if (heatmapEditMode) {
                toggleBtn.textContent = '✅ Edit Mode Active';
                toggleBtn.style.background = 'var(--accent-green)';
                toggleBtn.style.borderColor = 'var(--accent-green)';
                toggleBtn.style.color = 'var(--white)';
            } else {
                toggleBtn.textContent = '🖊️ Enable Edit Mode';
                toggleBtn.style.background = 'var(--white)';
                toggleBtn.style.borderColor = 'var(--gray-300)';
                toggleBtn.style.color = 'var(--navy-700)';
            }
        });

        // Click handler for heat map cells and badges
        document.addEventListener('click', (e) => {
            if (!heatmapEditMode) return;

            if (e.target.classList.contains('heatmap-badge')) {
                cycleHeatmapBadge(e.target);
            } else if (e.target.closest('.heatmap-cell')) {
                const cell = e.target.closest('.heatmap-cell');
                // If clicking empty space in cell, add a new badge
                if (e.target === cell) {
                    addHeatmapBadge(cell);
                }
            }
        });
    }
}

function cycleHeatmapBadge(badge) {
    const currentClass = badge.className.split(' ').find(c => ['a', 'r', 'c', 'i', 'empty'].includes(c));
    
    // If cycling to empty, remove the badge entirely
    if (currentClass === 'i') {
        badge.remove();
        saveRACIToSheets(); // Auto-save after edit
        return;
    }
    
    // Remove all RACI classes
    badge.classList.remove('a', 'r', 'c', 'i', 'empty');
    
    // Determine next state
    let nextClass, nextText;
    switch(currentClass) {
        case 'a':
            nextClass = 'r';
            nextText = 'R';
            break;
        case 'r':
            nextClass = 'c';
            nextText = 'C';
            break;
        case 'c':
            nextClass = 'i';
            nextText = 'I';
            break;
        default:
            nextClass = 'a';
            nextText = 'A';
            break;
    }
    
    badge.classList.add(nextClass);
    badge.textContent = nextText;
    saveRACIToSheets(); // Auto-save after edit
}

function addHeatmapBadge(cell) {
    const newBadge = document.createElement('span');
    newBadge.className = 'heatmap-badge a';
    newBadge.textContent = 'A';
    cell.appendChild(newBadge);
    saveRACIToSheets(); // Auto-save after adding badge
}

// Save RACI matrix to Google Sheets
async function saveRACIToSheets() {
    console.log('💾 Saving RACI matrix to Google Sheets...');
    
    const rows = [['responsibility', 'marc', 'anthony', 'geremia', 'francis', 'tom', 'rogi', 'jon']]; // Header
    
    // Extract all RACI data from the heatmap tables
    const tables = document.querySelectorAll('.heatmap-table');
    tables.forEach(table => {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        tbody.querySelectorAll('tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 0) return;
            
            const responsibility = cells[0].textContent.trim();
            const raciValues = [];
            
            // Extract RACI codes from each person column (skip first column which is responsibility name)
            for (let i = 1; i < cells.length; i++) {
                const badges = cells[i].querySelectorAll('.heatmap-badge');
                const codes = Array.from(badges).map(b => b.textContent.trim()).join(',');
                raciValues.push(codes || '');
            }
            
            rows.push([responsibility, ...raciValues]);
        });
    });
    
    const success = await writeToSheet('raci_matrix', rows);
    
    if (success) {
        console.log('✅ RACI matrix saved to Google Sheets');
        showSaveNotification();
    } else {
        console.log('❌ Failed to save RACI matrix');
    }
}

// Load RACI matrix from Google Sheets
async function loadRACIFromSheets() {
    const data = await readFromSheet('raci_matrix');
    if (!data || data.length <= 1) {
        console.log('📋 No RACI data found in sheets, using defaults');
        return;
    }
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
        const [responsibility, marc, anthony, geremia, francis, tom, rogi, jon] = data[i];
        
        // Find the row in the heatmap with this responsibility name
        const tables = document.querySelectorAll('.heatmap-table');
        tables.forEach(table => {
            const tbody = table.querySelector('tbody');
            if (!tbody) return;
            
            tbody.querySelectorAll('tr').forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length === 0) return;
                
                const rowResponsibility = cells[0].textContent.trim();
                if (rowResponsibility === responsibility) {
                    // Update each person's column
                    const raciData = [marc, anthony, geremia, francis, tom, rogi, jon];
                    for (let j = 0; j < raciData.length; j++) {
                        const cellIndex = j + 1; // +1 because first column is responsibility name
                        if (cells[cellIndex]) {
                            const cell = cells[cellIndex].querySelector('.heatmap-cell');
                            if (cell) {
                                // Clear existing badges
                                cell.innerHTML = '';
                                
                                // Add new badges from saved data
                                const codes = raciData[j].split(',').filter(c => c.trim());
                                codes.forEach(code => {
                                    const badge = document.createElement('span');
                                    badge.className = `heatmap-badge ${code.toLowerCase()}`;
                                    badge.textContent = code;
                                    cell.appendChild(badge);
                                });
                            }
                        }
                    }
                }
            });
        });
    }
    
    console.log('✅ RACI matrix loaded from Google Sheets');
}

// Initialize heat map when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeatmap);
} else {
    initHeatmap();
}
