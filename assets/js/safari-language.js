(() => {
  const configNode = document.getElementById("kudo-safari-locale-config");
  if (!configNode || !window.KudoLocale) return;
  let config;
  try { config = JSON.parse(configNode.textContent); } catch (_) { return; }
  const { canonicalize } = window.KudoLocale;
  const storageKey = "kudoall-site-language";
  const locales = config.locales || {};
  const localeInfo = (locale) => Object.prototype.hasOwnProperty.call(locales, locale) ? locales[locale] : null;

  function remember(locale) {
    try { window.localStorage.setItem(storageKey, locale); } catch (_) { /* Language links still work without storage. */ }
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[data-kudo-lang]");
    if (!link) return;
    const locale = canonicalize(link.dataset.kudoLang);
    if (localeInfo(locale)) remember(locale);
  });

  // A non-English static path is authoritative. Legacy language queries only
  // choose a route at the neutral English entry point, preserving other parameters.
  if (config.pageLocale !== "en") return;
  const current = new URL(window.location.href);
  if (current.searchParams.has("lang")) {
    const locale = canonicalize(current.searchParams.get("lang")) || "en";
    const destination = localeInfo(locale) || localeInfo("en");
    if (!destination) return;
    const target = new URL(destination.path, current);
    target.search = current.search;
    target.searchParams.delete("lang");
    target.hash = current.hash;
    remember(locale);
    window.location.replace(target.href);
    return;
  }

  let saved;
  try { saved = canonicalize(window.localStorage.getItem(storageKey)); } catch (_) { /* Use the browser preference. */ }
  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language || "en"];
  const preferred = saved || browserLanguages.map(canonicalize).find((locale) => localeInfo(locale)) || "en";
  const destination = localeInfo(preferred);
  const suggestion = document.getElementById("kudo-language-suggestion");
  if (preferred === "en" || !destination || !suggestion) return;

  // Suggest the matching language without changing the URL or overriding an
  // explicit language path. All eight complete pages remain available without JS.
  const title = document.getElementById("kudo-language-suggestion-title");
  const link = document.getElementById("kudo-language-suggestion-link");
  title.textContent = title.dataset.pattern.replace("{language}", destination.name);
  link.href = destination.path;
  link.dataset.kudoLang = preferred;
  suggestion.hidden = false;
  document.getElementById("kudo-language-suggestion-dismiss").addEventListener("click", () => {
    remember("en");
    suggestion.hidden = true;
  });
})();
