const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const vm = require('node:vm');
const moduleExports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/utils/stepDates.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: moduleExports });
const { getStepRange } = moduleExports;

test('daily step ranges follow Brussels DST and cap today at now', () => {
    const spring = getStepRange('2026-03-29', new Date('2026-03-30T12:00:00Z'));
    assert.equal(spring.start.toISOString(), '2026-03-28T23:00:00.000Z');
    assert.equal((spring.end - spring.start) / 3600000, 23);
    const autumn = getStepRange('2026-10-25', new Date('2026-10-26T12:00:00Z'));
    assert.equal((autumn.end - autumn.start) / 3600000, 25);
    const now = new Date('2026-09-26T14:30:00Z');
    const today = getStepRange('2026-09-26', now);
    assert.equal(today.start.toISOString(), '2026-09-25T22:00:00.000Z');
    assert.equal(today.end.toISOString(), now.toISOString());
});

test('rejects future dates and incomplete history older than seven days', () => {
    const now = new Date('2026-09-26T14:30:00Z');
    assert.throws(() => getStepRange('2026-09-27', now), /previous day/);
    assert.throws(() => getStepRange('2026-09-19', now), /seven days/);
    assert.doesNotThrow(() => getStepRange('2026-09-20', now));
});
