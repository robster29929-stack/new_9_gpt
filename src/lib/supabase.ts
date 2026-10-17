import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import defaults from "../../config/supabase.public.json";
let client: SupabaseClient | undefined;
export function getSupabase() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || defaults.supabaseUrl;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      defaults.supabasePublishableKey;
    if (!url.startsWith("https://") || !key.startsWith("sb_publishable_"))
      throw new Error("การตั้งค่าบัญชีไม่สมบูรณ์");
    client = createClient(url, key);
  }
  return client;
}
