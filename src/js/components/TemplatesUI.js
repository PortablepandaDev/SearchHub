import { db } from '../utils/db.js';
import { showToast } from '../utils/toast.js';

export class TemplatesUI {
    constructor(container) {
        this.container = container;
        this.templates = [];
        this.init();
    }

    async init() {
        try {
            this.templates = await db.getAll('templates');
            await this.render();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize templates:', error);
            this.templates = [];
            const empty = document.createElement('p');
            empty.className = 'text-gray-500 text-sm';
            empty.textContent = 'Failed to load templates. Please try refreshing the page.';
            this.container.appendChild(empty);
        }
    }

    async reload() {
        await this.init();
    }

    setupEventListeners() {
        document.getElementById('importTemplatesBtn')?.addEventListener('click', () => this.importTemplates());
        document.getElementById('exportTemplatesBtn')?.addEventListener('click', () => this.exportTemplates());
    }

    async render() {
        this.container.innerHTML = '';
        
        if (!this.templates.length) {
            const empty = document.createElement('p');
            empty.className = 'text-gray-500 text-sm';
            empty.textContent = 'No templates yet. Create one by saving a search setup.';
            this.container.appendChild(empty);
            return;
        }

        this.templates.forEach(template => {
            const div = document.createElement('div');
            div.className = 'template-item bg-gray-700/30 p-3 rounded-lg mb-2 hover:bg-gray-700/50 transition-colors';
            
            const header = document.createElement('div');
            header.className = 'flex justify-between items-center mb-2';
            
            const title = document.createElement('h4');
            title.className = 'font-medium text-sm';
            title.textContent = template.name;
            
            const actions = document.createElement('div');
            actions.className = 'flex gap-2';
            
            const useBtn = document.createElement('button');
            useBtn.className = 'text-xs text-blue-400 hover:text-blue-300';
            useBtn.textContent = 'Use';
            useBtn.onclick = () => this.useTemplate(template);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'text-xs text-red-400 hover:text-red-300';
            deleteBtn.textContent = '×';
            deleteBtn.onclick = () => this.deleteTemplate(template.id);
            
            actions.append(useBtn, deleteBtn);
            header.append(title, actions);
            
            const description = document.createElement('p');
            description.className = 'text-gray-400 text-xs';
            description.textContent = template.description;
            
            div.append(header, description);
            this.container.appendChild(div);
        });
    }

    async useTemplate(template) {
        // Dispatch an event to load the template
        const event = new CustomEvent('loadTemplate', { 
            detail: template 
        });
        document.dispatchEvent(event);
        
        // Update last used timestamp
        await db.update('templates', {
            ...template,
            lastUsed: new Date().toISOString()
        });
        
        showToast('Template loaded');
    }

    async deleteTemplate(id) {
        await db.delete('templates', id);
        this.templates = this.templates.filter(t => t.id !== id);
        this.render();
        showToast('Template deleted');
    }

    async importTemplates() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const templates = JSON.parse(text);
                
                for (const template of templates) {
                    await db.add('templates', {
                        ...template,
                        imported: new Date().toISOString()
                    });
                }
                
                this.templates = await db.getAll('templates');
                this.render();
                showToast(`Imported ${templates.length} templates`);
            } catch (error) {
                console.error('Failed to import templates:', error);
                showToast('Failed to import templates', 'error');
            }
        };
        
        input.click();
    }

    async exportTemplates() {
        try {
            const templates = await db.getAll('templates');
            const blob = new Blob([JSON.stringify(templates, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'searchhub-templates.json';
            a.click();
            
            URL.revokeObjectURL(url);
            showToast('Templates exported successfully');
        } catch (error) {
            console.error('Failed to export templates:', error);
            showToast('Failed to export templates', 'error');
        }
    }
}
