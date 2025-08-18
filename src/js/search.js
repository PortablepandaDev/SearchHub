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
  const promises = engines.map((engineKey, idx) => 
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!ENGINE[engineKey]) {
          console.error(`Engine ${engineKey} not found`);
          reject(new Error(`Engine ${engineKey} not found`));
          return;
        }
        
        try {
          const after = dom.afterDateInput?.value || '';
          const before = dom.beforeDateInput?.value || '';
          const filteredQuery = buildQueryString(state, dom);
          const url = buildURL(engineKey, filteredQuery, after, before);
          const opened = window.open(url, '_blank', 'noopener,noreferrer');
          
          if (!opened) {
            reject(new Error('Popup blocked'));
            return;
          }

          urls.push(url);

          // Only add the first to history
          if (addToHistory && engineKey === engines[0]) {
            addToHistory(
              { query: filteredQuery, url, date: new Date().toISOString() },
              state,
              () => {}
            );
          }

          resolve(url);
        } catch (err) {
          reject(err);
        }
      }, idx * 300); // 300ms delay between tabs
    })
  );

  // Wait for all engines to open
  Promise.allSettled(promises).then(results => {
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    if (successful === 0) {
      showToast && showToast('Failed to open searches. Please check popup blocker.', 'error');
    } else if (failed > 0) {
      showToast && showToast(`Opened ${successful} of ${engines.length} searches. Some were blocked.`, 'warning');
    } else {
      showToast && showToast('Search started!', 'success');
    }
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
