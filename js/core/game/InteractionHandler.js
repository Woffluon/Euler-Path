import {
  getSVGCoordinates,
  isPointOnDrawableArea,
  lineSegmentIntersectsRect,
} from '@utils/utils.js';
import CONFIG from '@data/config.js';

/**
 * InteractionHandler processes mouse and touch events for the game.
 * Handles drawing interactions, coordinate transformations, and gesture handling.
 *
 * @class InteractionHandler
 */
export class InteractionHandler {
  /**
   * Creates an InteractionHandler instance.
   *
   * @param {Object} gameState - The centralized game state manager
   * @param {BridgeManager} bridgeManager - The bridge manager instance
   * @param {PathDrawer} pathDrawer - The path drawer instance
   */
  constructor(gameState, bridgeManager, pathDrawer) {
    this.gameState = gameState;
    this.bridgeManager = bridgeManager;
    this.pathDrawer = pathDrawer;
    this.drawingStarted = false;
  }

  /**
   * Sets up mouse and touch event listeners on the SVG element.
   * Returns a cleanup function to remove all event listeners.
   *
   * @param {SVGElement} svgElement - The SVG element to attach listeners to
   * @returns {Function} Cleanup function to remove event listeners
   */
  setupListeners(svgElement) {
    if (!svgElement) {
      console.error('InteractionHandler: svgElement is null or undefined');
      return () => {};
    }

    // Keyboard cursor position (in SVG coordinates)
    this.keyboardCursor = null;

    // Unified interaction handlers
    const onInteractionStart = (event) => {
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      this.drawingStarted = this.handleStart(clientX, clientY);
      if (this.drawingStarted && event.cancelable) {
        event.preventDefault();
      }
    };

    const onInteractionMove = (event) => {
      const isDrawing = this.gameState.get('isDrawing');
      if (!isDrawing) return;
      if (event.cancelable) {
        event.preventDefault();
      }
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      this.handleMove(clientX, clientY);
    };

    const onInteractionEnd = () => {
      if (this.drawingStarted) {
        this.handleEnd();
        this.drawingStarted = false;
      }
    };

    // Keyboard event handler
    const onKeyDown = (event) => {
      this.handleKeyDown(event);
    };

    // Mouse Events
    svgElement.addEventListener('mousedown', onInteractionStart);
    window.addEventListener('mousemove', onInteractionMove);
    window.addEventListener('mouseup', onInteractionEnd);

    // Touch Events
    svgElement.addEventListener('touchstart', onInteractionStart, { passive: false });
    svgElement.addEventListener('touchmove', onInteractionMove, { passive: false });
    svgElement.addEventListener('touchend', onInteractionEnd);
    svgElement.addEventListener('touchcancel', onInteractionEnd);

    // Keyboard Events
    svgElement.addEventListener('keydown', onKeyDown);

    // Return cleanup function
    return () => {
      svgElement.removeEventListener('mousedown', onInteractionStart);
      window.removeEventListener('mousemove', onInteractionMove);
      window.removeEventListener('mouseup', onInteractionEnd);
      svgElement.removeEventListener('touchstart', onInteractionStart);
      svgElement.removeEventListener('touchmove', onInteractionMove);
      svgElement.removeEventListener('touchend', onInteractionEnd);
      svgElement.removeEventListener('touchcancel', onInteractionEnd);
      svgElement.removeEventListener('keydown', onKeyDown);
    };
  }

  /**
   * Handles the start of a drawing interaction.
   * Validates the start point and initializes drawing if valid.
   *
   * @param {number} clientX - Client X coordinate
   * @param {number} clientY - Client Y coordinate
   * @returns {boolean} True if drawing started successfully, false otherwise
   */
  handleStart(clientX, clientY) {
    const isComplete = this.gameState.get('isComplete');
    const svgElement = this.gameState.get('svgElement');

    if (isComplete || !svgElement) {
      return false;
    }

    // Wait until bridges are loaded before allowing drawing
    const totalBridges = this.gameState.get('totalBridges');
    const bridgesMap = this.gameState.get('bridgesMap');

    if (totalBridges === 0 && bridgesMap.size === 0) {
      const bridgeElements = svgElement.querySelectorAll('rect[id^="bridge-"]');
      if (bridgeElements.length === 0) {
        // Message will be shown by caller if needed
        return false;
      }
    }

    // Check if point is on drawable area
    if (!this.isPointOnDrawableArea(clientX, clientY)) {
      // Message will be shown by caller if needed
      return false;
    }

    // Get SVG coordinates
    const coords = this.getSVGCoordinates(clientX, clientY);
    if (!coords) {
      return false;
    }

    // Reset game state for new drawing
    this.gameState.set('isComplete', false);
    const crossedBridgeIds = this.gameState.get('crossedBridgeIds');
    crossedBridgeIds.clear();
    this.gameState.set('crossedBridgeIds', crossedBridgeIds);
    this.bridgeManager.reset();

    // Initialize drawing
    this.pathDrawer.startDrawing(coords);
    this.gameState.set('interactionStartPoint', coords);

    // Reset bridge crossing state
    this.gameState.set('currentlyInsideBridgeId', null);
    this.gameState.set('justCrossedBridgeId', null);
    this.gameState.set('bridgeEntryPoint', null);

    return true;
  }

