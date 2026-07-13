(() => {
  const requestedLocale = new URLSearchParams(window.location.search).get("lang");
  const browserLocale = navigator.languages?.[0] || navigator.language || "en";
  const locale = (requestedLocale || browserLocale).toLowerCase();
  const resolvedLocale = locale.startsWith("zh") ? "zh" : "en";

  document.documentElement.dataset.kudoLocale = resolvedLocale;
  document.documentElement.lang = resolvedLocale === "zh" ? "zh-CN" : "en";
})();
