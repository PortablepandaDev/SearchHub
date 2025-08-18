// Main functionality imports
import { renderEngines, searchEngines, toggleEngine } from './engines.js';
import { renderCategories, searchCategories } from './categories.js';
import { renderHistory, addToHistory } from './history.js';
import { handleSearch } from './search.js';
import { buildQueryString } from './query.js';
import { renderOptions } from './options.js';
import { renderPreview } from './preview.js';
import { handleCopy } from './search.js';
import { showToast } from './utils/toast.js';
import { registerEventListeners } from './events.js';
import { TemplatesUI } from './components/TemplatesUI.js';
import { defaultTemplates } from './config/defaultTemplates.js';
import { db } from './utils/db.js';

// DOM references
const dom = {
  engineChips: document.getElementById('engineChips'),
  categoryContainer: document.getElementById('categoryContainer'),
  historyContainer: document.getElementById('historyContainer'),
  templatesContainer: document.getElementById('templatesContainer'),
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
  safeModeToggle: document.getElementById('safeModeToggle'),
  toast: document.getElementById('toast'),
  cheatEngineLabel: document.getElementById('cheatEngineLabel'),
  searchSuggestions: document.getElementById('searchSuggestions')
};

// State management
const state = {
  activeCategory: 'web',
  selectedOptions: [],
  selectedEngines: ['google'],
  isSafeMode: true,
  isSearching: false,
  query: '',
  lastSearchKey: null,
  lastSearchTime: 0,
  updateState(newState) {
    Object.assign(this, newState);
  },
  toggleSafeMode() {
    this.isSafeMode = !this.isSafeMode;
    return this.isSafeMode;
  }
};

// Helper function to check search button state
function checkSearchButtonState() {
  if (!dom.searchButton) return;
  const hasQuery = dom.searchQuery?.value?.trim().length > 0;
  const hasEngine = state.selectedEngines.length > 0;
  dom.searchButton.disabled = !hasQuery || !hasEngine;
}

// Helper function to update search button label
function updateSearchBtnLabel() {
  if (!dom.searchButton) return;
  dom.searchButton.textContent = 'Search';
}

// Debounce function to prevent rapid-fire searches
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

// Handler for search operations
const performSearch = debounce(async (triggerSource) => {
  // Validate query
  if (!dom.searchQuery?.value) {
    showToast('Please enter a search query', 'error');
    return;
  }

  // Check if already searching
  if (state.isSearching) {
    console.log('Search prevented - already searching');
    return;
  }

  console.log('Search triggered from:', triggerSource);
  
  // Disable search button and set searching state
  dom.searchButton.disabled = true;
  state.isSearching = true;

  try {
    const results = await handleSearch(state, dom, buildQueryString, addToHistory, showToast);
    if (results?.success) {
      showToast('Search started successfully', 'success');
    }
  } catch (error) {
    console.error('Search failed:', error);
    showToast('Search failed. Please try again.', 'error');
  } finally {
    // Reset search state after a short delay to prevent rapid re-triggering
    setTimeout(() => {
      state.isSearching = false;
      dom.searchButton.disabled = false;
    }, 500);
  }
}, 300);

// Initialize the application
async function init() {
  console.log('INIT: Starting initialization');
  
  try {
    // Initialize templates UI
    await db.ready;
    const templatesUI = new TemplatesUI(dom.templatesContainer, state, {
      onTemplateLoad: () => {
        renderCategories(
          state, dom, {},
          (key) => renderOptions(key, state, dom, buildQueryString, renderPreview, checkSearchButtonState),
          buildQueryString,
          renderPreview,
          checkSearchButtonState
        );
        renderPreview(state, dom, buildQueryString);
        checkSearchButtonState();
      }
    });

    // Initialize components
    renderCategories(
      state, dom, {},
      (key) => renderOptions(key, state, dom, buildQueryString, renderPreview, checkSearchButtonState),
      buildQueryString,
      renderPreview,
      checkSearchButtonState
    );

    // Initialize history
    await renderHistory(state, dom);
    
    // Initialize options and preview
    renderOptions(state.activeCategory, state, dom, buildQueryString, renderPreview, checkSearchButtonState);
    renderPreview(state, dom, buildQueryString);
    
    // Set up SafeMode toggle
    if (dom.safeModeToggle) {
      const initialIsSafe = state.isSafeMode;
      dom.safeModeToggle.classList.toggle('bg-green-500', initialIsSafe);
      dom.safeModeToggle.classList.toggle('bg-gray-500', !initialIsSafe);

      dom.safeModeToggle.addEventListener('click', () => {
        const isSafe = state.toggleSafeMode();
        dom.safeModeToggle.classList.toggle('bg-green-500', isSafe);
        dom.safeModeToggle.classList.toggle('bg-gray-500', !isSafe);
        showToast(`Safe Mode ${isSafe ? 'Enabled' : 'Disabled'}`, isSafe ? 'success' : 'error');
        
        renderCategories(
          state, dom, {},
          (key) => renderOptions(key, state, dom, buildQueryString, renderPreview, checkSearchButtonState),
          buildQueryString,
          renderPreview,
          checkSearchButtonState
        );
        
        renderOptions(
          state.activeCategory,
          state, dom, buildQueryString, 
          renderPreview, 
          checkSearchButtonState
        );

        renderPreview(state, dom, buildQueryString);
      });
    }
    
    // Set up search event listeners
    const handleSearchTrigger = (event, source) => {
      event?.preventDefault();
      performSearch(source);
    };

    dom.searchButton?.addEventListener('click', (e) => handleSearchTrigger(e, 'search-button'));
    
    const searchForm = dom.searchQuery?.closest('form');
    searchForm?.addEventListener('submit', (e) => handleSearchTrigger(e, 'enter-key'));

    // Set up other event listeners
    registerEventListeners(state, dom, {
      handleCopy: () => handleCopy(state, showToast),
      handlePreview: () => renderPreview(state, dom, buildQueryString)
    });

    // Initialize state
    updateSearchBtnLabel();
    checkSearchButtonState();

    // Add query input listeners
    dom.searchQuery?.addEventListener('input', () => {
      renderPreview(state, dom, buildQueryString);
      checkSearchButtonState();
    });
    
    console.log('INIT: Initialization complete');
  } catch (error) {
    console.error('INIT: Failed', error);
    showToast('Failed to initialize the application', 'error');
  }
}

// Start initialization when DOM is ready
document.addEventListener('DOMContentLoaded', init);
