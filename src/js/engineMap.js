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
  }
};

export function buildURL(engineKey, query, after, before) {
  const e = ENGINE[engineKey];
  return e.base + encodeURIComponent(query) + (e.date(after, before) || '');
}
