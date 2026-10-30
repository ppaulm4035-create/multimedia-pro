// --- Constants & State Initialization ---
const STATE_KEY = 'multimedia_app_state';
const TEMPLATES_KEY = 'multimedia_app_templates';

let appState = JSON.parse(localStorage.getItem(STATE_KEY)) || {
    currentText: 'Welcome to your Multimedia App',
    viewMode: 'MAIN', // 'MAIN' or 'CP'
    status: 'SHOW'    // 'SHOW', 'CLEAR', or 'BLACK'
};

let defaultTemplates = [
    { id: 1, title: 'Welcome Slide', view: 'MAIN', content: 'Welcome to your Multimedia App' },
    { id: 2, title: 'Verse 1 (Main)', view: 'MAIN', content: 'Panginoon, kay tapat Mo' },
    { id: 3, title: 'Verse 1 (Chords/CP)', view: 'CP', content: '[Verse 1]\nC   G   Am   F\nPanginoon, kay tapat Mo' },
    { id: 4, title: 'Chorus (Main)', view: 'MAIN', content: 'Purihin ang Pangalan Mo' },
    { id: 5, title: 'Chorus (Chords/CP)', view: 'CP', content: '[Chorus]\nF   G   C   Am\nPurihin ang Pangalan Mo' }
];

let templates = JSON.parse(localStorage.getItem(TEMPLATES_KEY)) || defaultTemplates;

// --- DOM Elements ---
const templateBar = document.getElementById('templateBar');
const centerEditorInput = document.getElementById('centerEditorInput');
const centerCanvasBox = document.getElementById('centerCanvasBox');
const editingModeLabel = document.getElementById('editingModeLabel');
const btnSwitchView = document.getElementById('btnSwitchView');
const mainLivePreview = document.getElementById('mainLivePreview');
const cpLivePreview = document.getElementById('cpLivePreview');

// --- Core Render & Sync Function ---
function updateApp() {
    // 1. Save current editor text back to state
    if (centerEditorInput) {
        appState.currentText = centerEditorInput.textContent;
    }

    // 2. Handle Display Status (Show, Clear, Blackout)
    let displayContent = appState.currentText;
    if (appState.status === 'CLEAR' || appState.status === 'BLACK') {
        displayContent = '';
    }

    // 3. Update Previews based on active view mode
    if (appState.viewMode === 'MAIN') {
        if (mainLivePreview) mainLivePreview.textContent = displayContent;
    } else {
        if (cpLivePreview) cpLivePreview.textContent = displayContent;
    }

    // 4. Persist state to LocalStorage
    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
}

// --- Render Template Cards on the Left ---
function renderTemplates() {
    if (!templateBar) return;
    templateBar.innerHTML = '';

    templates.forEach(tpl => {
        const card = document.createElement('div');
        card.className = 'slide-thumb';
        card.textContent = tpl.title;

        card.addEventListener('click', () => {
            appState.viewMode = tpl.view;
            appState.currentText = tpl.content;
            appState.status = 'SHOW';

            // Sync Editor & UI layout with template view mode
            if (centerEditorInput) centerEditorInput.textContent = tpl.content;
            
            if (tpl.view === 'CP') {
                editingModeLabel.textContent = 'EDITING: CP VIEW (PORTRAIT)';
                btnSwitchView.textContent = 'SWITCH TO MAIN VIEW';
                centerCanvasBox.classList.remove('landscape');
                centerCanvasBox.classList.add('portrait');
            } else {
                editingModeLabel.textContent = 'EDITING: MAIN VIEW (LANDSCAPE)';
                btnSwitchView.textContent = 'SWITCH TO CP VIEW';
                centerCanvasBox.classList.remove('portrait');
                centerCanvasBox.classList.add('landscape');
            }

            updateApp();
        });

        templateBar.appendChild(card);
    });
}

// --- Event Listeners ---

// Live input typing in center canvas
if (centerEditorInput) {
    centerEditorInput.addEventListener('input', () => {
        updateApp();
    });
}

// Switch View Button (Main vs CP)
if (btnSwitchView) {
    btnSwitchView.addEventListener('click', () => {
        if (appState.viewMode === 'MAIN') {
            appState.viewMode = 'CP';
            editingModeLabel.textContent = 'EDITING: CP VIEW (PORTRAIT)';
            btnSwitchView.textContent = 'SWITCH TO MAIN VIEW';
            centerCanvasBox.classList.remove('landscape');
            centerCanvasBox.classList.add('portrait');
        } else {
            appState.viewMode = 'MAIN';
            editingModeLabel.textContent = 'EDITING: MAIN VIEW (LANDSCAPE)';
            btnSwitchView.textContent = 'SWITCH TO CP VIEW';
            centerCanvasBox.classList.remove('portrait');
            centerCanvasBox.classList.add('landscape');
        }
        updateApp();
    });
}

// Top Action Controls
document.getElementById('btnPushLive')?.addEventListener('click', () => {
    appState.status = 'SHOW';
    updateApp();
});

document.getElementById('btnClear')?.addEventListener('click', () => {
    appState.status = 'CLEAR';
    updateApp();
});

document.getElementById('btnBlack')?.addEventListener('click', () => {
    appState.status = 'BLACK';
    updateApp();
});

// --- Initialization ---
function init() {
    if (centerEditorInput) {
        centerEditorInput.textContent = appState.currentText;
    }
    
    // Set initial canvas styling based on state viewMode
    if (appState.viewMode === 'CP') {
        editingModeLabel.textContent = 'EDITING: CP VIEW (PORTRAIT)';
        btnSwitchView.textContent = 'SWITCH TO MAIN VIEW';
        centerCanvasBox.classList.remove('landscape');
        centerCanvasBox.classList.add('portrait');
    }

    renderTemplates();
    updateApp();
}

init();
