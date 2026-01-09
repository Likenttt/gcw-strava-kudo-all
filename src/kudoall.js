let _intl;

try {
    if (window.chrome !== undefined && chrome.i18n) {
        _intl = chrome.i18n;
    } else if (window.browser !== undefined && browser.i18n) {
        _intl = browser.i18n;
    } else {
        throw new Error("No i18n provider");
    }
} catch (err) {
    _intl = {
        getMessage: function (messageName, substitutions) {
            return substitutions ? substitutions : messageName;
        },
    };
}

function getMessage(messageName, substitutions) {
    return _intl.getMessage(messageName, substitutions);
}

// === Debug toggle ===
const DEBUG = false;
const log = (...args) => DEBUG && console.log("[KudoAll]", ...args);

// === Small utils ===
function debounce(fn, waitMs) {
    let t;
    return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), waitMs);
    };
}

function patchSpaNavigation(onChange) {
    // Patch history only once per page
    if (window.__gcwKudoAllHistoryPatched) return;
    window.__gcwKudoAllHistoryPatched = true;

    const fire = () => window.dispatchEvent(new Event("gcw-locationchange"));
    const _ps = history.pushState;
    const _rs = history.replaceState;

    history.pushState = function () {
        const r = _ps.apply(this, arguments);
        fire();
        return r;
    };
    history.replaceState = function () {
        const r = _rs.apply(this, arguments);
        fire();
        return r;
    };
    window.addEventListener("popstate", fire);

    window.addEventListener("gcw-locationchange", onChange);
}

function isHostStrava() {
    return /^(.+\.)?strava\.com$/i.test(window.location.hostname);
}

function isHostGarmin() {
    const h = window.location.hostname.toLowerCase();
    return (
        h === "connect.garmin.com" ||
        h === "connect.garmin.cn" ||
        h === "connectus.garmin.cn"
    );
}

// =========================
// ======= STRAVA ==========
// =========================
const Strava = (() => {
    const BTN_ID = "gcw-kudo-all-strava";

    function getContainer() {
        // More robust than [class="user-nav nav-group"] because class order may vary
        return document.querySelector(".user-nav.nav-group");
    }

    function findKudosButtons(container) {
        const selector =
            "button[data-testid='kudos_button'] > svg[data-testid='unfilled_kudos']";

        const root = container || document;
        return Array.from(root.querySelectorAll(selector));
    }

    function createFilter(athleteLink) {
        const href = athleteLink.href
            .replace("https://www.strava.com", "")
            .replace("https://strava.com", "");

        return (item) => !item.querySelector(`a[href^="${href}"]`);
    }

    function getKudosButtons() {
        const athleteLink = document.querySelector(
            "#athlete-profile a[href^='/athletes']"
        );

        if (!athleteLink) {
            return findKudosButtons();
        }

        let activities = document.querySelectorAll(
            "div[data-testid='web-feed-entry']"
        );

        if (activities.length < 1) {
            return findKudosButtons();
        }

        activities = Array.from(activities).filter(createFilter(athleteLink));

        if (activities.length < 1) {
            return findKudosButtons();
        }

        return activities.flatMap(findKudosButtons).filter(Boolean);
    }

    function createButton() {
        const label = getMessage("kudo_all", "Kudo All");

        const navItemLi = document.createElement("li");
        const navItemA = document.createElement("a");

        navItemLi.className = "nav-item";
        navItemLi.style.marginRight = "10px";

        navItemA.href = "#";
        navItemA.className = "btn btn-default btn-sm empty";
        navItemA.id = BTN_ID;

        const navItemIcon = document.createElement("span");
        navItemIcon.className = "app-icon icon-kudo";
        navItemIcon.style.marginRight = "5px";

        const navItemText = document.createElement("span");
        navItemText.className = "ka-progress text-caption1";
        navItemText.textContent = label;

        navItemA.append(navItemIcon);
        navItemA.append(navItemText);
        navItemLi.append(navItemA);

        return navItemLi;
    }

    function kudoAllHandler(event) {
        event.preventDefault();

        const icons = getKudosButtons();
        const len = icons.length;
        if (len < 1) return;

        for (let i = 0; i < len; i++) {
            const item = icons[i];
            if (!item) continue;

            const parentItem = item.parentElement;
            if (parentItem) parentItem.click();
        }
    }

    function ensureButton() {
        const container = getContainer();
        if (!container) return;

        // Already injected?
        if (document.getElementById(BTN_ID)) return;

        const buttonLi = createButton();
        container.prepend(buttonLi);

        // Event listener on <a> inside
        const a = buttonLi.querySelector(`#${BTN_ID}`);
        (a || buttonLi).addEventListener("click", kudoAllHandler);

        log("Strava button injected");
    }

    const scheduleEnsure = debounce(ensureButton, 200);

    function init() {
        log("Strava init");

        // Initial
        scheduleEnsure();

        // Observe DOM changes (Strava feed is SPA)
        const obs = new MutationObserver(scheduleEnsure);
        obs.observe(document.documentElement, { childList: true, subtree: true });

        patchSpaNavigation(scheduleEnsure);
    }

    return { init };
})();

