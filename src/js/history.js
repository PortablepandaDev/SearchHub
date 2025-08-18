// History and favorites logic
import { db } from './utils/db.js';
import { historyRow, favoriteRow } from './utils/domHelpers.js';
import { showToast } from './utils/toast.js';

export async function renderFavorites(state, dom) {
  // Clear container
  while (dom.favoritesContainer.firstChild) {
    dom.favoritesContainer.removeChild(dom.favoritesContainer.firstChild);
  }
  const collection = state.activeFavoritesCollection || 'Default';
  const favorites = (state.searchFavorites && state.searchFavorites[collection]) || [];
  if (!favorites.length) {
    const empty = document.createElement('p');
    empty.className = 'text-gray-500';
    empty.textContent = 'Star ★ items from your history to save them here.';
    dom.favoritesContainer.appendChild(empty);
    return;
  }
  // Add each favorite item
  favorites.forEach((item, index) => {
    dom.favoritesContainer.appendChild(favoriteRow(item, index));
  });
}

export async function addToHistory(item, state, renderHistory) {
  try {
    // Check for exact duplicates (same query and URL)
    const history = await db.getAll('history');
    if (!history.some(h => h.query === item.query && h.url === item.url)) {
      await db.add('history', {
        ...item,
        timestamp: new Date().toISOString()
      });
      
      // Limit history size
      const allHistory = await db.getAll('history');
      if (allHistory.length > 50) {
        const oldestEntry = allHistory.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        )[0];
        await db.delete('history', oldestEntry.id);
      }
      
      renderHistory();
    }
  } catch (error) {
    console.error('Failed to add to history:', error);
    showToast('Failed to save to history', 'error');
  }
}

export function renderHistory(state, dom) {
  // Clear container
  while (dom.historyContainer.firstChild) {
    dom.historyContainer.removeChild(dom.historyContainer.firstChild);
  }

  // Tag filter UI
  const filterDiv = document.createElement('div');
  filterDiv.className = 'mb-2 flex gap-2 items-center';
  const filterInput = document.createElement('input');
  filterInput.type = 'text';
  filterInput.placeholder = 'Filter by tag (e.g. #osint)';
  filterInput.value = state.historyTagFilter || '';
  filterInput.className = 'w-full px-2 py-1 rounded text-xs border border-gray-700 bg-gray-900 text-gray-200';
  filterInput.addEventListener('input', (e) => {
    state.updateState({ historyTagFilter: e.target.value });
    renderHistory(state, dom);
  });
  filterDiv.appendChild(filterInput);
  dom.historyContainer.appendChild(filterDiv);

  // Filter history by tag
  let filtered = state.searchHistory;
  const tag = (state.historyTagFilter || '').replace(/^#/, '').toLowerCase();
  if (tag) {
    filtered = filtered.filter(item => (item.tags || []).some(t => t.toLowerCase().includes(tag)));
  }

  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'text-gray-500';
    empty.textContent = 'No search history yet.';
    dom.historyContainer.appendChild(empty);
    return;
  }

  // Add each history item
  filtered.forEach((item, index) => {
    dom.historyContainer.appendChild(historyRow(item, index));
  });
}
