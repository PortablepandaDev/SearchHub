// Template save/load/delete logic
import { safeGet, safeSet } from './utils.js';

export function renderTemplates(state, dom) {
  // Clear the select
  while (dom.templateSelect.firstChild) {
    dom.templateSelect.removeChild(dom.templateSelect.firstChild);
  }
  
  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Load template…';
  dom.templateSelect.appendChild(defaultOption);
  
  // Add template options
  state.templates.forEach((template, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = template.name;
    dom.templateSelect.appendChild(option);
  });
}

export function saveTemplate(state, dom, getCurrentConfig, renderTemplates, showToast) {
  const name = prompt('Template name:');
  if (!name) return;
  const cfg = getCurrentConfig();
  cfg.name = name.trim();
  const existingIdx = state.templates.findIndex(t=>t.name.toLowerCase()===cfg.name.toLowerCase());
  if (existingIdx>=0) state.templates.splice(existingIdx,1);
  state.templates.unshift(cfg);
  safeSet('templates', state.templates);
  renderTemplates(state, dom);
  showToast('Template saved.','success');
}

export function deleteTemplate(state, dom, renderTemplates, showToast) {
  const idx = parseInt(dom.templateSelect.value,10);
  if (isNaN(idx)) return showToast('Select a template to delete.','error');
  const name = state.templates[idx]?.name || 'template';
  if (!confirm(`Delete "${name}"?`)) return;
  state.templates.splice(idx,1); safeSet('templates', state.templates); renderTemplates(state, dom); showToast('Template deleted.');
}
