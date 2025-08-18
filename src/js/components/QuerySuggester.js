// QuerySuggester.js - Provides AI-assisted query suggestions
export class QuerySuggester {
    constructor() {
        this.commonPatterns = {
            'api_key': /api[_\s]?key/i,
            'email': /email|e-mail/i,
            'password': /password|passwd/i,
            'date': /after|before|during|date/i,
            'filetype': /pdf|excel|doc|csv/i
        };

        this.operatorSuggestions = {
            'filetype:': ['pdf', 'doc', 'xls', 'txt', 'env', 'yaml', 'json'],
            'site:': ['github.com', 'gitlab.com', 'bitbucket.org', 'pastebin.com'],
            'intext:': ['password', 'secret', 'api_key', 'credentials'],
            'intitle:': ['index of', 'admin', 'dashboard', 'login'],
            'inurl:': ['admin', 'config', 'settings', 'backup']
        };
    }

    analyzeQuery(query) {
        const suggestions = [];
        
        // Check for common patterns
        Object.entries(this.commonPatterns).forEach(([type, pattern]) => {
            if (pattern.test(query)) {
                suggestions.push(...this.getContextualSuggestions(type));
            }
        });

        // Add operator suggestions based on query context
        const operators = this.detectMissingOperators(query);
        suggestions.push(...operators);

        return suggestions;
    }

    getContextualSuggestions(type) {
        switch(type) {
            case 'api_key':
                return [
                    'filename:.env "API_KEY"',
                    'intext:"api_key" filetype:yaml',
                    'site:github.com "api_key" "authorization"'
                ];
            case 'email':
                return [
                    'intext:@gmail.com filetype:xls',
                    'site:pastebin.com intext:@company.com'
                ];
            case 'password':
                return [
                    'filetype:env "DB_PASSWORD"',
                    'intext:"password" filetype:log'
                ];
            case 'date':
                return [
                    'after:2024',
                    'before:2025-08-17'
                ];
            case 'filetype':
                return [
                    'filetype:pdf',
                    'filetype:xlsx',
                    'filetype:csv'
                ];
            default:
                return [];
        }
    }

    detectMissingOperators(query) {
        const suggestions = [];
        const hasFiletype = /filetype:/.test(query);
        const hasSite = /site:/.test(query);
        
        if (!hasFiletype && this.shouldSuggestFileType(query)) {
            suggestions.push('Add filetype: to specify document type');
        }
        
        if (!hasSite && this.shouldSuggestSite(query)) {
            suggestions.push('Add site: to narrow search to specific domains');
        }

        return suggestions;
    }

    shouldSuggestFileType(query) {
        return /document|file|pdf|excel|csv|config/i.test(query);
    }

    shouldSuggestSite(query) {
        return /github|gitlab|company|website/i.test(query);
    }

    getAutocompleteSuggestions(partialOperator) {
        const operator = Object.keys(this.operatorSuggestions)
            .find(op => op.startsWith(partialOperator.toLowerCase()));
            
        if (operator) {
            return this.operatorSuggestions[operator].map(value => operator + value);
        }
        return [];
    }
}
