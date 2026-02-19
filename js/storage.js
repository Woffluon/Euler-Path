/**
 * Storage management module for persisting completed levels.
 * Uses StorageManager for robust localStorage operations with error handling and fallbacks.
 *
 * @module storage
 */

import CONFIG from './data/config.js';
import StorageManager from './core/StorageManager.js';

// Robust local storage implementation for completed levels using StorageManager
// Provides error handling, quota management, and fallback support

const storageManager = new StorageManager(CONFIG.storage.completedLevelsKey);

/**
 * Gets the set of completed level indices from storage.
 * Uses StorageManager for robust error handling and fallback support.
 *
 * @returns {Set<number>} A set of completed level indices
 */
export function getCompletedLevels() {
  const completedArray = storageManager.get([]);

  // Ensure all items are numbers and convert to Set
  if (Array.isArray(completedArray)) {
    return new Set(completedArray.filter((item) => typeof item === 'number'));
  }

  // Return empty set if data is invalid
  return new Set();
}

/**
 * Saves the set of completed level indices to storage.
 * Uses StorageManager for robust error handling and quota management.
 *
 * @param {Set<number>} completedLevelsSet - The set of completed level indices
 */
export function saveCompletedLevels(completedLevelsSet) {
  // Convert Set to Array for JSON stringification
  const completedArray = Array.from(completedLevelsSet);
  const success = storageManager.set(completedArray);

  if (success) {
    console.log('Completed levels saved:', completedArray);
  } else {
    console.warn('Completed levels saved to memory fallback:', completedArray);
  }
}

/**
 * Marks a specific level as completed and saves the state.
 * Uses StorageManager methods for all storage operations.
 *
 * @param {number} levelIndex - The index of the level to mark as completed
 */
export function markLevelAsCompleted(levelIndex) {
  const completedLevelsSet = getCompletedLevels();
  if (!completedLevelsSet.has(levelIndex)) {
    completedLevelsSet.add(levelIndex);
    saveCompletedLevels(completedLevelsSet);
    console.log(`Level ${levelIndex} marked as completed.`);
  } else {
    console.log(`Level ${levelIndex} was already completed.`);
  }
}

/**
 * Clears all completed levels from storage.
 * Uses StorageManager.clear() for robust cleanup.
 */
export function clearCompletedLevels() {
  storageManager.clear();
  console.log('All completed levels cleared from storage.');
}
