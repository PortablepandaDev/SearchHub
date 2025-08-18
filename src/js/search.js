import { searchEngines } from './engines.js';
import { withDateFilter } from './query.js';
import { ENGINE, buildURL } from './engineMap.js';

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
    if (engines.length > 1) {
      showToast && showToast('Multiple engines: Your browser may block pop-ups. Allow pop-ups for best results.', 'warning');
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
          window.open(url, '_blank', 'noopener,noreferrer');
          if (addToHistory) {
            addToHistory(
              { query: input, url, date: new Date().toISOString() },
              state,
              () => {}
            );
          }
          showToast && showToast('Wayback Machine opened!', 'success');
          return { success: true, urls: [url] };
        } catch (err) {
          showToast && showToast('Invalid URL', 'error');
          return { success: false, error: 'Invalid URL' };
        }
      }
    }

    // Track opened URLs for returning
    const urls = [];

    // Open each engine in a new tab using ENGINE/buildURL
  engines.forEach((engineKey, idx) => {
      setTimeout(() => {
        if (!ENGINE[engineKey]) {
          console.error(`Engine ${engineKey} not found`);
          return;
        }
        try {
          const after = dom.afterDateInput?.value || '';
          const before = dom.beforeDateInput?.value || '';
          const filteredQuery = buildQueryString(state, dom); // Already adapted for engine
          const url = buildURL(engineKey, filteredQuery, after, before);
          window.open(url, '_blank', 'noopener,noreferrer');
          urls.push(url);

          // Only add the first to history for cleanliness
          if (addToHistory && engineKey === engines[0]) {
            addToHistory(
              { query: filteredQuery, url, date: new Date().toISOString() },
              state,
              () => {}
            );
          }

          // Show success for first engine
          if (idx === 0) {
            showToast && showToast('Search started!', 'success');
          }
        } catch (err) {
          showToast && showToast('Failed to open search', 'error');
          console.error('Failed to open URL:', err);
        }
      }, idx * 350);
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
