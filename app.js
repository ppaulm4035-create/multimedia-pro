const lyricsInput = document.getElementById('lyricsInput');
const lyricsDisplay = document.getElementById('lyricsDisplay');

// Controller Logic
if (lyricsInput) {
  lyricsInput.value = localStorage.getItem('worship_lyrics') || '';
  lyricsInput.addEventListener('input', (e) => {
    localStorage.setItem('worship_lyrics', e.target.value);
  });
}

// Display / Band Logic
if (lyricsDisplay) {
  const updateLyrics = () => {
    lyricsDisplay.textContent = localStorage.getItem('worship_lyrics') || '';
  };

  updateLyrics();
  window.addEventListener('storage', updateLyrics);
  setInterval(updateLyrics, 300); // Fast interval sync
}
