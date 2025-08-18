// Event listeners and keyboard shortcuts
export function registerEventListeners(state, dom, handlers) {
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
  // Note: Search functionality is handled in main.js
}
