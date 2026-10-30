const STATE_KEY = 'worship_presenter_state';
const TEMPLATES_KEY = 'worship_presenter_templates';

let state = JSON.parse(localStorage.getItem(STATE_KEY)) || {
  mainText: 'Welcome to Worship',
  bandText: '[Verse]\nC - G - Am - F',
  mode: 'SHOW'
};

let templates = JSON.parse(localStorage.getItem(TEMPLATES_KEY)) || [
  { title: 'Verse 1 (Main)', type: 'main', text: 'Panginoon, kay tapat Mo' },
  { title: 'Verse 1 (CP/Chords)', type: 'cp', text: '[Verse 1]\nC   G   Am   F\nPanginoon, kay tapat Mo' },
  { title: 'Chorus (Main)', type: 'main', text: 'Purihin ang Pangalan Mo' },
  { title: 'Chorus (CP/Chords)', type: 'cp', text: '[Chorus]\nF   G   C   Am\nPurihin ang Pangalan Mo' }
];

let activeEditingMode = 'MAIN'; // 'MAIN' or 'CP'

// DOM Elements
const centerEditorInput = document.getElementById('centerEditorInput');
const centerCanvasBox = document.getElementById('centerCanvasBox');
const editingModeLabel = document.getElementById('editingModeLabel');
const btnSwitchView = document.getElementById('btnSwitchView');

const mainLivePreview = document.getElementById('mainLivePreview');
const cpLivePreview = document.getElementById('cpLivePreview');
const leftCpPreview = document.getElementById('leftCpPreview');
const templateBar = document.getElementById('templateBar');
const lyricsDisplay = document.getElementById('lyricsDisplay');

function broadcastState(newState) {
  state = { ...state, ...newState };
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  renderUI();
}

function renderUI() {
  if (lyricsDisplay) {
    let displayContent = document.body.classList.contains('band-screen') ? state.bandText : state.mainText;
    if (state.mode === 'BLACK' || state.mode === 'CLEAR') displayContent = '';
    lyricsDisplay.textContent = displayContent;
    return;
  }

  if (!centerEditorInput) return;

  // Read text directly from contenteditable canvas
  if (activeEditingMode === 'MAIN') {
    state.mainText = centerEditorInput.textContent;
  } else {
    state.bandText = centerEditorInput.textContent;
  }

  if (state.mode === 'BLACK' || state.mode === 'CLEAR') {
    if (mainLivePreview) mainLivePreview.textContent = '';
    if (cpLivePreview) cpLivePreview.textContent = '';
    if (leftCpPreview) leftCpPreview.textContent = '';
    return;
  }

  // Update live screens so they mirror the exact content and proportions
  if (mainLivePreview) mainLivePreview.textContent = state.mainText;
  if (cpLivePreview) cpLivePreview.textContent = state.bandText;
  if (leftCpPreview) leftCpPreview.textContent = state.bandText;
}

// Switch between Main (Landscape) and CP (Portrait)
btnSwitchView.addEventListener('click', () => {
  if (activeEditingMode === 'MAIN') {
    activeEditingMode = 'CP';
    editingModeLabel.textContent = 'EDITING: CP VIEW (PORTRAIT)';
    btnSwitchView.textContent = 'SWITCH TO MAIN VIEW';
    centerCanvasBox.classList.remove('landscape');
    centerCanvasBox.classList.add('portrait');
    centerEditorInput.textContent = state.bandText;
  } else {
    activeEditingMode = 'MAIN';
    editingModeLabel.textContent = 'EDITING: MAIN VIEW (LANDSCAPE)';
    btnSwitchView.textContent = 'SWITCH TO CP VIEW';
    centerCanvasBox.classList.remove('portrait');
    centerCanvasBox.classList.add('landscape');
    centerEditorInput.textContent = state.mainText;
  }
  renderUI();
});

// Real-time input listener for contenteditable
centerEditorInput.addEventListener('input', () => {
  renderUI();
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
});

document.getElementById('btnPushLive').addEventListener('click', () => {
  renderUI();
  broadcastState({ mode: 'SHOW' });
});

document.getElementById('btnClear').addEventListener('click', () => broadcastState({ mode: 'CLEAR' }));
document.getElementById('btnBlack').addEventListener('click', () => broadcastState({ mode: 'BLACK' }));

function renderTemplates() {
  if (!templateBar) return;
  templateBar.innerHTML = '';
  templates.forEach((tpl) => {
    const card = document.createElement('div');
    card.className = 'slide-thumb';
    card.textContent = tpl.title;
    card.addEventListener('click', () => {
      if (tpl.type === 'main') {
        activeEditingMode = 'MAIN';
        editingModeLabel.textContent = 'EDITING: MAIN VIEW (LANDSCAPE)';
        btnSwitchView.textContent = 'SWITCH TO CP VIEW';
        centerCanvasBox.classList.remove('portrait');
        centerCanvasBox.classList.add('landscape');
        centerEditorInput.textContent = tpl.text;
        state.mainText = tpl.text;
      } else {
        activeEditingMode = 'CP';
        editingModeLabel.textContent = 'EDITING: CP VIEW (PORTRAIT)';
        btnSwitchView.textContent = 'SWITCH TO MAIN VIEW';
        centerCanvasBox.classList.remove('landscape');
        centerCanvasBox.classList.add('portrait');
        centerEditorInput.textContent = tpl.text;
        state.bandText = tpl.text;
      }
      renderUI();
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    });
    templateBar.appendChild(card);
  });
}

// Initial Setup
if (centerEditorInput) {
  centerEditorInput.textContent = state.mainText;
}

renderTemplates();
renderUI();
