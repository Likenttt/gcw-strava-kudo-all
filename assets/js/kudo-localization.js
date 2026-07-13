(() => {
  const searchParams = new URLSearchParams(window.location.search);
  const requestedLocale = searchParams.get("lang");
  const browserLocale = navigator.languages?.[0] || navigator.language || "en";
  const locale = (requestedLocale || browserLocale).toLowerCase();
  const resolvedLocale = locale.startsWith("zh") ? "zh" : "en";
  const reason = searchParams.get("reason");
  const version = searchParams.get("version");

  document.documentElement.dataset.kudoLocale = resolvedLocale;
  document.documentElement.lang = resolvedLocale === "zh" ? "zh-CN" : "en";

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
