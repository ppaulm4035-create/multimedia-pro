const STATE_KEY = 'multimedia_main_state';
const TEMPLATES_KEY = 'multimedia_main_templates';

let appState = JSON.parse(localStorage.getItem(STATE_KEY)) || {
    activeSlideIndex: 0,
    status: 'SHOW'
};

let templates = JSON.parse(localStorage.getItem(TEMPLATES_KEY)) || [
    { id: 1, title: 'Slide 1', content: 'Welcome to the Presentation' },
    { id: 2, title: 'Slide 2', content: 'Here is your second point.' },
    { id: 3, title: 'Slide 3', content: 'Thank you for watching!' }
];

const templateBar = document.getElementById('templateBar');
const centerEditor = document.getElementById('centerEditor');
const livePreviewBox = document.getElementById('livePreviewBox');
const btnShow = document.getElementById('btnShow');
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

// Update everything directly from the Editing Screen (The Main source)
function updateApp() {
    const currentText = getEditorContent();

    // 1. Save to active template
    if (templates[appState.activeSlideIndex]) {
        templates[appState.activeSlideIndex].content = currentText;
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    }

    // 2. Determine output for live monitor
    let displayContent = currentText;
    if (appState.status === 'CLEAR' || appState.status === 'BLACK') {
        displayContent = '';
    }

    // 3. Mirror onto Live Monitor
    if (livePreviewBox) {
        livePreviewBox.textContent = displayContent;
    }

    // 4. Mirror onto Template Thumbnails
    renderTemplates();

    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
}

function renderTemplates() {
    if (!templateBar) return;
    templateBar.innerHTML = '';

    templates.forEach((tpl, index) => {
        const card = document.createElement('div');
        card.className = `slide-thumb ${index === appState.activeSlideIndex ? 'active' : ''}`;
        
        // Mirror the exact content of the slide directly
        card.textContent = tpl.content;

        card.addEventListener('click', () => {
            appState.activeSlideIndex = index;
            appState.status = 'SHOW';
            setEditorContent(tpl.content);
            renderTemplates();
            updateApp();
        });

        templateBar.appendChild(card);
    });
}

if (centerEditor) {
    centerEditor.addEventListener('input', () => {
        updateApp();
    });
}

btnShow?.addEventListener('click', () => {
    appState.status = 'SHOW';
    updateApp();
});

btnClear?.addEventListener('click', () => {
    appState.status = 'CLEAR';
    updateApp();
});

btnBlack?.addEventListener('click', () => {
    appState.status = 'BLACK';
    updateApp();
});

function init() {
    if (templates.length > 0) {
        setEditorContent(templates[appState.activeSlideIndex].content);
    }
    renderTemplates();
    updateApp();
}

init();
