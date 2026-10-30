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
const btnImport = document.getElementById('btnImport');
const fileImporter = document.getElementById('fileImporter');

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

// --- FILE PARSING LOGIC (.pptx, .docx, .txt) ---
btnImport?.addEventListener('click', () => {
    fileImporter.click();
});

fileImporter?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    try {
        if (fileName.endsWith('.txt')) {
            const text = await file.text();
            loadSlidesFromText(text);
        } else if (fileName.endsWith('.docx')) {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            loadSlidesFromText(result.value);
        } else if (fileName.endsWith('.pptx')) {
            const arrayBuffer = await file.arrayBuffer();
            const zip = await JSZip.loadAsync(arrayBuffer);
            
            let slideTexts = [];
            let slideIndex = 1;

            // PowerPoint stores slides inside ppt/slides/slide1.xml, slide2.xml, etc.
            while (zip.file(`ppt/slides/slide${slideIndex}.xml`)) {
                const xmlContent = await zip.file(`ppt/slides/slide${slideIndex}.xml`).async('text');
                
                // Simple regex extraction to pull text chunks out of PowerPoint XML nodes (<a:t>...</a:t>)
                const matches = xmlContent.match(/<a:t[^>]*>(.*?)<\/a:t>/g);
                if (matches) {
                    const extracted = matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ');
                    if (extracted.trim() !== '') {
                        slideTexts.push(extracted.trim());
                    }
                }
                slideIndex++;
            }

            if (slideTexts.length > 0) {
                templates = slideTexts.map((text, idx) => ({
                    id: idx + 1,
                    title: `Slide ${idx + 1}`,
                    content: text
                }));
                appState.activeSlideIndex = 0;
                appState.status = 'SHOW';
                if (centerEditor) centerEditor.value = templates[0].content;
                localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
                updateApp();
                alert(`Successfully imported ${slideTexts.length} slides from PowerPoint!`);
            } else {
                alert('No readable slide text found in this PowerPoint file.');
            }
        } else {
            alert('Please select a valid .pptx, .docx, or .txt file.');
        }
    } catch (err) {
        console.error(err);
        alert('Error reading file. Please try another file.');
    }

    fileImporter.value = ''; // Reset input
});

function loadSlidesFromText(fullText) {
    // Split text paragraphs by double line breaks into separate slides
    const chunks = fullText.split(/\n\s*\n/).filter(c => c.trim() !== '');
    if (chunks.length > 0) {
        templates = chunks.map((chunk, idx) => ({
            id: idx + 1,
            title: `Slide ${idx + 1}`,
            content: chunk.trim()
        }));
        appState.activeSlideIndex = 0;
        appState.status = 'SHOW';
        if (centerEditor) centerEditor.value = templates[0].content;
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
        updateApp();
        alert(`Successfully imported ${chunks.length} slides from document!`);
    } else {
        alert('The document appears to be empty.');
    }
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
