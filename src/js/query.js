// Query string builder and decorators
export function sanitizeQueryTerm(term) {
  // Remove extra quotes and escaping
  return term.trim()
    .replace(/^["']+|["']+$/g, '')  // Remove leading/trailing quotes
    .replace(/\\(.)/g, '$1');       // Un-escape characters
}

export function decorateQueryWithTerms(base, includes = [], excludes = [], wrap = false) {
  // Clean and prepare terms
  const baseQuery = sanitizeQueryTerm(base);
  const includeTerms = includes.map(term => {
    const cleaned = sanitizeQueryTerm(term);
    return wrap ? `"${cleaned}"` : cleaned;
  });
  const excludeTerms = excludes.map(term => `-${sanitizeQueryTerm(term)}`);

  // Build query with proper spacing
  return [
    baseQuery,
    ...includeTerms,
    ...excludeTerms
  ].filter(Boolean).join(' ').trim();
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
  
  // Replace generic operators with engine-specific ones
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
      if (selected.isDomainTarget) {
        optionsQuery = selected.value + userQuery;
      } else if (selected.isCustomHandler) {
        optionsQuery = userQuery;
      } else {
        optionsQuery = selected.value;
      }
    }
  }

  // Combine with user input and decorations
  const decorated = decorateQueryWithTerms(
    [baseQuery, optionsQuery, optionsQuery ? '' : userQuery].filter(Boolean).join(' '),
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
