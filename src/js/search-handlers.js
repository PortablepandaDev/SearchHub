// Debounce function
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
    console.log('Search triggered from:', triggerSource);
    
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
}, 300); // 300ms debounce delay

// Set up unified search handler
const handleSearchTrigger = (event, source) => {
    // Prevent the default form submission
    event.preventDefault();
    // Call the debounced search function
    performSearch(source);
};

// Set up search event listeners
const setupSearchListeners = () => {
    // Search button click handler
    dom.searchButton?.addEventListener('click', (e) => handleSearchTrigger(e, 'search-button'));

    // Form submit handler (enter key)
    const searchForm = dom.searchQuery?.closest('form');
    searchForm?.addEventListener('submit', (e) => handleSearchTrigger(e, 'enter-key'));

    // Preview button click handler
    dom.runPreviewBtn?.addEventListener('click', (e) => handleSearchTrigger(e, 'preview-button'));
};
