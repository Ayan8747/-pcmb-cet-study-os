/**
 * Main Application Bootstrap & Router for PCMB Interactive CET
 *
 * Extended with:
 *   - Auth initialization (session check on startup)
 *   - Auth guard (protected routes redirect to auth screen)
 *   - Profile menu in header
 *   - Cloud progress load + local/cloud merge after login
 *   - Sync manager initialization
 *
 * PRESERVATION GUARANTEE:
 *   All original methods (parseHash, handleRoute, updateActiveNav,
 *   updateBreadcrumbs, bindGlobalNavigation, updateBadges) are unchanged.
 *   The router logic is unchanged. All views, simulations, and navigation
 *   continue to work exactly as before.
 */

import { Store, Bus } from "./state/store.js";
import { StorageManager } from "./state/storage.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderSyllabusView } from "./views/syllabus-view.js";
import { renderResourcesView } from "./views/resources-view.js";
import { renderSubjectView } from "./views/subject-view.js";
import { renderChapterView } from "./views/chapter-view.js";
import { renderPracticeView } from "./views/practice-view.js";
import { renderTestView } from "./views/test-view.js";
import { renderRevisionView } from "./views/revision-view.js";
import { renderProgressView } from "./views/progress-view.js";

// Auth layer imports
import { AuthState } from "./auth/auth-state.js";
import { AuthService } from "./auth/auth-service.js";
import { renderAuthView, renderAuthLoading } from "./auth/auth-ui.js";
import { CloudStorage } from "./state/cloud-storage.js";
import { SyncManager } from "./state/sync-manager.js";
import { shouldPromptMigration, renderMigrationPrompt } from "./auth/migration-ui.js";
import { isConfigured } from "./auth/supabase-client.js";

// Protected routes — these require authentication
const PROTECTED_ROUTES = new Set([
  "dashboard", "syllabus", "resources", "subject", "chapter", "practice", "tests",
  "revision", "progress", "physics", "chemistry", "mathematics", "biology"
]);

class App {
  constructor() {
    this.mainContainer = document.getElementById("main-view-container");
    this.sidebar = document.getElementById("app-sidebar");
    this._authReady = false;
    this._syncInitialized = false;
    this.init();
  }

  async init() {
    // Step 1: Show loading state immediately (prevents flash of app/auth)
    renderAuthLoading(this.mainContainer);

    // Step 2: Wire up router and global navigation
    window.addEventListener("hashchange", () => this.handleRoute());
    this.bindGlobalNavigation();

    // Step 3: Listen for Bus events
    Bus.on("state:changed", () => this.updateBadges());
    Bus.on("auth:initialized", (data) => this._onAuthInitialized(data));
    Bus.on("auth:signed-in", (data) => this._onSignedIn(data));
    Bus.on("auth:signed-out", () => this._onSignedOut());

    // Step 4: Start auth session detection
    // If Supabase is not yet configured, skip cloud auth and go straight to app
    if (!isConfigured) {
      console.info("[PCMB] Running in local-only mode (Supabase not configured).");
      this._authReady = true;
      this.handleRoute();
      this.updateBadges();
      this._renderGuestUserBadge();
      return;
    }

    await AuthState.initialize();
    // Auth state change listener will call _onAuthInitialized via Bus
  }

  // ─── Auth Event Handlers ─────────────────────────────────────────────────

  async _onAuthInitialized(data) {
    this._authReady = true;

    if (data.status === "authenticated" && data.user) {
      await this._onSignedIn(data);
    } else {
      // Unauthenticated — show auth screen
      Store.clearAuth();
      this._renderProfileMenu(null, null);
      renderAuthView(this.mainContainer);
    }
  }

  async _onSignedIn(data) {
    const { user, profile } = data;
    Store.setAuthUser(user, profile);

    // Initialize sync manager for this user
    if (!this._syncInitialized) {
      SyncManager.init(user.id);
      this._syncInitialized = true;
    }

    // Load cloud progress and merge into local state
    await this._loadAndMergeCloudProgress(user.id);

    // Update profile menu UI
    this._renderProfileMenu(user, profile);

    // Update streak badge with user data
    this.updateBadges();

    // Check for local→cloud migration prompt (first login with existing data)
    if (shouldPromptMigration(user.id)) {
      renderMigrationPrompt(user.id, (action) => {
        // After migration decision, proceed to the app
        this.handleRoute();
        if (action === "imported") {
          Store.showToast("Your progress has been imported to your account! 🎉", "success");
        }
      });
      return; // Migration modal is shown; handleRoute called from callback
    }

    // Route to current hash
    this.handleRoute();
  }

