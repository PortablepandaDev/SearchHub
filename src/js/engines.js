// Engine selection and rendering
import { safeGet, safeSet } from './utils.js';

export const searchEngines = {
  google: { 
    name: "Google", 
    url: "https://www.google.com/search?q=",
    icon: "google",
    description: "General web search"
  },
  scholar: {
    name: "Google Scholar",
    url: "https://scholar.google.com/scholar?q=",
    icon: "scholar",
    description: "Academic papers search"
  },
  arxiv: {
    name: "arXiv",
    url: "https://arxiv.org/search/?query=",
    icon: "arxiv",
    description: "Scientific papers archive"
  },
  pubmed: {
    name: "PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=",
    icon: "pubmed",
    description: "Medical research papers"
  },
  stackoverflow: {
    name: "Stack Overflow",
    url: "https://stackoverflow.com/search?q=",
    icon: "stackoverflow",
    description: "Developer Q&A"
  },
  github: {
    name: "GitHub",
    url: "https://github.com/search?q=",
    icon: "github",
    description: "Search code repositories"
  },
  npm: {
    name: "NPM",
    url: "https://www.npmjs.com/search?q=",
    icon: "npm",
    description: "Node.js packages"
  },
  pypi: {
    name: "PyPI",
    url: "https://pypi.org/search/?q=",
    icon: "pypi",
    description: "Python packages"
  },
  mdn: {
    name: "MDN",
    url: "https://developer.mozilla.org/search?q=",
    icon: "mdn",
    description: "Web documentation"
  },
  youtube: {
    name: "YouTube",
    url: "https://www.youtube.com/results?search_query=",
    icon: "youtube",
    description: "Video search"
  },
  duckduckgo: { 
    name: "DuckDuckGo", 
    url: "https://duckduckgo.com/?q=",
    icon: "duckduckgo",
    description: "Privacy-focused search"
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
    const selected = key === state.activeEngine;
    const btn = document.createElement('button');
    btn.className = `engine-chip search-engine-tab border border-gray-700 rounded-full px-3 py-1 text-sm ${selected ? 'active' : ''}`;
    btn.setAttribute('aria-pressed', selected);
    btn.innerHTML = `<span>${searchEngines[key].name}</span>`;
    btn.addEventListener('click', () => toggleEngine(key, state, dom, renderEngines, _updateCheatsheet, updateSearchBtnLabel, renderPreview));
    dom.engineChips.appendChild(btn);
  });
  updateSearchBtnLabel();
}

export function toggleEngine(key, state, dom, renderEngines, _updateCheatsheet, updateSearchBtnLabel, renderPreview) {
  // Set the active engine
  state.activeEngine = key;
  // Keep selectedEngines in sync for backwards compatibility
  state.selectedEngines = [key];
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
