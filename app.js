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

function updateApp() {
    if (centerEditorInput) {
        appState.currentText = centerEditorInput.innerText;
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

            if (centerEditorInput) centerEditorInput.innerText = tpl.content;
            
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

    // Fix Enter key behavior to insert proper line breaks smoothly
    centerEditorInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            const range = selection.getRangeAt(0);
            
            range.deleteContents();
            const textNode = document.createTextNode('\n');
            range.insertNode(textNode);
            
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);
            
            updateApp();
        }
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
    if (centerEditorInput) {
        centerEditorInput.innerText = appState.currentText;
    }
    
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
