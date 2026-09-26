const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const vm = require('node:vm');

// Exercise the actual Zustand middleware with asynchronous device storage replaced in memory.
const disk = new Map();
const storage = {
    getItem: async (key) => disk.get(key) ?? null,
    setItem: async (key, value) => { await new Promise((r) => setTimeout(r, 2)); disk.set(key, value); },
    removeItem: async (key) => disk.delete(key),
};
function boot() {
    const module = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync('src/stores/scrapbook.ts', 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(code, { module, exports: module.exports, require: (id) => id === '@react-native-async-storage/async-storage' ? storage : require(id) });
    return module.exports.useScrapbook;
}
async function flush(store) {
    // A sentinel save waits for every preceding write in the store's queue.
    await store.persist.getOptions().storage.setItem('sentinel', { state: {}, version: 1 });
}
test('restores all media and transforms, isolates dates, and persists deletion/clear', async () => {
    let store = boot();
    await store.persist.rehydrate();
    const date = '2026-09-26';
    const collections = {
        textElements: [{ id: 't', text: 'A day to remember' }],
        imageElements: [{ id: 'i', uri: 'file:///photo.jpg', index: 3 }],
        stickerElements: [{ id: 's', sticker: { id: 'gif', source: { uri: 'https://example.com/a.gif' } } }],
        audioElements: [{ id: 'a', uri: 'file:///audio.m4a', duration: 12 }],
        videoElements: [{ id: 'v', uri: 'file:///video.mov' }],
    };
    for (const [key, items] of Object.entries(collections)) store.getState().update(date, key, items);
    store.getState().transform(date, 'image:i', { x: 42, y: -18, scale: 1.8, rotation: 0.6 });
    store.getState().update('2026-09-27', 'textElements', [{ id: 'next', text: 'Tomorrow' }]);
    const expected = JSON.stringify(store.getState().days);
    await flush(store);
    store = boot();
    assert.equal(Object.keys(store.getState().days).length, 0);
    await store.persist.rehydrate();
    assert.equal(JSON.stringify(store.getState().days), expected);
    store.getState().update(date, 'imageElements', []);
    await flush(store);
    store = boot();
    await store.persist.rehydrate();
    assert.equal(store.getState().days[date].imageElements.length, 0);
    assert.equal(store.getState().days[date].textElements[0].text, 'A day to remember');
    store.getState().clear(date);
    store.getState().transform(date, 'image:i', { x: 100, y: 0, scale: 1, rotation: 0 });
    await flush(store);
    store = boot();
    await store.persist.rehydrate();
    assert.equal(store.getState().days[date], undefined);
    assert.equal(store.getState().days['2026-09-27'].textElements[0].text, 'Tomorrow');
});

test('refreshes existing daily step cards without moving them or restoring deleted cards', async () => {
    let store = boot();
    await store.persist.rehydrate();
    const date = '2026-09-26';
    store.getState().update(date, 'textElements', [
        { id: 'old-steps', text: `👣 10 steps\nDaily steps · ${date}` },
        { id: 'new-steps', text: '20 steps', stepSource: 'daily' },
        { id: 'walk-steps', text: 'Walking session', stepSource: 'session' },
        { id: 'note', text: 'My own text' },
    ]);
    const transform = { x: 90, y: -20, scale: 2, rotation: 1.5 };
    store.getState().transform(date, 'text:old-steps', transform);
    store.getState().update('2026-09-25', 'textElements', [{ id: 'past-steps', text: 'Yesterday', stepSource: 'daily' }]);
    store.getState().refreshDailySteps(date, 3456, ['old-steps', 'new-steps', 'walk-steps', 'note']);
    const items = store.getState().days[date].textElements;
    assert.match(items[0].text, /3,456 steps/);
    assert.equal(items[0].stepSource, 'daily');
    assert.match(items[1].text, /3,456 steps/);
    assert.equal(items[2].text, 'Walking session');
    assert.equal(items[3].text, 'My own text');
    assert.equal(store.getState().days['2026-09-25'].textElements[0].text, 'Yesterday');
    assert.equal(JSON.stringify(store.getState().days[date].transforms['text:old-steps']), JSON.stringify(transform));
    await flush(store);
    store = boot();
    await store.persist.rehydrate();
    assert.match(store.getState().days[date].textElements[0].text, /3,456 steps/);
    store.getState().update(date, 'textElements', (items) => items.filter((item) => item.id !== 'old-steps'));
    store.getState().refreshDailySteps(date, 4000, ['old-steps']);
    assert.equal(store.getState().days[date].textElements.some((item) => item.id === 'old-steps'), false);
    store.getState().clear(date);
    store.getState().refreshDailySteps(date, 5000, ['new-steps']);
    assert.equal(store.getState().days[date], undefined);
    await flush(store);
});
