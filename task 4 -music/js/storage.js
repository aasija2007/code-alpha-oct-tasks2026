/**
 * Aurora Music Player - LocalStorage Manager
 * Persistent state management for favorites, wishlist, custom playlists, volume, theme, language, and playback options
 */

const STORAGE_KEYS = {
  FAVORITES: 'aurora_favorites',
  WISHLIST: 'aurora_wishlist',
  CUSTOM_PLAYLISTS: 'aurora_custom_playlists',
  PLAYER_STATE: 'aurora_player_state',
  USER_TRACKS: 'aurora_user_tracks'
};

const AppStorage = {
  // Favorites / Liked Songs
  getFavorites() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse favorites from storage:', e);
      return [];
    }
  },

  toggleFavorite(trackId) {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(trackId);
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(trackId);
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return favorites.includes(trackId);
  },

  isFavorite(trackId) {
    return this.getFavorites().includes(trackId);
  },

  // Wishlist / Saved for Later Tracks
  getWishlist() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse wishlist from storage:', e);
      return [];
    }
  },

  toggleWishlist(trackId) {
    const wishlist = this.getWishlist();
    const index = wishlist.indexOf(trackId);
    if (index > -1) {
      wishlist.splice(index, 1);
    } else {
      wishlist.push(trackId);
    }
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    return wishlist.includes(trackId);
  },

  isWishlist(trackId) {
    return this.getWishlist().includes(trackId);
  },

  // Custom User Playlists
  getCustomPlaylists() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_PLAYLISTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  createPlaylist(name) {
    const playlists = this.getCustomPlaylists();
    const newPlaylist = {
      id: 'pl-' + Date.now(),
      name: name,
      trackIds: [],
      createdAt: new Date().toISOString()
    };
    playlists.push(newPlaylist);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PLAYLISTS, JSON.stringify(playlists));
    return newPlaylist;
  },

  addTrackToPlaylist(playlistId, trackId) {
    const playlists = this.getCustomPlaylists();
    const pl = playlists.find(p => p.id === playlistId);
    if (pl && !pl.trackIds.includes(trackId)) {
      pl.trackIds.push(trackId);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PLAYLISTS, JSON.stringify(playlists));
    }
  },

  removeTrackFromPlaylist(playlistId, trackId) {
    const playlists = this.getCustomPlaylists();
    const pl = playlists.find(p => p.id === playlistId);
    if (pl) {
      pl.trackIds = pl.trackIds.filter(id => id !== trackId);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PLAYLISTS, JSON.stringify(playlists));
    }
  },

  deletePlaylist(playlistId) {
    const playlists = this.getCustomPlaylists().filter(p => p.id !== playlistId);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PLAYLISTS, JSON.stringify(playlists));
  },

  // Player State Persistence
  getPlayerState() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYER_STATE);
      return data ? JSON.parse(data) : {
        currentTrackIndex: 0,
        volume: 0.8,
        isMuted: false,
        shuffle: false,
        repeat: 'off',
        playbackRate: 1.0,
        eqGains: [0, 0, 0],
        currentTime: 0,
        lang: 'en',
        theme: 'aurora',
        lyricMode: 'dual'
      };
    } catch (e) {
      return {
        currentTrackIndex: 0,
        volume: 0.8,
        isMuted: false,
        shuffle: false,
        repeat: 'off',
        playbackRate: 1.0,
        eqGains: [0, 0, 0],
        currentTime: 0,
        lang: 'en',
        theme: 'aurora',
        lyricMode: 'dual'
      };
    }
  },

  savePlayerState(state) {
    try {
      const current = this.getPlayerState();
      localStorage.setItem(STORAGE_KEYS.PLAYER_STATE, JSON.stringify({ ...current, ...state }));
    } catch (e) {
      // Storage quota exceeded quiet catch
    }
  },

  // Local User Uploaded Tracks
  getUserTracks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_TRACKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  addUserTrack(track) {
    const userTracks = this.getUserTracks();
    userTracks.push(track);
    try {
      localStorage.setItem(STORAGE_KEYS.USER_TRACKS, JSON.stringify(userTracks));
    } catch (e) {
      console.warn('Storage quota reached for local audio metadata');
    }
  }
};
