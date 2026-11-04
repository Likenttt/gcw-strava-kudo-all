const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const contentSource = fs.readFileSync(path.join(__dirname, '../src/kudoall.js'), 'utf8');
const instanceKey = '__gcwKudoAllInstance';

function createRuntime() {
    const state = { invalidated: false, added: 0, removalAttempts: 0, listeners: new Set() };
    const checkContext = () => {
        if (state.invalidated) throw new Error('Extension context invalidated.');
    };
    return {
        state,
        api: {
            getManifest() {
                checkContext();
                return { version: '1.5' };
            },
            onMessage: {
                addListener(listener) {
                    checkContext();
                    state.added++;
                    state.listeners.add(listener);
                },
                removeListener(listener) {
                    state.removalAttempts++;
                    checkContext();
                    state.listeners.delete(listener);
                },
            },
        },
    };
}

function createPage(runtime) {
    const window = { location: { hostname: 'example.com', pathname: '/' } };
    const context = vm.createContext({
        window,
        document: { getElementById: () => null, querySelectorAll: () => [] },
        clearTimeout,
        clearInterval,
    });
    const setRuntime = (nextRuntime) => {
        context.chrome = { runtime: nextRuntime.api };
        window.chrome = context.chrome;
    };
    setRuntime(runtime);
    return {
        window,
        setRuntime,
        inject: () => vm.runInContext(contentSource, context, { filename: 'kudoall.js' }),
    };
}

test('same-version reinjection reuses a live instance without registering another listener', () => {
    const runtime = createRuntime();
    const page = createPage(runtime);
    page.inject();
    const originalInstance = page.window[instanceKey];

    page.inject();

    assert.strictEqual(page.window[instanceKey], originalInstance);
    assert.equal(originalInstance.isActive(), true);
    assert.equal(runtime.state.added, 1);
    assert.equal(runtime.state.listeners.size, 1);
    assert.equal(runtime.state.removalAttempts, 0);
});

test('reinjection replaces an invalidated instance even when its old listener cannot be removed', () => {
    const oldRuntime = createRuntime();
    const page = createPage(oldRuntime);
    page.inject();
    const originalInstance = page.window[instanceKey];

    oldRuntime.state.invalidated = true;
    oldRuntime.state.listeners.clear();
    const freshRuntime = createRuntime();
    page.setRuntime(freshRuntime);
    assert.doesNotThrow(() => page.inject());

    const replacement = page.window[instanceKey];
    assert.notStrictEqual(replacement, originalInstance);
    assert.equal(originalInstance.isActive(), false);
    assert.equal(replacement.isActive(), true);
    assert.equal(oldRuntime.state.removalAttempts, 1);
    assert.equal(freshRuntime.state.added, 1);
    assert.equal(freshRuntime.state.listeners.size, 1);

    let response;
    const [listener] = freshRuntime.state.listeners;
    listener({ type: 'kudoall:status' }, {}, (value) => { response = value; });
    assert.equal(response.supported, false);
    assert.equal(response.running, false);
});
