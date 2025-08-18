// Ensure updateSearchBtnLabel is defined
function updateSearchBtnLabel() {
  if (!dom.searchButton) return;
  dom.searchButton.textContent = 'Search';
}
import { renderEngines, searchEngines, toggleEngine } from './engines.js';
import { renderCategories, searchCategories } from './categories.js';
import { renderHistory, addToHistory } from './history.js';
import { TemplatesUI } from './components/TemplatesUI.js';
import { defaultTemplates } from './config/defaultTemplates.js';
import { db } from './utils/db.js';
import { renderOptions } from './options.js';
import { renderPreview } from './preview.js';
import { handleSearch, handleCopy } from './search.js';
import { registerEventListeners } from './events.js';
import { safeGet, safeSet, showToast } from './utils.js';
import { buildQueryString, adaptQueryForEngine } from './query.js';
import { ENGINE, buildURL } from './engineMap.js';
import { DorkLibrary } from './components/DorkLibrary.js';
import { QuerySuggester } from './components/QuerySuggester.js';
import { GitHubSearch } from './components/GitHubSearch.js';
import { ResultPreviewer } from './components/ResultPreviewer.js';
import { SearchEngine } from './components/SearchEngine.js';
import { AISuggester } from './components/AISuggester.js';

// DOM references
const dom = {
  engineChips: document.getElementById('engineChips'),
  categoryContainer: document.getElementById('categoryContainer'),
  historyContainer: document.getElementById('historyContainer'),
  templatesContainer: document.getElementById('templatesContainer'),
  importTemplatesBtn: document.getElementById('importTemplatesBtn'),
  exportTemplatesBtn: document.getElementById('exportTemplatesBtn'),
  optionsTitle: document.getElementById('optionsTitle'),
  optionsDescription: document.getElementById('optionsDescription'),
  optionsContainer: document.getElementById('optionsContainer'),
  searchQuery: document.getElementById('searchQuery'),
  searchButton: document.getElementById('searchButton'),
  aiSuggestBtn: document.getElementById('aiSuggestBtn'),
  aiSuggestBox: document.getElementById('aiSuggestBox'),
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
  copyGoogleBtn: null,
  copyBingBtn: null,
  copyDDGBtn: null,
  copyPreviewBtn: document.getElementById('copyPreviewBtn'),
  runPreviewBtn: document.getElementById('runPreviewBtn'),
  searchBtnLabel: document.getElementById('searchBtnLabel'),
  exportBtn: document.getElementById('exportBtn'),
  importInput: document.getElementById('importInput'),
  suggestionsList: document.getElementById('suggestionsList'),
  dorkLibrary: document.getElementById('dorkLibrary'),
  githubResults: document.getElementById('githubResults'),
  resultPreviews: document.getElementById('resultPreviews'),
  aiSuggestBtn: document.getElementById('aiSuggestBtn'),
  aiSuggestBox: document.getElementById('aiSuggestBox'),
};

