/**
 * Aurora Music Player - UI Controller & Event Orchestrator
 * Integrates AudioEngine, Visualizer, PlaylistManager, Storage, Wishlist, i18n Translator, and Dynamic Themes
 */

class UIController {
  constructor() {
    this.engine = new AudioEngine();
    this.playlist = new PlaylistManager();
    this.visualizer = new AudioVisualizer('visualizer-canvas');

    this.currentTrackIndex = 0;
    
    // Load persisted state
    const savedState = AppStorage.getPlayerState();
    this.currentTrackIndex = savedState.currentTrackIndex || 0;
    this.playlist.shuffleEnabled = savedState.shuffle || false;
    this.playlist.repeatMode = savedState.repeat || 'off';
    this.currentLang = savedState.lang || 'en';
    this.currentTheme = savedState.theme || 'aurora';
    this.currentSpeed = savedState.playbackRate || 1.0;
    this.lyricMode = savedState.lyricMode || 'dual';

    this.initDOM();
    this.applyTheme(this.currentTheme);
    this.applyLanguage(this.currentLang);
    this.bindEngineCallbacks();
    this.bindEvents();
    this.bindKeyboardShortcuts();
    this.loadInitialTrack();
  }

  initDOM() {
    // Cache DOM Elements
    this.elCover = document.getElementById('cover-art-img');
    this.elVinyl = document.getElementById('vinyl-disc');
    this.elTitle = document.getElementById('track-title');
    this.elArtist = document.getElementById('track-artist');
    this.elAlbum = document.getElementById('track-album');
    this.elLangPill = document.getElementById('track-lang-pill');

    this.elBtnPlay = document.getElementById('btn-play-pause');
    this.elBtnPrev = document.getElementById('btn-prev');
    this.elBtnNext = document.getElementById('btn-next');
    this.elBtnShuffle = document.getElementById('btn-shuffle');
    this.elBtnRepeat = document.getElementById('btn-repeat');
    this.elBtnLike = document.getElementById('btn-like');
    this.elBtnWishlist = document.getElementById('btn-wishlist');
    this.elBtnAddToPlaylist = document.getElementById('btn-add-to-playlist');

    this.elProgressBar = document.getElementById('progress-bar-track');
    this.elProgressFill = document.getElementById('progress-bar-fill');
    this.elProgressHandle = document.getElementById('progress-bar-handle');
    this.elCurrentTime = document.getElementById('current-time-text');
    this.elTotalDuration = document.getElementById('total-duration-text');

    this.elVolumeSlider = document.getElementById('volume-slider');
    this.elVolumeFill = document.getElementById('volume-fill');
    this.elBtnMute = document.getElementById('btn-mute');
    this.elVolumeIcon = document.getElementById('volume-icon');

    this.elPlaylistContainer = document.getElementById('playlist-items-container');
    this.elSearchInput = document.getElementById('playlist-search-input');
    this.elSortSelect = document.getElementById('playlist-sort-select');

    this.elLyricsContainer = document.getElementById('lyrics-container');
    this.elLyricModeSelect = document.getElementById('lyric-mode-select');
    this.elAmbientBg = document.getElementById('ambient-backdrop');

    // Header Controls
    this.elLangSelect = document.getElementById('header-lang-select');
    this.elThemeSelect = document.getElementById('header-theme-select');
    this.elSpeedSelect = document.getElementById('header-speed-select');
    this.elBtnSleepModal = document.getElementById('btn-sleep-modal');
    this.elSleepBadge = document.getElementById('sleep-timer-badge');
    this.elBtnCreatePlaylistModal = document.getElementById('btn-create-playlist-modal');

    // Equalizer sliders
    this.elEqBass = document.getElementById('eq-bass-slider');
    this.elEqMid = document.getElementById('eq-mid-slider');
    this.elEqTreble = document.getElementById('eq-treble-slider');
    this.elEqPresetSelect = document.getElementById('eq-preset-select');

    // Apply saved volume & speed
    const savedState = AppStorage.getPlayerState();
    if (this.elVolumeSlider) {
      this.elVolumeSlider.value = (savedState.volume || 0.8) * 100;
      this.updateVolumeUI(savedState.volume || 0.8);
    }
    if (this.elSpeedSelect) {
      this.elSpeedSelect.value = this.currentSpeed;
      this.engine.setPlaybackRate(this.currentSpeed);
    }
    if (this.elLangSelect) this.elLangSelect.value = this.currentLang;
    if (this.elThemeSelect) this.elThemeSelect.value = this.currentTheme;
    if (this.elLyricModeSelect) this.elLyricModeSelect.value = this.lyricMode;
  }

