import { searchEngines } from './engines.js';
// Search and copy logic
export function handleSearch(state, dom, buildQueryString, addToHistory, showToast) {
  try {
    const query = buildQueryString(state, dom);
    if (!query) {
      showToast && showToast('Please enter a search query', 'error');
      return { success: false, error: 'No query provided' };
    }

    // Make sure we have engines selected
    const engines = state.selectedEngines.length ? state.selectedEngines : ['google'];
    if (engines.length === 0) {
      showToast && showToast('No search engine selected', 'error');
      return { success: false, error: 'No engines selected' };
    }

    // Track opened URLs for returning
    const urls = [];

    // Open each engine in a new tab
    engines.forEach((engineKey, idx) => {
      setTimeout(() => {
        const engine = searchEngines[engineKey]; // Use imported searchEngines
        if (!engine) {
          console.error(`Engine ${engineKey} not found`);
          return;
        }

        try {
          const url = engine.url + encodeURIComponent(query);
          window.open(url, '_blank', 'noopener,noreferrer');
          urls.push(url);

          // Only add the first to history for cleanliness
          if (addToHistory && engineKey === engines[0]) {
            addToHistory(
              { query, url, date: new Date().toISOString() },
              state,
              () => {}
            );
          }

          // Show success for first engine
          if (idx === 0) {
            showToast && showToast('Search started!', 'success');
          }
        } catch (err) {
          console.error('Failed to open URL:', err);
          showToast && showToast('Failed to open search', 'error');
        }
      }, idx * 350); // 350ms delay between tabs
    });

    return { success: true, urls };
  } catch (error) {
    console.error('Search failed:', error);
    showToast && showToast('Search failed', 'error');
    return { success: false, error: error.message };
  }
}

export function handleCopy(state, dom, buildQueryString, showToast) {
  const q = buildQueryString(state, dom);
  if (!q) return showToast && showToast('Nothing to copy. Build a query first.', 'error');
  navigator.clipboard.writeText(q).then(() => showToast && showToast('Copied to clipboard!', 'success')).catch(() => showToast && showToast('Failed to copy.', 'error'));
}
