/**
 * GameState - Centralized state management with observable pattern
 *
 * Manages all game state in a centralized store and notifies subscribers
 * of state changes. Implements the Observer pattern for reactive updates.
 *
 * @class GameState
 */
export class GameState {
  /**
   * Creates a new GameState instance with initial state
   */
  constructor() {
    // Initialize state with default values
    this.state = {
      currentLevelIndex: 0,
      levelData: null,
      svgElement: null,
      pathElement: null,
      bridgesMap: new Map(),
      totalBridges: 0,
      isDrawing: false,
      pathPoints: [],
      crossedBridgeIds: new Set(),
      isComplete: false,
      currentlyInsideBridgeId: null,
      justCrossedBridgeId: null,
      bridgeEntryPoint: null,
      interactionStartPoint: null,
    };

    // Store initial state for reset functionality
    this.initialState = {
      currentLevelIndex: 0,
      levelData: null,
      svgElement: null,
      pathElement: null,
      bridgesMap: new Map(),
      totalBridges: 0,
      isDrawing: false,
      pathPoints: [],
      crossedBridgeIds: new Set(),
      isComplete: false,
      currentlyInsideBridgeId: null,
      justCrossedBridgeId: null,
      bridgeEntryPoint: null,
      interactionStartPoint: null,
    };

    // Array of listener functions
    this.listeners = [];
  }

  /**
   * Gets a value from the state
   *
   * @param {string} key - The state key to retrieve
   * @returns {any} The value associated with the key
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Sets a value in the state and notifies listeners
   *
   * @param {string} key - The state key to update
   * @param {any} value - The new value to set
   */
  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    this.notify(key, value, oldValue);
  }

  /**
   * Subscribes a listener to state changes
   *
   * @param {Function} listener - Callback function (key, newValue, oldValue) => void
   * @returns {Function} Unsubscribe function to remove the listener
   */
  subscribe(listener) {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notifies all subscribed listeners of a state change
   *
   * @param {string} key - The state key that changed
   * @param {any} newValue - The new value
   * @param {any} oldValue - The previous value
   */
  notify(key, newValue, oldValue) {
    this.listeners.forEach((listener) => {
      try {
        listener(key, newValue, oldValue);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  /**
   * Resets the state to initial values while preserving level data
   *
   * This method restores the state to its initial configuration but keeps
   * the currentLevelIndex, levelData, svgElement, and pathElement to maintain
   * the current level context.
   */
  reset() {
    // Preserve level-related data
    const preservedData = {
      currentLevelIndex: this.state.currentLevelIndex,
      levelData: this.state.levelData,
      svgElement: this.state.svgElement,
      pathElement: this.state.pathElement,
    };

    // Reset all state to initial values
    this.state = {
      ...this.initialState,
      currentLevelIndex: preservedData.currentLevelIndex,
      levelData: preservedData.levelData,
      svgElement: preservedData.svgElement,
      pathElement: preservedData.pathElement,
      bridgesMap: new Map(),
      pathPoints: [],
      crossedBridgeIds: new Set(),
    };

    // Notify listeners about the reset
    this.notify('reset', this.state, null);
  }

  /**
   * Returns the complete state object (for debugging)
   *
   * @returns {Object} The full state object
   */
  getState() {
    return { ...this.state };
  }
}
