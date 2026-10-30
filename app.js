const STATE_KEY = 'multimedia_studio_state';
const TEMPLATES_KEY = 'multimedia_studio_templates';

let appState = JSON.parse(localStorage.getItem(STATE_KEY)) || {
    activeSlideIndex: 0,
    status: 'SHOW'
};

let templates = JSON.parse(localStorage.getItem(TEMPLATES_KEY)) || [
    { id: 1, title: 'Slide 1', content: "Sa 'Yong biyaya, ako\nay namamangha" },
    { id: 2, title: 'Slide 2', content: "Sa 'Yong kalinga,\npanganib ay 'di banta" },
    { id: 3, title: 'Slide 3', content: "Sa pag-ibig Mo,\npalaging ligtas ang puso" }
];

const templateBar = document.getElementById('templateBar');
const centerEditor = document.getElementById('centerEditor');
const livePreviewBox = document.getElementById('livePreviewBox');
const btnClear = document.getElementById('btnClear');
const btnBlack = document.getElementById('btnBlack');

function updateApp() {
    const currentText = centerEditor ? centerEditor.value : '';

    // 1. Sync current text to active slide template
    if (templates[appState.activeSlideIndex]) {
        templates[appState.activeSlideIndex].content = currentText;
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    }

    // 2. Determine display output for live monitor
    let displayContent = currentText;
    if (appState.status === 'CLEAR') {
        displayContent = '';
        livePreviewBox.style.color = 'white';
    } else if (appState.status === 'BLACK') {
        displayContent = '';
        livePreviewBox.style.color = 'transparent';
    } else {
        livePreviewBox.style.color = 'white';
    }

    livePreviewBox.textContent = displayContent;

    // 3. Render left templates as exact miniature clones
    renderTemplates();

    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
}

function renderTemplates() {
    if (!templateBar) return;
    templateBar.innerHTML = '';

    templates.forEach((tpl, index) => {
        const card = document.createElement('div');
        card.className = `slide-thumb ${index === appState.activeSlideIndex ? 'active' : ''}`;
        
        const thumbText = document.createElement('div');
        thumbText.className = 'thumb-text';
        thumbText.textContent = tpl.content;
        
        card.appendChild(thumbText);

        card.addEventListener('click', () => {
            appState.activeSlideIndex = index;
            appState.status = 'SHOW';
            if (centerEditor) {
                centerEditor.value = tpl.content;
            }
            updateApp();
        });

        templateBar.appendChild(card);
    });
}

if (centerEditor) {
    centerEditor.addEventListener('input', () => {
        appState.status = 'SHOW';
        updateApp();
    });
}

btnClear?.addEventListener('click', () => {
    appState.status = 'CLEAR';
    if (centerEditor) centerEditor.value = '';
    updateApp();
});

btnBlack?.addEventListener('click', () => {
    appState.status = appState.status === 'BLACK' ? 'SHOW' : 'BLACK';
    updateApp();
});

function init() {
    if (templates.length > 0 && centerEditor) {
        centerEditor.value = templates[appState.activeSlideIndex].content;
    }
    renderTemplates();
    updateApp();
}

init();
