const STATE_KEY = 'multimedia_clean_state';
const TEMPLATES_KEY = 'multimedia_clean_templates';

let appState = JSON.parse(localStorage.getItem(STATE_KEY)) || {
    currentText: 'Welcome to your Multimedia App',
    viewMode: 'MAIN',
    status: 'SHOW'
};

let templates = JSON.parse(localStorage.getItem(TEMPLATES_KEY)) || [
    { id: 1, title: 'Welcome Slide', view: 'MAIN', content: 'Welcome to your Multimedia App' },
    { id: 2, title: 'Verse 1 (Main)', view: 'MAIN', content: 'Panginoon, kay tapat Mo' },
    { id: 3, title: 'Verse 1 (Chords/CP)', view: 'CP', content: '[Verse 1]\nC   G   Am   F\nPanginoon, kay tapat Mo' },
    { id: 4, title: 'Chorus (Main)', view: 'MAIN', content: 'Purihin ang Pangalan Mo' },
    { id: 5, title: 'Chorus (Chords/CP)', view: 'CP', content: '[Chorus]\nF   G   C   Am\nPurihin ang Pangalan Mo' }
];

const templateBar = document.getElementById('templateBar');
const centerEditorInput = document.getElementById('centerEditorInput');
const centerCanvasBox = document.getElementById('centerCanvasBox');
const editingModeLabel = document.getElementById('editingModeLabel');
const btnSwitchView = document.getElementById('btnSwitchView');
const mainLivePreview = document.getElementById('mainLivePreview');
const cpLivePreview = document.getElementById('cpLivePreview');

// Helper to convert HTML breaks to plain text with newlines for state/previews
function getEditorText() {
    if (!centerEditorInput) return '';
    // Replace <br> tags with newlines, and strip other html tags safely
    return centerEditorInput.innerHTML
        .replace(/<div><br><\/div>/gi, '\n')
        .replace(/<div>/gi, '\n')
        .replace(/<\/div>/gi, '')
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/&nbsp;/g, ' ');
}

function setEditorText(text) {
    if (!centerEditorInput) return;
    // Convert newlines to innerHTML breaks so lines stack properly
    centerEditorInput.innerHTML = text.replace(/\n/g, '<br>');
}

function updateApp() {
    if (centerEditorInput) {
        appState.currentText = getEditorText();
    }

    let displayContent = appState.currentText;
    if (appState.status === 'CLEAR' || appState.status === 'BLACK') {
        displayContent = '';
    }

    if (mainLivePreview) mainLivePreview.textContent = '';
    if (cpLivePreview) cpLivePreview.textContent = '';

    if (appState.viewMode === 'MAIN') {
        if (mainLivePreview) mainLivePreview.textContent = displayContent;
    } else {
        if (cpLivePreview) cpLivePreview.textContent = displayContent;
    }

    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
}

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

            setEditorText(tpl.content);
            
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

if (centerEditorInput) {
    centerEditorInput.addEventListener('input', () => {
        updateApp();
    });
}

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

function init() {
    setEditorText(appState.currentText);
    
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
