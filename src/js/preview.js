// Query preview logic
export function renderPreview(state, dom, buildQueryString) {
    if (!dom.queryPreview) return;  // Exit early if element doesn't exist
    
    const query = buildQueryString(state, dom);
    dom.queryPreview.textContent = query;
    if (query && dom.queryPreview.classList.contains('hidden')) {
      dom.queryPreview.classList.remove('hidden');
    }
    if (!query && !dom.queryPreview.classList.contains('hidden')) {
      dom.queryPreview.classList.add('hidden');
    }
}
