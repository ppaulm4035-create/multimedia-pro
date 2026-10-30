const STATE_KEY = 'multimedia_studio_state';

let appState = JSON.parse(localStorage.getItem(STATE_KEY)) || {
    editingContent: "Sa 'Yong biyaya, ako\nay namamangha\nSa 'Yong kalinga,\npanganib ay 'di banta",
    liveContent: "Sa 'Yong biyaya, ako\nay namamangha\nSa 'Yong kalinga,\npanganib ay 'di banta",
    isLive: true,
    status: 'SHOW' // 'SHOW', 'CLEAR', 'BLACK'
};

const centerEditor = document.getElementById('centerEditor');
const livePreviewBox = document.getElementById('livePreviewBox');
const btnGoLive = document.getElementById('btnGoLive');
const btnClear = document.getElementById('btnClear');
const btnBlack = document.getElementById('btnBlack');

function getEditorContent(el) {
    if (!el) return '';
    return el.innerHTML
        .replace(/<div><br><\/div>/gi, '\n')
        .replace(/<div>/gi, '\n')
        .replace(/<\/div>/gi, '')
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/&nbsp;/g, ' ');
}

function setContent(el, text) {
    if (!el) return;
    el.innerHTML = text.replace(/\n/g, '<br>');
}

function updateApp() {
    // 1. Keep track of what's typed in the editing workspace
    appState.editingContent = getEditorContent(centerEditor);

    // 2. Determine what displays on the live monitor based on live state / blackout / clear
    let displayOutput = appState.liveContent;
    if (appState.status === 'CLEAR') {
        displayOutput = '';
    } else if (appState.status === 'BLACK') {
        displayOutput = '';
        livePreviewBox.style.backgroundColor = '#000';
    }

    setContent(livePreviewBox, displayOutput);

    if (appState.status === 'BLACK') {
        livePreviewBox.style.color = 'transparent';
    } else {
        livePreviewBox.style.color = 'white';
        livePreviewBox.style.backgroundColor = 'transparent';
    }

    // Update GO LIVE button visual status
    if (appState.isLive) {
        btnGoLive.classList.add('live-active');
        btnGoLive.textContent = '🟢 LIVE (PUSHED)';
    } else {
        btnGoLive.classList.remove('live-active');
        btnGoLive.textContent = '🔴 GO LIVE (PUSH)';
    }

    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
}

// User types in center editor (Does NOT push to live monitor automatically)
if (centerEditor) {
    centerEditor.addEventListener('input', () => {
        // Just saves local workspace state
        appState.editingContent = getEditorContent(centerEditor);
        localStorage.setItem(STATE_KEY, JSON.stringify(appState));
    });
}

// GO LIVE BUTTON: Pushes the editing screen content out to the Live Monitor
btnGoLive?.addEventListener('click', () => {
    appState.liveContent = getEditorContent(centerEditor);
    appState.status = 'SHOW';
    appState.isLive = true;
    updateApp();
});

btnClear?.addEventListener('click', () => {
    appState.status = 'CLEAR';
    appState.liveContent = '';
    updateApp();
});

btnBlack?.addEventListener('click', () => {
    appState.status = appState.status === 'BLACK' ? 'SHOW' : 'BLACK';
    updateApp();
});

function init() {
    setContent(centerEditor, appState.editingContent);
    setContent(livePreviewBox, appState.liveContent);
    updateApp();
}

init();
