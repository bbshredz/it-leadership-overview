// ==================== GOOGLE SHEETS INTEGRATION ====================

const SHEET_CONFIG = {
    spreadsheetId: '1WCPNNt1op5DkdPvX9DDlo6txw6SfIK51HYZng5v2KJY',
    apiKey: 'AIzaSyCH_acdiNmWkt_myzA7ML71e7CAuo-zHi8',
    clientId: '593454334812-qp5ic5292vbe273ina2f6egru32qc5r1.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    baseUrl: 'https://sheets.googleapis.com/v4/spreadsheets'
};

let accessToken = null;
let tokenClient = null;

// Initialize Google Identity Services
function initializeGoogleAuth() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: SHEET_CONFIG.clientId,
        scope: SHEET_CONFIG.scope,
        callback: (response) => {
            if (response.access_token) {
                accessToken = response.access_token;
                console.log('✅ Authenticated with Google');
                updateAuthUI(true);
                
                // Try to load data after auth
                loadKanbanFromSheets();
            }
        },
    });
    
    // Check if we already have a token in session storage
    const savedToken = sessionStorage.getItem('google_access_token');
    if (savedToken) {
        accessToken = savedToken;
        updateAuthUI(true);
        console.log('📋 Using saved access token');
    }
}

// Sign in with Google
function signInWithGoogle() {
    if (tokenClient) {
        tokenClient.requestAccessToken();
    }
}

// Sign out
function signOutGoogle() {
    accessToken = null;
    sessionStorage.removeItem('google_access_token');
    google.accounts.oauth2.revoke(accessToken, () => {
        console.log('Signed out');
    });
    updateAuthUI(false);
}

// Reload data from Google Sheets
async function reloadFromSheet() {
    console.log('🔄 Reloading from Google Sheets...');
    const sheetsData = await loadKanbanFromSheets();
    
    if (sheetsData) {
        kanbanData = sheetsData;
        renderKanban();
        showSaveNotification('✅ Reloaded from Sheet');
        console.log('✅ Data reloaded from Google Sheets');
    } else {
        showSaveNotification('⚠️ Could not load from Sheet');
        console.log('⚠️ Failed to reload from sheets');
    }
}

// Update UI based on auth state
function updateAuthUI(isAuthenticated) {
    const authButton = document.getElementById('google-auth-btn');
    if (authButton) {
        if (isAuthenticated) {
            authButton.textContent = '✅ Signed In';
            authButton.classList.add('authenticated');
            authButton.onclick = signOutGoogle;
            // Save token
            if (accessToken) {
                sessionStorage.setItem('google_access_token', accessToken);
            }
        } else {
            authButton.textContent = '🔐 Sign in with Google';
            authButton.classList.remove('authenticated');
            authButton.onclick = signInWithGoogle;
        }
    }
}

