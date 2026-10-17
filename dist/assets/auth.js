(async () => {
  'use strict';
  const client = window.portalSupabase;
  const mode = document.body.dataset.authMode;
  const form = document.getElementById('auth-form');
  const message = document.getElementById('auth-message');
  const submit = form.querySelector('button[type=submit]');
  const text = (value, error = false) => { message.textContent = value; message.dataset.error = String(error); };
  let recoverySession = false;
  if (mode === 'reset') {
    submit.disabled = true;
    client.auth.onAuthStateChange(event => { if (event === 'PASSWORD_RECOVERY') { recoverySession = true; submit.disabled = false; } });
    const params = new URLSearchParams(location.search);
    if (params.has('token_hash') && ['recovery','invite'].includes(params.get('type'))) {
      const { error } = await client.auth.verifyOtp({ token_hash: params.get('token_hash'), type: params.get('type') });
      if (error) { text('ลิงก์ไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่', true); return; }
      recoverySession = true;
    }
    const { data, error } = await client.auth.getSession();
    if (!error && data.session) { recoverySession = true; submit.disabled = false; }
    else text('เปิดหน้านี้จากลิงก์ตั้งรหัสผ่านในอีเมลก่อน หากลิงก์หมดอายุให้ขอใหม่', true);
    history.replaceState(null, '', location.pathname);
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); submit.disabled = true;
    text('กำลังดำเนินการ…');
    const email = form.elements.email?.value.trim();
    const password = form.elements.password?.value;
    try {
      if (mode === 'login') {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        location.replace('/workspace.html'); return;
      }
      if (mode === 'signup') {
        if (password.length < 12) throw new Error('password_short');
        const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + '/login.html' } });
        if (error) throw error;
        if (data.session) { location.replace('/workspace.html'); return; }
        text('กรุณาตรวจอีเมลเพื่อยืนยันบัญชี แล้วกลับมาเข้าสู่ระบบ หากมีบัญชีแล้วให้ใช้หน้าลืมรหัสผ่าน');
      }
      if (mode === 'forgot') {
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/reset-password.html' });
        if (error) throw error;
        text('หากอีเมลนี้มีบัญชี ระบบจะส่งลิงก์ตั้งรหัสผ่านให้ กรุณาตรวจกล่องจดหมายและสแปม');
      }
      if (mode === 'reset') {
        if (!recoverySession) throw new Error('recovery_required');
        if (password.length < 12) throw new Error('password_short');
        if (password !== form.elements.confirmPassword.value) throw new Error('password_mismatch');
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        text('บันทึกรหัสผ่านใหม่แล้ว กำลังออกจากระบบเพื่อให้เข้าสู่ระบบอีกครั้ง');
        const { error: signoutError } = await client.auth.signOut();
        if (signoutError) throw signoutError;
        location.replace('/login.html'); return;
      }
    } catch (error) {
      const messages = {
        password_short: 'ใช้รหัสผ่านอย่างน้อย 12 ตัวอักษร',
        password_mismatch: 'รหัสผ่านทั้งสองช่องไม่ตรงกัน',
        recovery_required: 'กรุณาเปิดลิงก์ตั้งรหัสผ่านจากอีเมล',
        invalid_credentials: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        email_not_confirmed: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ',
        over_email_send_rate_limit: 'ส่งอีเมลถี่เกินไป กรุณารอสักครู่แล้วลองใหม่',
        email_address_not_authorized: 'ผู้ส่งอีเมลของโปรเจกต์ยังไม่อนุญาตผู้รับนี้ กรุณาให้ผู้ดูแลตั้งค่า SMTP'
      };
      text(messages[error.code || error.message] || 'ดำเนินการไม่สำเร็จ กรุณาตรวจข้อมูล การเชื่อมต่อ หรือให้ผู้ดูแลตรวจการตั้งค่า Supabase Auth', true);
    } finally { submit.disabled = false; }
  });
})();
