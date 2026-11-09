const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const locales = JSON.parse(fs.readFileSync(path.join(root, '_data/safari_locales.json'), 'utf8'));
const localizationSource = fs.readFileSync(path.join(root, 'assets/js/kudo-localization.js'), 'utf8');
const languageSource = fs.readFileSync(path.join(root, 'assets/js/safari-language.js'), 'utf8');

function leaves(value, prefix = '') {
  return Object.entries(value).flatMap(([key, item]) => {
    const name = `${prefix}.${key}`;
    return item && typeof item === 'object' ? leaves(item, name) : [[name, item]];
  });
}

function languagePage({ locale = 'en', url = 'https://kudoall.li2niu.com/safari/', saved, languages = ['en-US'], storageFails = false } = {}) {
  const values = new Map(saved ? [['kudoall-site-language', saved]] : []);
  const redirects = [];
  const listeners = {};
  const nodes = {
    'kudo-safari-locale-config': { textContent: JSON.stringify({
      pageLocale: locale,
      locales: Object.fromEntries(Object.entries(locales).map(([key, data]) => [key, { path: data.path, name: data.languageName }])),
    }) },
    'kudo-language-suggestion': { hidden: true },
    'kudo-language-suggestion-title': { dataset: { pattern: 'Read this page in {language}' }, textContent: '' },
    'kudo-language-suggestion-link': { dataset: {}, href: '/safari/' },
    'kudo-language-suggestion-dismiss': { addEventListener: (name, callback) => { listeners.dismiss = callback; } },
  };
  const document = {
    documentElement: { dataset: { kudoPageLocale: locale, kudoLocale: locale } },
    getElementById: (id) => nodes[id],
    addEventListener: (name, callback) => { listeners[name] = callback; },
  };
  const parsed = new URL(url);
  const window = {
    location: { href: url, search: parsed.search, replace: (target) => redirects.push(target) },
    localStorage: {
      getItem: (key) => { if (storageFails) throw new Error('Storage disabled'); return values.get(key); },
      setItem: (key, value) => { if (storageFails) throw new Error('Storage disabled'); values.set(key, value); },
    },
  };
  const context = vm.createContext({ document, window, URL, URLSearchParams, navigator: { languages } });
  vm.runInContext(localizationSource, context);
  vm.runInContext(languageSource, context);
  return {
    document, nodes, redirects, values,
    clickLanguage: (targetLocale) => listeners.click({ target: { closest: () => ({ dataset: { kudoLang: targetLocale } }) } }),
    dismiss: () => listeners.dismiss(),
  };
}

test('all eight complete translations preserve the schema and purchase facts', () => {
  assert.deepEqual(Object.keys(locales), ['en', 'de', 'nl', 'fr', 'es', 'pt-BR', 'pl', 'zh-CN']);
  const sourcePaths = leaves(locales.en.copy).map(([key]) => key);
  const routes = new Set();
  for (const [locale, data] of Object.entries(locales)) {
    assert.equal(data.locale, locale);
    assert.equal(routes.has(data.path), false);
    routes.add(data.path);
    assert.deepEqual(leaves(data.copy).map(([key]) => key), sourcePaths);
    for (const [key, value] of leaves(data.copy)) assert.ok(typeof value === 'string' && value.trim(), `${locale}${key}`);
    assert.ok(data.copy.offer.price.includes('$2.99'));
    assert.ok(data.copy.offer.body.includes('macOS 12'));
    assert.ok(data.copy.languageRecommendation.title.includes('{language}'));
    assert.equal(data.copy.features.length, 3);
    assert.equal(data.copy.steps.length, 3);
    assert.equal(data.copy.troubleshooting.length, 4);
    assert.ok(data.copy.steps[1].body.includes('Safari'), `${locale} explains where to enable the extension`);
    assert.ok(data.copy.stravaDemo.body.includes('Safari'), `${locale} explains the Safari sign-in context`);
    assert.ok(data.copy.stravaDemo.caption.includes('EGO') && data.copy.stravaDemo.caption.includes('Chromium'), `${locale} labels the Strava screenshot browser`);
  }
  assert.ok(locales.en.copy.steps.reduce((sum, step) => sum + step.body.split(/\s+/).length, 0) <= 120);
});

test('explicit static language pages override query, memory and browser preferences', () => {
  for (const locale of Object.keys(locales).filter((key) => key !== 'en')) {
    const page = languagePage({ locale, url: `https://kudoall.li2niu.com${locales[locale].path}?lang=en`, saved: 'pt-BR', languages: ['fr-FR'] });
    assert.equal(page.document.documentElement.lang, locale);
    assert.equal(page.document.documentElement.dataset.kudoLocale, locale);
    assert.equal(page.redirects.length, 0);
    assert.equal(page.nodes['kudo-language-suggestion'].hidden, true);
  }
});

test('legacy language queries resolve regional aliases and preserve unrelated parameters', () => {
  for (const [requested, expected] of [['zh', 'zh-CN'], ['pt-br', 'pt-BR'], ['fr-CA', 'fr'], ['unknown', 'en']]) {
    const page = languagePage({ url: `https://kudoall.li2niu.com/safari/?lang=${requested}&utm_source=readme#setup` });
    const target = new URL(page.redirects[0]);
    assert.equal(target.pathname, locales[expected].path);
    assert.equal(target.searchParams.get('utm_source'), 'readme');
    assert.equal(target.searchParams.has('lang'), false);
    assert.equal(target.hash, '#setup');
  }
});

test('browser language matching suggests a real route without forcing a redirect', () => {
  const page = languagePage({ languages: ['ja-JP', 'fr-CA'] });
  assert.equal(page.redirects.length, 0);
  assert.equal(page.nodes['kudo-language-suggestion'].hidden, false);
  assert.equal(page.nodes['kudo-language-suggestion-link'].href, '/safari/fr/');
  assert.match(page.nodes['kudo-language-suggestion-title'].textContent, /Français/);
  page.dismiss();
  assert.equal(page.nodes['kudo-language-suggestion'].hidden, true);
  assert.equal(page.values.get('kudoall-site-language'), 'en');
});

test('manual language choices are remembered ahead of browser preferences', () => {
  const page = languagePage({ saved: 'pt-BR', languages: ['de-DE'] });
  assert.equal(page.nodes['kudo-language-suggestion-link'].href, '/safari/pt-br/');
  page.clickLanguage('nl');
  assert.equal(page.values.get('kudoall-site-language'), 'nl');
});

test('unknown languages and unavailable preference storage keep the English fallback usable', () => {
  const page = languagePage({ languages: ['ja-JP'], storageFails: true });
  assert.equal(page.document.documentElement.lang, 'en');
  assert.equal(page.nodes['kudo-language-suggestion'].hidden, true);
  assert.doesNotThrow(() => page.clickLanguage('de'));
  assert.equal(page.redirects.length, 0);
});
