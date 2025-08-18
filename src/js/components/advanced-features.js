// Initialize components
const dorkLibrary = new DorkLibrary();
const querySuggester = new QuerySuggester();
const githubSearch = new GitHubSearch();
const resultPreviewer = new ResultPreviewer();

// State management
const state = {
  engines: searchEngines,
  categories: searchCategories,
  activeEngine: searchEngines[0],
  activeCategory: null,
  suggestions: [],
  previews: new Map(),
  githubResults: [],
  dorks: dorkLibrary.getAllCategories()
};

// Initialize UI
function initializeUI() {
  renderEngines(state, dom);
  renderCategories(state, dom);
  renderHistory(state, dom);
  renderTemplates(state, dom);
  renderOptions(state, dom);
  registerEventListeners(state, dom);
  setupAdvancedFeatures();
}

// Set up advanced features
function setupAdvancedFeatures() {
  // Setup query suggestions
  dom.searchQueryInput.addEventListener('input', debounce(async (e) => {
    const query = e.target.value;
    state.suggestions = querySuggester.analyzeQuery(query);
    renderSuggestions(state.suggestions);
  }, 300));

  // Setup dork library
  renderDorkLibrary();
  
  // Setup GitHub integration
  setupGitHubSearch();
  
  // Setup result previews
  setupResultPreviews();
}

// Debounce helper
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

// Render suggestions
function renderSuggestions(suggestions) {
  if (!dom.suggestionsList) return;
  
  dom.suggestionsList.innerHTML = suggestions
    .map(suggestion => `
      <li class="suggestion-item" onclick="applySuggestion(this.textContent)">
        ${suggestion}
      </li>
    `)
    .join('');
}

// Apply suggestion to search
function applySuggestion(suggestion) {
  const current = dom.searchQueryInput.value;
  dom.searchQueryInput.value = suggestion;
  updateQueryPreview();
}

// Render dork library
function renderDorkLibrary() {
  if (!dom.dorkLibrary) return;
  
  const categories = dorkLibrary.getAllCategories();
  dom.dorkLibrary.innerHTML = categories
    .map(category => `
      <div class="dork-category">
        <h3>${category}</h3>
        <ul>
          ${dorkLibrary.getDorksByCategory(category)
            .map(dork => `
              <li class="dork-item" onclick="applyDork('${dork.query}')">
                <strong>${dork.name}</strong>
                <p>${dork.description}</p>
                <code>${dork.query}</code>
              </li>
            `)
            .join('')}
        </ul>
      </div>
    `)
    .join('');
}

// Apply dork to search
function applyDork(query) {
  dom.searchQueryInput.value = query;
  updateQueryPreview();
}

// Setup GitHub search
function setupGitHubSearch() {
  if (!dom.githubResults) return;
  
  // Add GitHub category if not exists
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

// Handle GitHub search
async function handleGitHubSearch(query) {
  try {
    const results = await githubSearch.searchGitHub(query);
    renderGitHubResults(results);
  } catch (error) {
    showToast('GitHub search failed: ' + error.message);
  }
}

// Render GitHub results
function renderGitHubResults(results) {
  if (!dom.githubResults) return;
  
  dom.githubResults.innerHTML = `
    <div class="github-results">
      <h3>GitHub Results (${results.totalCount})</h3>
      ${results.items
        .map(item => `
          <div class="github-result">
            <h4><a href="${item.url}" target="_blank">${item.repo}</a></h4>
            <p>${item.path}</p>
            ${item.matchingText
              ? `<pre><code>${item.matchingText[0]?.fragment || ''}</code></pre>`
              : ''}
          </div>
        `)
        .join('')}
    </div>
  `;
}

// Setup result previews
function setupResultPreviews() {
  if (!dom.resultPreviews) return;
  
  // Listen for search results
  document.addEventListener('searchCompleted', async (e) => {
    const urls = e.detail.urls || [];
    await fetchPreviews(urls);
  });
}

// Fetch and render previews
async function fetchPreviews(urls) {
  if (!dom.resultPreviews) return;
  
  const previews = await Promise.all(
    urls.map(async url => {
      const preview = await resultPreviewer.fetchPreview(url);
      return { url, preview };
    })
  );
  
  dom.resultPreviews.innerHTML = previews
    .filter(({ preview }) => preview)
    .map(({ url, preview }) => `
      <div class="result-preview">
        <h3><a href="${url}" target="_blank">${preview.title}</a></h3>
        <p class="description">${preview.description}</p>
        <div class="snippet">${preview.snippet}</div>
      </div>
    `)
    .join('');
}

// Initialize everything
initializeUI();
