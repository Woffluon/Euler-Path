/**
 * Centralized configuration for the Euler's Path game.
 * All magic numbers, constants, colors, and timing values are defined here for easy maintenance.
 * Environment-specific overrides are applied based on import.meta.env.
 *
 * @module data/config
 */

const CONFIG = {
  // Colors
  colors: {
    bridgeInitial: 'rgba(139, 69, 19, 0.8)', // Brownish - improved contrast
    bridgeCrossed: 'rgba(34, 139, 34, 0.7)', // Forest green - improved contrast and distinguishability
    path: 'rgba(0, 0, 255, 0.7)', // Blue
    land: '#6e903a', // Green land color
    water: '#68adcd', // Blue water color
  },

  // Drawing parameters
  drawing: {
    pathWidth: 5, // Stroke width for drawn path
    minPointDistance: 9, // Minimum squared distance between path points (3px * 3px)
    touchThreshold: 3, // Touch sensitivity threshold
  },

  // Keyboard navigation
  keyboard: {
    arrowKeyStep: 10, // Pixels to move cursor per arrow key press
    enabled: true, // Enable keyboard navigation
  },

  // Timing constants
  timing: {
    messageTimeout: 2000, // ms - Duration to show messages
    resetDelay: 1500, // ms - Delay before resetting path on error/incomplete
    animationDuration: 300, // ms - Duration for animations
  },

  // Game settings
  game: {
    maxLevels: 10, // Maximum number of levels
    enableDebug: false, // Debug mode flag (overridden by environment)
  },

  // Storage keys
  storage: {
    completedLevelsKey: 'eulerinYoluCompletedLevels',
    version: '1.0', // Storage schema version
  },

  // Environment variables
  env: {
    appName: import.meta.env.VITE_APP_NAME || "Euler's Path",
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5173',
    isDev: import.meta.env.DEV || false,
  },
};

// Environment-specific overrides
if (import.meta.env.DEV) {
  CONFIG.game.enableDebug = true;
}

// Export as default
export default CONFIG;

// Legacy named exports for backward compatibility (to be removed after migration)
export const BRIDGE_INITIAL_COLOR_RGBA = CONFIG.colors.bridgeInitial;
export const BRIDGE_CROSSED_COLOR_RGBA = CONFIG.colors.bridgeCrossed;
export const PATH_COLOR = CONFIG.colors.path;
export const PATH_WIDTH = CONFIG.drawing.pathWidth;
export const MESSAGE_TIMEOUT = CONFIG.timing.messageTimeout;
export const RESET_DELAY = CONFIG.timing.resetDelay;
