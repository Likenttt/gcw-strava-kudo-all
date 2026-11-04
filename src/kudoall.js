(() => {
"use strict";

const INSTANCE_KEY = "__gcwKudoAllInstance";
const INSTANCE_VERSION = "strava-resilience-v1";
const previousInstance = window[INSTANCE_KEY];
if (previousInstance && previousInstance.version === INSTANCE_VERSION &&
    typeof previousInstance.isActive === "function" && previousInstance.isActive()) {
    previousInstance.refresh();
    return;
}
if (previousInstance && typeof previousInstance.dispose === "function") {
    try {
        previousInstance.dispose();
    } catch (_) {
        // An invalidated extension context must not prevent a fresh connection.
    }
}
let disposed = false;

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
        getMessage: function () {
            return "";
        },
    };
}

function getMessage(messageName, fallback) {
    try {
        return _intl.getMessage(messageName) || fallback || messageName;
    } catch (err) {
        return fallback || messageName;
    }
}

// === Debug toggle ===
const DEBUG = false;
const log = (...args) => DEBUG && console.log("[KudoAll]", ...args);

// === Small utils ===
function debounce(fn, waitMs) {
    let t;
    const scheduled = function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), waitMs);
    };
    scheduled.cancel = () => clearTimeout(t);
    return scheduled;
}

