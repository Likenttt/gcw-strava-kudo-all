const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const popupSource = fs.readFileSync(path.join(__dirname, '../src/popup.js'), 'utf8');
const flush = () => new Promise((resolve) => setImmediate(resolve));

function createBrowser({ url = 'https://www.strava.com/dashboard', connected = true } = {}) {
    const state = {
        url, connected,
        content: { site: 'strava', supported: true, available: 3, running: false, placement: 'header' },
        sent: [], injected: [],
    };
    const api = {
        i18n: { getUILanguage: () => 'en-US', getMessage: (key) => key },
        tabs: {
            query: async () => [{ id: 7, url: state.url }],
            get: async () => ({ id: 7, url: state.url }),
            sendMessage: async (tabId, request, options) => {
                assert.equal(tabId, 7);
                assert.equal(options.frameId, 0);
                state.sent.push(request.type);
                if (!state.connected) throw new Error('No receiving end');
                if (request.type === 'kudoall:run') state.content.running = true;
                return { ...state.content };
            },
        },
        scripting: {
            executeScript: async (options) => {
                state.injected.push(options);
                state.connected = true;
            },
        },
    };
    return { state, api };
}

async function openPopup(browser) {
    const nodes = new Map();
    const intervals = [];
    const getNode = (id) => {
        if (!nodes.has(id)) {
            nodes.set(id, {
                textContent: '', disabled: false, listeners: {},
                addEventListener(type, callback) { this.listeners[type] = callback; },
            });
        }
        return nodes.get(id);
    };
    vm.runInNewContext(popupSource, {
        chrome: browser.api, URL,
        document: { documentElement: {}, getElementById: getNode, querySelectorAll: () => [] },
        setInterval: (callback) => intervals.push(callback),
    }, { filename: 'popup.js' });
    await flush();
    return {
        node: getNode,
        click: async (id) => { await getNode(id).listeners.click(); await flush(); },
        poll: async () => { await intervals[0](); await flush(); },
    };
}

test('opening and polling the popup only read status, even when disconnected', async () => {
    for (const connected of [true, false]) {
        const browser = createBrowser({ connected });
        const popup = await openPopup(browser);
        await popup.poll();
        await popup.poll();
        assert.deepEqual(browser.state.sent, Array(3).fill('kudoall:status'));
        assert.equal(browser.state.injected.length, 0);
        assert.equal(popup.node('connection').textContent, connected ? 'popup_connected' : 'popup_disconnected');
    }
});

test('unsupported URLs cannot reconnect or run scripts', async () => {
    for (const url of [
        'https://example.com/dashboard',
        'https://www.strava.com.evil.example/dashboard',
        'http://www.strava.com/dashboard',
        'https://www.strava.com/athletes/123',
    ]) {
        const browser = createBrowser({ url, connected: false });
        const popup = await openPopup(browser);
        assert.equal(popup.node('reconnect').disabled, true);
        // Invoke the handler directly too: the URL guard must enforce the rule independently of the UI.
        await popup.click('reconnect');
        await popup.click('run');
        assert.equal(browser.state.injected.length, 0);
        assert.deepEqual(browser.state.sent, []);
        assert.equal(popup.node('notice').textContent, 'popup_unsupported');
    }
});

test('explicit reconnect injects once and reuses the connected content script', async () => {
    const browser = createBrowser({ connected: false });
    const popup = await openPopup(browser);
    assert.equal(popup.node('run').disabled, true);
    assert.equal(popup.node('reconnect').disabled, false);
    await popup.click('reconnect');
    assert.equal(browser.state.injected.length, 1);
    assert.equal(browser.state.injected[0].target.tabId, 7);
    assert.deepEqual(Array.from(browser.state.injected[0].files), ['kudoall.js']);
    assert.equal(popup.node('connection').textContent, 'popup_connected');
    assert.equal(popup.node('run').disabled, false);
    await popup.click('reconnect');
    await popup.poll();
    assert.equal(browser.state.injected.length, 1);
    assert.equal(browser.state.sent.filter((type) => type === 'kudoall:run').length, 0);
});

test('run requires an explicit click and a running operation is not started twice', async () => {
    const browser = createBrowser();
    const popup = await openPopup(browser);
    assert.equal(browser.state.sent.includes('kudoall:run'), false);
    await popup.click('run');
    assert.equal(browser.state.sent.filter((type) => type === 'kudoall:run').length, 1);
    assert.equal(popup.node('running').textContent, 'popup_yes');
    assert.equal(popup.node('run').disabled, true);
    await popup.poll();
    await popup.click('run');
    assert.equal(browser.state.sent.filter((type) => type === 'kudoall:run').length, 1);
    assert.equal(browser.state.injected.length, 0);
});

test('a reopened popup reads the page running state and last result without rerunning', async () => {
    const browser = createBrowser();
    const first = await openPopup(browser);
    await first.click('run');
    const runningPopup = await openPopup(browser);
    assert.equal(runningPopup.node('running').textContent, 'popup_yes');
    assert.equal(runningPopup.node('run').disabled, true);
    browser.state.content.running = false;
    browser.state.content.lastRun = { confirmed: 2, unconfirmed: 1, skipped: 0 };
    const completedPopup = await openPopup(browser);
    assert.equal(completedPopup.node('confirmed').textContent, '2');
    assert.equal(completedPopup.node('unconfirmed').textContent, '1');
    assert.equal(completedPopup.node('running').textContent, 'popup_no');
    assert.equal(browser.state.sent.filter((type) => type === 'kudoall:run').length, 1);
    assert.equal(browser.state.injected.length, 0);
});
