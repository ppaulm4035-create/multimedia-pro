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

let contextTargetIndex = null;

const templateBar = document.getElementById('templateBar');
const centerEditor = document.getElementById('centerEditor');
const livePreviewBox = document.getElementById('livePreviewBox');
const btnClear = document.getElementById('btnClear');
const btnBlack = document.getElementById('btnBlack');
const contextMenu = document.getElementById('contextMenu');

const ctxNew = document.getElementById('ctxNew');
const ctxDuplicate = document.getElementById('ctxDuplicate');
const ctxDelete = document.getElementById('ctxDelete');

function updateApp() {
    const currentText = centerEditor ? centerEditor.value : '';

    if (templates[appState.activeSlideIndex]) {
        templates[appState.activeSlideIndex].content = currentText;
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    }

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
    renderTemplates();

    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
}

function renderTemplates() {
    if (!templateBar) return;
    templateBar.innerHTML = '';

    templates.forEach((tpl, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = `template-card-wrapper ${index === appState.activeSlideIndex ? 'active' : ''}`;

        const label = document.createElement('span');
        label.textContent = `Slide ${index + 1}`;

        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'thumb-canvas-container';

        const virtualStage = document.createElement('div');
        virtualStage.className = 'thumb-virtual-stage';
        virtualStage.textContent = tpl.content;

        canvasContainer.appendChild(virtualStage);
        wrapper.appendChild(label);
        wrapper.appendChild(canvasContainer);

        setTimeout(() => {
            const containerWidth = canvasContainer.clientWidth;
            if (containerWidth > 0) {
                const scaleVal = containerWidth / 800;
                virtualStage.style.transform = `scale(${scaleVal})`;
            }
        }, 10);

        // Left click to select slide
        wrapper.addEventListener('click', () => {
            appState.activeSlideIndex = index;
            appState.status = 'SHOW';
            if (centerEditor) {
                centerEditor.value = tpl.content;
            }
            updateApp();
        });

        // Right click for PowerPoint-style context menu
        wrapper.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            contextTargetIndex = index;

            // Position and display popup menu
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${e.pageX} তোলে` || `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
        });

        templateBar.appendChild(wrapper);
    });
}

// Hide context menu when clicking anywhere else
document.addEventListener('click', () => {
    if (contextMenu) contextMenu.style.display = 'none';
});

// --- CONTEXT MENU ACTIONS ---

// 1. New Slide
ctxNew?.addEventListener('click', () => {
    const newSlide = {
        id: Date.now(),
        title: `Slide ${templates.length + 1}`,
        content: "New Slide Text"
    };
    templates.splice(contextTargetIndex + 1, 0, newSlide);
    appState.activeSlideIndex = contextTargetIndex + 1;
    appState.status = 'SHOW';
    if (centerEditor) centerEditor.value = newSlide.content;
    updateApp();
});

// 2. Duplicate Slide
ctxDuplicate?.addEventListener('click', () => {
    const targetContent = templates[contextTargetIndex].content;
    const duplicatedSlide = {
        id: Date.now(),
        title: `Slide ${templates.length + 1}`,
        content: targetContent
    };
    templates.splice(contextTargetIndex + 1, 0, duplicatedSlide);
    appState.activeSlideIndex = contextTargetIndex + 1;
    appState.status = 'SHOW';
    if (centerEditor) centerEditor.value = duplicatedSlide.content;
    updateApp();
});

// 3. Delete Slide
ctxDelete?.addEventListener('click', () => {
    if (templates.length <= 1) {
        alert("You must keep at least one slide!");
        return;
    }
    templates.splice(contextTargetIndex, 1);
    if (appState.activeSiteIndex >= templates.length) {
        appState.activeSlideIndex = templates.length - 1;
    }
    appState.status = 'SHOW';
    if (centerEditor) centerEditor.value = templates[appState.activeSlideIndex].content;
    updateApp();
});

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
