/* One private TEST workspace per authenticated account; serialized CAS saves. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PortalPersistence = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  return class PortalPersistence {
    constructor({ save, notify = () => {}, delay = 400 }) {
      this.save = save; this.notify = notify; this.delay = delay;
      this.revision = 0; this.saved = ''; this.latest = ''; this.ready = false;
      this.blocked = false; this.inFlight = null; this.timer = null;
    }
    start(snapshot, revision) {
      this.saved = this.latest = JSON.stringify(snapshot); this.revision = revision; this.ready = true;
      this.notify('saved');
    }
    get dirty() { return this.ready && this.latest !== this.saved; }
    changed(snapshot) {
      if (!this.ready) return;
      this.latest = JSON.stringify(snapshot);
      if (!this.dirty || this.blocked) return;
      this.notify('pending'); clearTimeout(this.timer);
      this.timer = setTimeout(() => { this.flush().catch(() => {}); }, this.delay);
    }
    async flush() {
      clearTimeout(this.timer);
      if (!this.ready) return;
      if (this.blocked) throw new Error('Save is blocked; resolve the connection or revision conflict first');
      if (this.inFlight) { await this.inFlight; if (this.dirty) return this.flush(); return; }
      this.inFlight = (async () => {
        while (this.dirty && !this.blocked) {
          const serialized = this.latest; this.notify('saving');
          try {
            const next = await this.save(JSON.parse(serialized), this.revision);
            if (!Number.isSafeInteger(next) || next !== this.revision + 1) throw new Error('Invalid saved revision');
            this.revision = next; this.saved = serialized;
          } catch (error) {
            this.blocked = true;
            this.notify(error.code === '40001' || /revision_conflict/.test(error.message) ? 'conflict' : 'error');
            throw error;
          }
        }
        this.notify('saved');
      })();
      try { await this.inFlight; } finally { this.inFlight = null; if (!this.dirty) clearTimeout(this.timer); }
    }
    async retry() { this.blocked = false; await this.flush(); }
  };
});
