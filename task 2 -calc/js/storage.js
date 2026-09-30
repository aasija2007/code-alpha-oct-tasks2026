/**
 * CalcPro - Storage Module
 * LocalStorage management for History, Memory state, Settings and Themes
 */

const StorageManager = (function () {
  'use strict';

  const KEYS = {
    HISTORY: 'calcpro_history_v1',
    MEMORY: 'calcpro_memory_v1',
    SETTINGS: 'calcpro_settings_v1'
  };

  const DEFAULT_SETTINGS = {
    theme: 'dark',        // 'dark' | 'light'
    accent: 'ocean',      // 'ocean' | 'sunset' | 'forest' | 'neon'
    soundEnabled: true,
    hapticEnabled: true,
    angleMode: 'DEG'      // 'DEG' | 'RAD'
  };

  /**
   * Helper to safely interact with localStorage
   */
  function getItem(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn('LocalStorage access failed:', e);
      return fallback;
    }
  }

  function setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  // --- HISTORY MANAGEMENT ---
  function getHistory() {
    return getItem(KEYS.HISTORY, []);
  }

  function addHistory(expression, result, formatted) {
    if (!expression || result === undefined || result === null) return;
    const history = getHistory();
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      expression,
      result: String(result),
      formatted: formatted || String(result),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Prepend new item and limit max entries to 50
    history.unshift(entry);
    if (history.length > 50) {
      history.pop();
    }
    setItem(KEYS.HISTORY, history);
    return entry;
  }

  function clearHistory() {
    setItem(KEYS.HISTORY, []);
  }

  // --- MEMORY MANAGEMENT ---
  function getMemory() {
    return getItem(KEYS.MEMORY, 0);
  }

  function setMemory(val) {
    const num = typeof val === 'number' ? val : parseFloat(val) || 0;
    setItem(KEYS.MEMORY, num);
    return num;
  }

  function clearMemory() {
    setItem(KEYS.MEMORY, 0);
    return 0;
  }

  function addToMemory(val) {
    const current = getMemory();
    const num = typeof val === 'number' ? val : parseFloat(val) || 0;
    const updated = current + num;
    setItem(KEYS.MEMORY, updated);
    return updated;
  }

  function subtractFromMemory(val) {
    const current = getMemory();
    const num = typeof val === 'number' ? val : parseFloat(val) || 0;
    const updated = current - num;
    setItem(KEYS.MEMORY, updated);
    return updated;
  }

  // --- SETTINGS MANAGEMENT ---
  function getSettings() {
    const stored = getItem(KEYS.SETTINGS, {});
    // Detect system dark mode preference if theme is not explicitly saved
    if (!stored.theme && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      stored.theme = prefersDark ? 'dark' : 'light';
    }
    return Object.assign({}, DEFAULT_SETTINGS, stored);
  }

  function saveSettings(newSettings) {
    const current = getSettings();
    const updated = Object.assign({}, current, newSettings);
    setItem(KEYS.SETTINGS, updated);
    return updated;
  }

  return {
    getHistory,
    addHistory,
    clearHistory,
    getMemory,
    setMemory,
    clearMemory,
    addToMemory,
    subtractFromMemory,
    getSettings,
    saveSettings
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
