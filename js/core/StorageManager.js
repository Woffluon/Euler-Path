/**
 * StorageManager - Robust localStorage wrapper with error handling and fallbacks
 *
 * Provides safe localStorage operations with:
 * - Availability detection (handles private mode, disabled storage)
 * - Quota exceeded error handling with automatic cleanup
 * - In-memory fallback when localStorage unavailable
 * - JSON serialization/deserialization with error recovery
 *
 * @class StorageManager
 */
export default class StorageManager {
  /**
   * Creates a StorageManager instance
   * @param {string} key - The localStorage key to manage
   */
  constructor(key) {
    this.key = key;
    this.available = this.checkAvailability();
    this.memoryFallback = null;
  }

  /**
   * Checks if localStorage is available and accessible
   * Handles cases where localStorage is disabled, in private mode, or blocked
   *
   * @returns {boolean} True if localStorage is available, false otherwise
   */
  checkAvailability() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage is not available:', error.message);
      return false;
    }
  }

  /**
   * Retrieves value from storage with fallback to default
   * Handles JSON parsing errors and returns default value on failure
   *
   * @param {*} defaultValue - Value to return if key doesn't exist or parsing fails
   * @returns {*} Stored value or defaultValue
   */
  get(defaultValue) {
    // Use memory fallback if localStorage unavailable
    if (!this.available) {
      return this.memoryFallback !== null ? this.memoryFallback : defaultValue;
    }

    try {
      const item = localStorage.getItem(this.key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Failed to get item from localStorage (${this.key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Stores value in localStorage with quota handling
   * Attempts cleanup if quota exceeded, falls back to memory storage on failure
   *
   * @param {*} value - Value to store (will be JSON stringified)
   * @returns {boolean} True if storage succeeded, false otherwise
   */
  set(value) {
    // Use memory fallback if localStorage unavailable
    if (!this.available) {
      this.memoryFallback = value;
      return false;
    }

    try {
      localStorage.setItem(this.key, JSON.stringify(value));
      return true;
    } catch (error) {
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, attempting cleanup...');
        this.cleanup();

        // Retry after cleanup
        try {
          localStorage.setItem(this.key, JSON.stringify(value));
          return true;
        } catch (retryError) {
          console.error('Failed to store after cleanup:', retryError);
          this.memoryFallback = value;
          return false;
        }
      }

      console.error(`Failed to set item in localStorage (${this.key}):`, error);
      this.memoryFallback = value;
      return false;
    }
  }

  /**
   * Removes old data from localStorage when quota is exceeded
   * Attempts to free up space by removing items with specific patterns
   * or clearing all items except the current key
   */
  cleanup() {
    try {
      // Strategy: Remove all localStorage items except our current key
      // This is a simple cleanup strategy - could be enhanced with timestamps
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key !== this.key) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove key during cleanup: ${key}`, error);
        }
      });

      console.warn(`Cleanup completed: removed ${keysToRemove.length} items`);
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  /**
   * Clears the stored value for this key
   * Resets both localStorage and memory fallback
   */
  clear() {
    this.memoryFallback = null;

    if (!this.available) {
      return;
    }

    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.error(`Failed to clear item from localStorage (${this.key}):`, error);
    }
  }
}
