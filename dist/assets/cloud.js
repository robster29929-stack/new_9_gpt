(async () => {
  'use strict';
  const client = window.portalSupabase;
  const gate = document.getElementById('workspace-gate');
  const status = document.getElementById('cloud-status');
  const saveButton = document.getElementById('cloud-save');
  const exportButton = document.getElementById('cloud-backup');
  let conflict = false;
  const labels = {
    saved: 'บันทึกใน Supabase แล้ว', pending: 'มีข้อมูลรอบันทึก', saving: 'กำลังบันทึก…',
    error: 'บันทึกไม่สำเร็จ — ตรวจการเชื่อมต่อแล้วกดบันทึกอีกครั้ง',
    conflict: 'ข้อมูลถูกแก้จากหน้าต่างอื่น — ดาวน์โหลดสำรองก่อนโหลดหน้าใหม่'
  };
  function notify(kind) {
    status.textContent = labels[kind]; status.dataset.state = kind;
    if (kind === 'conflict') conflict = true;
    saveButton.disabled = kind === 'saving' || conflict;
    exportButton.hidden = !['error','conflict','pending'].includes(kind);
  }
  try {
    const { data: { session }, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) { location.replace('/login.html'); return; }
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user) { location.replace('/login.html'); return; }
    const persistence = new window.PortalPersistence({
      save: async (snapshot, expected) => {
        const { data, error } = await client.rpc('portal_save_workspace', { p_snapshot: snapshot, p_expected_revision: expected, p_user_id: user.id });
        if (error) throw error;
        return data;
      }, notify
    });
    const { data: current, error: readError } = await client.from('portal_workspaces').select('snapshot,revision').eq('user_id', user.id).maybeSingle();
    if (readError) throw readError;
    let snapshot, revision;
    if (current) { snapshot = current.snapshot; revision = current.revision; }
    else {
      const { data: seed, error: seedError } = await client.from('portal_seed').select('snapshot').eq('id', 'TEST_SEED_001').single();
      if (seedError) throw seedError;
      snapshot = seed.snapshot;
      const { data: created, error: createError } = await client.rpc('portal_save_workspace', { p_snapshot: snapshot, p_expected_revision: 0, p_user_id: user.id });
      if (createError) throw createError;
      revision = created;
    }
    window.portalApp.hydrate(snapshot);
    persistence.start(window.portalApp.snapshot(), revision);
    window.portalPersistence = persistence;
    document.getElementById('signed-in-email').textContent = user.email || 'บัญชีที่เข้าสู่ระบบ';
    document.body.dataset.cloudReady = 'true';
    gate.hidden = true;
    saveButton.addEventListener('click', async () => {
      persistence.changed(window.portalApp.snapshot());
      try { await persistence.retry(); } catch { /* visible save state describes the failure */ }
    });
    exportButton.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(window.portalApp.snapshot(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = 'TEST_workspace_unsaved_backup.json'; link.click();
      URL.revokeObjectURL(url);
    });
    document.getElementById('platform-logout').addEventListener('click', async (event) => {
      event.preventDefault();
      try {
        await persistence.flush();
        const { error } = await client.auth.signOut();
        if (error) throw error;
        location.replace('/login.html');
      } catch { status.textContent = 'ยังออกจากระบบไม่ได้: โปรดบันทึกหรือดาวน์โหลดข้อมูลที่ค้างก่อน'; }
    });
    window.addEventListener('beforeunload', event => {
      if (persistence.dirty) { event.preventDefault(); event.returnValue = ''; }
    });
    client.auth.onAuthStateChange((event, nextSession) => {
      if (nextSession && nextSession.user.id !== user.id) {
        persistence.blocked = true;
        document.body.removeAttribute('data-cloud-ready');
        gate.hidden = false; gate.textContent = 'บัญชีเปลี่ยนแล้ว กรุณาโหลดหน้านี้ใหม่';
      }
      if (event === 'SIGNED_OUT') {
        document.body.removeAttribute('data-cloud-ready');
        gate.hidden = false;
        gate.textContent = 'ออกจากระบบแล้ว กรุณาเข้าสู่ระบบใหม่';
        if (!persistence.dirty) location.replace('/login.html');
      }
    });
  } catch (error) {
    gate.textContent = 'เปิดพื้นที่ทำงานไม่สำเร็จ กรุณาลองโหลดหน้าใหม่ หากยังไม่ได้ ให้ตรวจฐานข้อมูลและสิทธิ์ Supabase';
    const link = document.createElement('a'); link.href = '/login.html'; link.textContent = 'กลับหน้าเข้าสู่ระบบ'; gate.appendChild(link);
    status.textContent = 'ยังไม่ได้เชื่อมพื้นที่ทำงาน';
    console.error('Workspace initialization failed', error.code || 'connection_error');
  }
})();