// =========================
// ======= GARMIN ===========
// =========================
const GC = (() => {
    const MOUNT_ID = "gcw-kudo-all-gc-mount";
    const BTN_ID = "gcw-kudo-all-gc-btn";
    const STYLE_ID = "gcw-kudo-all-style";

    function onNewsfeed() {
        // Garmin uses /app/newsfeed (and some setups had /modern/newsfeed)
        const p = window.location.pathname || "";
        // accept /app/newsfeed, /app/newsfeed/ and also /modern/newsfeed
        return (
            p === "/app/newsfeed" ||
            p.startsWith("/app/newsfeed/") ||
            p === "/modern/newsfeed" ||
            p.startsWith("/modern/newsfeed/")
        );
    }

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
      /* Fallback floating button if header mount isn't found */
      #${BTN_ID}.gcw-floating {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 999999;
        font: 600 13px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Arial;
        padding: 10px 12px;
        border-radius: 10px;
        border: 0;
        cursor: pointer;
        box-shadow: 0 6px 18px rgba(0,0,0,.18);
        background: #111;
        color: #fff;
      }
    `;
        document.head.appendChild(style);
    }

    function findHeaderNav() {
        // Primary: exact known class (works for many versions)
        let nav = document.querySelector("div.header-nav") || document.querySelector(".header-nav");
        if (nav) return nav;

        // Fallback: any element whose class contains "header-nav" (class order / css modules)
        const candidates = Array.from(document.querySelectorAll("div,nav,header"));
        nav = candidates.find((el) => {
            const cls = (el.className || "").toString();
            return cls.includes("header-nav");
        });

        return nav || null;
    }

    function ensureMount(container) {
        if (!container) return null;

        let mount = document.getElementById(MOUNT_ID);
        if (mount && mount.isConnected) return mount;

        mount = document.createElement("div");
        mount.id = MOUNT_ID;
        mount.classList.add("kudo-all-nav-item");
        mount.classList.add("header-nav-item");
        mount.style.height = "60px";
        mount.style.width = "50px";
        container.prepend(mount);

        return mount;
    }

    function findKudosIcons(root) {
        const selector =
            'button[class^="CommentLikeSection_socialIconWrapper"] > div[class*="CommentLikeSection_animateBox"] > i[class*="icon-heart-inverted"]';

        const base = root || document;
        return Array.from(base.querySelectorAll(selector));
    }

    function getClickableFromIcon(iconEl) {
        if (!iconEl) return null;
        // Garmin: clicking the wrapper button is usually safest
        return (
            iconEl.closest("button") ||
            iconEl.closest("a") ||
            iconEl.parentElement ||
            iconEl
        );
    }

    function createButton() {
        const label = getMessage("kudo_all", "Kudo All");

        // Use <a> styled like existing header icons (your original approach)
        const link = document.createElement("a");
        link.href = "#";
        link.id = BTN_ID;
        link.className = "header-nav-link icon-heart-inverted";
        link.setAttribute("aria-label", label);
        link.setAttribute("data-original-title", label);
        link.setAttribute("data-rel", "tooltip");
        return link;
    }

    function kudoAllHandler(event) {
        event.preventDefault();

        // Don’t run outside the newsfeed
        if (!onNewsfeed()) return;

        const icons = findKudosIcons();
        const len = icons.length;
        if (len < 1) return;

        for (let i = 0; i < len; i++) {
            const icon = icons[i];
            if (!icon) continue;

            const clickable = getClickableFromIcon(icon);
            if (clickable) clickable.click();
        }
    }

    function injectFloatingFallbackIfNeeded() {
        // If we can't find a nav container, still provide a working button
        if (document.getElementById(BTN_ID)) return;

        ensureStyles();

        const btn = document.createElement("button");
        btn.id = BTN_ID;
        btn.type = "button";
        btn.classList.add("gcw-floating");
        btn.textContent = getMessage("kudo_all", "Kudo All");
        btn.addEventListener("click", kudoAllHandler);

        document.body.appendChild(btn);
        log("Garmin floating fallback injected");
    }

    function ensureButton() {
        if (!isHostGarmin()) return;
        if (!onNewsfeed()) return;

        // Already there?
        if (document.getElementById(BTN_ID)) return;

        const nav = findHeaderNav();

        if (!nav) {
            // Header not in DOM yet (common with filters / SPA render)
            // Try fallback so user always has a button
            injectFloatingFallbackIfNeeded();
            return;
        }

        // If we previously injected fallback floating button, remove it and inject into header
        const existing = document.getElementById(BTN_ID);
        if (existing && existing.classList.contains("gcw-floating")) {
            existing.remove();
        }

        const mount = ensureMount(nav);
        if (!mount) return;

        // Might have been injected between checks
        if (document.getElementById(BTN_ID)) return;

        const button = createButton();
        mount.append(button);
        button.addEventListener("click", kudoAllHandler);

        log("Garmin button injected");
    }

    const scheduleEnsure = debounce(ensureButton, 200);

    function init() {
        log("Garmin init");

        // Initial (don’t rely on window.onload)
        scheduleEnsure();

        // Watch for Garmin re-renders (filter changes often remount parts of the page)
        const obs = new MutationObserver(scheduleEnsure);
        obs.observe(document.documentElement, { childList: true, subtree: true });

        patchSpaNavigation(() => {
            // give the router/render a moment
            setTimeout(scheduleEnsure, 250);
        });

        // Safety retry for slow renders (especially after login/redirect)
        const retry = setInterval(() => {
            ensureButton();
            if (document.getElementById(BTN_ID)) clearInterval(retry);
        }, 500);
        setTimeout(() => clearInterval(retry), 15000);
    }

    return { init };
})();

// =========================
// ========== INIT ==========
// =========================
(function start() {
    log("Kudo All content script start");

    // Run immediately; don't depend on onload
    if (isHostStrava()) {
        Strava.init();
    } else if (isHostGarmin()) {
        GC.init();
    }
})();
