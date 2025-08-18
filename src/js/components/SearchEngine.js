import { storage } from '../utils/storage.js';
import { showToast } from '../utils/toast.js';
import { searchEngines } from '../config/searchEngines.js';

export class SearchEngine {
    constructor(state) {
        this.state = state;
        this.dom = {
            engineChips: document.getElementById('engineChips'),
            searchButton: document.getElementById('searchButton'),
            searchQueryInput: document.getElementById('searchQuery')
        };
        
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.dom.engineChips.innerHTML = Object.entries(searchEngines)
            .map(([key, engine]) => `
                <button
                    class="engine-chip ${this.state.selectedEngines.includes(key) ? 'active' : ''}"
                    data-engine="${key}"
                >
                    ${engine.name}
                </button>
            `).join('');
    }
    
    attachEventListeners() {
        this.dom.engineChips.addEventListener('click', (e) => {
            const chip = e.target.closest('.engine-chip');
            if (!chip) return;
            
            const engineKey = chip.dataset.engine;
            this.toggleEngine(engineKey);
        });
        
        this.dom.searchButton.addEventListener('click', () => this.handleSearch());
    }
    
    toggleEngine(key) {
        const index = this.state.selectedEngines.indexOf(key);
        if (index > -1) {
            this.state.selectedEngines = this.state.selectedEngines.filter(e => e !== key);
        } else {
            this.state.selectedEngines = [...this.state.selectedEngines, key];
        }
        
        storage.set('selectedEngines', this.state.selectedEngines);
        this.render();
    }
    
    async handleSearch() {
        const query = this.dom.searchQueryInput.value.trim();
        if (!query) {
            showToast('Please enter a search query', 'error');
            return;
        }
        
        for (const engineKey of this.state.selectedEngines) {
            const engine = searchEngines[engineKey];
            const url = engine.url + encodeURIComponent(query);
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }
}
