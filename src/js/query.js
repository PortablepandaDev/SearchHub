// Centralized date filter logic
export function withDateFilter(engine, query, after, before) {
  if (!after && !before) return { query, extraQueryString: '' };
  if (engine === 'google') {
    const mmdd = s => new Date(s).toLocaleDateString('en-US');
    const tbs = `&tbs=cdr:1${after ? `,cd_min:${mmdd(after)}` : ''}${before ? `,cd_max:${mmdd(before)}` : ''}`;
    return { query, extraQueryString: tbs };
  }
  if (engine === 'bing') {
    // Bing has no reliable after: operator; prefer UI filter.
    return { query, extraQueryString: '' };
  }
  return { query, extraQueryString: '' };
}

// Subdomain builder
export function subdomainQuery(domain) {
  const d = domain.replace(/^https?:\/\//, '').replace(/\/.*/, '');
  return `site:*.${d}`;
}

// Improved decorateQuery: only quote includes if wrapPhrases is true
export function decorateQuery(base, includes, excludes, wrapPhrases) {
  const inc = includes.map(t => wrapPhrases ? `"${t}"` : t);
  const exc = excludes.map(t => `-${t}`);
  return [base, ...inc, ...exc].filter(Boolean).join(' ').trim();
}
// Query string builder and decorators
export function sanitizeQueryTerm(term) {
  // Remove extra quotes and escaping
  return term.trim()
    .replace(/^["']+|["']+$/g, '')  // Remove leading/trailing quotes
    .replace(/\\(.)/g, '$1');       // Un-escape characters
}

export function decorateQueryWithTerms(base, includes = [], excludes = [], wrap = false) {
  // Use new decorateQuery logic
  const baseQuery = sanitizeQueryTerm(base);
  const inc = includes.map(term => wrap ? `"${sanitizeQueryTerm(term)}"` : sanitizeQueryTerm(term));
  const exc = excludes.map(term => `-${sanitizeQueryTerm(term)}`);
  return [baseQuery, ...inc, ...exc].filter(Boolean).join(' ').trim();
}

// Engine-specific query adaptations
const engineAdaptations = {
  google: {
    fileType: 'filetype:',
    site: 'site:',
    inUrl: 'inurl:',
    inTitle: 'intitle:',
    or: ' OR ',
  },
  bing: {
    fileType: 'filetype:',
    site: 'site:',
    inUrl: 'url:',
    inTitle: 'title:',
    feed: 'feed:',
    or: ' OR ',
  },
  duckduckgo: {
    fileType: 'filetype:',
    site: 'site:',
    inUrl: 'inurl:',
    inTitle: 'title:',
    or: ' OR ',
  },
  yandex: {
    fileType: 'mime:',
    site: 'site:',
    inUrl: 'inurl:',
    inTitle: 'title:',
    or: ' | ',
  }
};

export function adaptQueryForEngine(query, engineKey = 'google') {
  const adaptations = engineAdaptations[engineKey] || engineAdaptations.google;
  
  // Special handling for Google to preserve parentheses in file type groups
  if (engineKey === 'google') {
    // Don't modify parenthesized file type groups
    const parts = query.split(/(\([^)]+\))/);
    return parts.map(part => {
      if (part.startsWith('(') && part.endsWith(')')) {
        return part; // Keep parenthesized groups intact
      }
      // Apply adaptations to non-parenthesized parts
      return part
        .replace(/filetype:/g, adaptations.fileType)
        .replace(/site:/g, adaptations.site)
        .replace(/inurl:/g, adaptations.inUrl)
        .replace(/intitle:/g, adaptations.inTitle)
        .replace(/ OR /g, adaptations.or);
    }).join('');
  }
  
  // For other engines, apply adaptations normally
  return query
    .replace(/filetype:/g, adaptations.fileType)
    .replace(/site:/g, adaptations.site)
    .replace(/inurl:/g, adaptations.inUrl)
    .replace(/intitle:/g, adaptations.inTitle)
    .replace(/ OR /g, adaptations.or);
}

export function buildQueryString(state, dom) {
  const category = state.categories[state.activeCategory];
  if (!category) return '';

  let baseQuery = '';
  let optionsQuery = '';
  const userQuery = dom.searchQuery?.value?.trim() || '';

  // Handle file search with subOptions
  if (state.activeCategory === 'file_search') {
    const selectedOption = category.options.find(opt => opt.checked) || category.options[0];
    const subOptions = selectedOption?.subOptions?.filter(opt => opt.checked).map(opt => opt.value) || [];
    
    baseQuery = category.baseQuery || '';
    if (subOptions.length > 0) {
      optionsQuery = `(${subOptions.join(' | ')})`;
    }
  } 
  // Handle other categories with options
  else if (category.options?.length > 0) {
    const selected = category.options.find(opt => opt.checked) || category.options[0];
    if (selected) {
      if (selected.isDomainTarget && userQuery) {
        // Use subdomainQuery for subdomain searches
        optionsQuery = subdomainQuery(userQuery);
      } else if (selected.isCustomHandler) {
        optionsQuery = userQuery;
      } else {
        // For site: operators, don't duplicate them
        optionsQuery = selected.value || '';
      }
    }
  }

  // Build the final query
  let queryParts = [];

  // Common web page extensions to exclude
  const EXCLUDE_EXTENSIONS = ['-html', '-htm', '-php', '-asp', '-jsp', '-cfm'];
  
  // Media file types to search for
  const MEDIA_TYPES = {
    audio: ['mp3', 'flac', 'm4a', 'opus', 'wav', 'aac', 'ogg', 'wma'],
    video: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv'],
    document: ['pdf', 'doc', 'docx', 'txt', 'rtf']
  };

  // Extract file type hints and clean up query
  let fileTypes = [];
  let searchTerms = userQuery;
  
  // Check for explicit extensions in query
  const fileTypeMatch = userQuery.match(/\.(mp3|flac|m4a|opus|wav|aac|ogg|wma|mp4|avi|mkv)(?:\s|$)/gi);
  if (fileTypeMatch) {
    fileTypes = fileTypeMatch.map(ft => ft.substring(1).toLowerCase());
    // Remove the extensions from search terms
    searchTerms = userQuery.replace(/\.(mp3|flac|m4a|opus|wav|aac|ogg|wma|mp4|avi|mkv)(?:\s|$)/gi, ' ').trim();
  }

  // If no specific types found but we're in file search mode, add default audio types
  if (fileTypes.length === 0 && state.activeCategory === 'file_search') {
    fileTypes = MEDIA_TYPES.audio;
  }

  // Handle site: operator queries
  if (optionsQuery.includes('site:')) {
    queryParts.push(optionsQuery);
  }

  // Add the search terms
  if (searchTerms) {
    queryParts.push(searchTerms);
  }

  // Add file type conditions
  if (fileTypes.length > 0) {
    queryParts.push(`(${fileTypes.join('|')})`);
  }

  // Add directory listing indicators
  queryParts.unshift('intitle:"index of" "parent directory"');

  // Add exclusions to filter out web pages
  queryParts.push(...EXCLUDE_EXTENSIONS);

  // Combine with decorations
  const decorated = decorateQueryWithTerms(
    queryParts.filter(Boolean).join(' '),
    dom.includeTerms?.value?.split(',') || [],
    dom.excludeTerms?.value?.split(',') || [],
    dom.exactPhrases?.checked || false
  );

  // Add date constraints if specified
  const dateConstraints = [];
  if (dom.afterDateInput?.value) {
    dateConstraints.push(`after:${dom.afterDateInput.value}`);
  }
  if (dom.beforeDateInput?.value) {
    dateConstraints.push(`before:${dom.beforeDateInput.value}`);
  }

  // Combine everything and adapt for specific engine
  const finalQuery = [decorated, ...dateConstraints].filter(Boolean).join(' ');
  return adaptQueryForEngine(finalQuery, state.activeEngine);
}

// Export for testing
export const __testing = {
  sanitizeQueryTerm,
  decorateQueryWithTerms,
  adaptQueryForEngine
};