// Helper: Read from Google Sheet
async function readFromSheet(tabName) {
    const url = `${SHEET_CONFIG.baseUrl}/${SHEET_CONFIG.spreadsheetId}/values/${tabName}?key=${SHEET_CONFIG.apiKey}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error('Failed to read from sheet:', response.statusText);
            return null;
        }
        const data = await response.json();
        return data.values || [];
    } catch (error) {
        console.error('Error reading from sheet:', error);
        return null;
    }
}

// Helper: Write to Google Sheet (requires OAuth)
async function writeToSheet(tabName, values) {
    if (!accessToken) {
        console.warn('⚠️ Not authenticated. Please sign in with Google to save data.');
        // Save to localStorage as fallback
        localStorage.setItem(`sheet_${tabName}`, JSON.stringify(values));
        return false;
    }

    const url = `${SHEET_CONFIG.baseUrl}/${SHEET_CONFIG.spreadsheetId}/values/${tabName}?valueInputOption=RAW`;
    
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: values
            })
        });
        
        if (!response.ok) {
            console.error('Failed to write to sheet:', response.statusText);
            // Fallback to localStorage
            localStorage.setItem(`sheet_${tabName}`, JSON.stringify(values));
            return false;
        }
        
        console.log(`✅ Data written to sheet: ${tabName}`);
        return true;
    } catch (error) {
        console.error('Error writing to sheet:', error);
        // Fallback to localStorage
        localStorage.setItem(`sheet_${tabName}`, JSON.stringify(values));
        return false;
    }
}

// Load Kanban data from Google Sheets
async function loadKanbanFromSheets() {
    console.log('📥 Loading data from Google Sheets...');
    
    const currentData = await readFromSheet('responsibilities_current');
    const futureData = await readFromSheet('responsibilities_future');
    
    if (!currentData || !futureData || currentData.length <= 1) {
        console.log('⚠️ No data in sheets. Using defaults.');
        return null;
    }

    // Parse sheet data into kanbanData structure
    const currentParsed = parseSheetToKanban(currentData);
    const futureParsed = parseSheetToKanban(futureData);
    
    const parsedData = {
        current: currentParsed.kanban,
        future: futureParsed.kanban
    };
    
    // Also load key responsibilities
    keyResponsibilities.current = currentParsed.keys;
    keyResponsibilities.future = futureParsed.keys;

    // Store tasks maps
    responsibilityTasks.current = currentParsed.tasksMap;
    responsibilityTasks.future = futureParsed.tasksMap;

    console.log('✅ Data loaded from Google Sheets');
    return parsedData;
}

// Convert sheet rows to kanban structure
function parseSheetToKanban(rows) {
    const kanban = {
        backlog: [],
        anthony: [],
        geremia: [],
        francis: [],
        tom: [],
        rogi: [],
        jon: []
    };

    const keys = {
        anthony: [],
        geremia: [],
        francis: [],
        tom: [],
        rogi: [],
        jon: []
    };

    const tasksMap = {}; // Store tasks for each responsibility

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
        const [person, responsibility, isKey, tasksString] = rows[i];
        if (person && responsibility) {
            const personKey = person.toLowerCase();
            if (kanban[personKey] !== undefined) {
                kanban[personKey].push(responsibility);
                
                // Track if marked as key
                if (isKey === 'TRUE' || isKey === 'true' || isKey === true) {
                    keys[personKey].push(responsibility);
                }

                // Parse and store tasks if present
                if (tasksString && tasksString.trim()) {
                    const tasks = tasksString.split(';').map(t => t.trim()).filter(t => t);
                    tasksMap[responsibility] = tasks;
                }
            }
        }
    }

    return { kanban, keys, tasksMap };
}

// Convert kanban structure to sheet rows
function kanbanToSheetRows(kanbanState, state) {
    const rows = [['person', 'responsibility', 'is_key', 'tasks']]; // Header row with tasks column
    
    Object.keys(kanbanState).forEach(person => {
        const responsibilities = kanbanState[person];
        const keyResps = keyResponsibilities[state][person] || [];
        const tasksMap = responsibilityTasks[state] || {};
        
        responsibilities.forEach(responsibility => {
            const isKey = keyResps.includes(responsibility);
            const tasks = tasksMap[responsibility] || [];
            const tasksString = tasks.length > 0 ? tasks.join('; ') : '';
            rows.push([person, responsibility, isKey ? 'TRUE' : 'FALSE', tasksString]);
        });
    });

    return rows;
}

// Save Kanban data to Google Sheets
async function saveKanbanToSheets() {
    console.log('💾 Saving data to Google Sheets...');
    
    const currentRows = kanbanToSheetRows(kanbanData.current, 'current');
    const futureRows = kanbanToSheetRows(kanbanData.future, 'future');
    
    const currentSuccess = await writeToSheet('responsibilities_current', currentRows);
    const futureSuccess = await writeToSheet('responsibilities_future', futureRows);
    
    if (currentSuccess && futureSuccess) {
        console.log('✅ Data saved to Google Sheets');
        showSaveNotification('Saved to Google Sheets');
        return true;
    } else {
        console.log('💾 Saved to browser (sign in to sync with Google Sheets)');
        showSaveNotification('Saved locally');
        return false;
    }
}

// Show save notification
function showSaveNotification(message) {
    const notification = document.getElementById('save-notification');
    if (notification) {
        notification.textContent = message;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 2000);
    }
}
