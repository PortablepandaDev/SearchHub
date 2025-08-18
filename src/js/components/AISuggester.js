// AI Suggester: Suggests advanced dorks, query refinements, and variations
// Local mock for privacy; can be extended to use transformers.js or an API

export class AISuggester {
    constructor({ useAPI = false, apiKey = null } = {}) {
        this.useAPI = useAPI;
        this.apiKey = apiKey;
    }

    async suggest(query, category) {
        // Local mock suggestions for privacy
        if (!this.useAPI) {
            return this.localSuggest(query, category);
        } else {
            return this.apiSuggest(query, category);
        }
    }

    localSuggest(query, category) {
        // Simple hardcoded logic for demo; replace with transformers.js for real local AI
        const lower = query.toLowerCase();
        if (category === 'intelligence') {
            if (lower.includes('github')) {
                return [
                    'site:github.com in:file database leak',
                    'site:github.com ext:sql password',
                    'site:github.com "leaked credentials"',
                ];
            }
            if (lower.includes('subdomain')) {
                return [
                    'site:*.example.com -www',
                    'site:*.target.com ext:txt',
                ];
            }
            // General OSINT
            return [
                'intitle:"index of" "parent directory" (csv | xls | sql)',
                'site:pastebin.com "database dump"',
                'site:github.com "api key"',
            ];
        }
        // Fallback
        return [
            `"${query}" filetype:pdf`,
            `inurl:${query} ext:log`,
            `site:reddit.com ${query}`
        ];
    }

    async apiSuggest(query, category) {
        // Example: call Grok or OpenAI API (user must provide key)
        // This is a stub; real implementation would use fetch()
        return [
            'API suggestion 1 for: ' + query,
            'API suggestion 2 for: ' + query
        ];
    }
}