  // Multi-language UI Switcher Engine
  applyLanguage(langKey) {
    this.currentLang = langKey || 'en';
    const dict = AURORA_DATA.translations[this.currentLang] || AURORA_DATA.translations['en'];

    AppStorage.savePlayerState({ lang: this.currentLang });

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (el.tagName === 'INPUT' && el.type === 'text') {
          el.placeholder = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    if (this.elSearchInput && dict.searchPlaceholder) {
      this.elSearchInput.placeholder = dict.searchPlaceholder;
    }

    const tabAll = document.querySelector('[data-category="all"]');
    const tabEn = document.querySelector('[data-category="en"]');
    const tabHi = document.querySelector('[data-category="hi"]');
    const tabTa = document.querySelector('[data-category="ta"]');
    const tabLiked = document.querySelector('[data-category="liked"]');
    const tabWishlist = document.querySelector('[data-category="wishlist"]');

    if (tabAll) tabAll.textContent = dict.tabAll;
    if (tabEn) tabEn.textContent = dict.tabEnglish;
    if (tabHi) tabHi.textContent = dict.tabHindi;
    if (tabTa) tabTa.textContent = dict.tabTamil;
    if (tabLiked) tabLiked.textContent = dict.tabLiked;
    if (tabWishlist) tabWishlist.textContent = dict.tabWishlist;

    const visible = this.playlist.getVisibleTracks();
    if (visible[this.currentTrackIndex]) {
      this.renderLyrics(visible[this.currentTrackIndex]);
    }
  }

  // Dynamic Theme Engine
  applyTheme(themeKey) {
    this.currentTheme = themeKey || 'aurora';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    AppStorage.savePlayerState({ theme: this.currentTheme });

    const visible = this.playlist.getVisibleTracks();
    const currentTrack = visible[this.currentTrackIndex];
    if (currentTrack && this.elAmbientBg) {
      this.elAmbientBg.style.background = `radial-gradient(circle at 50% 30%, ${currentTrack.dominantColor}44 0%, var(--bg-primary) 75%)`;
    }
  }

  bindEngineCallbacks() {
    this.engine.onTimeUpdate = (currentTime, duration) => {
      this.updateProgressUI(currentTime, duration);
      this.updateLyricsHighlight(currentTime);
    };

    this.engine.onEnded = () => {
      this.playNextTrack();
    };

    this.engine.onStateChange = (isPlaying) => {
      this.updatePlayStateUI(isPlaying);
    };

    this.engine.onError = () => {
      this.showToast('Audio fallback: Playing Web Audio Synth tone for current track.', 'info');
    };
  }

  loadInitialTrack() {
    const visible = this.playlist.getVisibleTracks();
    if (visible.length === 0) return;

    if (this.currentTrackIndex >= visible.length) {
      this.currentTrackIndex = 0;
    }

    const track = visible[this.currentTrackIndex];
    this.updateTrackDetailsUI(track);
    this.renderPlaylistItems();
  }

  loadAndPlayTrack(track) {
    if (!track) return;

    this.updateTrackDetailsUI(track);
    this.engine.playTrack(track);
    this.visualizer.setAnalyser(this.engine.analyserNode);
    this.visualizer.setColors(track.dominantColor, track.accentColor);
    this.visualizer.start();
    this.renderPlaylistItems();

    AppStorage.savePlayerState({
      ...AppStorage.getPlayerState(),
      currentTrackIndex: this.currentTrackIndex
    });
  }

  playNextTrack() {
    const nextTrack = this.playlist.getNextTrack(this.currentTrackIndex);
    if (nextTrack) {
      const visible = this.playlist.getVisibleTracks();
      const idx = visible.findIndex(t => t.id === nextTrack.id);
      this.currentTrackIndex = idx !== -1 ? idx : 0;
      this.loadAndPlayTrack(nextTrack);
    }
  }

  playPrevTrack() {
    const prevTrack = this.playlist.getPrevTrack(this.currentTrackIndex, this.engine.audio.currentTime);
    if (prevTrack) {
      const visible = this.playlist.getVisibleTracks();
      const idx = visible.findIndex(t => t.id === prevTrack.id);
      this.currentTrackIndex = idx !== -1 ? idx : 0;
      this.loadAndPlayTrack(prevTrack);
    }
  }

  updateTrackDetailsUI(track) {
    if (!track) return;

    if (this.elTitle) this.elTitle.textContent = track.title;
    if (this.elArtist) this.elArtist.textContent = track.artist;
    if (this.elAlbum) this.elAlbum.textContent = track.album;
    if (this.elTotalDuration) this.elTotalDuration.textContent = this.formatTime(track.duration);

    if (this.elLangPill) {
      const langNames = { en: 'EN 🇬🇧', ta: 'TA 🇮🇳', hi: 'HI 🇮🇳' };
      this.elLangPill.textContent = langNames[track.lang] || 'EN 🌐';
    }

    if (this.elCover) {
      this.elCover.src = track.cover;
      this.elCover.alt = `${track.title} by ${track.artist}`;
    }

    // Ambient Backdrop Transition
    if (this.elAmbientBg) {
      this.elAmbientBg.style.background = `radial-gradient(circle at 50% 30%, ${track.dominantColor}44 0%, var(--bg-primary) 75%)`;
    }

    // Like Button status
    const isFav = AppStorage.isFavorite(track.id);
    if (this.elBtnLike) {
      const icon = this.elBtnLike.querySelector('i');
      if (icon) {
        icon.className = isFav ? 'fas fa-heart liked' : 'far fa-heart';
      }
    }

    // Wishlist Button status
    const isWish = AppStorage.isWishlist(track.id);
    if (this.elBtnWishlist) {
      const icon = this.elBtnWishlist.querySelector('i');
      if (icon) {
        icon.className = isWish ? 'fas fa-bookmark wishlisted' : 'far fa-bookmark';
      }
    }

    // Render Synced Lyrics
    this.renderLyrics(track);
  }

  updatePlayStateUI(isPlaying) {
    if (this.elBtnPlay) {
      const icon = this.elBtnPlay.querySelector('i');
      if (icon) {
        icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
      }
      this.elBtnPlay.setAttribute('aria-label', isPlaying ? 'Pause Music' : 'Play Music');
    }

    if (this.elVinyl) {
      if (isPlaying) {
        this.elVinyl.classList.add('spinning');
      } else {
        this.elVinyl.classList.remove('spinning');
      }
    }

    if (isPlaying) {
      this.visualizer.start();
    } else {
      this.visualizer.stop();
    }
  }

  updateProgressUI(currentTime, duration) {
    if (!duration) return;
    const percent = (currentTime / duration) * 100;

    if (this.elProgressFill) this.elProgressFill.style.width = `${percent}%`;
    if (this.elProgressHandle) this.elProgressHandle.style.left = `${percent}%`;
    if (this.elCurrentTime) this.elCurrentTime.textContent = this.formatTime(currentTime);
    if (this.elTotalDuration && duration) this.elTotalDuration.textContent = this.formatTime(duration);
  }

  updateVolumeUI(vol) {
    this.engine.setVolume(vol);
    if (this.elVolumeFill) this.elVolumeFill.style.width = `${vol * 100}%`;

    if (this.elVolumeIcon) {
      if (vol === 0) {
        this.elVolumeIcon.className = 'fas fa-volume-mute';
      } else if (vol < 0.5) {
        this.elVolumeIcon.className = 'fas fa-volume-down';
      } else {
        this.elVolumeIcon.className = 'fas fa-volume-up';
      }
    }
  }

  renderPlaylistItems() {
    if (!this.elPlaylistContainer) return;
    const visibleTracks = this.playlist.getVisibleTracks();
    const currentTrack = visibleTracks[this.currentTrackIndex];
    const dict = AURORA_DATA.translations[this.currentLang] || AURORA_DATA.translations['en'];

    if (visibleTracks.length === 0) {
      this.elPlaylistContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
          <i class="fas fa-bookmark" style="font-size: 2.2rem; margin-bottom: 12px; color: var(--accent-primary);"></i>
          <p>${dict.noTracksFound}</p>
        </div>
      `;
      return;
    }

    this.elPlaylistContainer.innerHTML = visibleTracks.map((track, idx) => {
      const isCurrent = currentTrack && currentTrack.id === track.id;
      const isFav = AppStorage.isFavorite(track.id);
      const isWish = AppStorage.isWishlist(track.id);
      const langBadge = track.lang === 'ta' ? 'ТА' : track.lang === 'hi' ? 'HI' : 'EN';

      return `
        <div class="playlist-item ${isCurrent ? 'active' : ''}" data-index="${idx}" data-id="${track.id}">
          <div class="playlist-item-left">
            <div class="playlist-item-cover-wrapper">
              <img src="${track.cover}" alt="${track.title}" class="playlist-item-cover">
              ${isCurrent ? `
                <div class="playing-eq-bars">
                  <span></span><span></span><span></span>
                </div>
              ` : ''}
            </div>
            <div class="playlist-item-info">
              <div class="playlist-item-title">${track.title}</div>
              <div class="playlist-item-artist">${track.artist} • <span class="lang-badge-pill">${langBadge}</span></div>
            </div>
          </div>

          <div class="playlist-item-right">
            <button class="icon-btn track-wishlist-btn" data-id="${track.id}" aria-label="Add to Wishlist" style="width: 32px; height: 32px; font-size: 0.8rem;">
              <i class="${isWish ? 'fas fa-bookmark wishlisted' : 'far fa-bookmark'}"></i>
            </button>
            <button class="icon-btn track-like-btn" data-id="${track.id}" aria-label="Favorite Track" style="width: 32px; height: 32px; font-size: 0.8rem;">
              <i class="${isFav ? 'fas fa-heart liked' : 'far fa-heart'}"></i>
            </button>
            <span class="playlist-item-duration">${this.formatTime(track.duration)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Dual-Language & Synced Lyric Translation Renderer
  renderLyrics(track) {
    if (!this.elLyricsContainer) return;
    const lyrics = track.lyrics || [];

    if (!lyrics.length) {
      this.elLyricsContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No synchronized lyrics available for this track.</p>';
      return;
    }

    this.elLyricsContainer.innerHTML = lyrics.map((line, i) => {
      let mainText = line.text;
      let transText = line.translation || '';

      if (this.lyricMode === 'trans' && transText) {
        mainText = transText;
        transText = '';
      } else if (this.lyricMode === 'original') {
        transText = '';
      }

      return `
        <div class="lyric-line-box" data-time="${line.time}" id="lyric-line-${i}">
          <div class="lyric-main-text">${mainText}</div>
          ${transText ? `<div class="lyric-trans-text">${transText}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  updateLyricsHighlight(currentTime) {
    const track = this.playlist.getVisibleTracks()[this.currentTrackIndex];
    if (!track || !track.lyrics) return;

    const lineBoxes = this.elLyricsContainer.querySelectorAll('.lyric-line-box');
    let activeIdx = -1;

    track.lyrics.forEach((line, idx) => {
      if (currentTime >= line.time) {
        activeIdx = idx;
      }
    });

    lineBoxes.forEach((boxEl, idx) => {
      if (idx === activeIdx) {
        boxEl.classList.add('active');
        boxEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        boxEl.classList.remove('active');
      }
    });
  }

  bindEvents() {
    // Header Language Switcher
    if (this.elLangSelect) {
      this.elLangSelect.addEventListener('change', (e) => {
        const dict = AURORA_DATA.translations[e.target.value] || AURORA_DATA.translations['en'];
        this.applyLanguage(e.target.value);
        this.showToast(`${dict.toastLangSwitched} ${e.target.options[e.target.selectedIndex].text}`);
      });
    }

    // Header Theme Switcher
    if (this.elThemeSelect) {
      this.elThemeSelect.addEventListener('change', (e) => {
        const dict = AURORA_DATA.translations[this.currentLang] || AURORA_DATA.translations['en'];
        this.applyTheme(e.target.value);
        this.showToast(`${dict.toastThemeSwitched} ${e.target.options[e.target.selectedIndex].text}`);
      });
    }

    // Header Speed Selector
    if (this.elSpeedSelect) {
      this.elSpeedSelect.addEventListener('change', (e) => {
        const speed = parseFloat(e.target.value);
        this.currentSpeed = speed;
        this.engine.setPlaybackRate(speed);
        AppStorage.savePlayerState({ playbackRate: speed });
        this.showToast(`Playback Speed: ${speed}x`);
      });
    }

    // Lyric Translation Mode Switcher
    if (this.elLyricModeSelect) {
      this.elLyricModeSelect.addEventListener('change', (e) => {
        this.lyricMode = e.target.value;
        AppStorage.savePlayerState({ lyricMode: this.lyricMode });
        const visible = this.playlist.getVisibleTracks();
        if (visible[this.currentTrackIndex]) {
          this.renderLyrics(visible[this.currentTrackIndex]);
        }
      });
    }

    // Sleep Timer Trigger & Presets
    if (this.elBtnSleepModal) {
      this.elBtnSleepModal.addEventListener('click', () => {
        const modal = document.getElementById('sleep-modal');
        if (modal) modal.classList.add('active');
      });
    }

    document.querySelectorAll('.timer-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mins = parseInt(btn.getAttribute('data-mins'), 10);
        const modal = document.getElementById('sleep-modal');
        if (modal) modal.classList.remove('active');

        if (mins === 0) {
          this.engine.clearSleepTimer();
          if (this.elSleepBadge) this.elSleepBadge.style.display = 'none';
          this.showToast('Sleep timer turned off');
        } else {
          this.engine.setSleepTimer(mins, 
            (remainingSecs) => {
              if (this.elSleepBadge) {
                this.elSleepBadge.style.display = 'inline-block';
                const m = Math.floor(remainingSecs / 60);
                const s = remainingSecs % 60;
                this.elSleepBadge.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
              }
            },
            () => {
              if (this.elSleepBadge) this.elSleepBadge.style.display = 'none';
              this.showToast('Sleep timer finished - Playback stopped');
            }
          );
          const dict = AURORA_DATA.translations[this.currentLang] || AURORA_DATA.translations['en'];
          this.showToast(`${dict.sleepTimerActive} ${mins} mins`);
        }
      });
    });

    // Create Playlist Modal Trigger
    if (this.elBtnCreatePlaylistModal) {
      this.elBtnCreatePlaylistModal.addEventListener('click', () => {
        const modal = document.getElementById('create-playlist-modal');
        if (modal) modal.classList.add('active');
      });
    }

    // Confirm Create Playlist
    const confirmCreateBtn = document.getElementById('btn-confirm-create-playlist');
    const inputPlaylistName = document.getElementById('input-playlist-name');
    if (confirmCreateBtn && inputPlaylistName) {
      confirmCreateBtn.addEventListener('click', () => {
        const name = inputPlaylistName.value.trim();
        if (name) {
          const newPl = AppStorage.createPlaylist(name);
          inputPlaylistName.value = '';
          const modal = document.getElementById('create-playlist-modal');
          if (modal) modal.classList.remove('active');

          const dict = AURORA_DATA.translations[this.currentLang] || AURORA_DATA.translations['en'];
          this.showToast(`${dict.playlistCreated} ${newPl.name}`);
          
          // Switch tab to new custom playlist
          this.playlist.activeFilterCategory = `custom-${newPl.id}`;
          this.renderPlaylistItems();
        }
      });
    }

    // Play/Pause button
    if (this.elBtnPlay) {
      this.elBtnPlay.addEventListener('click', () => this.engine.togglePlay());
    }

    // Next / Prev buttons
    if (this.elBtnNext) {
      this.elBtnNext.addEventListener('click', () => this.playNextTrack());
    }
    if (this.elBtnPrev) {
      this.elBtnPrev.addEventListener('click', () => this.playPrevTrack());
    }

    // Shuffle Button
    if (this.elBtnShuffle) {
      this.elBtnShuffle.addEventListener('click', () => {
        const dict = AURORA_DATA.translations[this.currentLang] || AURORA_DATA.translations['en'];
        this.playlist.shuffleEnabled = !this.playlist.shuffleEnabled;
        this.elBtnShuffle.classList.toggle('active', this.playlist.shuffleEnabled);
        this.showToast(this.playlist.shuffleEnabled ? dict.toastShuffleOn : dict.toastShuffleOff);
      });
    }

    // Repeat Button
    if (this.elBtnRepeat) {
      this.elBtnRepeat.addEventListener('click', () => {
        const dict = AURORA_DATA.translations[this.currentLang] || AURORA_DATA.translations['en'];
        const modes = ['off', 'all', 'one'];
        const curIdx = modes.indexOf(this.playlist.repeatMode);
        this.playlist.repeatMode = modes[(curIdx + 1) % modes.length];

        this.elBtnRepeat.classList.toggle('active', this.playlist.repeatMode !== 'off');
        const badge = this.elBtnRepeat.querySelector('.badge-indicator');
        if (badge) badge.textContent = this.playlist.repeatMode === 'one' ? '1' : '';

        this.showToast(`${dict.toastRepeatMode} ${this.playlist.repeatMode.toUpperCase()}`);
      });
    }

    // Like Button (Player Card)
    if (this.elBtnLike) {
      this.elBtnLike.addEventListener('click', () => {
        const visible = this.playlist.getVisibleTracks();
        const current = visible[this.currentTrackIndex];
        const dict = AURORA_DATA.translations[this.currentLang] || AURORA_DATA.translations['en'];
        if (current) {
          const isFav = AppStorage.toggleFavorite(current.id);
          this.updateTrackDetailsUI(current);
          this.renderPlaylistItems();
          this.showToast(isFav ? dict.toastLiked : dict.toastUnliked);
        }
      });
    }

    // Wishlist Button (Player Card)
    if (this.elBtnWishlist) {
      this.elBtnWishlist.addEventListener('click', () => {
        const visible = this.playlist.getVisibleTracks();
        const current = visible[this.currentTrackIndex];
        const dict = AURORA_DATA.translations[this.currentLang] || AURORA_DATA.translations['en'];
        if (current) {
          const isWish = AppStorage.toggleWishlist(current.id);
          this.updateTrackDetailsUI(current);
          this.renderPlaylistItems();
          this.showToast(isWish ? dict.toastWishlistAdded : dict.toastWishlistRemoved);
        }
      });
    }

    // Progress Bar Seeking
    if (this.elProgressBar) {
      this.elProgressBar.addEventListener('click', (e) => {
        const rect = this.elProgressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = clickX / rect.width;
        const track = this.playlist.getVisibleTracks()[this.currentTrackIndex];
        if (track) {
          const seekTime = percent * track.duration;
          this.engine.seek(seekTime);
        }
      });
    }

    // Volume Slider
    if (this.elVolumeSlider) {
      this.elVolumeSlider.addEventListener('input', (e) => {
        const vol = parseFloat(e.target.value) / 100;
        this.updateVolumeUI(vol);
        AppStorage.savePlayerState({ volume: vol });
      });
    }

    // Mute Button
    if (this.elBtnMute) {
      this.elBtnMute.addEventListener('click', () => {
        if (this.engine.audio.volume > 0) {
          this.updateVolumeUI(0);
          this.elVolumeSlider.value = 0;
        } else {
          const saved = AppStorage.getPlayerState().volume || 0.8;
          this.updateVolumeUI(saved);
          this.elVolumeSlider.value = saved * 100;
        }
      });
    }

    // Playlist Item Click Handler & Item Action Buttons
    if (this.elPlaylistContainer) {
      this.elPlaylistContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.playlist-item');
        const likeBtn = e.target.closest('.track-like-btn');
        const wishlistBtn = e.target.closest('.track-wishlist-btn');

        if (likeBtn) {
          const trackId = likeBtn.getAttribute('data-id');
          const isFav = AppStorage.toggleFavorite(trackId);
          const dict = AURORA_DATA.translations[this.currentLang] || AURORA_DATA.translations['en'];
          this.renderPlaylistItems();
          this.showToast(isFav ? dict.toastLiked : dict.toastUnliked);
          return;
        }

        if (wishlistBtn) {
          const trackId = wishlistBtn.getAttribute('data-id');
          const isWish = AppStorage.toggleWishlist(trackId);
          const dict = AURORA_DATA.translations[this.currentLang] || AURORA_DATA.translations['en'];
          this.renderPlaylistItems();
          this.showToast(isWish ? dict.toastWishlistAdded : dict.toastWishlistRemoved);
          return;
        }

        if (item) {
          const idx = parseInt(item.getAttribute('data-index'), 10);
          this.currentTrackIndex = idx;
          const track = this.playlist.getVisibleTracks()[idx];
          this.loadAndPlayTrack(track);
        }
      });
    }

    // Search Input Handler
    if (this.elSearchInput) {
      this.elSearchInput.addEventListener('input', (e) => {
        this.playlist.searchQuery = e.target.value;
        this.renderPlaylistItems();
      });
    }

    // Sort Handler
    if (this.elSortSelect) {
      this.elSortSelect.addEventListener('change', (e) => {
        this.playlist.sortOption = e.target.value;
        this.renderPlaylistItems();
      });
    }

    // Category Tabs (All, Tamil, Hindi, English, Wishlist, Liked)
    document.querySelectorAll('.playlist-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (btn.classList.contains('viz-mode-btn')) return; // Ignore visualizer tab buttons
        document.querySelectorAll('.playlist-tab-btn').forEach(b => {
          if (!b.classList.contains('viz-mode-btn')) b.classList.remove('active');
        });
        e.target.classList.add('active');
        this.playlist.activeFilterCategory = e.target.getAttribute('data-category');
        this.currentTrackIndex = 0;
        this.renderPlaylistItems();
      });
    });

