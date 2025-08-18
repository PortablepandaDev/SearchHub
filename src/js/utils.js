// Utility functions
export const safeGet = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch(_) { return fallback; } };
// Debounced safeSet to avoid spamming localStorage
let _debounceTimers = {};
export const safeSet = (key, value, delay = 150) => {
  clearTimeout(_debounceTimers[key]);
  _debounceTimers[key] = setTimeout(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(_) {}
  }, delay);
};
export function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = '';
  toast.classList.add('show', type);
  setTimeout(() => toast.classList.remove('show'), 2600);
}
