import CONFIG from '@data/config.js';
import { isOppositeSide as utilIsOppositeSide } from '@utils/utils.js';

/**
 * BridgeManager handles bridge state management, crossing validation, and visual updates.
 * Responsible for initializing bridges from SVG, tracking crossed bridges, and validating
 * that bridges are crossed from opposite sides.
 */
export class BridgeManager {
  /**
   * Creates a new BridgeManager instance.
   * @param {GameState} gameState - The centralized game state manager
   */
  constructor(gameState) {
    this.gameState = gameState;
  }

  /**
   * Initializes bridges by finding all bridge elements in the SVG and storing them.
   * Sets initial visual state for all bridges.
   * @param {SVGElement} svgElement - The SVG element containing bridge elements
   */
  initialize(svgElement) {
    const bridgesMap = new Map();
    const bridgeElements = svgElement.querySelectorAll('rect[id^="bridge-"]');

    console.log(`BridgeManager: Found ${bridgeElements.length} bridge elements`);

    bridgeElements.forEach((bridge) => {
      bridgesMap.set(bridge.id, bridge);
      bridge.style.fill = CONFIG.colors.bridgeInitial;
      bridge.classList.remove('crossed');
      bridge.setAttribute('pointer-events', 'all');
      console.log(`BridgeManager: Initialized bridge: ${bridge.id}`);
    });

    this.gameState.set('bridgesMap', bridgesMap);
    this.gameState.set('totalBridges', bridgesMap.size);
    console.log(`BridgeManager: Initialized ${bridgesMap.size} bridges`);
  }

  /**
   * Validates if a bridge crossing is valid (crosses from opposite side).
   * @param {string} bridgeId - The ID of the bridge being crossed
   * @param {Point} entryPoint - The point where the path entered the bridge
   * @param {Point} exitPoint - The point where the path exited the bridge
   * @returns {boolean} True if the crossing is valid (opposite sides)
   */
  validateCrossing(bridgeId, entryPoint, exitPoint) {
    const bridgesMap = this.gameState.get('bridgesMap');
    const bridge = bridgesMap.get(bridgeId);

    if (!bridge || !entryPoint || !exitPoint) {
      return false;
    }

    return this.isOppositeSide(entryPoint, exitPoint, bridge);
  }

  /**
   * Marks a bridge as crossed by adding it to the crossedBridgeIds set and updating visuals.
   * @param {string} bridgeId - The ID of the bridge to mark as crossed
   */
  markCrossed(bridgeId) {
    const crossedBridgeIds = this.gameState.get('crossedBridgeIds');
    if (!crossedBridgeIds.has(bridgeId)) {
      crossedBridgeIds.add(bridgeId);
      this.gameState.set('crossedBridgeIds', crossedBridgeIds);
      this.updateVisual(bridgeId, true);
    }
  }

  /**
   * Resets all bridges to their initial state, clearing crossed status and resetting visuals.
   */
  reset() {
    const crossedBridgeIds = this.gameState.get('crossedBridgeIds');
    crossedBridgeIds.clear();
    this.gameState.set('crossedBridgeIds', crossedBridgeIds);

    const bridgesMap = this.gameState.get('bridgesMap');
    bridgesMap.forEach((bridge) => {
      bridge.style.fill = CONFIG.colors.bridgeInitial;
      bridge.classList.remove('crossed');
    });
  }

  /**
   * Updates the visual appearance of a bridge based on its crossed state.
   * @param {string} bridgeId - The ID of the bridge to update
   * @param {boolean} crossed - Whether the bridge has been crossed
   */
  updateVisual(bridgeId, crossed) {
    const bridgesMap = this.gameState.get('bridgesMap');
    const bridge = bridgesMap.get(bridgeId);

    if (bridge) {
      bridge.style.fill = crossed ? CONFIG.colors.bridgeCrossed : CONFIG.colors.bridgeInitial;
      if (crossed) {
        bridge.classList.add('crossed');
      } else {
        bridge.classList.remove('crossed');
      }
    }
  }

  /**
   * Finds the bridge element at a given point.
   * @param {Point} point - The point to check (in SVG coordinates)
   * @returns {string|null} The bridge ID if found, null otherwise
   */
  getBridgeAtPoint(point) {
    const bridgesMap = this.gameState.get('bridgesMap');

    for (const [bridgeId, bridge] of bridgesMap.entries()) {
      try {
        const bbox = bridge.getBBox();
        if (
          point.x >= bbox.x &&
          point.x <= bbox.x + bbox.width &&
          point.y >= bbox.y &&
          point.y <= bbox.y + bbox.height
        ) {
          return bridgeId;
        }
      } catch (error) {
        console.error(`Error getting bbox for bridge ${bridgeId}:`, error);
      }
    }

    return null;
  }

  /**
   * Checks if the exit point from a bridge is on the opposite side relative to the entry point.
   * Uses angle-based geometry to determine if the path crossed the bridge from one side to another.
   * @param {Point} entryPoint - The point where the path entered the bridge
   * @param {Point} exitPoint - The point where the path exited the bridge
   * @param {SVGRectElement} bridge - The bridge rectangle element
   * @returns {boolean} True if the exit is on the opposite side
   */
  isOppositeSide(entryPoint, exitPoint, bridge) {
    return utilIsOppositeSide(entryPoint, exitPoint, bridge);
  }
}
