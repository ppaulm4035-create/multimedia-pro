const STATE_KEY = 'multimedia_app_state';
const TEMPLATES_KEY = 'multimedia_app_templates';

let appState = JSON.parse(localStorage.getItem(STATE_KEY)) || {
    activeSlideIndex: 0,
    status: 'SHOW'
};

let templates = JSON.parse(localStorage.getItem(TEMPLATES_KEY)) || [
    { id: 1, title: 'Slide 1', content: 'Welcome to the Presentation' },
    { id: 2, title: 'Slide 2', content: 'Here is your second point or lyric.' },
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

function updateApp() {
    if (templates[appState.activeSlideIndex]) {
        templates[appState.activeSlideIndex].content = getEditorContent();
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    }

    let displayContent = templates[appState.activeSlideIndex]?.content || '';
    if (appState.status === 'CLEAR' || appState.status === 'BLACK') {
        displayContent = '';
    }

    if (livePreviewBox) {
        livePreviewBox.textContent = displayContent;
    }

    // Update left thumbnail preview text instantly
    renderTemplates();

    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
}

function renderTemplates() {
    if (!templateBar) return;
    templateBar.innerHTML = '';

    templates.forEach((tpl, index) => {
        const card = document.createElement('div');
        card.className = `slide-thumb ${index === appState.activeSlideIndex ? 'active' : ''}`;
        
        // Show slide title and a mini preview of the content inside the thumbnail
        card.innerHTML = `<strong>Slide ${index + 1}</strong><div style="font-size: 0.5rem; opacity: 0.8; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${tpl.content}</div>`;

        card.addEventListener('click', () => {
            appState.activeSlideIndex = index;
            appState.status = 'SHOW';
            setEditorContent(tpl.content);
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
