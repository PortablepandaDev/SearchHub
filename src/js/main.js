// Ensure updateSearchBtnLabel is defined
function updateSearchBtnLabel() {
  if (!dom.searchButton) return;
  dom.searchButton.textContent = 'Search';
}
import { renderEngines, searchEngines, toggleEngine } from './engines.js';
import { renderCategories, searchCategories } from './categories.js';
import { renderHistory, addToHistory } from './history.js';
import { renderTemplates, saveTemplate, deleteTemplate } from './templates.js';
import { renderOptions } from './options.js';
import { renderPreview } from './preview.js';
import { handleSearch, handleCopy } from './search.js';
import { registerEventListeners } from './events.js';
import { safeGet, safeSet, showToast } from './utils.js';
import { buildQueryString } from './query.js';
import { DorkLibrary } from './components/DorkLibrary.js';
import { QuerySuggester } from './components/QuerySuggester.js';
import { GitHubSearch } from './components/GitHubSearch.js';
import { ResultPreviewer } from './components/ResultPreviewer.js';

// DOM references
const dom = {
  engineChips: document.getElementById('engineChips'),
  categoryContainer: document.getElementById('categoryContainer'),
  historyContainer: document.getElementById('historyContainer'),
  templateSelect: document.getElementById('templateSelect'),
  saveTemplateBtn: document.getElementById('saveTemplateBtn'),
  deleteTemplateBtn: document.getElementById('deleteTemplateBtn'),
  optionsTitle: document.getElementById('optionsTitle'),
  optionsDescription: document.getElementById('optionsDescription'),
  optionsContainer: document.getElementById('optionsContainer'),
  searchQuery: document.getElementById('searchQuery'),
  searchButton: document.getElementById('searchButton'),
  copyButton: document.getElementById('copyButton'),
  afterDateInput: document.getElementById('afterDate'),
  beforeDateInput: document.getElementById('beforeDate'),
  favoritesContainer: document.getElementById('favoritesContainer'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  safeModeToggle: document.getElementById('safeModeToggle'),
  toast: document.getElementById('toast'),
  cheatsToggle: document.getElementById('cheatsToggle'),
  cheatsBody: document.getElementById('cheatsBody'),
  cheatsList: document.getElementById('cheatsList'),
  cheatEngineLabel: document.getElementById('cheatEngineLabel'),
  includeTerms: document.getElementById('includeTerms'),
  excludeTerms: document.getElementById('excludeTerms'),
  exactPhrases: document.getElementById('exactPhrases'),
  clearRegexBtn: document.getElementById('clearRegexBtn'),
  queryPreview: document.getElementById('queryPreview'),
  copyPreviewBtn: document.getElementById('copyPreviewBtn'),
  runPreviewBtn: document.getElementById('runPreviewBtn'),
  searchBtnLabel: document.getElementById('searchBtnLabel'),
  exportBtn: document.getElementById('exportBtn'),
  importInput: document.getElementById('importInput'),
  suggestionsList: document.getElementById('suggestionsList'),
  dorkLibrary: document.getElementById('dorkLibrary'),
  githubResults: document.getElementById('githubResults'),
  resultPreviews: document.getElementById('resultPreviews'),
};

const state = {
  selectedEngines: safeGet('selectedEngines', ['google']),
  searchHistory: safeGet('searchHistory', []),
  searchFavorites: safeGet('searchFavorites', []),
  templates: safeGet('templates', []),
  isSearching: false,
  isSafeMode: safeGet('isSafeMode', true),
  activeCategory: safeGet('activeCategory', 'file_search'),
  activeEngine: safeGet('activeEngine', 'google'),
  categories: searchCategories,
  engines: searchEngines,
  
  // Add methods to update state
  updateState(updates) {
    Object.assign(this, updates);
    // Save persistent values
    if (updates.selectedEngines) safeSet('selectedEngines', updates.selectedEngines);
    if (updates.activeEngine) safeSet('activeEngine', updates.activeEngine);
    if (updates.activeCategory) safeSet('activeCategory', updates.activeCategory);
    if (updates.isSafeMode !== undefined) safeSet('isSafeMode', updates.isSafeMode);
    // Notify listeners
    window.dispatchEvent(new CustomEvent('stateUpdate', { detail: updates }));
  },
  
  toggleEngine(key) {
    const idx = this.selectedEngines.indexOf(key);
    if (idx >= 0) {
      this.selectedEngines.splice(idx, 1);
    } else {
      this.selectedEngines.push(key);
    }
    // Always keep at least one engine
    if (this.selectedEngines.length === 0) {
      this.selectedEngines = [key];
    }
    this.activeEngine = this.selectedEngines[0];
    this.updateState({ 
      selectedEngines: [...this.selectedEngines], 
      activeEngine: this.activeEngine 
    });
  },
  
  setCategory(key) {
    this.activeCategory = key;
    this.updateState({ activeCategory: key });
  },
  
  toggleSafeMode() {
    this.isSafeMode = !this.isSafeMode;
    this.updateState({ isSafeMode: this.isSafeMode });
    return this.isSafeMode;
  }
};

function checkSearchButtonState() {/* implement as needed */}
function getCurrentConfig() {/* implement as needed */}

// Initialize advanced features components
const dorkLibrary = new DorkLibrary();
const querySuggester = new QuerySuggester();
const githubSearch = new GitHubSearch();
const resultPreviewer = new ResultPreviewer();

// Utility functions




// Initialize the application
async function init() {
  console.log('INIT: Starting initialization');
  
  // Verify and update DOM references
  const criticalElements = [
    'engineChips',
    'categoryContainer',
    'searchQuery',
    'searchButton',
    'optionsContainer',
    'toast'
  ];
  
  for (const elementId of criticalElements) {
    if (!dom[elementId]) {
      console.error(`Critical element not found: ${elementId}`);
      dom[elementId] = document.getElementById(elementId);
      if (!dom[elementId]) {
        showToast(`Failed to initialize: Missing ${elementId}`, 'error');
        return;
      }
    }
  }
  
  try {
    // Initialize base features with proper error handling
    renderEngines(state, dom, 
      () => {}, 
      () => updateSearchBtnLabel(), 
      () => renderPreview(state, dom, buildQueryString)
    );

    renderCategories(
      state, dom, {},
      (key) => renderOptions(key, state, dom, buildQueryString, renderPreview, checkSearchButtonState),
      buildQueryString,
      renderPreview,
      checkSearchButtonState
    );

    // Initialize history and templates
    await Promise.all([
      renderHistory(state, dom),
      renderTemplates(state, dom)
    ]);

    // Initialize options and preview
  renderOptions(state.activeCategory, state, dom, buildQueryString, renderPreview, checkSearchButtonState);
  renderPreview(state, dom, buildQueryString);
    
    // Set up SafeMode toggle
    if (dom.safeModeToggle) {
      dom.safeModeToggle.addEventListener('click', () => {
        const isSafe = state.toggleSafeMode();
        dom.safeModeToggle.classList.toggle('bg-green-500', isSafe);
        dom.safeModeToggle.classList.toggle('bg-gray-500', !isSafe);
        showToast(`Safe Mode ${isSafe ? 'Enabled' : 'Disabled'}`, isSafe ? 'success' : 'error');
        
        // Re-render categories and current category's options
        renderCategories(
          state, dom, {},
          (key) => renderOptions(key, state, dom, buildQueryString, renderPreview, checkSearchButtonState),
          buildQueryString,
          renderPreview,
          checkSearchButtonState
        );
        
        // Re-render options for current category
        renderOptions(
          state.activeCategory,
          state, dom, buildQueryString, 
          renderPreview, 
          checkSearchButtonState
        );

        // Update preview
        renderPreview(state, dom, buildQueryString);
      });
    }
    
    // Register core event listeners
    registerEventListeners(state, dom, {
      handleSearch: async () => {
        if (!dom.searchQuery?.value) {
          showToast('Please enter a search query', 'error');
          return;
        }
        const results = await handleSearch(state, dom, buildQueryString, addToHistory, showToast);
        if (results?.success) {
          showToast('Search started successfully', 'success');
        }
      },
      handleCopy: () => handleCopy(state, dom, buildQueryString, showToast),
      handlePreview: () => renderPreview(state, dom, buildQueryString),
      saveTemplate: () => saveTemplate(state, dom, getCurrentConfig, renderTemplates, showToast),
      deleteTemplate: () => deleteTemplate(state, dom, renderTemplates, showToast),
    });

    // Update initial button states
    updateSearchBtnLabel();
    checkSearchButtonState();

    // Add query input listeners
    if (dom.searchQuery) {
      dom.searchQuery.addEventListener('input', () => {
        renderPreviewWithQuery();
        checkSearchButtonState();
      });

      // Add keyboard shortcut
      dom.searchQuery.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          handleSearch(state, dom, buildQueryString, addToHistory, showToast);
        }
      });
    }

    // Helper to always call renderPreview with buildQueryString
    function renderPreviewWithQuery() {
      renderPreview(state, dom, buildQueryString);
    }

    console.log('INIT: Finished successfully');
  } catch (error) {
    console.error('INIT: Failed', error);
    showToast('Failed to initialize the application', 'error');
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', init);

// Handle search results for previews and GitHub integration
async function handleSearchResults(results) {
  if (!results) return;

  // Handle GitHub results if in GitHub category
  if (state.activeCategory === 'github' && results.urls) {
    try {
      const githubResults = await githubSearch.searchGitHub(buildQueryString(state, dom));
      renderGitHubResults(githubResults);
    } catch (error) {
      showToast('GitHub search failed: ' + error.message);
    }
  }

  // Generate previews for results
  if (results.urls && results.urls.length > 0) {
    await generatePreviews(results.urls);
  }
}

// Initialize advanced features
function initAdvancedFeatures() {
  // Setup query suggestions
  if (dom.searchQueryInput && dom.suggestionsList) {
    dom.searchQueryInput.addEventListener('input', debounce(async (e) => {
      const query = e.target.value;
      const suggestions = querySuggester.analyzeQuery(query);
      renderSuggestions(suggestions);
    }, 300));
  }

  // Setup dork library
  if (dom.dorkLibrary) {
    renderDorkLibrary();
  }

  // Add GitHub search category if not exists
  if (!state.categories.find(c => c.id === 'github')) {
    state.categories.push({
      id: 'github',
      name: 'GitHub Search',
      description: 'Search GitHub repositories for code and secrets',
      baseQuery: '',
      options: GitHubSearch.getSecurityDorks()
    });
    renderCategories(state, dom);
  }
}

// Render suggestions dropdown
function renderSuggestions(suggestions) {
  if (!dom.suggestionsList) return;
  
  const html = suggestions
    .map(suggestion => `
      <div class="suggestion-item px-4 py-2 hover:bg-gray-700 cursor-pointer" 
           onclick="applySuggestion('${suggestion}')">
        ${suggestion}
      </div>
    `)
    .join('');
    
  dom.suggestionsList.innerHTML = html;
  dom.suggestionsList.style.display = suggestions.length ? 'block' : 'none';
}

// Render dork library
function renderDorkLibrary() {
  if (!dom.dorkLibrary) return;

  const categories = dorkLibrary.getAllCategories();
  const html = categories
    .map(category => `
      <div class="dork-category mb-6">
        <h3 class="text-lg font-semibold mb-3">${category}</h3>
        <div class="space-y-2">
          ${dorkLibrary.getDorksByCategory(category)
            .map(dork => `
              <div class="dork-item p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600"
                   onclick="applyDork('${dork.query}')">
                <div class="font-medium">${dork.name}</div>
                <div class="text-sm text-gray-300 mt-1">${dork.description}</div>
                <code class="block mt-2 p-2 bg-gray-800 rounded text-sm">${dork.query}</code>
              </div>
            `)
            .join('')}
        </div>
      </div>
    `)
    .join('');

  dom.dorkLibrary.innerHTML = html;
}

// Render GitHub results
function renderGitHubResults(results) {
  if (!dom.githubResults || !results) return;

  const html = `
    <div class="space-y-4">
      <h3 class="text-lg font-semibold">GitHub Results (${results.totalCount})</h3>
      <div class="space-y-3">
        ${results.items.map(item => `
          <div class="github-result p-4 bg-gray-700 rounded-lg">
            <div class="flex items-center justify-between">
              <a href="${item.url}" target="_blank" class="text-blue-400 hover:text-blue-300">
                ${item.repo}
              </a>
              <span class="text-sm text-gray-400">${item.path}</span>
            </div>
            ${item.matchingText ? `
              <pre class="mt-3 p-3 bg-gray-800 rounded overflow-x-auto">
                <code>${item.matchingText[0]?.fragment || ''}</code>
              </pre>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  dom.githubResults.innerHTML = html;
}

// Generate previews for search results
async function generatePreviews(urls) {
  if (!dom.resultPreviews) return;

  const previews = await Promise.all(
    urls.slice(0, 5).map(async url => {
      try {
        const preview = await resultPreviewer.fetchPreview(url);
        return preview ? { url, preview } : null;
      } catch (error) {
        console.error('Preview generation failed:', error);
        return null;
      }
    })
  );

  const html = previews
    .filter(Boolean)
    .map(({ url, preview }) => `
      <div class="result-preview p-4 bg-gray-700 rounded-lg mb-3">
        <a href="${url}" target="_blank" class="text-blue-400 hover:text-blue-300 font-medium">
          ${preview.title}
        </a>
        <p class="text-sm text-gray-300 mt-2">${preview.description}</p>
        <div class="mt-3 p-3 bg-gray-800 rounded text-sm font-mono">
          ${preview.snippet}
        </div>
      </div>
    `)
    .join('');

  dom.resultPreviews.innerHTML = html;
}

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Global functions for suggestions and dorks
window.applySuggestion = function(suggestion) {
  if (dom.searchQueryInput) {
    dom.searchQueryInput.value = suggestion;
    renderPreview(state, dom, buildQueryString);
    dom.suggestionsList.style.display = 'none';
  }
};

window.applyDork = function(query) {
  if (dom.searchQueryInput) {
    dom.searchQueryInput.value = query;
    renderPreview(state, dom, buildQueryString);
  }
};

document.addEventListener('DOMContentLoaded', init);
