// Query preview logic
export function renderPreview(state, dom, buildQueryString) {
  const q = buildQueryString(state, dom);
    const query = buildQueryString(state, dom);
    dom.queryPreview.textContent = query;
    if (query && dom.queryPreview.classList.contains('hidden')) {
      dom.queryPreview.classList.remove('hidden');
    }
    if (!query && !dom.queryPreview.classList.contains('hidden')) {
      dom.queryPreview.classList.add('hidden');
    }
}
