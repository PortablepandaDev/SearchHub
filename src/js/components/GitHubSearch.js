// GitHubSearch.js - Handles GitHub-specific search functionality
export class GitHubSearch {
    constructor() {
        this.API_BASE = 'https://api.github.com/search/code';
        this.RATE_LIMIT_WAIT = 60000; // 1 minute
        this.lastRequestTime = 0;
    }

    async searchGitHub(query, options = {}) {
        const {
            sort = 'indexed',
            order = 'desc',
            perPage = 30,
            page = 1
        } = options;

        // Rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.RATE_LIMIT_WAIT) {
            await new Promise(resolve => 
                setTimeout(resolve, this.RATE_LIMIT_WAIT - timeSinceLastRequest)
            );
        }

        const searchParams = new URLSearchParams({
            q: query,
            sort,
            order,
            per_page: perPage,
            page
        });

        try {
            const response = await fetch(`${this.API_BASE}?${searchParams}`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    // Note: Users would need to add their own token
                    'Authorization': 'token' // Token would be set via UI
                }
            });

            this.lastRequestTime = Date.now();

            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status}`);
            }

            const data = await response.json();
            return this.processResults(data);

        } catch (error) {
            console.error('GitHub Search Error:', error);
            throw error;
        }
    }

    processResults(data) {
        return {
            totalCount: data.total_count,
            incomplete: data.incomplete_results,
            items: data.items.map(item => ({
                repo: item.repository.full_name,
                path: item.path,
                url: item.html_url,
                score: item.score,
                matchingText: item.text_matches?.map(match => ({
                    fragment: match.fragment,
                    matches: match.matches
                }))
            }))
        };
    }

    // Pre-defined GitHub dork queries
    static getSecurityDorks() {
        return {
            'API Keys': 'filename:.env "API_KEY"',
            'SSH Keys': 'filename:.ssh/id_rsa',
            'AWS Keys': 'filename:credentials "aws_access_key_id"',
            'Database Credentials': 'filename:database.yml password',
            'Docker Configs': 'filename:docker-compose.yml',
            'WordPress Configs': 'filename:wp-config.php',
            'NPM Tokens': 'filename:.npmrc _auth',
            'Travis CI Files': 'filename:.travis.yml',
            'Jenkins Files': 'filename:Jenkinsfile',
            'Kubernetes Secrets': 'filename:deployment.yaml'
        };
    }

    // Helper method to build GitHub-specific queries
    static buildGitHubQuery(base, options = {}) {
        const {
            language,
            user,
            org,
            fileType,
            path,
            created,
            size
        } = options;

        const parts = [base];

        if (language) parts.push(`language:${language}`);
        if (user) parts.push(`user:${user}`);
        if (org) parts.push(`org:${org}`);
        if (fileType) parts.push(`extension:${fileType}`);
        if (path) parts.push(`path:${path}`);
        if (created) parts.push(`created:${created}`);
        if (size) parts.push(`size:${size}`);

        return parts.join(' ');
    }
}
