// Engine selection and rendering
import { safeGet, safeSet } from './utils.js';

export const searchEngines = {
  google: { 
    name: "Google", 
    url: "https://www.google.com/search?q=",
    icon: "google",
    description: "General web search"
  },
  duckduckgo: { 
    name: "DuckDuckGo", 
    url: "https://duckduckgo.com/?q=",
    icon: "duckduckgo",
    description: "Privacy-focused search engine"
  },
  github: {
    name: "GitHub",
    url: "https://github.com/search?q=",
    icon: "github",
    description: "Search code repositories"
  },
  stackoverflow: {
    name: "Stack Overflow",
    url: "https://stackoverflow.com/search?q=",
    icon: "stackoverflow",
    description: "Developer Q&A"
  },
  bing: { 
    name: "Bing", 
    url: "https://www.bing.com/search?q=",
    icon: "bing",
    description: "Microsoft's search engine"
  }
};

export function renderEngines(state, dom, _updateCheatsheet, updateSearchBtnLabel, renderPreview) {
  dom.engineChips.innerHTML = '';
  Object.keys(searchEngines).forEach(key => {
    const selected = state.selectedEngines.includes(key);
    const btn = document.createElement('button');
    btn.className = `engine-chip search-engine-tab border border-gray-700 rounded-full px-3 py-1 text-sm ${selected ? 'active' : ''}`;
    btn.setAttribute('aria-pressed', selected);
    btn.innerHTML = `<span>${searchEngines[key].name}</span>`;
    btn.addEventListener('click', () => toggleEngine(key, state, dom, renderEngines, _updateCheatsheet, updateSearchBtnLabel, renderPreview));
    dom.engineChips.appendChild(btn);
  });
  // updateCheatsheet();
  updateSearchBtnLabel();
}

export function toggleEngine(key, state, dom, renderEngines, _updateCheatsheet, updateSearchBtnLabel, renderPreview) {
  const idx = state.selectedEngines.indexOf(key);
  if (idx >= 0) {
    state.selectedEngines.splice(idx, 1);
  } else {
    state.selectedEngines.push(key);
  }
  // Always keep at least one engine selected
  if (state.selectedEngines.length === 0) {
    state.selectedEngines = [key];
  }
  state.activeEngine = state.selectedEngines[0];
  safeSet('selectedEngines', state.selectedEngines);
  safeSet('activeEngine', state.activeEngine);
  renderEngines(state, dom, _updateCheatsheet, updateSearchBtnLabel, renderPreview);
  renderPreview && renderPreview();
  // Trigger state update notification
  window.dispatchEvent(new CustomEvent('stateUpdate', { detail: { type: 'engines' } }));
}
