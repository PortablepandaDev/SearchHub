// Centralized state management for SearchHub
import { safeGet, safeSet } from '../utils.js';

export const state = {
  selectedEngines: safeGet('selectedEngines', ['google']),
  searchHistory: safeGet('searchHistory', []),
  searchFavorites: safeGet('searchFavorites', []),
  templates: safeGet('templates', []),
  isSearching: false,
  isSafeMode: safeGet('isSafeMode', true),
  activeCategory: safeGet('activeCategory', 'file_search'),
  activeEngine: safeGet('activeEngine', 'google'),
  categories: {}, // to be set after import
  engines: {}, // to be set after import

  updateState(updates) {
    Object.assign(this, updates);
    if (updates.selectedEngines) safeSet('selectedEngines', updates.selectedEngines);
    if (updates.activeEngine) safeSet('activeEngine', updates.activeEngine);
    if (updates.activeCategory) safeSet('activeCategory', updates.activeCategory);
    if (updates.isSafeMode !== undefined) safeSet('isSafeMode', updates.isSafeMode);
    window.dispatchEvent(new CustomEvent('stateUpdate', { detail: updates }));
  },

  toggleEngine(key) {
    const idx = this.selectedEngines.indexOf(key);
    if (idx >= 0) {
      this.selectedEngines.splice(idx, 1);
    } else {
      this.selectedEngines.push(key);
    }
    if (this.selectedEngines.length === 0) {
      this.selectedEngines = [key];
    }
    this.activeEngine = this.selectedEngines[0];
    this.updateState({
      selectedEngines: [...this.selectedEngines],
      activeEngine: this.activeEngine
    });
  }
};