  _onSignedOut() {
    // Stop sync manager
    SyncManager.destroy();
    this._syncInitialized = false;

    // Clear auth state from Store
    Store.clearAuth();

    // Update UI
    this._renderProfileMenu(null, null);

    // Clear sidebar badges
    this.updateBadges();

    // Navigate to auth screen
    renderAuthView(this.mainContainer);
  }

  // ─── Cloud Progress Load ─────────────────────────────────────────────────

  async _loadAndMergeCloudProgress(userId) {
    try {
      const cloudProgress = await CloudStorage.loadUserProgress(userId);
      if (!cloudProgress) return;

      const localState = StorageManager.load();
      const merged = CloudStorage.mergeCloudIntoLocal(localState, cloudProgress);
      StorageManager.save(merged);

      // Refresh store so views pick up the merged state
      Store.refresh();
    } catch (err) {
      console.warn("[App] Cloud progress load failed:", err);
      // Non-fatal — app continues with local state
    }
  }

  // ─── Profile Menu ────────────────────────────────────────────────────────

  _renderProfileMenu(user, profile) {
    const headerActions = document.querySelector(".header-actions");
    if (!headerActions) return;

    // Remove existing profile wrapper if present
    const existingWrapper = headerActions.querySelector(".profile-menu-wrapper");
    if (existingWrapper) existingWrapper.remove();

    // Remove old streak badge / user badge (we'll re-add streak, replace user)
    const oldUserBadge = headerActions.querySelector("#header-user-badge");
    if (oldUserBadge) oldUserBadge.remove();

    if (!user) {
      // Unauthenticated — show sign-in / register link
      const signInEl = document.createElement("button");
      signInEl.id = "header-user-badge";
      signInEl.className = "header-stat-badge";
      signInEl.style.cursor = "pointer";
      signInEl.textContent = "👤 Sign In / Register";
      signInEl.addEventListener("click", () => {
        location.hash = "#login";
      });
      headerActions.appendChild(signInEl);
      return;
    }

    const displayName = profile?.full_name || user.email?.split("@")[0] || "Aspirant";
    const email = user.email || "";
    const initials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    const wrapper = document.createElement("div");
    wrapper.className = "profile-menu-wrapper";
    wrapper.innerHTML = `
      <button class="profile-menu-toggle" id="profile-menu-toggle" aria-label="User menu" aria-expanded="false">
        <div class="profile-avatar">${initials}</div>
        <span style="max-width: 100px; overflow: hidden; text-overflow: ellipsis;">${displayName}</span>
        <span style="font-size: 0.65rem; color: var(--text-muted);">▾</span>
      </button>
      <div class="profile-dropdown" id="profile-dropdown" style="display: none;">
        <div class="profile-dropdown-header">
          <div class="profile-dropdown-name">${displayName}</div>
          <div class="profile-dropdown-email">${email}</div>
        </div>
        <a href="#progress" class="profile-dropdown-item" id="pd-progress">
          📈 Mastery Analytics
        </a>
        <div class="profile-dropdown-divider"></div>
        <button class="profile-dropdown-item danger" id="pd-signout">
          🚪 Sign Out
        </button>
      </div>
    `;

    headerActions.appendChild(wrapper);

    // Toggle dropdown
    const toggle = wrapper.querySelector("#profile-menu-toggle");
    const dropdown = wrapper.querySelector("#profile-dropdown");

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.style.display !== "none";
      dropdown.style.display = isOpen ? "none" : "block";
      toggle.setAttribute("aria-expanded", String(!isOpen));
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) {
        dropdown.style.display = "none";
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    // Sign out
    wrapper.querySelector("#pd-signout").addEventListener("click", async () => {
      dropdown.style.display = "none";
      await AuthService.signOut();
      // Bus will emit auth:signed-out → _onSignedOut()
    });

    // Close dropdown on nav click
    wrapper.querySelector("#pd-progress")?.addEventListener("click", () => {
      dropdown.style.display = "none";
    });

    // Attach sync indicator
    this._initSyncIndicator(headerActions);
  }

