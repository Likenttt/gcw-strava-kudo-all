(() => {
  if (window.__kudoAcquisitionInitialized) return;
  window.__kudoAcquisitionInitialized = true;

  const campaigns = {
    home: "kudo_safari_home",
    readme: "kudo_safari_readme",
    welcome: "kudo_safari_welcome",
    landing: "kudo_safari_landing",
  };

  function storeLink(anchor) {
    try {
      const url = new URL(anchor.href, window.location.href);
      return url.protocol === "https:" && url.hostname === "apps.apple.com"
        && /\/id6458730808(?:\/|$)/.test(url.pathname) ? url : null;
    } catch (_) {
      return null;
    }
  }

  function sourceFor(anchor, url) {
    const explicit = anchor.dataset.kudoSource;
    if (Object.prototype.hasOwnProperty.call(campaigns, explicit)) return explicit;
    const source = Object.keys(campaigns).find((key) => campaigns[key] === url.searchParams.get("ct"));
    return source || (anchor.closest(".kudo-readme") ? "readme" : "landing");
  }

  function initialize() {
    let providerToken = "";
    try {
      const config = JSON.parse(document.getElementById("kudo-acquisition-config")?.textContent || "{}");
      if (/^\d+$/.test(String(config.providerToken || ""))) providerToken = String(config.providerToken);
    } catch (_) {
      // Purchase links and the local click event remain usable without config.
    }

    document.querySelectorAll('a[href*="id6458730808"]').forEach((anchor) => {
      const url = storeLink(anchor);
      if (!url) return;
      const source = sourceFor(anchor, url);
      url.searchParams.set("ct", campaigns[source]);
      url.searchParams.set("mt", "8");
      if (providerToken) url.searchParams.set("pt", providerToken);
      anchor.href = url.toString();
    });

    document.querySelectorAll("a[data-kudo-lang]").forEach((anchor) => {
      // Localized landing pages already contain real, crawlable language URLs.
      if (anchor.dataset.kudoLocalePath !== undefined) {
        if (anchor.dataset.kudoLang === document.documentElement.dataset.kudoLocale) anchor.setAttribute("aria-current", "true");
        return;
      }
      const url = new URL(window.location.href);
      url.searchParams.set("lang", anchor.dataset.kudoLang);
      anchor.href = url.pathname + url.search + url.hash;
      if (anchor.dataset.kudoLang === document.documentElement.dataset.kudoLocale) {
        anchor.setAttribute("aria-current", "true");
      }
    });

    document.addEventListener("click", (event) => {
      const anchor = event.target.closest?.("a");
      if (!anchor) return;
      const url = storeLink(anchor);
      if (!url) return;
      if (typeof window.gtag === "function") {
        window.gtag("event", "safari_store_click", {
          source: sourceFor(anchor, url),
          locale: document.documentElement.dataset.kudoLocale || "en",
        });
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