function patchSpaNavigation(onChange) {
    window.addEventListener("gcw-locationchange", onChange);
    const removeListener = () =>
        window.removeEventListener("gcw-locationchange", onChange);
    // The shared event bridge survives a content-script version replacement.
    if (window.__gcwKudoAllHistoryPatched) return removeListener;
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

    return removeListener;
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
    const MOUNT_ID = "gcw-kudo-all-strava-mount";
    const STYLE_ID = "gcw-kudo-all-strava-style";
    const KUDOS_SELECTOR = "button[data-testid='kudos_button']";
    const UNFILLED_SELECTOR = "svg[data-testid='unfilled_kudos']";
    const FILLED_SELECTOR = "svg[data-testid='filled_kudos']";
    let observer;
    let removeNavigationListener;
    let ensureTimer;
    let running = false;
    let lastRun;
    let lastMessage;

    function onDashboard() {
        return isHostStrava() && /^\/dashboard\/?$/.test(location.pathname);
    }

    function isVisible(element) {
        if (!element || !element.isConnected || !element.getClientRects().length) {
            return false;
        }
        const style = getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden";
    }

    function getContainer() {
        const header = document.getElementById("global-header");
        const athleteMenu = header && header.querySelector("#athlete-menu");
        const userGroup = athleteMenu && athleteMenu.closest("nav > ul");
        if (userGroup && header.contains(userGroup) && isVisible(userGroup)) {
            return userGroup;
        }
        return Array.from(document.querySelectorAll(".user-nav.nav-group"))
            .find(isVisible) || null;
    }

    function isEligible(button) {
        return Boolean(
            button && button.isConnected && button.matches(KUDOS_SELECTOR) &&
            !button.disabled && button.getAttribute("aria-disabled") !== "true" &&
            button.querySelector(UNFILLED_SELECTOR) &&
            !button.querySelector(FILLED_SELECTOR)
        );
    }

    function findKudosButtons(root = document) {
        return Array.from(root.querySelectorAll(KUDOS_SELECTOR)).filter(isEligible);
    }

    function getKudosButtons() {
        const athleteLink = document.querySelector(
            "#athlete-profile a[href^='/athletes']"
        );
        const activities = Array.from(document.querySelectorAll(
            "div[data-testid='web-feed-entry']"
        ));
        if (!athleteLink || !activities.length) return findKudosButtons();

        const href = athleteLink.href
            .replace("https://www.strava.com", "")
            .replace("https://strava.com", "");
        const others = activities.filter((item) =>
            !Array.from(item.querySelectorAll("a[href]")).some((link) =>
                link.getAttribute("href").startsWith(href)
            )
        );
        return others.length ? others.flatMap(findKudosButtons) : findKudosButtons();
    }

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
            #${MOUNT_ID} { align-items: center; display: flex; list-style: none; margin: 0 10px 0 0; padding: 0; }
            #${BTN_ID} {
                all: initial; align-items: center; background: #fc4c02;
                border: 1px solid #d33f00; border-radius: 6px; box-sizing: border-box;
                color: #fff; cursor: pointer; display: inline-flex;
                font: 600 13px/1.2 system-ui, sans-serif; gap: 6px;
                min-height: 34px; padding: 8px 12px; white-space: nowrap;
            }
            #${BTN_ID}:hover { background: #d33f00; }
            #${BTN_ID}:focus-visible { outline: 2px solid #242428; outline-offset: 3px; }
            #${BTN_ID}:disabled { cursor: wait; opacity: .7; }
            #${BTN_ID} svg { flex: none; height: 16px; width: 16px; }
            #${BTN_ID}.gcw-strava-floating {
                bottom: 16px; box-shadow: 0 3px 14px #0003; position: fixed;
                right: 16px; z-index: 999999;
            }
        `;
        document.head.appendChild(style);
    }

    function updateButton() {
        const button = document.getElementById(BTN_ID);
        if (!button) return;
        const label = running
            ? getMessage("strava_running", "Giving kudos…")
            : getMessage("kudo_all", "Kudo All");
        const text = button.querySelector("span");
        if (text && text.textContent !== label) text.textContent = label;
        if (button.disabled !== running) button.disabled = running;
        if (button.getAttribute("aria-label") !== label) {
            button.setAttribute("aria-label", label);
            button.title = label;
        }
    }

    function createButton() {
        const button = document.createElement("button");
        button.id = BTN_ID;
        button.type = "button";
        button.innerHTML = `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M8 10V21H4V10H8ZM8 10L13 3C15 3 16 4 15 7L14 10H19C21 10 21 12 20 15L18 21H8" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg><span></span>`;
        button.addEventListener("click", (event) => {
            event.preventDefault();
            void run();
        });
        return button;
    }

    function removeButton() {
        const mount = document.getElementById(MOUNT_ID);
        if (mount) mount.remove();
        const button = document.getElementById(BTN_ID);
        if (button) {
            // Clean up the older content script's unmarked navigation wrapper.
            const oldWrapper = button.closest("li.nav-item");
            if (oldWrapper) oldWrapper.remove();
            else button.remove();
        }
    }

    function ensureButton() {
        if (disposed) return;
        if (!onDashboard()) {
            removeButton();
            return;
        }
        ensureStyles();
        const container = getContainer();
        let button = document.getElementById(BTN_ID);
        const mount = document.getElementById(MOUNT_ID);
        const correctPlacement = button && button.tagName === "BUTTON" && (
            container
                ? mount && mount.parentElement === container && mount.contains(button)
                : button.classList.contains("gcw-strava-floating") && button.parentElement === document.body
        );
        if (!correctPlacement) {
            removeButton();
            button = createButton();
            if (container) {
                const wrapper = document.createElement("li");
                wrapper.id = MOUNT_ID;
                wrapper.appendChild(button);
                container.prepend(wrapper);
            } else {
                button.classList.add("gcw-strava-floating");
                document.body.appendChild(button);
            }
        }
        updateButton();
    }

    function scheduleEnsure() {
        // Schedule from the first mutation; later changes cannot postpone it.
        if (disposed || ensureTimer !== undefined) return;
        ensureTimer = setTimeout(() => {
            ensureTimer = undefined;
            ensureButton();
        }, 200);
    }

    function status() {
        const supported = onDashboard();
        const available = supported ? getKudosButtons().length : 0;
        const button = document.getElementById(BTN_ID);
        const placement = supported && isVisible(button)
            ? button.classList.contains("gcw-strava-floating") ? "floating" : "header"
            : null;
        let message = getMessage("strava_unsupported", "Open the Strava dashboard to use Kudo All.");
        if (supported) {
            const recognized = document.querySelector(
                `${KUDOS_SELECTOR} ${UNFILLED_SELECTOR}, ${KUDOS_SELECTOR} ${FILLED_SELECTOR}`
            );
            const hasActivities = document.querySelector("[data-testid='web-feed-entry']");
            message = running
                ? getMessage("strava_running", "Giving kudos…")
                : lastMessage || (hasActivities && !recognized
                    ? getMessage("strava_structure_unknown", "Strava activity buttons were not recognized.")
                    : available
                        ? getMessage("strava_ready", "Ready to give kudos to loaded activities.")
                        : getMessage("strava_empty", "No eligible unliked activities found."));
        }
        return { site: "strava", supported, available, running, placement, message,
            ...(lastRun ? { lastRun: { ...lastRun } } : {}) };
    }

    const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function observeConfirmation(button) {
        const deadline = Date.now() + 1800;
        let filledSince;
        while (!disposed && onDashboard() && button.isConnected && Date.now() < deadline) {
            const filled = button.querySelector(FILLED_SELECTOR) &&
                !button.querySelector(UNFILLED_SELECTOR);
            if (filled) {
                if (filledSince === undefined) filledSince = Date.now();
                // This confirms a stable page state, not server persistence.
                if (Date.now() - filledSince >= 350) return true;
            } else {
                filledSince = undefined;
            }
            await pause(100);
        }
        return false;
    }

    async function run() {
        if (disposed || running || !onDashboard()) return status();
        const buttons = getKudosButtons();
        if (!buttons.length) return status();
        running = true;
        lastMessage = undefined;
        lastRun = { confirmed: 0, unconfirmed: 0, skipped: 0 };
        updateButton();
        try {
            for (let index = 0; index < buttons.length; index++) {
                if (disposed || !onDashboard()) {
                    lastRun.skipped += buttons.length - index;
                    lastMessage = getMessage("strava_run_stopped", "Run stopped because the page changed.");
                    break;
                }
                const button = buttons[index];
                if (!isEligible(button)) {
                    lastRun.skipped++;
                    continue;
                }
                try {
                    button.click();
                    if (await observeConfirmation(button)) lastRun.confirmed++;
                    else lastRun.unconfirmed++;
                } catch (err) {
                    lastRun.unconfirmed++;
                }
                if (lastRun.unconfirmed) {
                    lastRun.skipped += buttons.length - index - 1;
                    lastMessage = getMessage("strava_run_unconfirmed", "The page did not confirm this kudo. Remaining activities were skipped.");
                    break;
                }
                if (index + 1 < buttons.length) await pause(300);
            }
            if (!lastMessage) {
                lastMessage = getMessage("strava_run_complete", "Run finished. Confirmed counts reflect the page state.");
            }
        } catch (err) {
            lastMessage = getMessage("strava_run_error", "Kudo All could not finish. Please refresh and try again.");
        } finally {
            running = false;
            if (!disposed) ensureButton();
        }
        return status();
    }

    function init() {
        ensureButton();
        observer = new MutationObserver(scheduleEnsure);
        observer.observe(document.documentElement, { childList: true, subtree: true });
        removeNavigationListener = patchSpaNavigation(scheduleEnsure);
    }

    function dispose() {
        if (observer) observer.disconnect();
        if (removeNavigationListener) removeNavigationListener();
        clearTimeout(ensureTimer);
        removeButton();
        const style = document.getElementById(STYLE_ID);
        if (style) style.remove();
    }

    return { init, refresh: ensureButton, dispose, status, run };
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
    let observer;
    let retry;
    let retryTimeout;
    let removeNavigationListener;

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
        if (disposed || !isHostGarmin()) return;
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
        observer = new MutationObserver(scheduleEnsure);
        observer.observe(document.documentElement, { childList: true, subtree: true });

        removeNavigationListener = patchSpaNavigation(() => {
            // give the router/render a moment
            setTimeout(scheduleEnsure, 250);
        });

        // Safety retry for slow renders (especially after login/redirect)
        retry = setInterval(() => {
            ensureButton();
            if (document.getElementById(BTN_ID)) clearInterval(retry);
        }, 500);
        retryTimeout = setTimeout(() => clearInterval(retry), 15000);
    }

    function dispose() {
        if (observer) observer.disconnect();
        if (removeNavigationListener) removeNavigationListener();
        scheduleEnsure.cancel();
        clearInterval(retry);
        clearTimeout(retryTimeout);
        for (const id of [MOUNT_ID, BTN_ID, STYLE_ID]) {
            const element = document.getElementById(id);
            if (element) element.remove();
        }
        document.querySelectorAll(".gcw-heart-burst").forEach((burst) => burst.remove());
    }

    return { init, refresh: ensureButton, dispose };
})();

