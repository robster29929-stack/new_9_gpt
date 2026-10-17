import type { NextConfig } from "next";
import defaults from "./config/supabase.public.json";
const publicUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  defaults.supabaseUrl;
const publicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  defaults.supabasePublishableKey;
if (
  !/^https:\/\/[^/]+\.supabase\.co\/?$/.test(publicUrl) ||
  !publicKey.startsWith("sb_publishable_")
)
  throw new Error(
    "Supabase public configuration is invalid; use a project URL and publishable key only",
  );
const config: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: publicUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publicKey,
  },
  poweredByHeader: false,
  async redirects() {
    return [
      ...[
        "login",
        "signup",
        "forgot-password",
        "reset-password",
        "workspace",
      ].map((page) => ({
        source: `/${page}.html`,
        destination: `/${page}`,
        permanent: false,
      })),
      {
        source: "/workspace/pali",
        destination: "/workspace/learning",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default config;
