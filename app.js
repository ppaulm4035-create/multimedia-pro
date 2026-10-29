const STATE_KEY = 'worship_presenter_state';
const SONGS_KEY = 'worship_presenter_songs';

let state = JSON.parse(localStorage.getItem(STATE_KEY)) || {
  mainText: '',
  bandText: '',
  mode: 'SHOW'
};

let songs = JSON.parse(localStorage.getItem(SONGS_KEY)) || [];
let currentSongParts = []; // Temporary parts for building a song

// DOM Elements
const activeMainInput = document.getElementById('activeMainInput');
const activeBandInput = document.getElementById('activeBandInput');
const mainPreviewText = document.querySelector('#mainPreview .preview-text');
const mobilePreviewText = document.querySelector('#mobilePreview .preview-text');
const songTitleInput = document.getElementById('songTitleInput');
const partSelect = document.getElementById('partSelect');
const partLyricsInput = document.getElementById('partLyricsInput');
const partBandInput = document.getElementById('partBandInput');
const addPartBtn = document.getElementById('addPartBtn');
const saveSongBtn = document.getElementById('saveSongBtn');
const songList = document.getElementById('songList');
const songPartTriggers = document.getElementById('songPartTriggers');

function broadcastState(newState) {
  state = { ...state, ...newState };
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  renderControllerUI();
}

function renderControllerUI() {
  if (!mainPreviewText || !mobilePreviewText) return;

  let mainDisplay = state.mainText;
  let bandDisplay = state.bandText;

  if (state.mode === 'BLACK' || state.mode === 'CLEAR') {
    mainDisplay = '';
    bandDisplay = '';
  }

  mainPreviewText.textContent = mainDisplay;
  mobilePreviewText.textContent = bandDisplay;
}

if (activeMainInput && activeBandInput) {
  activeMainInput.value = state.mainText;
  activeBandInput.value = state.bandText;

  // Live input sync
  activeMainInput.addEventListener('input', (e) => {
    broadcastState({ mainText: e.target.value, mode: 'SHOW' });
  });

  activeBandInput.addEventListener('input', (e) => {
    broadcastState({ bandText: e.target.value, mode: 'SHOW' });
  });

  // Edit Mode Focus
  document.getElementById('btnEdit').addEventListener('click', () => {
    activeMainInput.focus();
  });

  document.getElementById('btnShow').addEventListener('click', () => {
    broadcastState({ 
      mainText: activeMainInput.value, 
      bandText: activeBandInput.value, 
      mode: 'SHOW' 
    });
  });

  document.getElementById('btnClear').addEventListener('click', () => broadcastState({ mode: 'CLEAR' }));
  document.getElementById('btnBlack').addEventListener('click', () => broadcastState({ mode: 'BLACK' }));

  // Add Part to Current Builder
  addPartBtn.addEventListener('click', () => {
    const type = partSelect.value;
    const lyrics = partLyricsInput.value.trim();
    const bandNotes = partBandInput.value.trim();

    if (!lyrics) return alert('Lagyan ng lyrics ang part na ito!');

    currentSongParts.push({ type, lyrics, bandNotes });
    partLyricsInput.value = '';
    partBandInput.value = '';
    alert(`Naidagdag ang ${type}! Pindutin ang 'Save Full Song' kapag tapos na.`);
    renderTriggers(currentSongParts);
  });

  // Save Full Song
  saveSongBtn.addEventListener('click', () => {
    const title = songTitleInput.value.trim();
    if (!title || currentSongParts.length === 0) return alert('Maglagay ng Song Title at kahit isang Part!');

    songs.push({ id: Date.now(), title, parts: [...currentSongParts] });
    localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
    songTitleInput.value = '';
    currentSongParts = [];
    songPartTriggers.innerHTML = '';
    renderSongList();
    alert('Matagumpay na na-save ang kanta!');
  });

  function renderSongList() {
    songList.innerHTML = '';
    songs.forEach(song => {
      const item = document.createElement('div');
      item.className = 'song-item';
      item.textContent = song.title;
      item.addEventListener('click', () => loadSongToTriggers(song));
      songList.appendChild(item);
    });
  }

  function loadSongToTriggers(song) {
    renderTriggers(song.parts);
  }

  function renderTriggers(parts) {
    songPartTriggers.innerHTML = '';
    parts.forEach(part => {
      const btn = document.createElement('button');
      btn.className = 'part-btn';
      btn.textContent = part.type;
      btn.addEventListener('click', () => {
        activeMainInput.value = part.lyrics;
        activeBandInput.value = part.bandNotes || part.lyrics; // Fallback to lyrics if no specific band notes
        broadcastState({ 
          mainText: activeMainInput.value, 
          bandText: activeBandInput.value, 
          mode: 'SHOW' 
        });
      });
      songPartTriggers.appendChild(btn);
    });
  }

  renderSongList();
  renderControllerUI();
}