  _renderGuestUserBadge() {
    const headerActions = document.querySelector(".header-actions");
    if (!headerActions) return;
    const old = headerActions.querySelector("#header-user-badge");
    if (old) old.remove();

    const el = document.createElement("div");
    el.id = "header-user-badge";
    el.className = "header-stat-badge";
    el.style.cursor = "pointer";
    el.onclick = () => location.hash = "#progress";
    el.textContent = "👤 Aspirant";
    headerActions.appendChild(el);
  }

  _initSyncIndicator(headerActions) {
    // Remove existing
    const existing = document.getElementById("sync-indicator");
    if (existing) existing.remove();

    const indicator = document.createElement("div");
    indicator.id = "sync-indicator";
    indicator.className = "sync-indicator";
    indicator.style.display = "none";
    indicator.innerHTML = `<div class="sync-dot"></div><span id="sync-indicator-text"></span>`;
    headerActions.insertBefore(indicator, headerActions.firstChild);

    // Listen for sync events
    Bus.on("progress:syncing", () => {
      indicator.style.display = "inline-flex";
      indicator.className = "sync-indicator syncing";
      indicator.querySelector(".sync-dot").classList.add("pulsing");
      document.getElementById("sync-indicator-text").textContent = "Syncing…";
    });

    Bus.on("progress:synced", () => {
      indicator.className = "sync-indicator";
      indicator.querySelector(".sync-dot").classList.remove("pulsing");
      document.getElementById("sync-indicator-text").textContent = "Saved";
      setTimeout(() => { indicator.style.display = "none"; }, 2500);
    });

    Bus.on("progress:sync-failed", ({ queued }) => {
      if (queued) {
        indicator.style.display = "inline-flex";
        indicator.className = "sync-indicator failed";
        indicator.querySelector(".sync-dot").classList.remove("pulsing");
        document.getElementById("sync-indicator-text").textContent = "Offline — saved locally";
      }
    });
  }

  // ─── Original Navigation & Routing (COMPLETELY PRESERVED) ────────────────

