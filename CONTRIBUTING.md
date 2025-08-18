# Contributing to SearchHub

Thank you for your interest in contributing to SearchHub! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- No harassment or discrimination
- Constructive criticism only
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

1. Check if the bug is already reported in [Issues](https://github.com/PortablepandaDev/SearchHub/issues)
2. If not, create a new issue using the bug report template
3. Include:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/OS version

### Suggesting Enhancements

1. Check existing [Issues](https://github.com/PortablepandaDev/SearchHub/issues) for similar suggestions
2. Create a new issue using the feature request template
3. Describe the feature and its value
4. Include mockups/examples if possible

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`feat: add amazing feature`)
6. Push to your fork
7. Open a Pull Request

#### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding tests
- chore: Maintenance

### Development Setup

1. Clone the repository
2. No build process required
3. Open index.html in a modern browser
4. For testing:
   - Install playwright for e2e tests
   - Run `npm test` for test suite

### Code Style

- Use ESLint configuration
- Follow existing code patterns
- Comment complex logic
- Keep functions focused and small
- Use meaningful variable names

### Testing

- Add tests for new features
- Update tests for bug fixes
- Run full test suite before PR
- Include UI tests for new components

## Project Structure

```
SearchHub/
├── src/
│   ├── js/
│   │   ├── components/    # UI components
│   │   ├── config/        # Configuration files
│   │   ├── modules/       # Core functionality
│   │   └── utils/         # Helper functions
│   └── css/              # Styles
├── tests/                # Test files
└── docs/                # Documentation
```

## Adding New Features

### Search Engines

1. Add engine config in `src/js/config/searchEngines.js`
2. Follow the existing engine format
3. Add necessary icons
4. Document in README

### Categories

1. Add category in appropriate config file
2. Include search patterns
3. Update UI components
4. Add tests

### Templates

1. Follow template schema
2. Add to default templates if generally useful
3. Include usage examples

## Questions?

Open an issue or contact the maintainers.