  /**
   * Handles movement during drawing.
   * Processes drawing movement and bridge crossing logic.
   *
   * @param {number} clientX - Client X coordinate
   * @param {number} clientY - Client Y coordinate
   */
  handleMove(clientX, clientY) {
    const isDrawing = this.gameState.get('isDrawing');
    const isComplete = this.gameState.get('isComplete');
    const svgElement = this.gameState.get('svgElement');

    if (!isDrawing || isComplete || !svgElement) {
      return;
    }

    const currentCoords = this.getSVGCoordinates(clientX, clientY);
    if (!currentCoords) {
      return;
    }

    const pathPoints = this.gameState.get('pathPoints');
    const lastPoint = pathPoints[pathPoints.length - 1];
    if (!lastPoint) {
      return;
    }

    // Check minimum distance threshold
    const dx = currentCoords.x - lastPoint.x;
    const dy = currentCoords.y - lastPoint.y;
    if (dx * dx + dy * dy < CONFIG.drawing.minPointDistance) {
      return;
    }

    const isOnDrawable = this.isPointOnDrawableArea(clientX, clientY);

    // Water collision check
    if (!isOnDrawable) {
      // Check if we were inside a bridge when hitting water
      const currentlyInsideBridgeId = this.gameState.get('currentlyInsideBridgeId');
      if (currentlyInsideBridgeId) {
        const exitedBridgeId = currentlyInsideBridgeId;
        const bridgeEntryPoint = this.gameState.get('bridgeEntryPoint');
        const bridgesMap = this.gameState.get('bridgesMap');

        if (
          bridgeEntryPoint &&
          this.bridgeManager.isOppositeSide(
            bridgeEntryPoint,
            currentCoords,
            bridgesMap.get(exitedBridgeId)
          )
        ) {
          const crossedBridgeIds = this.gameState.get('crossedBridgeIds');
          if (!crossedBridgeIds.has(exitedBridgeId)) {
            this.bridgeManager.markCrossed(exitedBridgeId);
          }
        }
      }

      // Stop drawing - caller will handle reset
      this.gameState.set('isDrawing', false);
      if (svgElement) {
        svgElement.classList.remove('drawing');
      }
      return;
    }

    // Find intersecting bridge
    let intersectingBridgeId = null;
    const bridgesMap = this.gameState.get('bridgesMap');
    for (const [bridgeId, bridgeRect] of bridgesMap.entries()) {
      if (lineSegmentIntersectsRect(lastPoint, currentCoords, bridgeRect)) {
        intersectingBridgeId = bridgeId;
        break;
      }
    }

    // Add the current point
    this.pathDrawer.addPoint(currentCoords);

    // Bridge crossing logic
    const currentlyInsideBridgeId = this.gameState.get('currentlyInsideBridgeId');
    const justCrossedBridgeId = this.gameState.get('justCrossedBridgeId');
    const bridgeEntryPoint = this.gameState.get('bridgeEntryPoint');
    const crossedBridgeIds = this.gameState.get('crossedBridgeIds');

    if (intersectingBridgeId) {
      const bridgeId = intersectingBridgeId;

      if (crossedBridgeIds.has(bridgeId)) {
        // Trying to cross an already crossed bridge
        if (bridgeId !== justCrossedBridgeId) {
          // Stop drawing - caller will handle reset
          this.gameState.set('isDrawing', false);
          if (svgElement) {
            svgElement.classList.remove('drawing');
          }
          return;
        } else {
          this.gameState.set('justCrossedBridgeId', null);
          if (currentlyInsideBridgeId !== bridgeId) {
            this.gameState.set('currentlyInsideBridgeId', bridgeId);
            this.gameState.set('bridgeEntryPoint', currentCoords);
          }
        }
      } else {
        // Entering a new, uncrossed bridge
        if (currentlyInsideBridgeId !== bridgeId) {
          if (currentlyInsideBridgeId && currentlyInsideBridgeId !== bridgeId) {
            const exitedBridgeId = currentlyInsideBridgeId;
            if (
              bridgeEntryPoint &&
              this.bridgeManager.isOppositeSide(
                bridgeEntryPoint,
                currentCoords,
                bridgesMap.get(exitedBridgeId)
              )
            ) {
              if (!crossedBridgeIds.has(exitedBridgeId)) {
                this.bridgeManager.markCrossed(exitedBridgeId);
              }
              this.gameState.set('justCrossedBridgeId', exitedBridgeId);
            }
          } else {
            if (justCrossedBridgeId && justCrossedBridgeId !== bridgeId) {
              this.gameState.set('justCrossedBridgeId', null);
            }
          }
          this.gameState.set('currentlyInsideBridgeId', bridgeId);
          this.gameState.set('bridgeEntryPoint', currentCoords);
        }
        if (justCrossedBridgeId === bridgeId) {
          this.gameState.set('justCrossedBridgeId', null);
        }
      }
    } else {
      // Currently moving over land (not a bridge)
      if (currentlyInsideBridgeId) {
        const exitedBridgeId = currentlyInsideBridgeId;
        if (
          bridgeEntryPoint &&
          this.bridgeManager.isOppositeSide(
            bridgeEntryPoint,
            currentCoords,
            bridgesMap.get(exitedBridgeId)
          )
        ) {
          if (!crossedBridgeIds.has(exitedBridgeId)) {
            this.bridgeManager.markCrossed(exitedBridgeId);
          }
          this.gameState.set('justCrossedBridgeId', exitedBridgeId);
        }
        this.gameState.set('currentlyInsideBridgeId', null);
        this.gameState.set('bridgeEntryPoint', null);
      } else if (justCrossedBridgeId) {
        this.gameState.set('justCrossedBridgeId', null);
      }
    }
  }