  bindGlobalNavigation() {
    // Mobile menu toggle
    const menuBtn = document.getElementById("mobile-menu-btn");
    if (menuBtn) {
      menuBtn.addEventListener("click", () => {
        if (this.sidebar) this.sidebar.classList.toggle("open");
      });
    }

    // Close sidebar on click outside in mobile
    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 768 && this.sidebar && this.sidebar.classList.contains("open")) {
        if (!this.sidebar.contains(e.target) && !e.target.closest("#mobile-menu-btn")) {
          this.sidebar.classList.remove("open");
        }
      }
    });

    // Global Search input
    const searchInput = document.getElementById("global-search-input");
    if (searchInput) {
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && searchInput.value.trim()) {
          const q = searchInput.value.trim();
          location.hash = `#practice?search=${encodeURIComponent(q)}`;
          searchInput.value = "";
        }
      });
    }
  }

  updateBadges() {
    const state = StorageManager.load();
    const unmasteredMistakes = state.mistakes.filter(m => !m.mastered).length;
    const mistakeBadge = document.getElementById("sidebar-mistakes-count");
    if (mistakeBadge) {
      mistakeBadge.textContent = unmasteredMistakes;
      mistakeBadge.style.display = unmasteredMistakes > 0 ? "inline-block" : "none";
    }

    const streakBadge = document.getElementById("header-streak-badge");
    if (streakBadge) {
      streakBadge.textContent = `⚡ ${state.user.streakDays} Day Streak`;
    }
  }

  parseHash() {
    const raw = location.hash.replace(/^#\/?/, "") || "dashboard";
    const [pathPart, queryPart] = raw.split("?");
    const segments = pathPart.split("/").filter(Boolean);
    const query = {};
    if (queryPart) {
      queryPart.split("&").forEach(param => {
        const [k, v] = param.split("=");
        query[k] = decodeURIComponent(v || "");
      });
    }
    return { segments, query };
  }

  updateActiveNav(currentSection) {
    document.querySelectorAll(".nav-link").forEach(link => {
      const target = link.getAttribute("data-nav");
      if (target === currentSection) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  updateBreadcrumbs(items) {
    const breadcrumbContainer = document.getElementById("header-breadcrumbs");
    if (!breadcrumbContainer) return;
    breadcrumbContainer.innerHTML = items.map((it, idx) => {
      const isLast = idx === items.length - 1;
      if (isLast) {
        return `<span class="breadcrumb-item current">${it.label}</span>`;
      }
      return `
        <a href="${it.url}" class="breadcrumb-item">${it.label}</a>
        <span class="breadcrumb-separator">/</span>
      `;
    }).join("");
  }

  handleRoute() {
    const { segments, query } = this.parseHash();
    const route = segments[0] || "dashboard";

    // Auth guard & Auth routes handling
    if (route === "login" || route === "auth" || route === "signup") {
      if (AuthState.isAuthenticated) {
        location.hash = "#dashboard";
        return;
      } else {
        renderAuthView(this.mainContainer, { mode: route === "signup" ? "signup" : "signin" });
        return;
      }
    }

    if (isConfigured && !AuthState.isAuthenticated) {
      if (PROTECTED_ROUTES.has(route)) {
        if (this._authReady) {
          renderAuthView(this.mainContainer);
        }
        return;
      }
    }

    // Scroll to top
    window.scrollTo(0, 0);

    // Close mobile sidebar
    if (this.sidebar) this.sidebar.classList.remove("open");

    if (route === "dashboard") {
      this.updateActiveNav("dashboard");
      this.updateBreadcrumbs([{ label: "Dashboard", url: "#dashboard" }]);
      renderDashboard(this.mainContainer);
    }
    else if (route === "syllabus") {
      this.updateActiveNav("syllabus");
      this.updateBreadcrumbs([
        { label: "Dashboard", url: "#dashboard" },
        { label: "Syllabus Study OS", url: "#syllabus" }
      ]);
      renderSyllabusView(this.mainContainer, query);
    }
    else if (route === "resources") {
      this.updateActiveNav("resources");
      this.updateBreadcrumbs([
        { label: "Dashboard", url: "#dashboard" },
        { label: "Free Study Materials Hub", url: "#resources" }
      ]);
      renderResourcesView(this.mainContainer, query);
    }
    else if (route === "subject") {
      const subjectId = segments[1] || "physics";
      this.updateActiveNav(subjectId);
      this.updateBreadcrumbs([
        { label: "Dashboard", url: "#dashboard" },
        { label: subjectId.charAt(0).toUpperCase() + subjectId.slice(1), url: `#subject/${subjectId}` }
      ]);
      renderSubjectView(this.mainContainer, subjectId);
    }
    else if (route === "chapter") {
      const subjectId = segments[1] || "physics";
      const chapterId = segments[2] || "kinematics";
      const step = query.step || "overview";
      this.updateActiveNav(subjectId);
      this.updateBreadcrumbs([
        { label: "Dashboard", url: "#dashboard" },
        { label: subjectId.charAt(0).toUpperCase() + subjectId.slice(1), url: `#subject/${subjectId}` },
        { label: "Kinematics Lab", url: `#chapter/${subjectId}/${chapterId}` }
      ]);
      renderChapterView(this.mainContainer, subjectId, chapterId, step);
    }
    else if (route === "physics" || route === "chemistry" || route === "mathematics" || route === "biology") {
      this.updateActiveNav(route);
      this.updateBreadcrumbs([
        { label: "Dashboard", url: "#dashboard" },
        { label: route.charAt(0).toUpperCase() + route.slice(1), url: `#subject/${route}` }
      ]);
      renderSubjectView(this.mainContainer, route);
    }
    else if (route === "practice") {
      this.updateActiveNav("practice");
      this.updateBreadcrumbs([
        { label: "Dashboard", url: "#dashboard" },
        { label: "Practice Bank", url: "#practice" }
      ]);
      renderPracticeView(this.mainContainer, query);
    }
    else if (route === "tests") {
      this.updateActiveNav("tests");
      this.updateBreadcrumbs([
        { label: "Dashboard", url: "#dashboard" },
        { label: "CET Exam Center", url: "#tests" }
      ]);
      renderTestView(this.mainContainer, query);
    }
    else if (route === "revision") {
      this.updateActiveNav("revision");
      this.updateBreadcrumbs([
        { label: "Dashboard", url: "#dashboard" },
        { label: "Revision & Mistake Notebook", url: "#revision" }
      ]);
      renderRevisionView(this.mainContainer, query);
    }
    else if (route === "progress") {
      this.updateActiveNav("progress");
      this.updateBreadcrumbs([
        { label: "Dashboard", url: "#dashboard" },
        { label: "Mastery Analytics", url: "#progress" }
      ]);
      renderProgressView(this.mainContainer);
    }
  }
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
});
