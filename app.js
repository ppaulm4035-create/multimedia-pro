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

    // 3. Render templates using exact live monitor component markup
    renderTemplates();

    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
}

function renderTemplates() {
    if (!templateBar) return;
    templateBar.innerHTML = '';

    templates.forEach((tpl, index) => {
        // Exact structural duplicate of the right panel's preview-card
        const wrapper = document.createElement('div');
        wrapper.className = `template-card-wrapper ${index === appState.activeSlideIndex ? 'active' : ''}`;

        const label = document.createElement('span');
        label.textContent = `Slide ${index + 1}`;

        const canvasBox = document.createElement('div');
        canvasBox.className = 'canvas-box live-box-small';

        const textOutput = document.createElement('div');
        textOutput.className = 'editor-output live-text-small';
        textOutput.textContent = tpl.content;

        canvasBox.appendChild(textOutput);
        wrapper.appendChild(label);
        wrapper.appendChild(canvasBox);

        // Click to load slide into editing screen
        wrapper.addEventListener('click', () => {
            appState.activeSlideIndex = index;
            appState.status = 'SHOW';
            if (centerEditor) {
                centerEditor.value = tpl.content;
            }
            updateApp();
        });

        templateBar.appendChild(wrapper);
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