  /**
   * Handles the end of a drawing interaction.
   * Finalizes drawing and checks for level completion.
   */
  handleEnd() {
    const isDrawing = this.gameState.get('isDrawing');
    const isComplete = this.gameState.get('isComplete');

    if (!isDrawing || isComplete) {
      return;
    }

    this.pathDrawer.endDrawing();

    // Check if the drawing ended inside a bridge and count it if crossed
    const currentlyInsideBridgeId = this.gameState.get('currentlyInsideBridgeId');
    if (currentlyInsideBridgeId) {
      const lastBridgeId = currentlyInsideBridgeId;
      const pathPoints = this.gameState.get('pathPoints');
      const lastPoint = pathPoints[pathPoints.length - 1];
      const bridgeEntryPoint = this.gameState.get('bridgeEntryPoint');
      const bridgesMap = this.gameState.get('bridgesMap');

      if (
        lastPoint &&
        bridgeEntryPoint &&
        bridgesMap.has(lastBridgeId) &&
        this.bridgeManager.isOppositeSide(bridgeEntryPoint, lastPoint, bridgesMap.get(lastBridgeId))
      ) {
        const crossedBridgeIds = this.gameState.get('crossedBridgeIds');
        if (!crossedBridgeIds.has(lastBridgeId)) {
          this.bridgeManager.markCrossed(lastBridgeId);
        }
      }
    }

    // Reset interaction state variables
    this.gameState.set('currentlyInsideBridgeId', null);
    this.gameState.set('justCrossedBridgeId', null);
    this.gameState.set('bridgeEntryPoint', null);
    this.gameState.set('interactionStartPoint', null);

    // Check for level completion
    const totalBridges = this.gameState.get('totalBridges');
    const crossedBridgeIds = this.gameState.get('crossedBridgeIds');

    if (totalBridges > 0 && crossedBridgeIds.size === totalBridges) {
      this.gameState.set('isComplete', true);
    }
  }

