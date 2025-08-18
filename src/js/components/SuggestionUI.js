/**
 * SuggestionUI component for rendering search suggestions
 */
import { QuerySuggester } from './QuerySuggester.js';
import { dom, ui } from '../utils/index.js';

export class SuggestionUI {
    constructor(searchInput, suggestionsContainer) {
        this.searchInput = searchInput;
        this.container = suggestionsContainer;
        this.suggester = new QuerySuggester();
        this.activeCategory = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Debounced input handler
        this.searchInput.addEventListener('input', ui.debounce(() => {
            this.updateSuggestions();
        }, 300));

        // Handle suggestion clicks
        this.container.addEventListener('click', (e) => {
            const suggestionEl = e.target.closest('.suggestion-item');
            if (suggestionEl) {
                this.searchInput.value = suggestionEl.dataset.query;
                this.searchInput.focus();
                this.clearSuggestions();
            }
        });

        // Handle category changes
        document.addEventListener('categoryChanged', (e) => {
            this.activeCategory = e.detail.category;
            this.updateSuggestions();
        });
    }

    updateSuggestions() {
        const query = this.searchInput.value;
        if (!query || query.length < 2) {
            this.clearSuggestions();
            return;
        }

        const suggestions = this.suggester.getSuggestions(
            this.activeCategory,
            query,
            { fileType: this.getFileTypeFromQuery(query) }
        );

        this.renderSuggestions(suggestions);
    }

    renderSuggestions(suggestions) {
        if (!suggestions.length) {
            this.clearSuggestions();
            return;
        }

        this.container.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item bg-gray-800/50 p-2 rounded-lg mb-2 cursor-pointer hover:bg-gray-700/50"
                 data-query="${suggestion.query}">
                <div class="text-sm font-medium text-gray-200">${suggestion.name}</div>
                <div class="text-xs text-gray-400">${suggestion.description}</div>
            </div>
        `).join('');

        this.container.classList.remove('hidden');
    }

    clearSuggestions() {
        this.container.innerHTML = '';
        this.container.classList.add('hidden');
    }

    getFileTypeFromQuery(query) {
        const match = query.match(/\.(mp3|flac|mp4|mkv|pdf|doc|txt)\b/i);
        return match ? match[1] : null;
    }
}
