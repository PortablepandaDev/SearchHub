# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.4.x   | :white_check_mark: |
| < 1.4.0 | :x:                |

## Reporting a Security Issue

If you discover a security vulnerability in SearchHub, please follow these steps:

1. **DO NOT** disclose the issue publicly on GitHub Issues or elsewhere
2. Send an email to [your-email@example.com] with:
   - A description of the vulnerability
   - Steps to reproduce (if applicable)
   - Potential impact
   - Suggested fixes (if any)

## Security Features

SearchHub implements several security measures:

1. **Content Security Policy (CSP)**
   - Strict CSP headers to prevent XSS attacks
   - No inline scripts
   - Limited external resource loading

2. **Safe Link Handling**
   - All external links use rel="noopener noreferrer"
   - Anti-tabnabbing protection
   - DOM sanitization for user inputs

3. **Data Privacy**
   - Local storage only
   - No external tracking
   - Optional AI features with configurable privacy settings

## Best Practices

When contributing to SearchHub, please follow these security practices:

1. Never store sensitive data in localStorage/IndexedDB
2. Sanitize all user inputs before DOM insertion
3. Use CSP-compliant code patterns
4. Keep dependencies updated
5. Test security features before submitting PRs
