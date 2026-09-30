/**
 * Aurora Music Player - Playlist & Queue Manager
 * Track filtering, Wishlist management, language selection, search, sorting, shuffle queue, and local file import
 */

class PlaylistManager {
  constructor() {
    this.allTracks = [...AURORA_DATA.tracks];
    this.userTracks = AppStorage.getUserTracks();
    this.allTracks = [...this.allTracks, ...this.userTracks];

    this.playQueue = [];
    this.historyQueue = [];
    
    this.activeFilterCategory = 'all'; // 'all', 'wishlist', 'en', 'hi', 'ta', 'liked', 'custom-[id]'
    this.searchQuery = '';
    this.sortOption = 'default';

    this.shuffleEnabled = false;
    this.repeatMode = 'off'; // 'off', 'all', 'one'
  }

  getVisibleTracks() {
    let list = [...this.allTracks];

    // Filter by category, language, wishlist or custom playlists
    if (this.activeFilterCategory === 'liked') {
      const favorites = AppStorage.getFavorites();
      list = list.filter(t => favorites.includes(t.id));
    } else if (this.activeFilterCategory === 'wishlist') {
      const wishlist = AppStorage.getWishlist();
      list = list.filter(t => wishlist.includes(t.id));
    } else if (['en', 'hi', 'ta'].includes(this.activeFilterCategory)) {
      list = list.filter(t => t.lang === this.activeFilterCategory);
    } else if (this.activeFilterCategory.startsWith('custom-')) {
      const playlistId = this.activeFilterCategory.replace('custom-', '');
      const playlists = AppStorage.getCustomPlaylists();
      const pl = playlists.find(p => p.id === playlistId);
      if (pl) {
        list = list.filter(t => pl.trackIds.includes(t.id));
      } else {
        list = [];
      }
    }

    // Search filter
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(t => {
        const titleMatch = t.title.toLowerCase().includes(q);
        const artistMatch = t.artist.toLowerCase().includes(q);
        const albumMatch = t.album.toLowerCase().includes(q);
        const genreMatch = t.genre.toLowerCase().includes(q);
        const lyricsMatch = t.lyrics && t.lyrics.some(l => l.text.toLowerCase().includes(q) || (l.translation && l.translation.toLowerCase().includes(q)));
        return titleMatch || artistMatch || albumMatch || genreMatch || lyricsMatch;
      });
    }

    // Sort
    if (this.sortOption === 'title-asc') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.sortOption === 'artist-asc') {
      list.sort((a, b) => a.artist.localeCompare(b.artist));
    } else if (this.sortOption === 'duration-asc') {
      list.sort((a, b) => a.duration - b.duration);
    }

    return list;
  }

  getTrackById(id) {
    return this.allTracks.find(t => t.id === id);
  }

  // Queue Operations
  addToQueue(trackId) {
    if (!this.playQueue.includes(trackId)) {
      this.playQueue.push(trackId);
    }
  }

  playNextInQueue(trackId) {
    this.playQueue.unshift(trackId);
  }

  removeFromQueue(index) {
    if (index >= 0 && index < this.playQueue.length) {
      this.playQueue.splice(index, 1);
    }
  }

  // Next & Previous Track Navigation Logic
  getNextTrack(currentIndex) {
    const visibleTracks = this.getVisibleTracks();
    if (!visibleTracks.length) return null;

    if (this.playQueue.length > 0) {
      const nextId = this.playQueue.shift();
      const nextTrack = this.getTrackById(nextId);
      if (nextTrack) return nextTrack;
    }

    if (this.repeatMode === 'one') {
      return visibleTracks[currentIndex] || visibleTracks[0];
    }

    if (this.shuffleEnabled) {
      const randomIndex = Math.floor(Math.random() * visibleTracks.length);
      return visibleTracks[randomIndex];
    }

    let nextIndex = currentIndex + 1;
    if (nextIndex >= visibleTracks.length) {
      if (this.repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return null;
      }
    }

    return visibleTracks[nextIndex];
  }

  getPrevTrack(currentIndex, currentPlayTime = 0) {
    const visibleTracks = this.getVisibleTracks();
    if (!visibleTracks.length) return null;

    if (currentPlayTime > 3) {
      return visibleTracks[currentIndex];
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = visibleTracks.length - 1;
    }

    return visibleTracks[prevIndex];
  }

  // User Local MP3 File Import
  handleLocalFileDrop(file) {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

      const colors = ['#6366f1', '#10b981', '#ec4899', '#f59e0b', '#0ea5e9', '#8b5cf6'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newTrack = {
        id: 'local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        title: fileNameWithoutExt,
        artist: 'Local Artist',
        album: 'Local Uploads',
        genre: 'User File',
        lang: 'en',
        duration: 180,
        cover: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><rect width='400' height='400' fill='${encodeURIComponent(randomColor)}'/><text x='200' y='210' text-anchor='middle' fill='%23ffffff' font-family='sans-serif' font-weight='bold' font-size='24'>🎵 ${encodeURIComponent(fileNameWithoutExt.substring(0, 15))}</text></svg>`,
        dominantColor: randomColor,
        accentColor: '#ffffff',
        audioUrl: objectUrl,
        syntheticFreq: [220, 293, 349, 440]
      };

      const tempAudio = new Audio(objectUrl);
      tempAudio.addEventListener('loadedmetadata', () => {
        if (tempAudio.duration && !isNaN(tempAudio.duration)) {
          newTrack.duration = Math.round(tempAudio.duration);
        }
        this.allTracks.push(newTrack);
        AppStorage.addUserTrack(newTrack);
        resolve(newTrack);
      });

      tempAudio.addEventListener('error', () => {
        this.allTracks.push(newTrack);
        AppStorage.addUserTrack(newTrack);
        resolve(newTrack);
      });
    });
  }
}