    // Equalizer Controls
    if (this.elEqPresetSelect) {
      this.elEqPresetSelect.addEventListener('change', (e) => {
        const presetName = e.target.value;
        const preset = AURORA_DATA.equalizerPresets.find(p => p.name === presetName);
        if (preset) {
          this.elEqBass.value = preset.gains[0];
          this.elEqMid.value = preset.gains[1];
          this.elEqTreble.value = preset.gains[2];
          this.engine.setEqualizerGains(preset.gains[0], preset.gains[1], preset.gains[2]);
        }
      });
    }

    const updateEQ = () => {
      const b = parseFloat(this.elEqBass.value);
      const m = parseFloat(this.elEqMid.value);
      const t = parseFloat(this.elEqTreble.value);
      this.engine.setEqualizerGains(b, m, t);
    };

    if (this.elEqBass) this.elEqBass.addEventListener('input', updateEQ);
    if (this.elEqMid) this.elEqMid.addEventListener('input', updateEQ);
    if (this.elEqTreble) this.elEqTreble.addEventListener('input', updateEQ);

    // Visualizer Style Switcher Buttons
    document.querySelectorAll('.viz-mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.viz-mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.visualizer.setMode(e.target.getAttribute('data-mode'));
      });
    });

    // Drag and Drop Local MP3 File Import
    const dropZone = document.getElementById('app-container');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-active');
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-active');
      });
      dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-active');

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          for (let file of e.dataTransfer.files) {
            if (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav')) {
              const newTrack = await this.playlist.handleLocalFileDrop(file);
              this.showToast(`Imported: ${newTrack.title}`);
            }
          }
          this.renderPlaylistItems();
        }
      });
    }
  }

  bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (['input', 'textarea', 'select'].includes(document.activeElement.tagName.toLowerCase())) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          this.engine.togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.engine.seek(this.engine.audio.currentTime - 5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.engine.seek(this.engine.audio.currentTime + 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          const newVolUp = Math.min(1, this.engine.audio.volume + 0.1);
          this.updateVolumeUI(newVolUp);
          if (this.elVolumeSlider) this.elVolumeSlider.value = newVolUp * 100;
          break;
        case 'ArrowDown':
          e.preventDefault();
          const newVolDown = Math.max(0, this.engine.audio.volume - 0.1);
          this.updateVolumeUI(newVolDown);
          if (this.elVolumeSlider) this.elVolumeSlider.value = newVolDown * 100;
          break;
        case 'KeyN':
          this.playNextTrack();
          break;
        case 'KeyP':
          this.playPrevTrack();
          break;
        case 'KeyM':
          if (this.elBtnMute) this.elBtnMute.click();
          break;
        case 'KeyS':
          if (this.elBtnShuffle) this.elBtnShuffle.click();
          break;
        case 'KeyR':
          if (this.elBtnRepeat) this.elBtnRepeat.click();
          break;
        case 'KeyL':
          if (this.elBtnLike) this.elBtnLike.click();
          break;
        case 'KeyW':
          if (this.elBtnWishlist) this.elBtnWishlist.click();
          break;
        case 'KeyT':
          const themes = ['aurora', 'cyberpunk', 'gold', 'emerald', 'ruby'];
          const nextT = themes[(themes.indexOf(this.currentTheme) + 1) % themes.length];
          if (this.elThemeSelect) this.elThemeSelect.value = nextT;
          this.applyTheme(nextT);
          this.showToast(`Theme: ${nextT}`);
          break;
        case 'KeyG':
          const langs = ['en', 'ta', 'hi', 'es'];
          const nextL = langs[(langs.indexOf(this.currentLang) + 1) % langs.length];
          if (this.elLangSelect) this.elLangSelect.value = nextL;
          this.applyLanguage(nextL);
          this.showToast(`Language: ${nextL.toUpperCase()}`);
          break;
        case 'Slash':
          if (e.shiftKey) {
            const modal = document.getElementById('shortcuts-modal');
            if (modal) modal.classList.toggle('active');
          }
          break;
      }
    });
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas fa-info-circle"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