const state = {
  selectedEngines: safeGet('selectedEngines', ['google']),
  searchHistory: safeGet('searchHistory', []),
  // Favorites collections: { [collectionName]: [favorite, ...] }
  searchFavorites: safeGet('searchFavorites', null) || { "Default": safeGet('searchFavorites', []) },
  activeFavoritesCollection: safeGet('activeFavoritesCollection', 'Default'),
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
    if (updates.searchFavorites) safeSet('searchFavorites', updates.searchFavorites);
    if (updates.activeFavoritesCollection) safeSet('activeFavoritesCollection', updates.activeFavoritesCollection);
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
const aiSuggester = new AISuggester();

// Utility functions




// Load a template into the current search setup
function loadTemplate(template) {
  // Update the state with template values
  state.updateState({
    query: template.query || '',
    category: template.category,
    selectedOptions: template.selectedOptions || [],
    selectedEngines: template.selectedEngines || [],
    safeMode: template.safeMode
  });

  // Update UI
  if (template.category) {
    renderCategories(state, dom, {}, 
      (key) => renderOptions(key, state, dom, buildQueryString, renderPreview, checkSearchButtonState),
      buildQueryString,
      renderPreview,
      checkSearchButtonState
    );
  }

  if (template.query) {
    dom.searchQuery.value = template.query;
  }

  // Update preview
  renderPreview(state, dom, buildQueryString);
  checkSearchButtonState();
}

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
    // Initialize SearchEngine component which handles all engine rendering and selection
    const searchEngineComponent = new SearchEngine(state);

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
      (async () => {
        try {
          // Wait for DB initialization
          await db.ready;
          
          // Initialize templates UI
          const templatesUI = new TemplatesUI(dom.templatesContainer, state, {
            onTemplateLoad: () => {
              renderCategories(state, dom, {}, 
                (key) => renderOptions(key, state, dom, buildQueryString, renderPreview, checkSearchButtonState),
                buildQueryString,
                renderPreview,
                checkSearchButtonState
              );
              renderPreview(state, dom, buildQueryString);
              checkSearchButtonState();
            }
          });
          
          // Wait for initialization to complete
          await new Promise(resolve => setTimeout(resolve, 100)); // Give time for init() to complete
          
          // Load default templates if none exist
          if (!templatesUI.templates.length) {
            console.log('No templates found, adding defaults...');
            for (const template of defaultTemplates) {
              try {
                await db.add('templates', {
                  ...template,
                  created: new Date().toISOString(),
                  lastUsed: new Date().toISOString()
                });
              } catch (err) {
                console.error('Failed to add template:', err);
              }
            }
            // Re-render after adding default templates
            await templatesUI.init();
          }
        } catch (error) {
          console.error('Failed to initialize templates:', error);
          showToast('Failed to initialize templates system', 'error');
        }
      })()
    ]);

    // Initialize options and preview
  renderOptions(state.activeCategory, state, dom, buildQueryString, renderPreview, checkSearchButtonState);
  renderPreview(state, dom, buildQueryString);
    
    // Set up SafeMode toggle
    if (dom.safeModeToggle) {
      // Initialize toggle state
      const initialIsSafe = state.isSafeMode;
      dom.safeModeToggle.classList.toggle('bg-green-500', initialIsSafe);
      dom.safeModeToggle.classList.toggle('bg-gray-500', !initialIsSafe);

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
    
    // Handler for search operations
    const performSearch = async (triggerSource) => {
      console.log('Search triggered from:', triggerSource);
      if (!dom.searchQuery?.value) {
        showToast('Please enter a search query', 'error');
        return;
      }

      // Guard against rapid repeated triggers of the same search
      const searchKey = `${dom.searchQuery.value}_${state.selectedEngines.join(',')}`;
      const now = Date.now();
      if (state.lastSearchKey === searchKey && state.lastSearchTime && (now - state.lastSearchTime) < 1000) {
        console.log('Search prevented - duplicate search detected');
        return;
      }
      state.lastSearchKey = searchKey;
      state.lastSearchTime = now;

      if (state.isSearching) {
        console.log('Search prevented - already searching');
        return;
      }
      
      dom.searchButton.disabled = true;
      state.isSearching = true;
      try {
        const results = await handleSearch(state, dom, buildQueryString, addToHistory, showToast);
        if (results?.success) {
          showToast('Search started successfully', 'success');
        }
      } finally {
        state.isSearching = false;
        dom.searchButton.disabled = false;
        // Allow the next different search immediately, but prevent duplicates for 1 second
        setTimeout(() => {
          if (state.lastSearchKey === searchKey) {
            state.lastSearchKey = null;
            state.lastSearchTime = 0;
          }
        }, 1000);
      }
    };

    // Set up search button click handler
    if (dom.searchButton) {
      dom.searchButton.addEventListener('click', () => performSearch('search-button'));
    }
    // Set up run preview button click handler
    if (dom.runPreviewBtn) {
      dom.runPreviewBtn.addEventListener('click', () => performSearch('preview-button'));
    }

    // Register other event listeners
    registerEventListeners(state, dom, {
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
        showQueryLintAndSuggestions();
      });

      // Add keyboard shortcut
      dom.searchQuery.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault(); // Prevent the keyup event
          performSearch('enter-key');
        }
      });
    }

    // Add clear dates button logic
    const clearDatesBtn = document.getElementById('clearDatesBtn');
    if (clearDatesBtn && dom.afterDateInput && dom.beforeDateInput) {
      clearDatesBtn.addEventListener('click', () => {
        dom.afterDateInput.value = '';
        dom.beforeDateInput.value = '';
        renderPreviewWithQuery();
      });
    }

    // Lint and suggestion UI
    let lintDiv = document.getElementById('query-lint');
    if (!lintDiv) {
      lintDiv = document.createElement('div');
      lintDiv.id = 'query-lint';
      lintDiv.className = 'text-xs mt-1';
      dom.searchQuery.parentNode.appendChild(lintDiv);
    }

    function showQueryLintAndSuggestions() {
      const q = dom.searchQuery.value;
      let warnings = [];
      let suggestions = [];
      // Naive lint: unbalanced quotes
      const quoteCount = (q.match(/"/g) || []).length;
      if (quoteCount % 2 !== 0) warnings.push('Unbalanced quotes detected.');
      // Naive lint: quoted site:
      if (/"site:[^\s"]+"/.test(q)) warnings.push('Do not quote site: operators.');
      // Naive lint: empty query
      if (!q.trim()) warnings.push('Query is empty.');
      // Naive "did you mean" (simple: double spaces, common typos)
      if (/\s{2,}/.test(q)) suggestions.push('Did you mean: remove extra spaces?');
      if (/\bsite\s*:\s*\./.test(q)) suggestions.push('Did you mean: site:example.com?');
      // Show
      lintDiv.innerHTML = '';
      if (warnings.length) {
        lintDiv.innerHTML += `<div class='text-red-400'>${warnings.map(w=>`⚠️ ${w}`).join('<br>')}</div>`;
      }
      if (suggestions.length) {
        lintDiv.innerHTML += `<div class='text-yellow-300 mt-1'>${suggestions.map(s=>`💡 ${s}`).join('<br>')}</div>`;
      }
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
document.addEventListener('DOMContentLoaded', () => {
  // Ensure AI Suggest button and box are assigned
  dom.aiSuggestBtn = document.getElementById('aiSuggestBtn');
  dom.aiSuggestBox = document.getElementById('aiSuggestBox');
  
  // Add click outside handler for AI suggest box
  document.addEventListener('click', (e) => {
    if (dom.aiSuggestBox && dom.aiSuggestBtn) {
      if (!dom.aiSuggestBox.contains(e.target) && !dom.aiSuggestBtn.contains(e.target)) {
        dom.aiSuggestBox.style.display = 'none';
      }
    }
  });
  
  init();
});

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

// --- AI Suggester integration ---
function showAISuggestions() {
  const query = dom.searchQuery.value.trim();
  const category = state.activeCategory;
  
  // Show the suggestions box
  dom.aiSuggestBox.style.display = 'block';
  dom.aiSuggestBox.innerHTML = '<div class="text-gray-400 text-xs">Thinking...</div>';
  
  aiSuggester.suggest(query, category).then(suggestions => {
    if (suggestions.length === 0) {
      dom.aiSuggestBox.innerHTML = '<div class="text-gray-400 text-xs p-2">No suggestions available</div>';
      return;
    }
    dom.aiSuggestBox.innerHTML = suggestions.map(s => `<div class="ai-suggestion cursor-pointer hover:bg-blue-700 p-2 rounded">${s}</div>`).join('');
    // Click to insert suggestion
    Array.from(dom.aiSuggestBox.querySelectorAll('.ai-suggestion')).forEach(el => {
      el.addEventListener('click', () => {
        dom.searchQuery.value = el.textContent;
        dom.aiSuggestBox.style.display = 'none';
      });
    });
  });
}

function updateAISuggestUI() {
  const cat = state.categories[state.activeCategory];
  if (dom.aiSuggestBtn && dom.aiSuggestBox) {
    if (!cat || cat.aiSuggest) {
      // Show button if no category selected or category has aiSuggest enabled
      dom.aiSuggestBtn.style.display = '';
      dom.aiSuggestBtn.onclick = showAISuggestions;
    } else {
      // Hide both button and box for other categories
      dom.aiSuggestBtn.style.display = 'none';
      dom.aiSuggestBox.style.display = 'none';
    }
  }
}

window.addEventListener('stateUpdate', updateAISuggestUI);
document.addEventListener('DOMContentLoaded', updateAISuggestUI);

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
    // Add copy variant buttons below preview if not present
    setTimeout(() => {
      const preview = dom.queryPreview;
      if (!preview) return;
      let btnRow = document.getElementById('copy-variants-row');
      if (!btnRow) {
        btnRow = document.createElement('div');
        btnRow.id = 'copy-variants-row';
        btnRow.className = 'flex gap-2 mt-2';
        // Google
        const gBtn = document.createElement('button');
        gBtn.textContent = 'Copy (Google)';
        gBtn.className = 'px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs';
        gBtn.onclick = () => copyVariant('google');
        // Bing
        const bBtn = document.createElement('button');
        bBtn.textContent = 'Copy (Bing)';
        bBtn.className = 'px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-500 text-xs';
        bBtn.onclick = () => copyVariant('bing');
        // DDG
        const dBtn = document.createElement('button');
        dBtn.textContent = 'Copy (DDG)';
        dBtn.className = 'px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs';
        dBtn.onclick = () => copyVariant('duckduckgo');
        btnRow.append(gBtn, bBtn, dBtn);
        preview.parentNode.insertBefore(btnRow, preview.nextSibling);
        dom.copyGoogleBtn = gBtn;
        dom.copyBingBtn = bBtn;
        dom.copyDDGBtn = dBtn;
      }
    }, 0);

    // Copy variant handler
    function copyVariant(engine) {
      const q = buildQueryString(state, dom);
      const translated = adaptQueryForEngine(q, engine);
      navigator.clipboard.writeText(translated)
        .then(() => showToast && showToast(`Copied for ${engine.charAt(0).toUpperCase() + engine.slice(1)}!`, 'success'))
        .catch(() => showToast && showToast('Failed to copy.', 'error'));
    }
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
