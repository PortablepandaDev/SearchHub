export const defaultTemplates = [
    {
        name: 'Basic OSINT Profile',
        description: 'Basic social media and web presence search',
        queries: [
            { query: 'site:linkedin.com "{target}"', engine: 'google' },
            { query: 'site:twitter.com "{target}"', engine: 'google' },
            { query: 'site:facebook.com "{target}"', engine: 'google' },
            { query: 'site:github.com "{target}"', engine: 'google' }
        ],
        variables: ['target'],
        category: 'OSINT'
    },
    {
        name: 'Document Search',
        description: 'Search for documents related to a topic or organization',
        queries: [
            { query: '"{target}" filetype:pdf', engine: 'google' },
            { query: '"{target}" filetype:doc OR filetype:docx', engine: 'google' },
            { query: '"{target}" filetype:ppt OR filetype:pptx', engine: 'google' },
            { query: '"{target}" filetype:xls OR filetype:xlsx', engine: 'google' }
        ],
        variables: ['target'],
        category: 'Documents'
    },
    {
        name: 'Tech Stack Analysis',
        description: 'Analyze technology stack of a domain',
        queries: [
            { query: 'site:"{domain}" inurl:wp- OR inurl:wordpress', engine: 'google', description: 'WordPress detection' },
            { query: 'site:builtwith.com "{domain}"', engine: 'google', description: 'BuiltWith profile' },
            { query: 'site:github.com "{domain}"', engine: 'github', description: 'GitHub repositories' }
        ],
        variables: ['domain'],
        category: 'Technical'
    },
    {
        name: 'Security Assessment',
        description: 'Basic security-focused searches (use responsibly)',
        queries: [
            { query: 'site:"{domain}" inurl:login OR inurl:admin OR inurl:backup OR inurl:wp-admin', engine: 'google' },
            { query: 'site:"{domain}" ext:log OR ext:txt OR ext:conf OR ext:config OR ext:json', engine: 'google' },
            { query: 'site:pastebin.com "{domain}"', engine: 'google' }
        ],
        variables: ['domain'],
        category: 'Security'
    },
    {
        name: 'Company Research',
        description: 'Comprehensive company information search',
        queries: [
            { query: '"{company}" site:linkedin.com/company', engine: 'google' },
            { query: '"{company}" site:crunchbase.com', engine: 'google' },
            { query: '"{company}" site:bloomberg.com OR site:reuters.com', engine: 'google' },
            { query: '"{company}" filetype:pdf site:sec.gov', engine: 'google' }
        ],
        variables: ['company'],
        category: 'Business'
    }
];
