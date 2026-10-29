const STATE_KEY = 'worship_presenter_state';
const SONGS_KEY = 'worship_presenter_songs';

let state = JSON.parse(localStorage.getItem(STATE_KEY)) || {
  text: '',
  mode: 'SHOW'
};

let songs = JSON.parse(localStorage.getItem(SONGS_KEY)) || [];

// DOM Elements
const activeLyricsInput = document.getElementById('activeLyricsInput');
const mainPreviewText = document.querySelector('#mainPreview .preview-text');
const mobilePreviewText = document.querySelector('#mobilePreview .preview-text');
const songTitleInput = document.getElementById('songTitleInput');
const songLyricsInput = document.getElementById('songLyricsInput');
const saveSongBtn = document.getElementById('saveSongBtn');
const songList = document.getElementById('songList');
const slideButtons = document.getElementById('slideButtons');

function broadcastState(newState) {
  state = { ...state, ...newState };
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  renderControllerUI();
}

function renderControllerUI() {
  if (!mainPreviewText || !mobilePreviewText) return;

  let displayContent = state.text;
  if (state.mode === 'BLACK' || state.mode === 'CLEAR') {
    displayContent = '';
  }

  mainPreviewText.textContent = displayContent;
  mobilePreviewText.textContent = displayContent;
}

if (activeLyricsInput) {
  activeLyricsInput.value = state.text;

  // Edit Button - focus input
  document.getElementById('btnEdit').addEventListener('click', () => {
    activeLyricsInput.focus();
  });

  // Show Live Button
  document.getElementById('btnShow').addEventListener('click', () => {
    broadcastState({ text: activeLyricsInput.value, mode: 'SHOW' });
  });

  // Clear & Black Buttons
  document.getElementById('btnClear').addEventListener('click', () => broadcastState({ mode: 'CLEAR' }));
  document.getElementById('btnBlack').addEventListener('click', () => broadcastState({ mode: 'BLACK' }));

  // Save Template
  saveSongBtn.addEventListener('click', () => {
    const title = songTitleInput.value.trim();
    const lyrics = songLyricsInput.value.trim();
    if (!title || !lyrics) return alert('Lagyan ng Title at Content!');

    songs.push({ id: Date.now(), title, lyrics });
    localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
    songTitleInput.value = '';
    songLyricsInput.value = '';
    renderSongList();
  });

  function renderSongList() {
    songList.innerHTML = '';
    songs.forEach(song => {
      const item = document.createElement('div');
      item.className = 'song-item';
      item.textContent = song.title;
      item.addEventListener('click', () => loadSongToController(song));
      songList.appendChild(item);
    });
  }

  function loadSongToController(song) {
    slideButtons.innerHTML = '';
    const paragraphs = song.lyrics.split('\n\n');

    paragraphs.forEach((para) => {
      const btn = document.createElement('button');
      btn.className = 'slide-btn';
      btn.textContent = para;
      btn.addEventListener('click', () => {
        activeLyricsInput.value = para;
        broadcastState({ text: para, mode: 'SHOW' });
      });
      slideButtons.appendChild(btn);
    });
  }

  renderSongList();
  renderControllerUI();
}

// Display / Band Screen Receiver
const lyricsDisplay = document.getElementById('lyricsDisplay');
if (lyricsDisplay) {
  function updateScreen() {
    const currentState = JSON.parse(localStorage.getItem(STATE_KEY)) || { text: '', mode: 'SHOW' };
    if (currentState.mode === 'BLACK' || currentState.mode === 'CLEAR') {
      lyricsDisplay.textContent = '';
    } else {
      lyricsDisplay.textContent = currentState.text;
    }
  }

  updateScreen();
  window.addEventListener('storage', updateScreen);
  setInterval(updateScreen, 200);
}
