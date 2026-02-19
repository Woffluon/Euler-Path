import { SVGLoader } from './SVGLoader.js';
import { BridgeManager } from './BridgeManager.js';
import { PathDrawer } from './PathDrawer.js';
import { InteractionHandler } from './InteractionHandler.js';
import { showMessage, hideMessage } from '@/utils/ui.js';
import { markLevelAsCompleted } from '@/storage.js';
import { levels } from '@data/levels.js';

/**
 * GameController - Main game orchestrator coordinating all game modules
 *
 * Coordinates SVGLoader, BridgeManager, PathDrawer, and InteractionHandler.
 * Manages game lifecycle including initialization, reset, completion, and cleanup.
 *
 * @class GameController
 */
export class GameController {
  /**
   * Creates a new GameController instance.
   *
   * @param {HTMLElement} container - The DOM container for the game
   * @param {number} levelIndex - The index of the level to load
   * @param {GameState} gameState - The centralized game state manager
   */
  constructor(container, levelIndex, gameState) {
    this.container = container;
    this.levelIndex = levelIndex;
    this.gameState = gameState;

    // Initialize game modules
    this.svgLoader = new SVGLoader();
    this.bridgeManager = new BridgeManager(gameState);
    this.pathDrawer = new PathDrawer(gameState);
    this.interactionHandler = new InteractionHandler(
      gameState,
      this.bridgeManager,
      this.pathDrawer
    );

    // Store cleanup function for event listeners
    this.cleanupListeners = null;

    // DOM element references
    this.resetButton = null;
    this.backButton = null;
    this.bridgeCounterElement = null;
    this.completionActionsElement = null;

    console.log(`GameController: Created for level ${levelIndex}`);
  }

  /**
   * Initializes the game by loading the SVG, setting up bridges, and attaching event listeners.
   * This is an async method that loads the level SVG and prepares the game for play.
   *
   * @returns {Promise<void>}
   * @throws {Error} If level data is invalid or SVG loading fails
   */
  async initialize() {
    console.log(`GameController: Initializing level ${this.levelIndex}`);

    // Get level data
    const levelData = levels[this.levelIndex];
    if (!levelData || !levelData.svgPath) {
      const error = new Error(`Level data or svgPath not found for index: ${this.levelIndex}`);
      console.error('GameController:', error.message);
      throw error;
    }

    // Store level data in state
    this.gameState.set('currentLevelIndex', this.levelIndex);
    this.gameState.set('levelData', levelData);

    // Get SVG container element
    const svgElement = this.container.querySelector('#game-svg');
    if (!svgElement) {
      const error = new Error('SVG container element not found');
      console.error('GameController:', error.message);
      throw error;
    }

    // Get DOM element references
    this.resetButton = this.container.querySelector('#game-reset-button');
    this.backButton = this.container.querySelector('#game-back-button');
    this.bridgeCounterElement = this.container.querySelector('#bridge-counter');
    this.completionActionsElement = this.container.querySelector('#completion-actions');

    if (
      !this.resetButton ||
      !this.backButton ||
      !this.bridgeCounterElement ||
      !this.completionActionsElement
    ) {
      const error = new Error('One or more essential game screen elements not found');
      console.error('GameController:', error.message);
      throw error;
    }

    try {
      // Load SVG content
      console.log(`GameController: Loading SVG from ${levelData.svgPath}`);
      const loadedSvgElement = await this.svgLoader.load(levelData.svgPath);

      // Clear previous SVG content
      while (svgElement.firstChild) {
        svgElement.removeChild(svgElement.firstChild);
      }

      // Copy viewBox and dimensions from loaded SVG
      const viewBox = this.svgLoader.extractViewBox(loadedSvgElement);
      if (viewBox) {
        svgElement.setAttribute('viewBox', viewBox);
        console.log(`GameController: Set viewBox to "${viewBox}"`);
      }

      const width = loadedSvgElement.getAttribute('width');
      const height = loadedSvgElement.getAttribute('height');
      if (width) svgElement.setAttribute('width', width);
      if (height) svgElement.setAttribute('height', height);

      // Append child nodes from loaded SVG
      Array.from(loadedSvgElement.childNodes).forEach((node) => {
        const importedNode = document.importNode(node, true);
        if (importedNode.nodeType === Node.ELEMENT_NODE) {
          svgElement.appendChild(importedNode);
        }
      });

      console.log('GameController: SVG content loaded and appended');

      // Store SVG element in state
      this.gameState.set('svgElement', svgElement);

      // Add accessibility attributes for keyboard navigation
      svgElement.setAttribute('tabindex', '0');
      svgElement.setAttribute('role', 'application');
      svgElement.setAttribute(
        'aria-label',
        'Oyun alanı - Tüm köprülerden geçmek için çizim yapın. Ok tuşları ile hareket edin, Enter veya Boşluk ile çizime başlayın/bitirin, Escape ile iptal edin.'
      );
      console.log('GameController: Added accessibility attributes to SVG');

      // Create polyline for path drawing
      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      pathElement.setAttribute('class', 'drawn-path');
      pathElement.setAttribute('points', '');
      svgElement.appendChild(pathElement);
      this.gameState.set('pathElement', pathElement);
      console.log('GameController: Created polyline for path drawing');

      // Initialize bridges (deferred to allow DOM to settle)
      setTimeout(() => {
        this.bridgeManager.initialize(svgElement);
        this.updateBridgeCounter();
        console.log('GameController: Bridges initialized');
      }, 0);

      // Set up event listeners
      this.setupEventListeners();

      // Reset game state
      this.reset();

      console.log('GameController: Initialization complete');
    } catch (error) {
      console.error('GameController: Initialization failed', error);
      throw error;
    }
  }

