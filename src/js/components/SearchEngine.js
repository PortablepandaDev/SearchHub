import { storage } from '../utils/storage.js';
import { showToast } from '../utils/toast.js';
import { searchEngines } from '../engines.js';

export class SearchEngine {
    constructor(state) {
        this.state = state;
        this.dom = {
            engineChips: document.getElementById('engineChips'),
            searchButton: document.getElementById('searchButton'),
            searchQueryInput: document.getElementById('searchQuery'),
            searchButtonTooltip: null
        };
        
        this.render();
        this.attachEventListeners();
    }
    
        render() {
        // Render chips in the order of selectedEngines, then the rest
        const ordered = [
            ...this.state.selectedEngines.map(key => [key, searchEngines[key]]),
            ...Object.entries(searchEngines).filter(([key]) => !this.state.selectedEngines.includes(key))
        ];
        this.dom.engineChips.innerHTML = ordered
            .map(([key, engine]) => {
                const isSelected = this.state.selectedEngines.includes(key);
                return `
                    <label class="relative flex items-center gap-2 cursor-pointer group py-1">
                        <input type="checkbox" 
                            class="engine-chip-checkbox appearance-none w-5 h-5 rounded border-2 border-gray-600 
                            checked:bg-blue-600 checked:border-transparent transition-all duration-150 ease-in-out
                            focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-gray-900" 
                            data-engine="${key}" 
                            ${isSelected ? 'checked' : ''}
                        />
                        <span
                            class="engine-chip px-3 py-1.5 rounded-md text-sm font-medium select-none
                            ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} 
                            transition-all duration-150 ease-in-out"
                            data-engine="${key}"
                            draggable="true"
                        >
                            ${engine.name}
                        </span>
                        <svg class="absolute left-1 top-2.5 w-3 h-3 text-white pointer-events-none 
                            transition-opacity duration-150 ${isSelected ? 'opacity-100' : 'opacity-0'}" 
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                    </label>
                `;
            }).join('');
    }
    
    attachEventListeners() {
        if (!this.dom.engineChips) return;
        // Remove any previous listeners (by replacing the node)
        const oldNode = this.dom.engineChips;
        const newNode = oldNode.cloneNode(true);
        oldNode.parentNode.replaceChild(newNode, oldNode);
        this.dom.engineChips = newNode;

        // Event delegation for engine selection
        this.dom.engineChips.addEventListener('click', (e) => {
            const checkbox = e.target.closest('.engine-chip-checkbox');
            if (checkbox) {
                const engineKey = checkbox.dataset.engine;
                this.toggleEngine(engineKey);
                return;
            }
            const chip = e.target.closest('.engine-chip');
            if (chip && !chip.classList.contains('dragging')) {
                const checkbox = chip.parentElement.querySelector('.engine-chip-checkbox');
                if (checkbox) {
                    this.toggleEngine(checkbox.dataset.engine);
                }
            }
        });
        


        // Drag-and-drop reorder
        let dragSrc = null;
        this.dom.engineChips.addEventListener('dragstart', (e) => {
            const chip = e.target.closest('.engine-chip');
            if (!chip) return;
            chip.classList.add('dragging');
            dragSrc = chip;
            e.dataTransfer.effectAllowed = 'move';
        });
        this.dom.engineChips.addEventListener('dragend', (e) => {
            const chip = e.target.closest('.engine-chip');
            if (chip) chip.classList.remove('dragging');
            dragSrc = null;
        });
        this.dom.engineChips.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        this.dom.engineChips.addEventListener('drop', (e) => {
            e.preventDefault();
            const chip = e.target.closest('.engine-chip');
            if (!chip || !dragSrc || chip === dragSrc) return;
            const from = dragSrc.dataset.engine;
            const to = chip.dataset.engine;
            const idxFrom = this.state.selectedEngines.indexOf(from);
            const idxTo = this.state.selectedEngines.indexOf(to);
            if (idxFrom === -1 || idxTo === -1) return;
            // Reorder selectedEngines
            const arr = [...this.state.selectedEngines];
            arr.splice(idxFrom, 1);
            arr.splice(idxTo, 0, from);
            this.state.selectedEngines = arr;
            storage.set('selectedEngines', arr);
            this.render();
        });

        // Add tooltip/info icon if not already present
        if (!this.dom.searchButtonTooltip) {
            let tooltipIcon = document.getElementById('searchButtonTooltip');
            if (!tooltipIcon) {
                tooltipIcon = document.createElement('span');
                tooltipIcon.id = 'searchButtonTooltip';
                tooltipIcon.innerHTML = '🛈';
                tooltipIcon.style.cursor = 'pointer';
                tooltipIcon.style.marginLeft = '8px';
                tooltipIcon.title = 'Click to search using the selected engine';
                this.dom.searchButton.parentElement.appendChild(tooltipIcon);
            }
            this.dom.searchButtonTooltip = tooltipIcon;
        }
    }
    
    toggleEngine(key) {
        // Get current state
        const isSelected = this.state.selectedEngines.includes(key);
        
        // Toggle selection
        if (isSelected) {
            // Don't remove if it's the last engine
            if (this.state.selectedEngines.length > 1) {
                this.state.selectedEngines = this.state.selectedEngines.filter(e => e !== key);
            }
        } else {
            this.state.selectedEngines = [...this.state.selectedEngines, key];
        }
        
        // Update storage and state
        storage.set('selectedEngines', this.state.selectedEngines);
        this.state.activeEngine = this.state.selectedEngines[0];
        storage.set('activeEngine', this.state.activeEngine);

        // Trigger state update notification
        window.dispatchEvent(new CustomEvent('stateUpdate', { 
            detail: { 
                type: 'engines',
                selectedEngines: this.state.selectedEngines,
                activeEngine: this.state.activeEngine
            } 
        }));

    // Re-render the UI
    this.render();
    }
}
