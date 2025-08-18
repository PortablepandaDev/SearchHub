// Event listeners and keyboard shortcuts
export function registerEventListeners(state, dom, handlers) {
  // Search button
  if (dom.searchButton) {
    dom.searchButton.addEventListener('click', handlers.handleSearch);
  }
  // Copy button
  if (dom.copyButton) {
    dom.copyButton.addEventListener('click', handlers.handleCopy);
  }
  // Query input live preview
  if (dom.searchQuery) {
    dom.searchQuery.addEventListener('input', () => {
      handlers.handlePreview && handlers.handlePreview();
    });
  }
  // Category change (handled in renderCategories)
  // Option change (handled in renderOptions)
  // Preview copy
  if (dom.copyPreviewBtn) {
    dom.copyPreviewBtn.addEventListener('click', handlers.handleCopy);
  }
  // Run preview
  if (dom.runPreviewBtn) {
    dom.runPreviewBtn.addEventListener('click', handlers.handleSearch);
  }
  // Keyboard shortcuts (basic)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handlers.handleSearch();
    }
  });
}