  /**
   * Sets up event listeners for user interactions.
   * Delegates drawing interactions to InteractionHandler and handles button clicks.
   */
  setupEventListeners() {
    const svgElement = this.gameState.get('svgElement');
    if (!svgElement) {
      console.error('GameController: Cannot setup listeners - svgElement not found');
      return;
    }

    // Set up drawing interaction listeners via InteractionHandler
    this.cleanupListeners = this.interactionHandler.setupListeners(svgElement);

    // Subscribe to state changes for completion detection
    this.stateUnsubscribe = this.gameState.subscribe((key, newValue) => {
      if (key === 'isComplete' && newValue === true) {
        this.handleComplete();
      }
      if (key === 'crossedBridgeIds') {
        this.updateBridgeCounter();
      }
      if (key === 'isDrawing' && newValue === true) {
        if (this.resetButton) {
          this.resetButton.disabled = false;
        }
      }
    });

    // Button event listeners
    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => this.reset());
    }

    console.log('GameController: Event listeners set up');
  }

  /**
   * Resets the game to its initial state.
   * Clears the path, resets bridges, and prepares for a new attempt.
   */
  reset() {
    console.log('GameController: Resetting game');

    // Reset game state
    this.gameState.set('isDrawing', false);
    this.gameState.set('isComplete', false);
    this.gameState.set('pathPoints', []);
    this.gameState.set('currentlyInsideBridgeId', null);
    this.gameState.set('justCrossedBridgeId', null);
    this.gameState.set('bridgeEntryPoint', null);
    this.gameState.set('interactionStartPoint', null);

    // Reset crossed bridges
    const crossedBridgeIds = this.gameState.get('crossedBridgeIds');
    crossedBridgeIds.clear();
    this.gameState.set('crossedBridgeIds', crossedBridgeIds);

    // Reset modules
    this.bridgeManager.reset();
    this.pathDrawer.clear();

    // Update UI
    this.updateBridgeCounter();
    hideMessage();

    if (this.resetButton) {
      this.resetButton.disabled = true;
    }

    const svgElement = this.gameState.get('svgElement');
    if (svgElement) {
      svgElement.classList.remove('drawing');
    }

    if (this.completionActionsElement) {
      this.completionActionsElement.classList.add('hidden');
    }

    console.log('GameController: Reset complete');
  }

  /**
   * Handles level completion.
   * Shows success message, marks level as completed, and displays completion actions.
   */
  handleComplete() {
    console.log('GameController: Level completed!');

    // Show success message
    showMessage('Tebrikler! Bu bölümü başarıyla tamamladınız!', 'success', 0);

    // Mark level as completed in storage
    markLevelAsCompleted(this.levelIndex);

    // Disable reset button
    if (this.resetButton) {
      this.resetButton.disabled = true;
    }

    // Show completion actions
    if (this.completionActionsElement) {
      this.completionActionsElement.classList.remove('hidden');
    }
  }

  /**
   * Cleans up event listeners and DOM references.
   * Should be called when navigating away from the game screen.
   */
  destroy() {
    console.log('GameController: Destroying and cleaning up');

    // Remove event listeners
    if (this.cleanupListeners) {
      this.cleanupListeners();
      this.cleanupListeners = null;
    }

    // Unsubscribe from state changes
    if (this.stateUnsubscribe) {
      this.stateUnsubscribe();
      this.stateUnsubscribe = null;
    }

    // Clear DOM references
    this.resetButton = null;
    this.backButton = null;
    this.bridgeCounterElement = null;
    this.completionActionsElement = null;

    console.log('GameController: Cleanup complete');
  }

  /**
   * Updates the bridge counter display.
   * Shows the number of crossed bridges out of total bridges.
   *
   * @private
   */
  updateBridgeCounter() {
    if (this.bridgeCounterElement) {
      const crossedBridgeIds = this.gameState.get('crossedBridgeIds');
      const totalBridges = this.gameState.get('totalBridges');
      this.bridgeCounterElement.textContent = `Geçilen Köprüler: ${crossedBridgeIds.size} / ${totalBridges}`;
    }
  }
}
