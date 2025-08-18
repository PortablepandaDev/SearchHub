import { db } from './db.js';
import { showToast } from './toast.js';

export class TemplateManager {
    static async saveTemplate(template) {
        try {
            await db.add('templates', {
                ...template,
                created: new Date().toISOString(),
                lastUsed: new Date().toISOString()
            });
            showToast('Template saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save template:', error);
            showToast('Failed to save template', 'error');
            return false;
        }
    }

    static async getTemplates() {
        try {
            const templates = await db.getAll('templates');
            return templates.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
        } catch (error) {
            console.error('Failed to get templates:', error);
            return [];
        }
    }

    static async deleteTemplate(id) {
        try {
            await db.delete('templates', id);
            showToast('Template deleted successfully');
            return true;
        } catch (error) {
            console.error('Failed to delete template:', error);
            showToast('Failed to delete template', 'error');
            return false;
        }
    }

    static async exportTemplates() {
        try {
            const templates = await this.getTemplates();
            const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'searchhub-templates.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast('Templates exported successfully');
            return true;
        } catch (error) {
            console.error('Failed to export templates:', error);
            showToast('Failed to export templates', 'error');
            return false;
        }
    }

    static async importTemplates(file) {
        try {
            const text = await file.text();
            const templates = JSON.parse(text);
            
            for (const template of templates) {
                await db.add('templates', {
                    ...template,
                    imported: new Date().toISOString(),
                    lastUsed: new Date().toISOString()
                });
            }
            
            showToast(`Imported ${templates.length} templates successfully`);
            return true;
        } catch (error) {
            console.error('Failed to import templates:', error);
            showToast('Failed to import templates', 'error');
            return false;
        }
    }
}
