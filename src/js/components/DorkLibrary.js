// DorkLibrary.js - Manages dork suggestions and library functionality
export class DorkLibrary {
    constructor() {
        this.dorkCategories = {
            'github': [
                { 
                    name: 'API Keys',
                    query: 'filename:.env "API_KEY"',
                    description: 'Find potential API keys in .env files'
                },
                {
                    name: 'AWS Keys',
                    query: 'filename:.aws/credentials',
                    description: 'Locate AWS credential files'
                },
                {
                    name: 'Database Credentials',
                    query: 'filename:database.yml password',
                    description: 'Search for database credentials'
                }
            ],
            'security': [
                {
                    name: 'CVE Search',
                    query: 'site:nvd.nist.gov intext:"CVE-"',
                    description: 'Search for CVE vulnerabilities'
                },
                {
                    name: 'Open Ports',
                    query: 'intitle:"index of" intext:"port 22"',
                    description: 'Find potentially exposed ports'
                }
            ],
            'documents': [
                {
                    name: 'PDF Documents',
                    query: 'filetype:pdf site:example.com',
                    description: 'Find PDF documents on specific sites'
                },
                {
                    name: 'Excel Files',
                    query: 'filetype:xlsx OR filetype:xls',
                    description: 'Find Excel spreadsheets'
                }
            ]
        };
    }

    getDorksByCategory(category) {
        return this.dorkCategories[category] || [];
    }

    getAllCategories() {
        return Object.keys(this.dorkCategories);
    }

    searchDorks(query) {
        const results = [];
        Object.values(this.dorkCategories).forEach(category => {
            category.forEach(dork => {
                if (dork.name.toLowerCase().includes(query.toLowerCase()) ||
                    dork.description.toLowerCase().includes(query.toLowerCase())) {
                    results.push(dork);
                }
            });
        });
        return results;
    }

    exportDorks() {
        return JSON.stringify(this.dorkCategories, null, 2);
    }

    importDorks(dorksJson) {
        try {
            const dorks = JSON.parse(dorksJson);
            // Validate structure before importing
            if (this.validateDorkStructure(dorks)) {
                this.dorkCategories = {...this.dorkCategories, ...dorks};
                return true;
            }
            return false;
        } catch (e) {
            console.error('Failed to import dorks:', e);
            return false;
        }
    }

    validateDorkStructure(dorks) {
        // Basic validation of imported dork structure
        return Object.values(dorks).every(category =>
            Array.isArray(category) &&
            category.every(dork =>
                dork.name &&
                dork.query &&
                dork.description
            )
        );
    }
}
