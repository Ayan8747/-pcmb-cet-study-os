/**
 * Theme Manager Module for MHT-CET PCMB Learning App
 * 
 * Provides single source of truth for runtime theme state (Light / Dark mode).
 * Persists theme preference to localStorage and listens for system preference changes.
 */

import { Bus } from "./state/store.js";

const THEME_STORAGE_KEY = "pcmb_theme";

export const ThemeManager = {
  getSavedTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  },

  getTheme() {
    return document.documentElement.getAttribute("data-theme") || this.getSavedTheme();
  },

  applyTheme(theme) {
    const targetTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", targetTheme);
    this.updateToggleUI(targetTheme);
    return targetTheme;
  },

  setTheme(theme) {
    const newTheme = theme === "dark" ? "dark" : "light";
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    this.applyTheme(newTheme);
    if (Bus && typeof Bus.emit === "function") {
      Bus.emit("theme:changed", { theme: newTheme });
    }
  },

  toggleTheme() {
    const current = this.getTheme();
    const next = current === "dark" ? "light" : "dark";
    this.setTheme(next);
    return next;
  },

  updateToggleUI(theme) {
    const isDark = theme === "dark";
    const buttons = document.querySelectorAll(".theme-toggle-btn, [data-action='toggle-theme']");
    buttons.forEach((btn) => {
      btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      btn.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
      btn.setAttribute("data-theme-state", theme);
      
      const iconEl = btn.querySelector(".theme-toggle-icon");
      if (iconEl) {
        iconEl.textContent = isDark ? "☀️" : "🌙";
      } else {
        btn.textContent = isDark ? "☀️" : "🌙";
      }
    });
  },

  initTheme() {
    const currentTheme = this.getSavedTheme();
    this.applyTheme(currentTheme);

    // Watch for OS theme preference changes if user hasn't explicitly set a preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = (e) => {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        this.applyTheme(e.matches ? "dark" : "light");
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleMediaChange);
    }

    // Global event delegation for theme toggle buttons
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".theme-toggle-btn, [data-action='toggle-theme']");
      if (btn) {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }
};