  /**
   * Handles keyboard events for navigation and drawing control.
   * Supports arrow keys for cursor movement, Enter/Space for drawing, and Escape for cancel.
   *
   * @param {KeyboardEvent} event - The keyboard event
   */
  handleKeyDown(event) {
    if (!CONFIG.keyboard.enabled) {
      return;
    }

    const isComplete = this.gameState.get('isComplete');
    if (isComplete) {
      return;
    }

    const svgElement = this.gameState.get('svgElement');
    if (!svgElement) {
      return;
    }

    // Handle Tab key - allow default focus navigation
    if (event.key === 'Tab') {
      return;
    }

    // Handle Escape key - cancel drawing and reset
    if (event.key === 'Escape') {
      event.preventDefault();
      const isDrawing = this.gameState.get('isDrawing');
      if (isDrawing) {
        this.handleEnd();
        this.drawingStarted = false;
      }
      // Reset keyboard cursor
      this.keyboardCursor = null;
      return;
    }

    // Initialize keyboard cursor if not set (center of SVG viewBox)
    if (!this.keyboardCursor) {
      const viewBox = svgElement.getAttribute('viewBox');
      if (viewBox) {
        const [x, y, width, height] = viewBox.split(' ').map(Number);
        this.keyboardCursor = {
          x: x + width / 2,
          y: y + height / 2,
        };
      } else {
        // Fallback to center of SVG element
        const bbox = svgElement.getBBox();
        this.keyboardCursor = {
          x: bbox.x + bbox.width / 2,
          y: bbox.y + bbox.height / 2,
        };
      }
    }

    // Handle arrow keys - move cursor
    if (
      event.key === 'ArrowUp' ||
      event.key === 'ArrowDown' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight'
    ) {
      event.preventDefault(); // Prevent page scrolling

      const step = CONFIG.keyboard.arrowKeyStep;

      switch (event.key) {
        case 'ArrowUp':
          this.keyboardCursor.y -= step;
          break;
        case 'ArrowDown':
          this.keyboardCursor.y += step;
          break;
        case 'ArrowLeft':
          this.keyboardCursor.x -= step;
          break;
        case 'ArrowRight':
          this.keyboardCursor.x += step;
          break;
      }

      // If currently drawing, add point at new cursor position
      const isDrawing = this.gameState.get('isDrawing');
      if (isDrawing) {
        // Convert SVG coordinates to client coordinates for validation
        const pt = svgElement.createSVGPoint();
        pt.x = this.keyboardCursor.x;
        pt.y = this.keyboardCursor.y;
        const screenCTM = svgElement.getScreenCTM();
        if (screenCTM) {
          const clientPt = pt.matrixTransform(screenCTM);
          this.handleMove(clientPt.x, clientPt.y);
        }
      }

      return;
    }

    // Handle Enter or Space - start/end drawing
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      const isDrawing = this.gameState.get('isDrawing');

      if (!isDrawing) {
        // Start drawing at keyboard cursor position
        const pt = svgElement.createSVGPoint();
        pt.x = this.keyboardCursor.x;
        pt.y = this.keyboardCursor.y;
        const screenCTM = svgElement.getScreenCTM();
        if (screenCTM) {
          const clientPt = pt.matrixTransform(screenCTM);
          this.drawingStarted = this.handleStart(clientPt.x, clientPt.y);
        }
      } else {
        // End drawing
        this.handleEnd();
        this.drawingStarted = false;
      }

      return;
    }
  }

  /**
   * Converts client coordinates to SVG coordinates.
   *
   * @param {number} clientX - Client X coordinate
   * @param {number} clientY - Client Y coordinate
   * @returns {Object|null} SVG coordinates {x, y} or null if conversion fails
   */
  getSVGCoordinates(clientX, clientY) {
    const svgElement = this.gameState.get('svgElement');
    if (!svgElement) {
      return null;
    }

    return getSVGCoordinates(svgElement, { clientX, clientY });
  }

  /**
   * Checks if a point is on a drawable area (land or bridge).
   *
   * @param {number} clientX - Client X coordinate
   * @param {number} clientY - Client Y coordinate
   * @returns {boolean} True if the point is on land or bridge, false otherwise
   */
  isPointOnDrawableArea(clientX, clientY) {
    const svgElement = this.gameState.get('svgElement');
    if (!svgElement) {
      return false;
    }

    return isPointOnDrawableArea(clientX, clientY, svgElement);
  }
}
