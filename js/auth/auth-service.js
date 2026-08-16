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

export class AuthService {
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

      if (error) return { data: null, error: AuthService._humanizeError(error) };

      // Upsert profile as a client-side safety net
      if (data.user) {
        await AuthService._ensureProfile(data.user, name.trim());
      }

      return { data, error: null };
    } catch (err) {
      console.error("[AuthService.signUp]", err);
      return { data: null, error: "Something went wrong during sign up. Please try again." };
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

      if (error) return { data: null, error: AuthService._humanizeError(error) };
      return { data, error: null };
    } catch (err) {
      console.error("[AuthService.signIn]", err);
      return { data: null, error: "Something went wrong during sign in. Please try again." };
    }
  }

  /**
   * Sign out the current user.
   * This clears the Supabase session from localStorage and memory.
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[AuthService.signOut]", error);
        // Still return success to allow UI cleanup even if network failed
      }
      return { error: null };
    } catch (err) {
      console.error("[AuthService.signOut]", err);
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
      if (error) return { data: null, error: AuthService._humanizeError(error) };
      return { data, error: null };
    } catch (err) {
      console.error("[AuthService.resetPassword]", err);
      return { data: null, error: "Failed to send reset email. Please try again." };
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
      if (error) return { data: null, error: AuthService._humanizeError(error) };
      return { data, error: null };
    } catch (err) {
      console.error("[AuthService.signInWithGoogle]", err);
      return { data: null, error: "Google sign-in is not available right now." };
    }
  }

  /**
   * Get the currently authenticated user synchronously from the cached session.
   * Returns null if no session exists.
   */
  static getCurrentUser() {
    const session = supabase.auth.session?.();
    return session?.user ?? null;
  }

  /**
   * Get the current session asynchronously (checks storage + refreshes if needed).
   */
  static async getCurrentSession() {
    try {
      const { data } = await supabase.auth.getSession();
      return data?.session ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Get the current user asynchronously (from live session).
   */
  static async getUser() {
    try {
      const { data } = await supabase.auth.getUser();
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
      callback(event, session);
    });
    // Return unsubscribe function
    return () => data.subscription?.unsubscribe();
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

      return { error: error ? AuthService._humanizeError(error) : null };
    } catch (err) {
      console.error("[AuthService.updateProfileName]", err);
      return { error: "Failed to update profile." };
    }
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  /**
   * Upsert a profile row. Called after sign-up as a client-side safety net
   * in case the database trigger hasn't been installed yet.
   */
  static async _ensureProfile(user, displayName) {
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
  }

  /**
   * Convert Supabase/PostgreSQL error messages into student-friendly copy.
   */
  static _humanizeError(error) {
    const msg = (error?.message || "").toLowerCase();

    if (msg.includes("invalid login credentials") || msg.includes("invalid email or password")) {
      return "Incorrect email or password. Please try again.";
    }
    if (msg.includes("email already registered") || msg.includes("user already registered")) {
      return "An account with this email already exists. Please sign in instead.";
    }
    if (msg.includes("password should be at least")) {
      return "Password must be at least 6 characters long.";
    }
    if (msg.includes("rate limit") || msg.includes("too many requests")) {
      return "Too many attempts. Please wait a moment before trying again.";
    }
    if (msg.includes("email not confirmed")) {
      return "Please verify your email address before signing in. Check your inbox.";
    }
    if (msg.includes("network") || msg.includes("fetch")) {
      return "Network error. Please check your connection and try again.";
    }
    if (msg.includes("invalid email")) {
      return "Please enter a valid email address.";
    }

    // Generic fallback — don't show raw Supabase/Postgres errors to students
    console.error("[AuthService] Raw error:", error);
    return "Something went wrong. Please try again.";
  }
}
