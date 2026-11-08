(() => {
  const searchParams = new URLSearchParams(window.location.search);
  function canonicalize(value) {
    const language = String(value || "").trim().toLowerCase().replace(/_/g, "-").split("-")[0];
    if (language === "pt") return "pt-BR";
    if (language === "zh") return "zh-CN";
    return ["en", "de", "nl", "fr", "es", "pl"].includes(language) ? language : null;
  }
  window.KudoLocale = { canonicalize };

  const requestedLocale = searchParams.get("lang");
  const browserLocales = navigator.languages?.length ? navigator.languages : [navigator.language || "en"];
  const explicitPageLocale = canonicalize(document.documentElement.dataset.kudoPageLocale);
  let savedLocale;
  try { savedLocale = canonicalize(window.localStorage?.getItem("kudoall-site-language")); } catch (_) { /* Preferences are optional. */ }
  // Static language pages keep their language even when a query or browser
  // preference differs. The home/welcome pages only have English, German and Chinese.
  const preferredLocale = requestedLocale !== null ? canonicalize(requestedLocale) || "en"
    : savedLocale || browserLocales.map(canonicalize).find(Boolean) || "en";
  const resolvedLocale = explicitPageLocale || (["en", "de", "zh-CN"].includes(preferredLocale) ? preferredLocale : "en");
  const reason = searchParams.get("reason");
  const version = searchParams.get("version");

  document.documentElement.dataset.kudoLocale = resolvedLocale;
  document.documentElement.lang = resolvedLocale;

  // Safari gets the first purchase action, without hiding the other editions
  // or redirecting a visitor to a different page.
  const userAgent = navigator.userAgent || "";
  const isMacSafari = /Macintosh/.test(userAgent) && /Safari\//.test(userAgent) && !(navigator.maxTouchPoints > 1)
    && !/Chrome|Chromium|CriOS|Edg|OPR|FxiOS/.test(userAgent);
  if (isMacSafari) document.documentElement.dataset.kudoBrowser = "safari";

  if (reason === "install" || reason === "update") {
    document.documentElement.dataset.kudoReason = reason;
  }

  if (version) {
    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll("[data-kudo-version]").forEach((element) => {
        element.textContent = version;
      });
    });
  }
})();
