const WELCOME_PAGE_URL = "https://kudoall.li2niu.com/welcome/";

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason !== "install" && details.reason !== "update") return;

    const version = chrome.runtime.getManifest().version;
    const url = new URL(WELCOME_PAGE_URL);
    url.searchParams.set("version", version);
    url.searchParams.set("reason", details.reason);
    url.searchParams.set("source", "extension");

    chrome.tabs.create({ url: url.toString() });
});
