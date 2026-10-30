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
const btnNewSlide = document.getElementById('btnNewSlide');
const btnDuplicate = document.getElementById('btnDuplicate');
const btnDelete = document.getElementById('btnDelete');

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

// --- NATIVE SLIDE MANAGEMENT TOOLS ---

// 1. New Slide
btnNewSlide?.addEventListener('click', () => {
    const newSlide = {
        id: Date.now(),
        title: `Slide ${templates.length + 1}`,
        content: "New Slide Text"
    };
    templates.splice(appState.activeSlideIndex + 1, 0, newSlide);
    appState.activeSlideIndex++;
    appState.status = 'SHOW';
    if (centerEditor) centerEditor.value = newSlide.content;
    updateApp();
});

// 2. Duplicate Slide
btnDuplicate?.addEventListener('click', () => {
    const currentContent = centerEditor ? centerEditor.value : '';
    const duplicatedSlide = {
        id: Date.now(),
        title: `Slide ${templates.length + 1}`,
        content: currentContent
    };
    templates.splice(appState.activeSlideIndex + 1, 0, duplicatedSlide);
    appState.activeSlideIndex++;
    appState.status = 'SHOW';
    if (centerEditor) centerEditor.value = duplicatedSlide.content;
    updateApp();
});

// 3. Delete Slide
btnDelete?.addEventListener('click', () => {
    if (templates.length <= 1) {
        alert("You must keep at least one slide!");
        return;
    }
    templates.splice(appState.activeSlideIndex, 1);
    if (appState.activeSlideIndex >= templates.length) {
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
