import { ENGINE, buildURL } from './engineMap.js';

// Search and copy logic
export async function handleSearch(state, dom, buildQueryString, addToHistory, showToast) {
  try {
    // Check if we have selected engines
    if (!state.selectedEngines?.length) {
      showToast && showToast('No search engine selected', 'error');
      return { success: false, error: 'No engine selected' };
    }
    
    const query = buildQueryString(state, dom);
    if (!query) {
      showToast && showToast('Please enter a search query', 'error');
      return { success: false, error: 'No query provided' };
    }

    // Custom handler for Wayback Machine
    if (state.activeCategory === 'intelligence' && state.categories['intelligence']) {
      const selected = state.categories['intelligence'].options.find(opt => opt.checked);
      if (selected && selected.label === 'Wayback Machine') {
        // Validate input as domain or URL
        let input = dom.searchQuery.value.trim();
        if (!input) {
          showToast && showToast('Please enter a domain or URL', 'error');
          return { success: false, error: 'No input' };
        }
        // Extract domain from URL if needed
        try {
          let domain = input;
          if (/^https?:\/\//.test(input)) {
            domain = (new URL(input)).hostname;
          } else if (/[^.]+\.[^.]+/.test(input)) {
            // Looks like a domain
            domain = input;
          } else {
            showToast && showToast('Enter a valid domain or URL', 'error');
            return { success: false, error: 'Invalid domain' };
          }
          const url = `https://web.archive.org/web/*/${encodeURIComponent(domain)}`;
          const opened = window.open(url, '_blank', 'noopener,noreferrer');
          if (!opened) {
            showToast && showToast('Popup blocked. Please allow popups for this site.', 'error');
            return { success: false, error: 'Popup blocked' };
          }
          if (addToHistory) {
            addToHistory(
              { query: input, url, date: new Date().toISOString() },
              state,
              () => {}
            );
          }
          showToast && showToast('Wayback Machine opened!', 'success');
          return { success: true, url };
        } catch (err) {
          showToast && showToast('Invalid URL', 'error');
          return { success: false, error: 'Invalid URL' };
        }
      }
    }

    // Standard search flow
    const after = dom.afterDateInput?.value || '';
    const before = dom.beforeDateInput?.value || '';
    
    // Open a tab for each selected engine
    let openedCount = 0;
    const urls = [];
    
    for (const engineKey of state.selectedEngines) {
      if (!ENGINE[engineKey]) continue;
      
      const url = buildURL(engineKey, query, after, before);
      const opened = window.open(url, '_blank', 'noopener,noreferrer');
      if (opened) {
        openedCount++;
        urls.push(url);
      }
      
      // Small delay between tabs to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (openedCount === 0) {
      showToast && showToast('Popup blocked. Please allow popups for this site.', 'error');
      return { success: false, error: 'Popup blocked' };
    }

    // Add to history only if all tabs opened successfully
    if (addToHistory && openedCount === state.selectedEngines.length) {
      addToHistory(
        { query, urls, engines: [...state.selectedEngines], date: new Date().toISOString() },
        state,
        () => {}
      );
    }

    const message = `Opened ${openedCount} search tab${openedCount > 1 ? 's' : ''}!`;
    showToast && showToast(message, 'success');
    return { success: true, urls };
  } catch (error) {
    console.error('Search failed:', error);
    showToast && showToast('Search failed: ' + error.message, 'error');
    return { success: false, error: error.message };
  }
}

export function handleCopy(state, dom, buildQueryString, showToast) {
  const q = buildQueryString(state, dom);
  if (!q) {
    showToast && showToast('Nothing to copy. Build a query first.', 'error');
    return;
  }
  navigator.clipboard.writeText(q)
    .then(() => showToast && showToast('Copied to clipboard!', 'success'))
    .catch(() => showToast && showToast('Failed to copy.', 'error'));
}
