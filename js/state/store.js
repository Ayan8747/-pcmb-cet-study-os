/**
 * Reactive Application Store & Event Bus
 *
 * Extended with auth state tracking:
 *   Store.auth.user    — current Supabase user or null
 *   Store.auth.profile — loaded profile row or null
 *   Store.auth.status  — 'initializing' | 'authenticated' | 'unauthenticated' | 'error'
 *   Store.setAuthUser(user, profile)
 *   Store.clearAuth()
 */

import { StorageManager } from "./storage.js";

class EventBus {
  constructor() {
    this.events = {};
  }
  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(cb => cb(data));
  }
}

export const Bus = new EventBus();

export class AppStore {
  constructor() {
    this.state = StorageManager.load();
    this.currentRoute = "dashboard";
    this.routeParams = {};

    // ── Auth state (added by auth layer) ───────────────────────────────────
    this.auth = {
      user: null,
      profile: null,
      status: "initializing" // matches AUTH_STATUS values
    };
  }

  getState() {
    return this.state;
  }

  refresh() {
    this.state = StorageManager.load();
    Bus.emit("state:changed", this.state);
  }

  /**
   * Set the authenticated user and profile after sign-in.
   * Refreshes local state and emits state:changed.
   */
  setAuthUser(user, profile) {
    this.auth.user = user;
    this.auth.profile = profile;
    this.auth.status = "authenticated";
    this.refresh(); // reload local state so views get fresh data
  }

  /**
   * Clear auth state after sign-out.
   * Resets the local state to default so the next user gets a clean slate.
   */
  clearAuth() {
    this.auth.user = null;
    this.auth.profile = null;
    this.auth.status = "unauthenticated";
    // Reset in-memory state to defaults (local storage is NOT cleared —
    // the next user's cloud data will overwrite it after login)
    this.state = StorageManager.load();
  }

  showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }
}

export const Store = new AppStore();
