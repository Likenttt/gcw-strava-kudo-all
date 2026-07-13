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
    const TOP_HEADER_SELECTOR =
        '[class*="TopHeaderBarView_headerItems"]';
    const IMPORT_MENU_SELECTOR = '[class*="ImportDataMenu_container"]';
    let kudoAllInProgress = false;

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
      #${MOUNT_ID}.gcw-top-header-item {
        align-items: center;
        display: flex;
        flex: 0 0 36px;
        height: 60px;
        justify-content: center;
        width: 36px;
      }
      #${BTN_ID}.gcw-top-header-button {
        -webkit-tap-highlight-color: transparent;
        align-items: center;
        animation: none !important;
        background: transparent !important;
        border: 0;
        border-radius: 4px;
        box-shadow: none !important;
        color: var(--icon-default, #6b6b6b);
        cursor: pointer;
        display: flex;
        height: 36px;
        justify-content: center;
        margin: 0;
        padding: 6px;
        transition: none !important;
        width: 36px;
      }
      #${BTN_ID}.gcw-top-header-button:hover,
      #${BTN_ID}.gcw-top-header-button:active {
        background: transparent !important;
        box-shadow: none !important;
        transform: none !important;
      }
      #${BTN_ID}.gcw-top-header-button:focus:not(:focus-visible) {
        outline: none;
      }
      #${BTN_ID}.gcw-top-header-button:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }
      #${BTN_ID}.gcw-top-header-button::before,
      #${BTN_ID}.gcw-top-header-button::after {
        animation: none !important;
        content: none !important;
        display: none !important;
      }
      #${BTN_ID}.gcw-top-header-button > svg {
        height: 18px;
        width: 18px;
      }
      .gcw-heart-burst {
        height: 0;
        left: 0;
        pointer-events: none;
        position: fixed;
        top: 0;
        width: 0;
        z-index: 1000000;
      }
      .gcw-heart-burst-particle {
        font: 700 10px/1 system-ui, sans-serif;
        left: 0;
        opacity: 0;
        position: absolute;
        top: 0;
        transform: translate(-50%, -50%) scale(.15) rotate(0deg);
        transform-origin: center;
        user-select: none;
        will-change: opacity, transform;
      }
      @media (prefers-reduced-motion: reduce) {
        .gcw-heart-burst {
          display: none;
        }
      }
    `;
        document.head.appendChild(style);
    }

    function launchHeartBurst(origin) {
        if (!origin || !origin.getBoundingClientRect) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        ensureStyles();

        const rect = origin.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return;

        document
            .querySelectorAll(".gcw-heart-burst")
            .forEach((existingBurst) => existingBurst.remove());

        const burst = document.createElement("div");
        burst.className = "gcw-heart-burst";
        burst.setAttribute("aria-hidden", "true");
        burst.style.left = `${rect.left + rect.width / 2}px`;
        burst.style.top = `${rect.top + rect.height / 2}px`;

        const colors = [
            "#ff4d6d",
            "#ff9f1c",
            "#ffd60a",
            "#2ec4b6",
            "#38bdf8",
            "#6366f1",
            "#a855f7",
            "#f472b6",
        ];
        const particleCount = 16;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const horizontalDirection =
                (i / (particleCount - 1) - 0.5) * 2;
            const heart = document.createElement("span");
            const velocityY = -(155 + Math.random() * 95);
            const gravity = 430 + Math.random() * 150;
            const returnToOriginMs =
                (2 * Math.abs(velocityY) * 1000) / gravity;
            const duration = Math.max(
                1100,
                returnToOriginMs + 300 + Math.random() * 200
            );

            heart.className = "gcw-heart-burst-particle";
            heart.textContent = "♥";
            heart.style.color = colors[i % colors.length];
            heart.style.fontSize = `${8 + Math.round(Math.random() * 6)}px`;
            burst.appendChild(heart);

            particles.push({
                element: heart,
                delay: Math.random() * 90,
                duration,
                fadeStartProgress: (returnToOriginMs + 80) / duration,
                velocityX:
                    horizontalDirection * (80 + Math.random() * 70) +
                    (Math.random() - 0.5) * 24,
                velocityY,
                gravity,
                spin: (Math.random() - 0.5) * 420,
            });
        }

        document.body.appendChild(burst);

        const startedAt = performance.now();

        function animate(now) {
            if (!burst.isConnected) return;

            let hasActiveParticle = false;

            for (const particle of particles) {
                const elapsed = now - startedAt - particle.delay;

                if (elapsed < 0) {
                    hasActiveParticle = true;
                    continue;
                }

                const progress = elapsed / particle.duration;
                if (progress >= 1) {
                    particle.element.style.opacity = "0";
                    continue;
                }

                hasActiveParticle = true;

                const time = elapsed / 1000;
                const x = particle.velocityX * time;
                const y =
                    particle.velocityY * time +
                    0.5 * particle.gravity * time * time;
                const scale =
                    0.15 + Math.min(progress / 0.3, 1) * 1.15;
                const opacity =
                    progress < particle.fadeStartProgress
                        ? Math.min(progress / 0.1, 1)
                        : Math.max(
                              (1 - progress) /
                                  (1 - particle.fadeStartProgress),
                              0
                          );
                const rotation = particle.spin * time;

                particle.element.style.opacity = `${opacity}`;
                particle.element.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale}) rotate(${rotation}deg)`;
            }

            if (hasActiveParticle) {
                requestAnimationFrame(animate);
            } else {
                burst.remove();
            }
        }

        requestAnimationFrame(animate);
    }

    function isTopHeaderContainer(container) {
        return Boolean(container && container.matches(TOP_HEADER_SELECTOR));
    }

    function findImportItem(container) {
        if (!isTopHeaderContainer(container)) return null;

        const importMenu = container.querySelector(IMPORT_MENU_SELECTOR);
        if (!importMenu) return null;

        return (
            Array.from(container.children).find((child) =>
                child.contains(importMenu)
            ) || null
        );
    }

    function findHeaderContainer() {
        // Current Garmin header. Match the stable CSS module name while
        // ignoring its generated suffix. Require the upload component and a
        // visible layout box so a hidden responsive header is not selected.
        let nav = Array.from(
            document.querySelectorAll(TOP_HEADER_SELECTOR)
        ).find(
            (candidate) =>
                findImportItem(candidate) &&
                candidate.getClientRects().length > 0
        );
        if (nav) return nav;

        // Primary: exact known class (works for many versions)
        nav =
            document.querySelector("div.header-nav") ||
            document.querySelector(".header-nav");
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
        if (mount && mount.parentElement !== container) {
            mount.remove();
            mount = null;
        }

        const isTopHeader = isTopHeaderContainer(container);
        const importItem = isTopHeader ? findImportItem(container) : null;
        if (isTopHeader && !importItem) return null;

        if (mount && mount.isConnected) {
            if (isTopHeader && mount.nextElementSibling !== importItem) {
                container.insertBefore(mount, importItem);
            }
            return mount;
        }

        mount = document.createElement("div");
        mount.id = MOUNT_ID;
        mount.classList.add("kudo-all-nav-item");

        if (isTopHeader) {
            mount.classList.add("gcw-top-header-item");
            container.insertBefore(mount, importItem);
        } else {
            mount.classList.add("header-nav-item");
            mount.style.height = "60px";
            mount.style.width = "50px";
            container.prepend(mount);
        }

        return mount;
    }

    function isUnlikedKudosButton(button) {
        if (!button) return false;

        const icon = Array.from(button.children).find((child) =>
            child.matches('svg[data-library="ui-icons"]')
        );
        if (!icon) return false;

        const isUnlikedIcon = icon.classList.contains("fadeIn");
        const isLikedIcon = icon.classList.contains("tada");
        if (!isUnlikedIcon && !isLikedIcon) return false;

        // Prefer the standard pressed state if Garmin adds it in the future.
        const pressed = button.getAttribute("aria-pressed");
        if (pressed !== null) {
            return pressed === "false" && isUnlikedIcon;
        }

        // Garmin currently renders the heart as an SVG. The localized
        // aria-label changes with the site language, while these icon states do
        // not: fadeIn is the outlined (unliked) heart and tada is the filled
        // (liked) heart. Unknown states intentionally fail closed so an
        // existing kudo is never removed by accident.
        return isUnlikedIcon;
    }

    function findKudosButtons(root) {
        const base = root || document;
        const selector =
            '[class*="CommentLikeSection_socialButtonWrapper"] button';

        return Array.from(base.querySelectorAll(selector)).filter(
            isUnlikedKudosButton
        );
    }

    function createButton(container) {
        const label = getMessage("kudo_all", "Kudo All");
        const isTopHeader = isTopHeaderContainer(container);

        if (isTopHeader) {
            ensureStyles();

            const button = document.createElement("button");
            button.id = BTN_ID;
            button.type = "button";
            button.classList.add("gcw-top-header-button");
            button.setAttribute("aria-label", label);
            button.setAttribute("title", label);
            button.innerHTML = `
                <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                </svg>
            `;
            return button;
        }

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

        launchHeartBurst(event.currentTarget);

        if (kudoAllInProgress) return;

        const buttons = findKudosButtons();
        const len = buttons.length;
        if (len < 1) return;

        kudoAllInProgress = true;

        for (let i = 0; i < len; i++) {
            const button = buttons[i];
            if (button) button.click();
        }

        setTimeout(() => {
            kudoAllInProgress = false;
        }, 1200);
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

        const existing = document.getElementById(BTN_ID);
        const nav = findHeaderContainer();

        if (!nav) {
            if (
                existing &&
                !existing.classList.contains("gcw-floating") &&
                existing.getClientRects().length < 1
            ) {
                const existingMount = existing.closest(`#${MOUNT_ID}`);
                if (existingMount) {
                    existingMount.remove();
                } else {
                    existing.remove();
                }
            }

            // Header not in DOM yet (common with filters / SPA render)
            // Try fallback so user always has a button
            injectFloatingFallbackIfNeeded();
            return;
        }

        // If we previously injected fallback floating button, remove it and inject into header
        if (existing && existing.classList.contains("gcw-floating")) {
            existing.remove();
        }

        const mount = ensureMount(nav);
        if (!mount) return;

        // An existing header button remains usable after ensureMount has
        // validated and, if needed, repositioned its mount.
        const mountedButton = document.getElementById(BTN_ID);
        if (mountedButton && mount.contains(mountedButton)) return;
        if (mountedButton) mountedButton.remove();

        const button = createButton(nav);
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
