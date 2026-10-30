const STATE_KEY = 'multimedia_app_state';
const TEMPLATES_KEY = 'multimedia_app_templates';

// App state management
let appState = JSON.parse(localStorage.getItem(STATE_KEY)) || {
    activeSlideIndex: 0,
    status: 'SHOW' // 'SHOW', 'CLEAR', 'BLACK'
};

// Default template slides
let templates = JSON.parse(localStorage.getItem(TEMPLATES_KEY)) || [
    { id: 1, title: 'Welcome Slide', content: 'Welcome to the Presentation' },
    { id: 2, title: 'Slide Two', content: 'Here is your second point or lyric.' },
    { id: 3, title: 'Conclusion', content: 'Thank you for watching!' }
];

// DOM Elements
const templateBar = document.getElementById('templateBar');
const centerEditor = document.getElementById('centerEditor');
const livePreviewBox = document.getElementById('livePreviewBox');
const btnShow = document.getElementById('btnShow');
const btnClear = document.getElementById('btnClear');
const btnBlack = document.getElementById('btnBlack');

// Helper to convert HTML editor content safely to plain text / newlines
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

// Update UI and Live Previews
function updateApp() {
    // Save current editor text to active template
    if (templates[appState.activeSlideIndex]) {
        templates[appState.activeSlideIndex].content = getEditorContent();
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    }

    // Determine output based on presentation status
    let displayContent = templates[appState.activeSlideIndex]?.content || '';
    if (appState.status === 'CLEAR' || appState.status === 'BLACK') {
        displayContent = '';
    }

    // Render onto the Live Monitor preview box
    if (livePreviewBox) {
        livePreviewBox.textContent = displayContent;
    }

    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
}

// Render the left-side template / slide list
function renderTemplates() {
    if (!templateBar) return;
    templateBar.innerHTML = '';

    templates.forEach((tpl, index) => {
        const card = document.createElement('div');
        card.className = `slide-thumb ${index === appState.activeSlideIndex ? 'active' : ''}`;
        card.textContent = tpl.title;

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

// Event Listeners for live typing
if (centerEditor) {
    centerEditor.addEventListener('input', () => {
        updateApp();
    });
}

// Toolbar Action Controls
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

// Initialization
function init() {
    if (templates.length > 0) {
        setEditorContent(templates[appState.activeSlideIndex].content);
    }
    renderTemplates();
    updateApp();
}

init();
