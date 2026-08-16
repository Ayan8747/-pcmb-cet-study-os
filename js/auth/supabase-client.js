/**
 * Supabase Client Singleton for PCMB Interactive CET
 *
 * Uses the official Supabase JS v2 ESM bundle via CDN.
 * No build step required — works directly in the browser with ES modules.
 *
 * The `supabase` export is a single shared instance used across the entire app.
 * Import it from here — never create a second client.
 */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../config.js";

/**
 * Check whether the config has been filled in with real credentials.
 * If not, log a clear instruction rather than throwing a cryptic error.
 */
const isConfigured =
  SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
  SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY" &&
  SUPABASE_URL.startsWith("https://");

if (!isConfigured) {
  console.warn(
    "[PCMB Auth] Supabase credentials not configured.\n" +
    "Open js/config.js and fill in your Supabase project URL and anon key.\n" +
    "The app will still work in local-only mode."
  );
}

/**
 * The shared Supabase client.
 * When credentials are not configured, we still create a client (with placeholder
 * values) so imports don't fail — all operations will return errors gracefully.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Persist the session across page reloads using localStorage
    persistSession: true,
    // Auto-refresh the JWT before it expires
    autoRefreshToken: true,
    // Detect session from URL hash (needed for password reset + OAuth)
    detectSessionInUrl: true,
    storageKey: "pcmb_cet_auth_session"
  }
});

export { isConfigured };
