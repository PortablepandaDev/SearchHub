// Unified engine mapping and URL builder

export const ENGINE = {
  google: {
    name: 'Google',
    base: 'https://www.google.com/search?q=',
    date: (a, b) => {
      if (!a && !b) return '';
      const mmdd = s => new Date(s).toLocaleDateString('en-US');
      return `&tbs=cdr:1${a ? `,cd_min:${mmdd(a)}` : ''}${b ? `,cd_max:${mmdd(b)}` : ''}`;
    }
  },
  bing: {
    name: 'Bing',
    base: 'https://www.bing.com/search?q=',
    date: () => ''
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    base: 'https://duckduckgo.com/?q=',
    date: () => ''
  },
  yandex: {
    name: 'Yandex',
    base: 'https://yandex.com/search/?text=',
    date: () => ''
  },
  youtube: {
    name: 'YouTube',
    base: 'https://www.youtube.com/results?search_query=',
    date: () => '' // YouTube does not support date in URL
  },
  scholar: {
    name: 'Google Scholar',
    base: 'https://scholar.google.com/scholar?q=',
    date: (a, b) => {
      // Google Scholar supports year range via as_ylo/as_yhi
      let params = '';
      if (a) params += `&as_ylo=${new Date(a).getFullYear()}`;
      if (b) params += `&as_yhi=${new Date(b).getFullYear()}`;
      return params;
    }
  },
  arxiv: {
    name: 'arXiv',
    base: 'https://arxiv.org/search/?query=',
    date: () => '' // arXiv does not support date in URL
  },
  pubmed: {
    name: 'PubMed',
    base: 'https://pubmed.ncbi.nlm.nih.gov/?term=',
    date: () => '' // PubMed supports date via filters, not URL
  },
  stackoverflow: {
    name: 'Stack Overflow',
    base: 'https://stackoverflow.com/search?q=',
    date: () => ''
  },
  npm: {
    name: 'NPM',
    base: 'https://www.npmjs.com/search?q=',
    date: () => ''
  },
  pypi: {
    name: 'PyPI',
    base: 'https://pypi.org/search/?q=',
    date: () => ''
  },
  rust: {
    name: 'Rust Docs',
    base: 'https://docs.rs/releases/search?query=',
    date: () => ''
  },
  mdn: {
    name: 'MDN',
    base: 'https://developer.mozilla.org/en-US/search?q=',
    date: () => ''
  },
  hackernews: {
    name: 'Hacker News',
    base: 'https://hn.algolia.com/?q=',
    date: () => ''
  },
  news: {
    name: 'Google News',
    base: 'https://news.google.com/search?q=',
    date: (a, b) => {
      // Google News supports after: and before: in query
      let q = '';
      if (a) q += ` after:${a}`;
      if (b) q += ` before:${b}`;
      return q;
    }
  }
};

export function buildURL(engineKey, query, after, before) {
  const e = ENGINE[engineKey];
  
  // For Google-like engines, convert spaces to + and preserve special characters
  const googleLike = ['google', 'scholar', 'youtube'];
  let encodedQuery;
  
  if (googleLike.includes(engineKey)) {
    // Replace spaces with + but don't encode special characters like quotes and parentheses
    encodedQuery = query.replace(/\s+/g, '+');
  } else {
    // For other engines, use full URL encoding
    encodedQuery = encodeURIComponent(query);
  }
  
  return e.base + encodedQuery + (e.date(after, before) || '');
}
