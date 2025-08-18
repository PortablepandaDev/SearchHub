// ResultPreviewer.js - Handles result previews and snippets
export class ResultPreviewer {
    constructor() {
        this.cache = new Map();
        this.proxyUrl = 'https://corsproxy.io/?'; // Example CORS proxy
    }

    async fetchPreview(url) {
        // Check cache first
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        try {
            const response = await fetch(this.proxyUrl + encodeURIComponent(url));
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            const preview = this.extractPreview(html);
            
            // Cache the result
            this.cache.set(url, preview);
            
            return preview;
        } catch (error) {
            console.error('Preview fetch error:', error);
            return null;
        }
    }

    extractPreview(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        return {
            title: this.extractTitle(doc),
            description: this.extractDescription(doc),
            snippet: this.extractSnippet(doc)
        };
    }

    extractTitle(doc) {
        return doc.querySelector('title')?.textContent || 
               doc.querySelector('h1')?.textContent || 
               'No title available';
    }

    extractDescription(doc) {
        return doc.querySelector('meta[name="description"]')?.content ||
               doc.querySelector('meta[property="og:description"]')?.content ||
               this.generateDescription(doc);
    }

    generateDescription(doc) {
        // Get the first paragraph or meaningful text
        const content = doc.body?.textContent || '';
        const cleaned = content.replace(/\s+/g, ' ').trim();
        return cleaned.substring(0, 200) + (cleaned.length > 200 ? '...' : '');
    }

    extractSnippet(doc) {
        // Remove script and style elements
        doc.querySelectorAll('script, style').forEach(el => el.remove());
        
        // Get main content area if it exists
        const main = doc.querySelector('main') || 
                    doc.querySelector('article') || 
                    doc.querySelector('.content') ||
                    doc.body;

        if (!main) return 'No preview available';

        // Extract text content
        const text = main.textContent
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 300);

        return text + (text.length === 300 ? '...' : '');
    }

    highlightSearchTerms(content, searchTerms) {
        if (!searchTerms || !content) return content;
        
        const terms = Array.isArray(searchTerms) ? searchTerms : [searchTerms];
        let highlightedContent = content;

        terms.forEach(term => {
            const regex = new RegExp(term, 'gi');
            highlightedContent = highlightedContent.replace(
                regex,
                match => `<mark>${match}</mark>`
            );
        });

        return highlightedContent;
    }

    // Format the preview for display
    formatPreview(preview, searchTerms) {
        if (!preview) return null;

        return {
            title: this.highlightSearchTerms(preview.title, searchTerms),
            description: this.highlightSearchTerms(preview.description, searchTerms),
            snippet: this.highlightSearchTerms(preview.snippet, searchTerms)
        };
    }

    // Clear the cache for a specific URL or all URLs
    clearCache(url = null) {
        if (url) {
            this.cache.delete(url);
        } else {
            this.cache.clear();
        }
    }
}
