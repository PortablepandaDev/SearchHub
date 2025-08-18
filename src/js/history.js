// History and favorites logic
import { safeGet, safeSet } from './utils.js';
import { historyRow, favoriteRow } from './utils/domHelpers.js';

export function renderFavorites(state, dom) {
  // Clear container
  while (dom.favoritesContainer.firstChild) {
    dom.favoritesContainer.removeChild(dom.favoritesContainer.firstChild);
  }

  if (!state.searchFavorites.length) {
    const empty = document.createElement('p');
    empty.className = 'text-gray-500';
    empty.textContent = 'Star ★ items from your history to save them here.';
    dom.favoritesContainer.appendChild(empty);
    return;
  }

  // Add each favorite item
  state.searchFavorites.forEach((item, index) => {
    dom.favoritesContainer.appendChild(favoriteRow(item, index));
  });
}

export function addToHistory(item, state, renderHistory) {
  if (!state.searchHistory.some(h=> h.query===item.query)) {
    state.searchHistory.unshift(item);
    if (state.searchHistory.length>50) state.searchHistory.pop();
    safeSet('searchHistory', state.searchHistory);
    renderHistory();
  }
}

export function renderHistory(state, dom) {
  // Clear container
  while (dom.historyContainer.firstChild) {
    dom.historyContainer.removeChild(dom.historyContainer.firstChild);
  }

  if (!state.searchHistory.length) {
    const empty = document.createElement('p');
    empty.className = 'text-gray-500';
    empty.textContent = 'Your recent searches will appear here.';
    dom.historyContainer.appendChild(empty);
    return;
  }

  // Add each history item
  state.searchHistory.forEach((item, index) => {
    dom.historyContainer.appendChild(historyRow(item, index));
  });
}
