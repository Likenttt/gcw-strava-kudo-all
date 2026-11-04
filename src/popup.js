(() => {
    const api = globalThis.browser || chrome;
    const element = (id) => document.getElementById(id);
    const message = (key) => api.i18n.getMessage(key) || key;
    let requestPending = false;
    let currentStatus = null;

    document.documentElement.lang = api.i18n.getUILanguage();
    document.querySelectorAll("[data-i18n]").forEach((node) => {
        node.textContent = message(node.dataset.i18n);
    });
    document.title = message("kudo_all");

    function render(status) {
        currentStatus = status;
        element("connection").textContent = message(status.connected ? "popup_connected" : "popup_disconnected");
        element("available").textContent = status.connected && status.supported ? String(status.available ?? 0) : "—";
        element("running").textContent = message(status.running ? "popup_yes" : "popup_no");
        element("confirmed").textContent = status.lastRun ? String(status.lastRun.confirmed ?? 0) : "—";
        element("unconfirmed").textContent = status.lastRun ? String(status.lastRun.unconfirmed ?? 0) : "—";
        let noticeKey = "popup_ready";
        if (status.errorCode === "unsupported" || !status.supported) noticeKey = "popup_unsupported";
        else if (status.errorCode === "request_failed" || status.errorCode === "reconnect_failed") noticeKey = "popup_request_failed";
        else if (!status.connected) noticeKey = "popup_not_connected";
        else if (status.running) noticeKey = "popup_in_progress";
        else if (!status.available) noticeKey = "popup_no_available";
        element("notice").textContent = status.connected && status.supported && typeof status.message === "string" && status.message
            ? status.message : message(noticeKey);
        element("run").disabled = requestPending || !status.connected || !status.supported || status.running || !status.available;
        element("reconnect").disabled = requestPending || !status.supported || status.running;
    }

    const reconnectingTabs = new Map();

    function isStravaDashboard(url) {
        try {
            const parsed = new URL(url);
            return parsed.protocol === "https:" &&
                /^(www\.)?strava\.com$/i.test(parsed.hostname) &&
                /^\/dashboard\/?$/.test(parsed.pathname);
        } catch (_) {
            return false;
        }
    }

    function disconnectedStatus(errorCode = "disconnected", supported = true) {
        return {
            site: "strava", supported, connected: false, available: 0,
            running: false, placement: null, errorCode,
        };
    }

    async function readContentStatus(tabId) {
        try {
            const status = await api.tabs.sendMessage(tabId, { type: "kudoall:status" }, { frameId: 0 });
            if (status?.site === "strava" && typeof status.supported === "boolean") {
                return { ...status, connected: true };
            }
        } catch (_) {
            // A missing receiver is expected after an extension update or page load.
        }
        return disconnectedStatus();
    }

    async function reconnectContent(tabId) {
        if (reconnectingTabs.has(tabId)) return reconnectingTabs.get(tabId);
        const pending = (async () => {
            // A working receiver must never be injected a second time.
            const current = await readContentStatus(tabId);
            if (current.connected) return current;
            const tab = await api.tabs.get(tabId);
            if (!isStravaDashboard(tab.url)) return disconnectedStatus("unsupported", false);
            try {
                await api.scripting.executeScript({ target: { tabId }, files: ["kudoall.js"] });
                const result = await readContentStatus(tabId);
                return result.connected ? result : disconnectedStatus("reconnect_failed");
            } catch (_) {
                return disconnectedStatus("reconnect_failed");
            }
        })();
        reconnectingTabs.set(tabId, pending);
        try {
            return await pending;
        } finally {
            reconnectingTabs.delete(tabId);
        }
    }

    async function handlePopupRequest(type) {
        const [tab] = await api.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id || !isStravaDashboard(tab.url)) return disconnectedStatus("unsupported", false);
        if (type === "kudoall:reconnect") return reconnectContent(tab.id);
        const status = await readContentStatus(tab.id);
        if (type !== "kudoall:popup-run" || !status.connected || !status.supported || status.running) return status;
        // Only a direct popup button click reaches this message.
        try {
            const result = await api.tabs.sendMessage(tab.id, { type: "kudoall:run" }, { frameId: 0 });
            return result?.site === "strava" ? { ...result, connected: true } : readContentStatus(tab.id);
        } catch (_) {
            return disconnectedStatus("request_failed");
        }
    }

    async function request(type) {
        if (requestPending) return;
        requestPending = true;
        if (currentStatus) render(currentStatus);
        try {
            const status = await handlePopupRequest(type);
            render(status || { supported: true, connected: false, errorCode: "request_failed" });
        } catch (_) {
            render({ supported: true, connected: false, errorCode: "request_failed" });
        } finally {
            requestPending = false;
            if (currentStatus) render(currentStatus);
        }
    }

    element("run").addEventListener("click", () => request("kudoall:popup-run"));
    element("reconnect").addEventListener("click", () => request("kudoall:reconnect"));
    request("kudoall:popup-status");
    setInterval(() => request("kudoall:popup-status"), 1000);
})();
