/**
 * Storage Client - Handles all data persistence to server storage.1 folder
 * Automatically saves application state, progress, test results, and user data
 */

class StorageClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.autoSaveInterval = 30000; // Auto-save every 30 seconds
    this.pendingChanges = new Map();
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      const response = await fetch(`${this.baseUrl}/api/files`);
      if (response.ok) {
        this.initialized = true;
        console.log('✓ Storage client connected');
      }
    } catch (error) {
      console.warn('⚠ Storage client: Server not available. Running in offline mode.');
      this.initialized = false;
    }
  }

  /**
   * Save data with a unique key
   * @param {string} key - Unique identifier for the data
   * @param {any} data - Data to save (will be JSON stringified)
   * @param {string} type - Category of data (e.g., 'progress', 'test-result', 'notes')
   */
  async save(key, data, type = 'general') {
    if (!this.initialized) {
      console.warn(`⚠ Offline mode: Data not saved. Key: ${key}`);
      this.pendingChanges.set(key, { data, type, timestamp: Date.now() });
      return { success: false, offline: true };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: `${type}-${key}`,
          data,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      console.log(`✓ Saved: ${key} (${type})`);
      return result;
    } catch (error) {
      console.error(`✗ Save failed for ${key}:`, error);
      this.pendingChanges.set(key, { data, type, timestamp: Date.now() });
      return { success: false, error: error.message };
    }
  }

  /**
   * Load the most recent data for a key
   * @param {string} key - Unique identifier
   * @param {string} type - Category of data
   */
  async load(key, type = 'general') {
    if (!this.initialized) {
      const pending = this.pendingChanges.get(key);
      return pending ? pending.data : null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/load/${type}-${key}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      return result.data?.data || null;
    } catch (error) {
      console.error(`✗ Load failed for ${key}:`, error);
      return null;
    }
  }

  /**
   * Auto-save handler - call this periodically
   */
  async autoSave() {
    for (const [key, value] of this.pendingChanges.entries()) {
      await this.save(key, value.data, value.type);
      this.pendingChanges.delete(key);
    }
  }

  /**
   * Get list of all saved files
   */
  async listFiles() {
    if (!this.initialized) return [];

    try {
      const response = await fetch(`${this.baseUrl}/api/files`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      return result.files || [];
    } catch (error) {
      console.error('✗ List files failed:', error);
      return [];
    }
  }

  /**
   * Clear all saved data (use with caution!)
   */
  async clear() {
    if (!this.initialized) {
      this.pendingChanges.clear();
      return { success: true };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/clear`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      console.log(`✓ Cleared ${result.cleared} files`);
      return result;
    } catch (error) {
      console.error('✗ Clear failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save user progress
   */
  async saveProgress(userId, progressData) {
    return this.save(`progress-${userId}`, progressData, 'progress');
  }

  /**
   * Save test results
   */
  async saveTestResult(testId, resultData) {
    return this.save(`test-${testId}`, resultData, 'test-result');
  }

  /**
   * Save notes or mistakes
   */
  async saveNotes(userId, notesData) {
    return this.save(`notes-${userId}`, notesData, 'notes');
  }

  /**
   * Load user progress
   */
  async loadProgress(userId) {
    return this.load(`progress-${userId}`, 'progress');
  }

  /**
   * Load test results
   */
  async loadTestResult(testId) {
    return this.load(`test-${testId}`, 'test-result');
  }

  /**
   * Load notes
   */
  async loadNotes(userId) {
    return this.load(`notes-${userId}`, 'notes');
  }
}

// Global instance
const storageClient = new StorageClient();

// Auto-save every 30 seconds
setInterval(() => storageClient.autoSave(), 30000);
