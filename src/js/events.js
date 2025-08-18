// Event listeners and keyboard shortcuts
export function registerEventListeners(state, dom, handlers) {
  // Template keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + S to save current setup as template
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
      e.preventDefault();
      handlers.saveCurrentSetupAsTemplate && handlers.saveCurrentSetupAsTemplate();
    }
  });

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
