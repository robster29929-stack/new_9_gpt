(() => {
  'use strict';
  const config = window.PORTAL_CONFIG;
  if (!config || !window.createPortalClient) throw new Error('Missing Supabase configuration');
  window.portalSupabase = window.createPortalClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
})();
