/**
 * LUMINA — Storage & State Persistence Manager
 * Manages LocalStorage for themes/favorites and IndexedDB for user-uploaded custom images.
 */

const STORAGE_KEYS = {
  THEME: "lumina_theme",
  FAVORITES: "lumina_favorites",
  LIKES_EXTRA: "lumina_user_likes",
  CUSTOM_IMAGES: "lumina_custom_images"
};

// IndexedDB Helper for uploaded images
class LuminaDB {
  static DB_NAME = "LuminaGalleryDB";
  static DB_VERSION = 1;
  static STORE_NAME = "user_images";

  static open() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        resolve(null);
        return;
      }
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null); // Fallback gracefully if error
    });
  }

  static async saveImage(imageObj) {
    try {
      const db = await this.open();
      if (!db) {
        this.saveLocalStorageFallback(imageObj);
        return;
      }
      return new Promise((resolve) => {
        const tx = db.transaction(this.STORE_NAME, "readwrite");
        const store = tx.objectStore(this.STORE_NAME);
        store.put(imageObj);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => {
          this.saveLocalStorageFallback(imageObj);
          resolve(false);
        };
      });
    } catch (e) {
      this.saveLocalStorageFallback(imageObj);
    }
  }

  static async getAllImages() {
    try {
      const db = await this.open();
      if (!db) {
        return this.getLocalStorageFallback();
      }
      return new Promise((resolve) => {
        const tx = db.transaction(this.STORE_NAME, "readonly");
        const store = tx.objectStore(this.STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve(this.getLocalStorageFallback());
      });
    } catch (e) {
      return this.getLocalStorageFallback();
    }
  }

  static async deleteImage(id) {
    try {
      const db = await this.open();
      if (db) {
        const tx = db.transaction(this.STORE_NAME, "readwrite");
        tx.objectStore(this.STORE_NAME).delete(id);
      }
      let local = this.getLocalStorageFallback().filter(img => img.id !== id);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_IMAGES, JSON.stringify(local));
    } catch (e) {}
  }

  static saveLocalStorageFallback(imageObj) {
    try {
      const current = this.getLocalStorageFallback();
      current.unshift(imageObj);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_IMAGES, JSON.stringify(current));
    } catch (e) {
      console.warn("Storage quota exceeded in localStorage fallback.");
    }
  }

  static getLocalStorageFallback() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_IMAGES);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
}

// Storage API controller
const StorageManager = {
  // Theme
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  },

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // Favorites
  getFavorites() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  isFavorite(id) {
    return this.getFavorites().includes(id);
  },

  toggleFavorite(id) {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(id);
    let isFav = false;
    if (index > -1) {
      favorites.splice(index, 1);
      isFav = false;
    } else {
      favorites.push(id);
      isFav = true;
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return isFav;
  },

  // Extra user likes count state
  getUserLikesMap() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LIKES_EXTRA);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  },

  setUserLike(id, delta) {
    const map = this.getUserLikesMap();
    map[id] = (map[id] || 0) + delta;
    localStorage.setItem(STORAGE_KEYS.LIKES_EXTRA, JSON.stringify(map));
    return map[id];
  },

  // Custom User Uploaded Images
  async getCustomImages() {
    return await LuminaDB.getAllImages();
  },

  async saveCustomImage(imageObj) {
    await LuminaDB.saveImage(imageObj);
  },

  async deleteCustomImage(id) {
    await LuminaDB.deleteImage(id);
  }
};
