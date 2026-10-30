const STATE_KEY = 'multimedia_single_state';

let appState = JSON.parse(localStorage.getItem(STATE_KEY)) || {
    content: "Sa 'Yong biyaya, ako\nay namamangha\nSa 'Yong kalinga,\npanganib ay 'di banta\nSa pag-ibig Mo,\npalaging ligtas ang puso",
    status: 'SHOW'
};

const centerEditor = document.getElementById('centerEditor');
const btnClear = document.getElementById('btnClear');
const btnBlack = document.getElementById('btnBlack');

function getEditorContent() {
    if (!centerEditor) return '';
    return centerEditor.innerHTML
        .replace(/<div><br><\/div>/gi, '\n')
        .replace(/<div>/gi, '\n')
        .replace(/<\/div>/gi, '')
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/&nbsp;/g, ' ');
}

function setEditorContent(text) {
    if (!centerEditor) return;
    centerEditor.innerHTML = text.replace(/\n/g, '<br>');
}

function updateApp() {
    if (appState.status === 'CLEAR' || appState.status === 'BLACK') {
        if (appState.status === 'CLEAR') {
            centerEditor.innerHTML = '';
        } else if (appState.status === 'BLACK') {
            centerEditor.style.color = 'transparent';
        }
    } else {
        centerEditor.style.color = 'white';
    }

    appState.content = getEditorContent();
    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
}

if (centerEditor) {
    centerEditor.addEventListener('input', () => {
        appState.status = 'SHOW';
        updateApp();
    });
}

btnClear?.addEventListener('click', () => {
    appState.status = 'CLEAR';
    centerEditor.innerHTML = '';
    updateApp();
});

btnBlack?.addEventListener('click', () => {
    appState.status = appState.status === 'BLACK' ? 'SHOW' : 'BLACK';
    updateApp();
});

function init() {
    setEditorContent(appState.content);
    updateApp();
}

init();
