
# SearchHub

SearchHub is a customizable, privacy-respecting search interface that lets you fire complex queries across multiple engines from one place. Built for researchers, OSINT enthusiasts, and anyone who’s tired of retyping the same query on multiple sites.

## Features
- Unified search bar for multiple engines (Google, Bing, DuckDuckGo, GitHub, and more)
- Advanced options for file types, categories, and search modes (Safe Mode, Disabled Mode, etc.)
- Customizable query templates
- Privacy-first: no tracking, no data sent to third parties
- Modern, responsive UI

## Getting Started
1. **Open `index.html` in your browser.**
2. Select a search category from the sidebar (e.g., Web, File Search, GitHub, etc.).
3. Enter your query in the search bar.
4. Adjust options as needed (file type, safe mode, etc.).
5. Click the search button to launch your query in the selected engine(s).

### Options & Modes
- **File Search:** Choose file type (e.g., Music, Books) and sub-options (e.g., PDF, MP3).
- **Safe Mode:** Toggle between Safe Mode and Disabled Mode for safer or unrestricted results.
- **Advanced:** Use advanced features for dorking, GitHub code search, and more.

## Customization
- Edit `src/js/config/searchEngines.js` to add or remove search engines.
- Tweak categories and options in `src/js/categories.js`.
- Adjust UI styles in `src/css/style.css`.

## Changelog

### v1.1.0 (2025-08-18)
- Fixed option highlighting for all categories and sub-options
- Improved selector safety for special characters in option values
- Enhanced state management for Safe Mode and Disabled Mode

### v1.0.0
- Initial release: unified search, category options, file search, and advanced features
