/**
 * Auth UI — PCMB Interactive CET
 *
 * Renders the authentication screen (sign in / sign up / forgot password)
 * directly into the main view container.
 *
 * Design: matches the existing warm ivory academic aesthetic.
 * Uses existing CSS design tokens from design-tokens.css.
 * Auth-specific styles are in css/auth.css.
 */

import { AuthService } from "./auth-service.js";
import { Store } from "../state/store.js";

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Render the full authentication screen.
 * @param {HTMLElement} container — the main view container
 * @param {Object} options
 * @param {string} [options.mode] — 'signin' | 'signup' | 'forgot' (default: 'signin')
 */
export function renderAuthView(container, options = {}) {
  let mode = options.mode || "signin";

  function render() {
    container.innerHTML = `
      <div class="auth-outer">
        <div class="auth-card">

          <!-- Brand Header -->
          <div class="auth-brand">
            <div class="auth-brand-badge">CET</div>
            <div>
              <div class="auth-brand-name">PCMB Interactive</div>
              <div class="auth-brand-tagline">Learn · Visualize · Practice · Master</div>
            </div>
          </div>

          <!-- Form Area -->
          <div id="auth-form-area">
            ${mode === "signin" ? renderSignInForm() : ""}
            ${mode === "signup" ? renderSignUpForm() : ""}
            ${mode === "forgot" ? renderForgotForm() : ""}
          </div>

        </div>
      </div>
    `;

    bindFormEvents();
  }

  function renderSignInForm() {
    return `
      <h2 class="auth-title">Welcome back</h2>
      <p class="auth-subtitle">Sign in to your account to continue studying</p>

      <!-- Google OAuth button -->
      <button class="auth-google-btn" id="auth-google-btn">
        <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
          <path d="M6.3 14.7l7 5.1C15.1 16.5 19.2 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" fill="#FF3D00"/>
          <path d="M24 46c5.5 0 10.5-1.9 14.4-5.1l-6.7-5.5C29.5 37 26.9 38 24 38c-6.1 0-11.3-4.1-13.2-9.7l-7 5.4C7.5 42.1 15.2 46 24 46z" fill="#4CAF50"/>
          <path d="M44.5 20H24v8.5h11.8c-.8 2.3-2.3 4.2-4.2 5.6l6.7 5.5C41.8 36.4 44.5 30.7 44.5 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
        </svg>
        Continue with Google
      </button>

      <div class="auth-divider"><span>or sign in with email</span></div>

      <form id="auth-signin-form" novalidate>
        <div class="auth-field">
          <label class="auth-label" for="signin-email">Email address</label>
          <input
            type="email"
            id="signin-email"
            class="auth-input"
            placeholder="you@example.com"
            autocomplete="email"
            required
          >
        </div>

        <div class="auth-field">
          <div class="auth-label-row">
            <label class="auth-label" for="signin-password">Password</label>
            <button type="button" class="auth-link-btn" id="go-forgot">Forgot password?</button>
          </div>
          <input
            type="password"
            id="signin-password"
            class="auth-input"
            placeholder="Your password"
            autocomplete="current-password"
            required
          >
        </div>

        <div id="auth-error-msg" class="auth-error" style="display:none;"></div>

        <button type="submit" class="auth-submit-btn" id="auth-submit-btn">
          Sign In
        </button>
      </form>

      <p class="auth-switch-text">
        Don't have an account?
        <button class="auth-link-btn" id="go-signup">Create free account</button>
      </p>
    `;
  }

  function renderSignUpForm() {
    return `
      <h2 class="auth-title">Create your account</h2>
      <p class="auth-subtitle">Start your MHT-CET preparation journey</p>

      <!-- Google OAuth button -->
      <button class="auth-google-btn" id="auth-google-btn">
        <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 37 2 2 11.8 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
          <path d="M6.3 14.7l7 5.1C15.1 16.5 19.2 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" fill="#FF3D00"/>
          <path d="M24 46c5.5 0 10.5-1.9 14.4-5.1l-6.7-5.5C29.5 37 26.9 38 24 38c-6.1 0-11.3-4.1-13.2-9.7l-7 5.4C7.5 42.1 15.2 46 24 46z" fill="#4CAF50"/>
          <path d="M44.5 20H24v8.5h11.8c-.8 2.3-2.3 4.2-4.2 5.6l6.7 5.5C41.8 36.4 44.5 30.7 44.5 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
        </svg>
        Continue with Google
      </button>

      <div class="auth-divider"><span>or sign up with email</span></div>

      <form id="auth-signup-form" novalidate>
        <div class="auth-field">
          <label class="auth-label" for="signup-name">Full name</label>
          <input
            type="text"
            id="signup-name"
            class="auth-input"
            placeholder="Your full name"
            autocomplete="name"
            required
          >
        </div>

        <div class="auth-field">
          <label class="auth-label" for="signup-email">Email address</label>
          <input
            type="email"
            id="signup-email"
            class="auth-input"
            placeholder="you@example.com"
            autocomplete="email"
            required
          >
        </div>

        <div class="auth-field">
          <label class="auth-label" for="signup-password">Password</label>
          <input
            type="password"
            id="signup-password"
            class="auth-input"
            placeholder="Minimum 6 characters"
            autocomplete="new-password"
            required
          >
          <span class="auth-field-hint">Use at least 6 characters</span>
        </div>

        <div class="auth-field">
          <label class="auth-label" for="signup-confirm">Confirm password</label>
          <input
            type="password"
            id="signup-confirm"
            class="auth-input"
            placeholder="Repeat your password"
            autocomplete="new-password"
            required
          >
        </div>

        <div id="auth-error-msg" class="auth-error" style="display:none;"></div>

        <button type="submit" class="auth-submit-btn" id="auth-submit-btn">
          Create Account
        </button>
      </form>

      <p class="auth-switch-text">
        Already have an account?
        <button class="auth-link-btn" id="go-signin">Sign in</button>
      </p>
    `;
  }

  function renderForgotForm() {
    return `
      <h2 class="auth-title">Reset your password</h2>
      <p class="auth-subtitle">Enter your email address and we'll send you a reset link</p>

      <form id="auth-forgot-form" novalidate>
        <div class="auth-field">
          <label class="auth-label" for="forgot-email">Email address</label>
          <input
            type="email"
            id="forgot-email"
            class="auth-input"
            placeholder="you@example.com"
            autocomplete="email"
            required
          >
        </div>

        <div id="auth-error-msg" class="auth-error" style="display:none;"></div>
        <div id="auth-success-msg" class="auth-success" style="display:none;"></div>

        <button type="submit" class="auth-submit-btn" id="auth-submit-btn">
          Send Reset Link
        </button>
      </form>

      <p class="auth-switch-text">
        Remember your password?
        <button class="auth-link-btn" id="go-signin">Back to sign in</button>
      </p>
    `;
  }

  function setLoading(isLoading) {
    const btn = container.querySelector("#auth-submit-btn");
    if (!btn) return;
    if (isLoading) {
      btn.disabled = true;
      btn.dataset.originalText = btn.textContent;
      btn.textContent = "Please wait…";
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalText || btn.textContent;
    }
  }

  function showError(msg) {
    const el = container.querySelector("#auth-error-msg");
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
  }

  function hideError() {
    const el = container.querySelector("#auth-error-msg");
    if (el) el.style.display = "none";
  }

  function showSuccess(msg) {
    const el = container.querySelector("#auth-success-msg");
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
  }

  function validate(fields) {
    for (const { value, label, rule } of fields) {
      if (!value || !value.trim()) return `${label} is required.`;
      if (rule) { const msg = rule(value); if (msg) return msg; }
    }
    return null;
  }

  function bindFormEvents() {
    // Navigation between modes
    const goSignup = container.querySelector("#go-signup");
    const goSignin = container.querySelector("#go-signin");
    const goForgot = container.querySelector("#go-forgot");

    if (goSignup) goSignup.addEventListener("click", () => { mode = "signup"; render(); });
    if (goSignin) goSignin.addEventListener("click", () => { mode = "signin"; render(); });
    if (goForgot) goForgot.addEventListener("click", () => { mode = "forgot"; render(); });

    // Google OAuth
    const googleBtn = container.querySelector("#auth-google-btn");
    if (googleBtn) {
      googleBtn.addEventListener("click", async () => {
        setLoading(true);
        const { error } = await AuthService.signInWithGoogle();
        setLoading(false);
        if (error) showError(error);
        // If no error, Supabase redirects to Google — page will reload on return
      });
    }

    // Sign In form
    const signinForm = container.querySelector("#auth-signin-form");
    if (signinForm) {
      signinForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();

        const email = container.querySelector("#signin-email")?.value || "";
        const password = container.querySelector("#signin-password")?.value || "";

        const err = validate([
          { value: email, label: "Email", rule: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Please enter a valid email address." },
          { value: password, label: "Password" }
        ]);
        if (err) { showError(err); return; }

        setLoading(true);
        const { error } = await AuthService.signIn(email, password);
        setLoading(false);

        if (error) {
          showError(error);
        }
        // Success: onAuthStateChange fires → AuthState updates → app re-renders
      });
    }

    // Sign Up form
    const signupForm = container.querySelector("#auth-signup-form");
    if (signupForm) {
      signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();

        const name = container.querySelector("#signup-name")?.value || "";
        const email = container.querySelector("#signup-email")?.value || "";
        const password = container.querySelector("#signup-password")?.value || "";
        const confirm = container.querySelector("#signup-confirm")?.value || "";

        const err = validate([
          { value: name, label: "Full name" },
          { value: email, label: "Email", rule: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Please enter a valid email address." },
          { value: password, label: "Password", rule: v => v.length >= 6 ? null : "Password must be at least 6 characters." },
          { value: confirm, label: "Confirm password", rule: v => v === password ? null : "Passwords do not match." }
        ]);
        if (err) { showError(err); return; }

        setLoading(true);
        const { error } = await AuthService.signUp(name, email, password);
        setLoading(false);

        if (error) {
          showError(error);
        } else {
          // Supabase may require email confirmation. Check session:
          const session = await AuthService.getCurrentSession();
          if (!session) {
            // Email confirmation required
            container.querySelector("#auth-form-area").innerHTML = `
              <div class="auth-check-email">
                <div class="auth-check-email-icon">📬</div>
                <h2 class="auth-title">Check your inbox</h2>
                <p class="auth-subtitle">
                  We sent a confirmation link to <strong>${email}</strong>.<br>
                  Click it to activate your account, then come back to sign in.
                </p>
                <button class="auth-submit-btn" id="back-to-signin" style="margin-top: 24px;">Back to Sign In</button>
              </div>
            `;
            container.querySelector("#back-to-signin")?.addEventListener("click", () => {
              mode = "signin"; render();
            });
          }
          // If session exists, onAuthStateChange fires and app transitions automatically
        }
      });
    }

    // Forgot password form
    const forgotForm = container.querySelector("#auth-forgot-form");
    if (forgotForm) {
      forgotForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();

        const email = container.querySelector("#forgot-email")?.value || "";
        const err = validate([
          { value: email, label: "Email", rule: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Please enter a valid email address." }
        ]);
        if (err) { showError(err); return; }

        setLoading(true);
        const { error } = await AuthService.resetPassword(email);
        setLoading(false);

        if (error) {
          showError(error);
        } else {
          showSuccess(`Reset link sent to ${email}. Check your inbox (and spam folder).`);
          container.querySelector("#auth-submit-btn").style.display = "none";
        }
      });
    }
  }

  render();
}

/**
 * Show a minimal loading overlay while the initial session check runs.
 * This prevents flashing the auth screen or app before we know the auth state.
 */
export function renderAuthLoading(container) {
  container.innerHTML = `
    <div class="auth-loading-overlay">
      <div class="auth-loading-content">
        <div class="auth-loading-spinner"></div>
        <p class="auth-loading-text">Checking your session…</p>
      </div>
    </div>
  `;
}