// =========================
// ========== INIT ==========
// =========================
const runtime = typeof chrome !== "undefined" && chrome.runtime
    ? chrome.runtime
    : typeof browser !== "undefined" ? browser.runtime : null;
const onMessage = (message, sender, sendResponse) => {
    const type = message && (message.type || message.action);
    if (type !== "kudoall:status" && type !== "kudoall:run") return false;
    if (isHostStrava()) {
        if (type === "kudoall:run") {
            Strava.refresh();
            void Strava.run();
        }
        sendResponse(Strava.status());
    } else {
        sendResponse({ site: isHostGarmin() ? "garmin" : null, supported: false,
            available: 0, running: false, placement: null });
    }
    return false;
};

window[INSTANCE_KEY] = {
    version: INSTANCE_VERSION,
    isActive() {
        if (disposed) return false;
        try {
            if (runtime) runtime.getManifest();
            return true;
        } catch (_) {
            return false;
        }
    },
    refresh() {
        if (disposed) return;
        if (isHostStrava()) Strava.refresh();
        else if (isHostGarmin()) GC.refresh();
    },
    dispose() {
        disposed = true;
        Strava.dispose();
        GC.dispose();
        try {
            if (runtime && runtime.onMessage) runtime.onMessage.removeListener(onMessage);
        } catch (_) {
            // Reloading an extension invalidates the old runtime API.
        }
        if (window[INSTANCE_KEY] === this) delete window[INSTANCE_KEY];
    },
};

if (runtime && runtime.onMessage) runtime.onMessage.addListener(onMessage);
if (isHostStrava()) Strava.init();
else if (isHostGarmin()) GC.init();
})();
