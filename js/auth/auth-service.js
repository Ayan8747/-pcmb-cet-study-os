/**
 * Auth Service — PCMB Interactive CET
 *
 * Central authentication operations. All other modules call this service
 * rather than touching the Supabase client directly. This keeps auth logic
 * in one place and makes it easy to swap providers in the future.
 *
 * Methods:
 *   signUp(name, email, password) → { data, error }
 *   signIn(email, password)       → { data, error }
 *   signOut()                     → { error }
 *   resetPassword(email)          → { data, error }
 *   signInWithGoogle()            → { data, error }
 *   getCurrentUser()              → User | null
 *   getCurrentSession()           → Session | null
 *   listenForAuthChanges(cb)      → unsubscribe fn
 */

import { supabase } from "./supabase-client.js";
import { SUPABASE_URL } from "../config.js";

export class AuthService {
  static _cachedUser = null;

  /**
   * Create a new account.
   * Also stores the user's display name in auth metadata and creates a profile row.
   * Profile creation is handled by the database trigger in the SQL migration.
   * We also upsert here as a fallback for projects without the trigger.
   */
  static async signUp(name, email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim()
          }
        }
      });

      if (error) return { data: null, error: AuthService._humanizeError(error, "signUp") };

      if (data?.user) {
        AuthService._cachedUser = data.user;
        await AuthService._ensureProfile(data.user, name.trim());
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: AuthService._humanizeError(err, "signUp") };
    }
  }

  /**
   * Sign in with email and password.
   */
  static async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) return { data: null, error: AuthService._humanizeError(error, "signIn") };
      
      if (data?.user) {
        AuthService._cachedUser = data.user;
      }
      return { data, error: null };
    } catch (err) {
      return { data: null, error: AuthService._humanizeError(err, "signIn") };
    }
  }

  /**
   * Sign out the current user.
   * This clears the Supabase session from localStorage and memory.
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      AuthService._cachedUser = null;
      if (error) {
        console.error("[AuthService.signOut] Error during sign out:", error);
        // Still return success to allow UI cleanup even if network failed
      }
      return { error: null };
    } catch (err) {
      console.error("[AuthService.signOut] Exception during sign out:", err);
      AuthService._cachedUser = null;
      return { error: null }; // Treat sign-out as always succeeding locally
    }
  }

  /**
   * Send a password reset email.
   */
  static async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: window.location.origin + window.location.pathname + "#reset-password"
        }
      );
      if (error) return { data: null, error: AuthService._humanizeError(error, "resetPassword") };
      return { data, error: null };
    } catch (err) {
      return { data: null, error: AuthService._humanizeError(err, "resetPassword") };
    }
  }

  /**
   * Sign in with Google OAuth.
   * This is a redirect-based flow — the user will leave and return to the page.
   * Works only if Google OAuth is configured in the Supabase dashboard.
   */
  static async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + window.location.pathname
        }
      });
      if (error) return { data: null, error: AuthService._humanizeError(error, "signInWithGoogle") };
      return { data, error: null };
    } catch (err) {
      return { data: null, error: AuthService._humanizeError(err, "signInWithGoogle") };
    }
  }

  /**
   * Get the currently authenticated user synchronously from cache.
   * Returns null if no user is cached.
   */
  static getCurrentUser() {
    return AuthService._cachedUser;
  }

  /**
   * Get the current session asynchronously (checks storage + refreshes if needed).
   */
  static async getCurrentSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn("[AuthService.getCurrentSession] Warning:", error.message);
        return null;
      }
      if (data?.session?.user) {
        AuthService._cachedUser = data.session.user;
      }
      return data?.session ?? null;
    } catch (err) {
      console.warn("[AuthService.getCurrentSession] Exception:", err);
      return null;
    }
  }

  /**
   * Get the current user asynchronously (from live session).
   */
  static async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        return null;
      }
      if (data?.user) {
        AuthService._cachedUser = data.user;
      }
      return data?.user ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Subscribe to auth state changes.
   * The callback receives (event, session).
   * Returns an unsubscribe function.
   *
   * Events: INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED,
   *         USER_UPDATED, PASSWORD_RECOVERY
   */
  static listenForAuthChanges(callback) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        AuthService._cachedUser = session.user;
      } else if (event === "SIGNED_OUT") {
        AuthService._cachedUser = null;
      }
      callback(event, session);
    });
    return () => data?.subscription?.unsubscribe();
  }

  /**
   * Load or create the user's profile row in the `profiles` table.
   */
  static async loadProfile(userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = "no rows returned" — not an error in this context
        console.warn("[AuthService.loadProfile] Unexpected error:", error);
      }

      return data ?? null;
    } catch (err) {
      console.error("[AuthService.loadProfile]", err);
      return null;
    }
  }

  /**
   * Update the user's profile display name.
   */
  static async updateProfileName(userId, fullName) {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq("id", userId);

      return { error: error ? AuthService._humanizeError(error, "updateProfileName") : null };
    } catch (err) {
      return { error: AuthService._humanizeError(err, "updateProfileName") };
    }
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  /**
   * Upsert a profile row. Called after sign-up as a client-side safety net
   * in case the database trigger hasn't been installed yet.
   */
  static async _ensureProfile(user, displayName) {
    try {
      const name = displayName ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "MHT-CET Aspirant";

      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: name,
        email: user.email,
        updated_at: new Date().toISOString()
      }, { onConflict: "id" });
    } catch (err) {
      console.warn("[AuthService._ensureProfile] Profile upsert warning:", err);
    }
  }

  /**
   * Log detailed diagnostic information to browser console and convert error into student-friendly copy.
   * Exposes error details (message, status, code, name, target host) without revealing secrets.
   */
  static _humanizeError(error, context = "Auth") {
    const rawMsg = error?.message || error?.msg || error?.error_description || (typeof error === "string" ? error : "");
    const msg = rawMsg.toLowerCase();
    const status = error?.status || error?.statusCode || error?.code || null;
    const code = error?.error_code || error?.code || null;
    const name = error?.name || "AuthError";

    // Structured diagnostic logging for developer / browser console
    console.error(`[AuthService.${context}] Diagnostic Log:`, {
      message: rawMsg,
      name,
      status,
      code,
      targetUrl: SUPABASE_URL,
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      rawError: error
    });

    // 1. Genuine client offline check
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return "You appear to be offline. Please check your internet connection and try again.";
    }

    // 2. Network / DNS / Host Unreachable check (Failed to fetch, ENOTFOUND, network errors when online)
    if (
      msg.includes("failed to fetch") ||
      msg.includes("networkerror") ||
      msg.includes("fetch failed") ||
      name === "AuthRetryableFetchError" ||
      (name === "TypeError" && msg.includes("fetch"))
    ) {
      const urlHost = (() => {
        try { return new URL(SUPABASE_URL).hostname; } catch { return SUPABASE_URL; }
      })();
      return `Unable to reach Supabase project server (${urlHost}). Please verify that your Supabase project is active or check SUPABASE_URL in js/config.js.`;
    }

    // 3. Provider not enabled / Unsupported provider error
    if (
      msg.includes("unsupported provider") ||
      msg.includes("provider is not enabled") ||
      (code === "validation_failed" && msg.includes("provider"))
    ) {
      if (context === "signInWithGoogle") {
        return "Google sign-in is not enabled in your Supabase project. Please enable the Google provider in your Supabase Dashboard under Authentication → Providers → Google, or sign in using Email & Password.";
      }
      if (context === "signIn" || context === "signUp") {
        return "Email authentication is not enabled in your Supabase project. Please enable the Email provider in your Supabase Dashboard under Authentication → Providers → Email.";
      }
      return "The requested authentication provider is not enabled in your Supabase Dashboard settings.";
    }

    // 4. Specific Supabase authentication error codes & messages
    if (msg.includes("invalid login credentials") || msg.includes("invalid email or password") || code === "invalid_credentials") {
      return "Incorrect email or password. Please try again.";
    }
    if (msg.includes("email already registered") || msg.includes("user already registered") || msg.includes("user_already_exists")) {
      return "An account with this email already exists. Please sign in instead.";
    }
    if (msg.includes("password should be at least")) {
      return "Password must be at least 6 characters long.";
    }
    if (msg.includes("rate limit") || msg.includes("too many requests") || status === 429) {
      return "Too many attempts. Please wait a moment before trying again.";
    }
    if (msg.includes("email not confirmed")) {
      return "Please verify your email address before signing in. Check your inbox.";
    }
    if (msg.includes("invalid email") || msg.includes("email address is invalid")) {
      return "Please enter a valid email address.";
    }
    if (status === 401 || status === 403 || msg.includes("invalid api key") || msg.includes("apikey")) {
      return "Supabase API key or project configuration error. Please check your settings.";
    }

    // 5. Fallback for other errors — display specific message if safe, otherwise humanized default
    if (rawMsg && !rawMsg.includes("http") && rawMsg.length < 120) {
      return rawMsg;
    }

    return "Authentication failed. Please check the browser console for diagnostic details.";
  }
}


