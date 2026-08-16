/**
 * Auth State Module — PCMB Interactive CET
 *
 * Single source of truth for the current authentication status.
 * All views and modules should read from this instead of calling Supabase directly.
 *
 * States:
 *   initializing  — session check in progress (show loading, never show app/auth yet)
 *   authenticated — user is signed in (show main app)
 *   unauthenticated — no session (show auth screen)
 *   error         — session check failed (show error, allow retry)
 *
 * Emits via Bus:
 *   auth:initialized  — first session check complete; data = { status, user, profile }
 *   auth:signed-in    — user signed in; data = { user, profile }
 *   auth:signed-out   — user signed out
 *   auth:error        — auth error occurred; data = { message }
 */

import { Bus } from "../state/store.js";
import { AuthService } from "./auth-service.js";

export const AUTH_STATUS = {
  INITIALIZING: "initializing",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated",
  ERROR: "error"
};

// ─── Internal state (module-level singleton) ─────────────────────────────────

let _status = AUTH_STATUS.INITIALIZING;
let _user = null;
let _profile = null;
let _unsubscribeAuthListener = null;

// ─── Public API ──────────────────────────────────────────────────────────────

export const AuthState = {
  /** Current status string */
  get status() { return _status; },

  /** Current Supabase user object or null */
  get user() { return _user; },

  /** Loaded profile row or null */
  get profile() { return _profile; },

  /** Whether the user is currently signed in */
  get isAuthenticated() { return _status === AUTH_STATUS.AUTHENTICATED; },

  /**
   * Initialize auth state. Called once at application startup.
   * Sets up the auth listener and performs the initial session check.
   */
  async initialize() {
    // Listen for auth state changes from Supabase
    _unsubscribeAuthListener = AuthService.listenForAuthChanges(
      async (event, session) => {
        await AuthState._handleAuthEvent(event, session);
      }
    );

    // The onAuthStateChange listener fires INITIAL_SESSION on mount,
    // so we don't need a separate getCurrentSession() call.
    // However we set a safety timeout in case it doesn't fire.
    setTimeout(() => {
      if (_status === AUTH_STATUS.INITIALIZING) {
        _status = AUTH_STATUS.UNAUTHENTICATED;
        Bus.emit("auth:initialized", { status: _status, user: null, profile: null });
      }
    }, 4000);
  },

  /**
   * Update the stored profile (e.g. after name change).
   */
  updateProfile(profile) {
    _profile = profile;
  },

  /**
   * Tear down the auth listener. Called when app unmounts (not typically needed
   * in an SPA but provided for completeness).
   */
  destroy() {
    if (_unsubscribeAuthListener) {
      _unsubscribeAuthListener();
      _unsubscribeAuthListener = null;
    }
  },

  // ─── Internal handler (exported for testing, not for external use) ──────────

  async _handleAuthEvent(event, session) {
    const prevStatus = _status;

    if (event === "SIGNED_OUT" || !session?.user) {
      _status = AUTH_STATUS.UNAUTHENTICATED;
      _user = null;
      _profile = null;

      if (prevStatus === AUTH_STATUS.AUTHENTICATED) {
        Bus.emit("auth:signed-out");
      } else if (prevStatus === AUTH_STATUS.INITIALIZING) {
        Bus.emit("auth:initialized", { status: _status, user: null, profile: null });
      }
      return;
    }

    // We have a user
    _user = session.user;
    _status = AUTH_STATUS.AUTHENTICATED;

    // Load profile (non-blocking for auth state, but we await before emitting)
    const profile = await AuthService.loadProfile(session.user.id);
    _profile = profile;

    if (event === "INITIAL_SESSION") {
      Bus.emit("auth:initialized", { status: _status, user: _user, profile: _profile });
    } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      Bus.emit("auth:signed-in", { user: _user, profile: _profile });
    } else if (event === "USER_UPDATED") {
      // Refresh profile
      const refreshed = await AuthService.loadProfile(session.user.id);
      _profile = refreshed;
      Bus.emit("auth:signed-in", { user: _user, profile: _profile });
    } else if (event === "PASSWORD_RECOVERY") {
      // User clicked password reset link — handled by auth-ui
      Bus.emit("auth:password-recovery", { user: _user });
    } else if (prevStatus === AUTH_STATUS.INITIALIZING) {
      // Fallback for any other event during init
      Bus.emit("auth:initialized", { status: _status, user: _user, profile: _profile });
    }
  }
};
