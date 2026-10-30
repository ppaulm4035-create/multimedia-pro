const STATE_KEY = 'worship_presenter_state';
const TEMPLATES_KEY = 'worship_presenter_templates';

let state = JSON.parse(localStorage.getItem(STATE_KEY)) || {
  mainText: 'Welcome to Worship',
  bandText: '[Verse]\nC - G - Am - F',
  mode: 'SHOW'
};

// Sample default templates if empty
let templates = JSON.parse(localStorage.getItem(TEMPLATES_KEY)) || [
  { title: 'Verse 1 (Main)', type: 'main', text: 'Panginoon, kay tapat Mo' },
  { title: 'Verse 1 (CP/Chords)', type: 'cp', text: '[Verse 1]\nC   G   Am   F\nPanginoon, kay tapat Mo' },
  { title: 'Chorus (Main)', type: 'main', text: 'Purihin ang Pangalan Mo' },
  { title: 'Chorus (CP/Chords)', type: 'chorus', text: '[Chorus]\nF   G   C   Am\nPurihin ang Pangalan Mo' }
];

let activeEditingMode = 'MAIN'; // 'MAIN' or 'CP'

// DOM Elements
const centerEditorInput = document.getElementById('centerEditorInput');
const centerEditorScreen = document.getElementById('centerEditorScreen');
const editingModeLabel = document.getElementById('editingModeLabel');
const btnSwitchView = document.getElementById('btnSwitchView');

const mainLivePreviewText = document.querySelector('#mainLivePreview .preview-text');
const cpLivePreviewText = document.querySelector('#cpLivePreview .preview-text');
const leftCpPreviewText = document.querySelector('#leftCpPreview .preview-text');
const templateBar = document.getElementById('templateBar');
const lyricsDisplay = document.getElementById('lyricsDisplay');

function broadcastState(newState) {
  state = { ...state, ...newState };
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  renderUI();
}

function renderUI() {
  // 1. External Windows (`display.html` or `band.html`)
  if (lyricsDisplay) {
    let displayContent = document.body.classList.contains('band-screen') ? state.bandText : state.mainText;
    if (state.mode === 'BLACK' || state.mode === 'CLEAR') {
      displayContent = '';
    }
    lyricsDisplay.textContent = displayContent;
    return;
  }

  // 2. Controller UI Sync
  if (!centerEditorInput) return;

  // Save current textarea content to appropriate state property
  if (activeEditingMode === 'MAIN') {
    state.mainText = centerEditorInput.value;
  } else {
    state.bandText = centerEditorInput.value;
  }

  if (state.mode === 'BLACK' || state.mode === 'CLEAR') {
    if (mainLivePreviewText) mainLivePreviewText.textContent = '';
    if (cpLivePreviewText) cpLivePreviewText.textContent = '';
    if (leftCpPreviewText) leftCpPreviewText.textContent = '';
    return;
  }

  // Update Live View Monitors
  if (mainLivePreviewText) mainLivePreviewText.textContent = state.mainText;
  if (cpLivePreviewText) cpLivePreviewText.textContent = state.bandText;
  if (leftCpPreviewText) leftCpPreviewText.textContent = state.bandText;
}

// Switch between Main (Landscape) and CP (Portrait) editing mode
btnSwitchView.addEventListener('click', () => {
  if (activeEditingMode === 'MAIN') {
    activeEditingMode = 'CP';
    editingModeLabel.textContent = 'EDITING: CP VIEW (PORTRAIT)';
    btnSwitchView.textContent = 'SWITCH TO MAIN VIEW';
    centerEditorScreen.classList.remove('landscape');
    centerEditorScreen.classList.add('portrait');
    centerEditorInput.value = state.bandText;
  } else {
    activeEditingMode = 'MAIN';
    editingModeLabel.textContent = 'EDITING: MAIN VIEW (LANDSCAPE)';
    btnSwitchView.textContent = 'SWITCH TO CP VIEW';
    centerEditorScreen.classList.remove('portrait');
    centerEditorScreen.classList.add('landscape');
    centerEditorInput.value = state.mainText;
  }
  renderUI();
});

centerEditorInput.addEventListener('input', () => {
  renderUI();
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
});

// Action buttons
document.getElementById('btnPushLive').addEventListener('click', () => {
  renderUI();
  broadcastState({ mode: 'SHOW' });
});

document.getElementById('btnClear').addEventListener('click', () => broadcastState({ mode: 'CLEAR' }));
document.getElementById('btnBlack').addEventListener('click', () => broadcastState({ mode: 'BLACK' }));

// Render Templates in the Scrollable Left Bar
function renderTemplates() {
  if (!templateBar) return;
  templateBar.innerHTML = '';
  templates.forEach((tpl) => {
    const card = document.createElement('div');
    card.className = 'template-card-item';
    card.textContent = tpl.title;
    card.addEventListener('click', () => {
      if (tpl.type === 'main') {
        activeEditingMode = 'MAIN';
        editingModeLabel.textContent = 'EDITING: MAIN VIEW (LANDSCAPE)';
        btnSwitchView.textContent = 'SWITCH TO CP VIEW';
        centerEditorScreen.classList.remove('portrait');
        centerEditorScreen.classList.add('landscape');
        centerEditorInput.value = tpl.text;
        state.mainText = tpl.text;
      } else {
        activeEditingMode = 'CP';
        editingModeLabel.textContent = 'EDITING: CP VIEW (PORTRAIT)';
        btnSwitchView.textContent = 'SWITCH TO MAIN VIEW';
        centerEditorScreen.classList.remove('landscape');
        centerEditorScreen.classList.add('portrait');
        centerEditorInput.value = tpl.text;
        state.bandText = tpl.text;
      }
      renderUI();
    });
    templateBar.appendChild(card);
  });
}

// Initial sync
if (centerEditorInput) {
  centerEditorInput.value = state.mainText;
}

renderTemplates();
renderUI();
