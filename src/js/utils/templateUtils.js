// Template management utils
import { db } from './utils/db.js';
import { showToast } from './utils/toast.js';

export async function saveCurrentSetupAsTemplate(state) {
    const name = prompt('Enter a name for this template:');
    if (!name) return;
    
    const description = prompt('Enter a description (optional):');
    
    const template = {
        name,
        description,
        timestamp: new Date().toISOString(),
        query: state.query,
        category: state.activeCategory,
        options: state.selectedOptions,
        engines: state.selectedEngines,
        safeMode: state.safeMode
    };
    
    try {
        await db.add('templates', template);
        showToast('Template saved successfully');
        return true;
    } catch (error) {
        console.error('Failed to save template:', error);
        showToast('Failed to save template', 'error');
        return false;
    }
}

export async function loadTemplate(template, state) {
    try {
        state.updateState({
            query: template.query,
            activeCategory: template.category,
            selectedOptions: template.options,
            selectedEngines: template.engines,
            safeMode: template.safeMode
        });
        
        // Update last used timestamp
        await db.update('templates', {
            ...template,
            lastUsed: new Date().toISOString()
        });
        
        showToast('Template loaded successfully');
        return true;
    } catch (error) {
        console.error('Failed to load template:', error);
        showToast('Failed to load template', 'error');
        return false;
    }
}
