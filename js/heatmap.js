// ==================== INTERACTIVE HEAT MAP ====================

let heatmapEditMode = false;

function initHeatmap() {
    const toggleBtn = document.getElementById('toggle-heatmap-edit');
    
    // Load RACI data from sheets (and seed if empty)
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

// ==================== COLUMN MAPPING ====================
// The RACI HTML tables have VARYING column counts:
// - Some tables: Domain | Marc | Anthony | Geremia | Francis | Tom | Rogi  (7 cols, NO Jon)
// - Some tables: Domain | Marc | Anthony | Geremia | Francis | Tom | Rogi | Jon  (8 cols, WITH Jon)
// The Google Sheet always has: responsibility | marc | anthony | geremia | francis | tom | rogi | jon
//
// FIX: We detect column count per table from the <thead> and map accordingly.

const PERSON_ORDER = ['marc', 'anthony', 'geremia', 'francis', 'tom', 'rogi', 'jon'];

// Get the person columns for a specific table by reading its thead
function getTablePersonColumns(table) {
    const headers = table.querySelectorAll('thead th');
    const personCols = [];
    for (let i = 1; i < headers.length; i++) { // skip first "Domain / Activity" column
        const name = headers[i].textContent.trim().toLowerCase();
        personCols.push(name);
    }
    return personCols;
}

// ==================== SAVE RACI TO SHEETS ====================

async function saveRACIToSheets() {
    console.log('💾 Saving RACI matrix to Google Sheets...');
    
    // Header row always has all 7 people
    const rows = [['responsibility', 'marc', 'anthony', 'geremia', 'francis', 'tom', 'rogi', 'jon']];
    
    // Extract all RACI data from the heatmap tables
    const tables = document.querySelectorAll('.heatmap-table');
    tables.forEach(table => {
        const personCols = getTablePersonColumns(table);
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        tbody.querySelectorAll('tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 0) return;
            
            const responsibility = cells[0].textContent.trim();
            
            // Build a map of person -> RACI codes for THIS row
            const raciMap = {};
            PERSON_ORDER.forEach(p => raciMap[p] = ''); // default empty for all
            
            for (let i = 0; i < personCols.length; i++) {
                const cellIndex = i + 1; // +1 because first cell is responsibility name
                if (cells[cellIndex]) {
                    const badges = cells[cellIndex].querySelectorAll('.heatmap-badge');
                    const codes = Array.from(badges).map(b => b.textContent.trim()).join(',');
                    raciMap[personCols[i]] = codes || '';
                }
            }
            
            // Write row in consistent order
            rows.push([
                responsibility,
                raciMap.marc,
                raciMap.anthony,
                raciMap.geremia,
                raciMap.francis,
                raciMap.tom,
                raciMap.rogi,
                raciMap.jon
            ]);
        });
    });
    
    const success = await writeToSheet('raci_matrix', rows);
    
    if (success) {
        console.log('✅ RACI matrix saved to Google Sheets (' + (rows.length - 1) + ' rows)');
        showSaveNotification('RACI saved to Google Sheets');
    } else {
        console.log('❌ Failed to save RACI matrix (not authenticated or network error)');
    }
}

// ==================== LOAD RACI FROM SHEETS ====================

async function loadRACIFromSheets() {
    const data = await readFromSheet('raci_matrix');
    
    if (!data || data.length <= 1) {
        console.log('📋 No RACI data found in sheets — seeding from HTML defaults...');
        // Seed Google Sheets with the default RACI data from the DOM
        // Use a short delay to ensure DOM is fully rendered
        setTimeout(async () => {
            await saveRACIToSheets();
            console.log('🌱 RACI defaults seeded to Google Sheets');
        }, 1500);
        return;
    }
    
    // Parse header to get column indices
    const header = data[0].map(h => h.toLowerCase().trim());
    const colIndex = {};
    PERSON_ORDER.forEach(p => {
        colIndex[p] = header.indexOf(p);
    });
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const responsibility = row[0];
        if (!responsibility) continue;
        
        // Build RACI values for each person from the sheet data
        const raciValues = {};
        PERSON_ORDER.forEach(person => {
            const idx = colIndex[person];
            raciValues[person] = (idx >= 0 && row[idx]) ? row[idx] : '';
        });
        
        // Find the matching row in the HTML heatmap tables
        const tables = document.querySelectorAll('.heatmap-table');
        tables.forEach(table => {
            const personCols = getTablePersonColumns(table);
            const tbody = table.querySelector('tbody');
            if (!tbody) return;
            
            tbody.querySelectorAll('tr').forEach(htmlRow => {
                const cells = htmlRow.querySelectorAll('td');
                if (cells.length === 0) return;
                
                const rowResponsibility = cells[0].textContent.trim();
                if (rowResponsibility === responsibility) {
                    // Update each person's column that exists in THIS table
                    for (let j = 0; j < personCols.length; j++) {
                        const personName = personCols[j];
                        const cellIndex = j + 1;
                        if (cells[cellIndex]) {
                            const cell = cells[cellIndex].querySelector('.heatmap-cell');
                            if (cell) {
                                // Clear existing badges
                                cell.innerHTML = '';
                                
                                // Add new badges from saved data
                                const codesStr = raciValues[personName] || '';
                                const codes = codesStr.split(',').filter(c => c.trim());
                                codes.forEach(code => {
                                    const badge = document.createElement('span');
                                    badge.className = `heatmap-badge ${code.toLowerCase().trim()}`;
                                    badge.textContent = code.trim();
                                    cell.appendChild(badge);
                                });
                            }
                        }
                    }
                }
            });
        });
    }
    
    console.log('✅ RACI matrix loaded from Google Sheets (' + (data.length - 1) + ' rows)');
}

// Initialize heat map when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeatmap);
} else {
    initHeatmap();
}
