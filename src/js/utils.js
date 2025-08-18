// Utility functions
export const safeGet = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch(_) { return fallback; } };
export const safeSet = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch(_) {} };
export function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = '';
  toast.classList.add('show', type);
  setTimeout(() => toast.classList.remove('show'), 2600);
}
