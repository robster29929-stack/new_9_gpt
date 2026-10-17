import type { NextConfig } from 'next';

// Read-only migration preview. Switch to server deployment only after canonical
// schema, dev authorization, settings, RLS and audited actions are verified.
const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.PORTAL_BASE_PATH ?? '',
  poweredByHeader: false,
  images: { unoptimized: true },
};
export default config;
