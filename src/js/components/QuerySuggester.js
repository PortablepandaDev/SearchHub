// QuerySuggester.js - Provides contextual query suggestions and autocomplete.
export class QuerySuggester {
    constructor() {
        // A data-driven ruleset for generating suggestions.
        this.suggestionRules = [
            {
                keywords: [/api[_\s]?key/i, /secret/i, /token/i],
                suggestions: [
                    'filename:.env "API_KEY"',
                    'intext:"api_key" filetype:yaml',
                    'site:github.com "api_key" "authorization"',
                    'site:pastebin.com "secret key"'
                ],
                exclude_if_present: ['filename:', 'intext:']
            },
            {
                keywords: [/password/i, /passwd/i, /credentials/i],
                suggestions: [
                    'filetype:log intext:"password"',
                    'filetype:sql "password"|"pass"',
                    'site:trello.com "password"',
                    'filename:.env "DB_PASSWORD"'
                ],
                exclude_if_present: ['filetype:']
            },
            {
                keywords: [/email/i, /e-mail/i, /contact/i],
                suggestions: [
                    'intext:"@gmail.com" filetype:xls',
                    'site:pastebin.com intext:"@company.com"'
                ]
            },
            {
                keywords: [/document/i, /report/i, /file/i],
                suggestions: [
                    'filetype:pdf',
                    'filetype:docx',
                    'filetype:csv "confidential"'
                ],
                exclude_if_present: ['filetype:']
            },
            {
                keywords: [/subdomain/i, /domain/i],
                suggestions: [
                    'site:*.example.com -www',
                    'inurl:dev. OR inurl:staging.'
                ],
                category: 'intelligence',
                exclude_if_present: ['site:']
            },
            {
                category: ['vulnerabilities', 'config_files', 'exposed_services', 'sensitive_files'],
                suggestions: [
                    'site:example.com',
                    'intitle:"index of"',
                    'inurl:admin'
                ],
                exclude_if_present: ['site:', 'intitle:', 'inurl:']
            }
        ];

        // Values for autocompleting search operators.
        this.operatorAutocomplete = {
            'filetype:': ['pdf', 'doc', 'xls', 'txt', 'env', 'yaml', 'json', 'sql', 'log'],
            'site:': ['github.com', 'gitlab.com', 'bitbucket.org', 'pastebin.com', 'trello.com', '*.gov', '*.edu'],
            'intext:': ['password', 'secret', 'api_key', 'credentials', 'confidential'],
            'intitle:': ['index of', 'admin', 'dashboard', 'login', 'config'],
            'inurl:': ['admin', 'config', 'settings', 'backup', 'login', 'phpmyadmin']
        };
    }

    /**
     * Analyzes a query and returns a list of relevant suggestions.
     * @param {string} query The user's search query.
     * @param {string|null} category The active search category for context.
     * @returns {string[]} An array of unique suggestion strings.
     */
    analyzeQuery(query, category = null) {
        const suggestions = new Set();
        const lowerQuery = query.toLowerCase();

        // Simple parser to detect existing operators like "site:", "filetype:", etc.
        const presentOperators = (lowerQuery.match(/\b\w+:/g) || []).map(op => op.slice(0, -1));

        this.suggestionRules.forEach(rule => {
            // Skip rule if it's for a different category
            if (rule.category) {
                const categories = Array.isArray(rule.category) ? rule.category : [rule.category];
                if (!category || !categories.includes(category)) {
                    return;
                }
            }

            // A rule is triggered by a keyword match, or if it's a general category rule without keywords.
            const keywordMatch = rule.keywords && rule.keywords.some(kw => kw.test(lowerQuery));
            const isApplicable = keywordMatch || (!rule.keywords && rule.category);

            if (isApplicable) {
                // Don't suggest if the query already uses a related operator.
                const shouldExclude = rule.exclude_if_present && rule.exclude_if_present.some(op => presentOperators.includes(op));
                
                if (!shouldExclude) {
                    rule.suggestions.forEach(s => suggestions.add(s));
                }
            }
        });

        // Add general "did you mean" style suggestions for common missing operators.
        if (!presentOperators.includes('site') && /github|gitlab|company|website/i.test(lowerQuery)) {
            suggestions.add('Consider adding `site:` to narrow your search (e.g., site:github.com).');
        }
        if (!presentOperators.includes('filetype') && /document|file
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
