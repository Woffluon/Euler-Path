import CONFIG from '../../data/config.js';
import { isPointOnDrawableArea } from '../../utils/utils.js';

/**
 * PathDrawer class handles drawing logic, path rendering, and point management.
 * Manages the polyline element that represents the user's drawn path.
 *
 * @class PathDrawer
 */
export class PathDrawer {
  /**
   * Creates a PathDrawer instance.
   *
   * @param {Object} gameState - The centralized game state manager
   */
  constructor(gameState) {
    this.gameState = gameState;
  }

  /**
   * Starts a new drawing path with the initial point.
   *
   * @param {Object} point - The starting point with x and y coordinates
   * @param {number} point.x - X coordinate in SVG space
   * @param {number} point.y - Y coordinate in SVG space
   */
  startDrawing(point) {
    const pathPoints = [point];
    this.gameState.set('pathPoints', pathPoints);
    this.gameState.set('isDrawing', true);
    this.updateVisual();

    const svgElement = this.gameState.get('svgElement');
    if (svgElement) {
      svgElement.classList.add('drawing');
    }
  }

  /**
   * Adds a new point to the path if it meets the distance threshold.
   *
   * @param {Object} point - The point to add with x and y coordinates
   * @param {number} point.x - X coordinate in SVG space
   * @param {number} point.y - Y coordinate in SVG space
   * @returns {boolean} True if the point was added, false otherwise
   */
  addPoint(point) {
    if (!this.shouldAddPoint(point)) {
      return false;
    }

    const pathPoints = this.gameState.get('pathPoints');
    pathPoints.push(point);
    this.gameState.set('pathPoints', pathPoints);
    this.updateVisual();
    return true;
  }

  /**
   * Ends the current drawing session.
   */
  endDrawing() {
    this.gameState.set('isDrawing', false);

    const svgElement = this.gameState.get('svgElement');
    if (svgElement) {
      svgElement.classList.remove('drawing');
    }
  }

  /**
   * Updates the visual representation of the path by updating the polyline points attribute.
   */
  updateVisual() {
    const pathElement = this.gameState.get('pathElement');
    const pathPoints = this.gameState.get('pathPoints');

    if (pathElement && pathPoints) {
      const pathDataString = pathPoints.map((p) => `${p.x},${p.y}`).join(' ');
      pathElement.setAttribute('points', pathDataString);
    }
  }

  /**
   * Clears all path points and updates the visual.
   */
  clear() {
    this.gameState.set('pathPoints', []);
    this.updateVisual();
  }

  /**
   * Checks if a point should be added based on minimum distance threshold.
   *
   * @param {Object} point - The point to check with x and y coordinates
   * @param {number} point.x - X coordinate in SVG space
   * @param {number} point.y - Y coordinate in SVG space
   * @returns {boolean} True if the point should be added, false otherwise
   */
  shouldAddPoint(point) {
    const pathPoints = this.gameState.get('pathPoints');
    if (!pathPoints || pathPoints.length === 0) {
      return true;
    }

    const lastPoint = pathPoints[pathPoints.length - 1];
    if (!lastPoint) {
      return true;
    }

    const dx = point.x - lastPoint.x;
    const dy = point.y - lastPoint.y;
    const distanceSquared = dx * dx + dy * dy;

    return distanceSquared >= CONFIG.drawing.minPointDistance;
  }

  /**
   * Validates if the current path is on a drawable area.
   * This method checks if a given client coordinate is on land or a bridge.
   *
   * @param {number} clientX - Client X coordinate
   * @param {number} clientY - Client Y coordinate
   * @returns {boolean} True if the point is on a drawable area, false otherwise
   */
  isValidPath(clientX, clientY) {
    const svgElement = this.gameState.get('svgElement');
    if (!svgElement) {
      return false;
    }

    return isPointOnDrawableArea(clientX, clientY, svgElement);
  }
}
