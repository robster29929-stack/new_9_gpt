const test = require('node:test');
const assert = require('node:assert/strict');
const Store = require('../dist/assets/persistence.js');
const doc = n => ({ schemaVersion: 1, n });

test('reload uses only confirmed server revision; changes during a save are queued', async () => {
  let release, called = false; const revisions = [];
  const store = new Store({ delay: 60000, save: async (snapshot, revision) => {
    revisions.push([snapshot.n, revision]);
    if (!called) { called = true; await new Promise(resolve => { release = resolve; }); }
    return revision + 1;
  }});
  store.start(doc(0), 2); store.changed(doc(1));
  const save = store.flush();
  store.changed(doc(2)); release(); await save;
  assert.deepEqual(revisions, [[1,2],[2,3]]);
  assert.equal(store.revision, 4); assert.equal(store.dirty, false);
});

test('a stale revision blocks further saves and retains the unsaved document', async () => {
  const notices=[]; let calls=0;
  const store = new Store({ delay:60000, notify: s => notices.push(s), save: async () => {
    calls++; throw Object.assign(new Error('revision_conflict'), {code:'40001'});
  }});
  store.start(doc(0), 1); store.changed(doc(1));
  await assert.rejects(store.flush(), /revision_conflict/);
  store.changed(doc(2));
  await assert.rejects(store.flush(), /blocked/);
  clearTimeout(store.timer);
  assert.equal(calls, 1); assert.equal(store.dirty, true);
  assert.equal(JSON.parse(store.latest).n, 2); assert.ok(notices.includes('conflict'));
});

test('network failure can retry without advancing the expected revision', async () => {
  let fail=true; const revisions=[];
  const store=new Store({delay:60000,save:async (_,r)=>{revisions.push(r);if(fail)throw Error('offline');return r+1;}});
  store.start(doc(0), 3); store.changed(doc(1));
  await assert.rejects(store.flush(), /offline/); assert.equal(store.revision,3);
  fail=false; await store.retry();
  assert.deepEqual(revisions,[3,3]); assert.equal(store.dirty,false);
});
