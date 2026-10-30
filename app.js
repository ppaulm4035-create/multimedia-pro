const STATE_KEY = 'worship_presenter_state';
const SONGS_KEY = 'worship_presenter_songs';

let state = JSON.parse(localStorage.getItem(STATE_KEY)) || {
  mainText: '',
  bandText: '',
  mode: 'SHOW'
};

let songs = JSON.parse(localStorage.getItem(SONGS_KEY)) || [];
let currentSongParts = [];

// DOM Elements (Controller)
const previewMainInput = document.getElementById('previewMainInput');
const previewBandInput = document.getElementById('previewBandInput');
const liveMainDisplay = document.getElementById('liveMainDisplay');
const liveBandDisplay = document.getElementById('liveBandDisplay');
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

const webSearchInput = document.getElementById('webSearchInput');
const searchWebBtn = document.getElementById('searchWebBtn');
const searchResults = document.getElementById('searchResults');
const lyricsDisplay = document.getElementById('lyricsDisplay');

function broadcastState(newState) {
  state = { ...state, ...newState };
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  renderUI();
}

function renderUI() {
  // 1. If we are on external Display/Band windows
  if (lyricsDisplay) {
    let displayContent = document.body.classList.contains('band-screen') ? state.bandText : state.mainText;
    if (state.mode === 'BLACK' || state.mode === 'CLEAR') {
      displayContent = '';
    }
    lyricsDisplay.textContent = displayContent;
    return;
  }

  // 2. Otherwise, we are on the Studio Controller UI
  if (!mainPreviewText || !mobilePreviewText) return;

  let mainDisplay = state.mainText;
  let bandDisplay = state.bandText;

  if (state.mode === 'BLACK' || state.mode === 'CLEAR') {
    mainDisplay = '';
    bandDisplay = '';
  }

  liveMainDisplay.value = state.mainText;
  liveBandDisplay.value = state.bandText;

  mainPreviewText.textContent = mainDisplay;
  mobilePreviewText.textContent = bandDisplay;
}

// Listen for updates from other tabs/windows if running concurrently
window.addEventListener('storage', (e) => {
  if (e.key === STATE_KEY) {
    state = JSON.parse(e.newValue) || state;
    renderUI();
  }
});

// Controller Initialization
if (previewMainInput && previewBandInput) {
  previewMainInput.value = state.mainText;
  previewBandInput.value = state.bandText;

  document.getElementById('btnPushLive').addEventListener('click', () => {
    broadcastState({
      mainText: previewMainInput.value,
      bandText: previewBandInput.value,
      mode: 'SHOW'
    });
  });

  document.getElementById('btnClear').addEventListener('click', () => broadcastState({ mode: 'CLEAR' }));
  document.getElementById('btnBlack').addEventListener('click', () => broadcastState({ mode: 'BLACK' }));

  searchWebBtn.addEventListener('click', async () => {
    const query = webSearchInput.value.trim();
    if (!query) return;

    searchResults.innerHTML = '<div class="search-result-item">Searching web...</div>';
    try {
      const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(query)}`);
      const data = await res.json();
      
      searchResults.innerHTML = '';
      if (data.lyrics) {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.textContent = `Found: ${query}`;
        item.addEventListener('click', () => {
          songTitleInput.value = query;
          partLyricsInput.value = data.lyrics;
          partBandInput.value = data.lyrics;
          alert('Lyrics loaded to Song Builder!');
        });
        searchResults.appendChild(item);
      } else {
        searchResults.innerHTML = '<div class="search-result-item">No lyrics found. Paste manually below.</div>';
      }
    } catch (e) {
      searchResults.innerHTML = '<div class="search-result-item">Search error or offline. Use manual entry.</div>';
    }
  });

  addPartBtn.addEventListener('click', () => {
    const type = partSelect.value;
    const lyrics = partLyricsInput.value.trim();
    const bandNotes = partBandInput.value.trim();

    if (!lyrics) return alert('Lagyan ng lyrics!');

    currentSongParts.push({ type, lyrics, bandNotes });
    partLyricsInput.value = '';
    partBandInput.value = '';
    renderTriggers(currentSongParts);
  });

  saveSongBtn.addEventListener('click', () => {
    const title = songTitleInput.value.trim();
    if (!title || currentSongParts.length === 0) return alert('Lagyan ng Title at Parts!');

    songs.push({ id: Date.now(), title, parts: [...currentSongParts] });
    localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
    songTitleInput.value = '';
    currentSongParts = [];
    songPartTriggers.innerHTML = '';
    renderSongList();
    alert('Na-save na ang kanta!');
  });

  function renderSongList() {
    songList.innerHTML = '';
    songs.forEach(song => {
      const item = document.createElement('div');
      item.className = 'song-item';
      item.textContent = song.title;
      item.addEventListener('click', () => renderTriggers(song.parts));
      songList.appendChild(item);
    });
  }

  function renderTriggers(parts) {
    songPartTriggers.innerHTML = '';
    parts.forEach(part => {
      const btn = document.createElement('button');
      btn.className = 'part-btn';
      btn.textContent = part.type;
      btn.addEventListener('click', () => {
        previewMainInput.value = part.lyrics;
        previewBandInput.value = part.bandNotes || part.lyrics;
      });
      songPartTriggers.appendChild(btn);
    });
  }

  renderSongList();
}

// Initial render call across all pages
renderUI();
