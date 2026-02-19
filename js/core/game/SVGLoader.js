import { showMessage } from '@/utils/ui.js';

/**
 * SVGLoader class handles asynchronous loading, parsing, and validation of SVG files.
 * Provides robust error handling for network failures, parse errors, and missing viewBox attributes.
 * Adds accessibility attributes to loaded SVGs for screen reader support.
 *
 * @class SVGLoader
 */
export class SVGLoader {
  constructor() {
    // No state needed for this utility class
  }

  /**
   * Loads an SVG file from the specified path, parses it, and returns the SVG element.
   *
   * @param {string} svgPath - The path to the SVG file to load
   * @returns {Promise<SVGElement>} The parsed and validated SVG element
   * @throws {Error} If the SVG cannot be fetched, parsed, or validated
   */
  async load(svgPath) {
    if (!svgPath) {
      const error = new Error('SVG path is required');
      console.error('SVGLoader.load: No SVG path provided');
      showMessage('Harita yolu bulunamadı.', 'error', 0);
      throw error;
    }

    console.log(`SVGLoader.load: Loading SVG from path: ${svgPath}`);

    try {
      // Fetch the SVG file
      const response = await fetch(svgPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText} for ${svgPath}`);
      }

      const svgString = await response.text();
      console.log(
        `SVGLoader.load: Successfully fetched SVG content from ${svgPath}. Length: ${svgString.length}`
      );

      if (!svgString || svgString.trim().length === 0) {
        throw new Error('SVG content is empty');
      }

      // Parse the SVG string into a DOM element
      const svgElement = this.parseSVG(svgString);

      // Extract and set viewBox
      const viewBox = this.extractViewBox(svgElement);
      if (viewBox) {
        svgElement.setAttribute('viewBox', viewBox);
      }

      // Set preserveAspectRatio for proper scaling
      svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      return svgElement;
    } catch (error) {
      console.error('SVGLoader.load: Critical error during SVG fetching or processing.', error);
      showMessage(`Harita yüklenemedi: ${error.message}`, 'error', 0);
      throw error;
    }
  }

  /**
   * Parses an SVG string into a DOM element using DOMParser.
   * Handles CDATA wrappers, validates the parsed content, and adds accessibility attributes.
   *
   * @param {string} svgString - The SVG content as a string
   * @returns {SVGElement} The parsed SVG element
   * @throws {Error} If parsing fails or the content is invalid
   */
  parseSVG(svgString) {
    // Remove CDATA wrapper if present
    const processedSvgString = this.removeCDATAWrapper(svgString.trim());
    console.log(
      'SVGLoader.parseSVG: Processing SVG string (first 100 chars):',
      processedSvgString.substring(0, 100)
    );

    // Use DOMParser for robust SVG parsing
    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(processedSvgString, 'image/svg+xml');
    console.log('SVGLoader.parseSVG: SVG string parsed using DOMParser.');

    // Validate the parsed document
    if (!this.validateSVG(parsedDocument)) {
      const parserError = parsedDocument.querySelector('parsererror');
      const errorMessage = parserError ? parserError.textContent : 'Unknown parsing error';
      console.error('SVGLoader.parseSVG: DOMParser encountered an error.', errorMessage);
      console.error(
        'SVGLoader.parseSVG: Beginning of string that failed parsing:',
        processedSvgString.substring(0, 200)
      );
      throw new Error(`SVG parsing error: ${errorMessage}`);
    }

    const svgElement = parsedDocument.documentElement;

    if (!svgElement || svgElement.nodeName.toLowerCase() !== 'svg') {
      console.error('SVGLoader.parseSVG: Parsed document root is not <svg>.', svgElement);
      throw new Error('Parsed document root is not an SVG element');
    }

    console.log('SVGLoader.parseSVG: Found <svg> root element in parsed document.');

    // Add accessibility attributes
    this.addAccessibilityAttributes(svgElement);

    return svgElement;
  }

  /**
   * Removes CDATA wrapper from SVG string if present.
   * CDATA wrappers are sometimes used in XML to escape special characters.
   *
   * @param {string} svgString - The SVG content string
   * @returns {string} The SVG string with CDATA wrapper removed (if present)
   */
  removeCDATAWrapper(svgString) {
    const cdataStart = '<![CDATA[';
    const cdataEnd = ']]>';

    if (svgString.startsWith(cdataStart) && svgString.endsWith(cdataEnd)) {
      console.log('SVGLoader.removeCDATAWrapper: Detected CDATA wrapper. Removing it.');
      const unwrapped = svgString
        .substring(cdataStart.length, svgString.length - cdataEnd.length)
        .trim();
      console.log(
        'SVGLoader.removeCDATAWrapper: SVG string after removing CDATA (first 100 chars):',
        unwrapped.substring(0, 100)
      );
      return unwrapped;
    }

    console.log('SVGLoader.removeCDATAWrapper: No CDATA wrapper detected.');
    return svgString;
  }

  /**
   * Extracts or calculates the viewBox attribute for an SVG element.
   * Falls back to width/height attributes if viewBox is missing or invalid.
   *
   * @param {SVGElement} svgElement - The SVG element to extract viewBox from
   * @returns {string|null} The viewBox value, or null if it cannot be determined
   */
  extractViewBox(svgElement) {
    const viewBox = svgElement.getAttribute('viewBox');
    console.log(`SVGLoader.extractViewBox: Source viewBox attribute = "${viewBox}"`);

    // Check if viewBox exists and is valid (contains only numbers, spaces, dots, and hyphens)
    if (viewBox && /^[0-9.\s-]+$/.test(viewBox.trim())) {
      console.log(`SVGLoader.extractViewBox: Valid viewBox found: "${viewBox.trim()}"`);
      return viewBox.trim();
    }

    // Fallback to width/height attributes
    console.warn(
      `SVGLoader.extractViewBox: SVG viewBox is missing or invalid ("${viewBox}"). Attempting fallback.`
    );

    const widthAttr = svgElement.getAttribute('width');
    const heightAttr = svgElement.getAttribute('height');
    const width = widthAttr ? parseInt(widthAttr, 10) : null;
    const height = heightAttr ? parseInt(heightAttr, 10) : null;

    if (width && height && !isNaN(width) && !isNaN(height)) {
      const fallbackViewBox = `0 0 ${width} ${height}`;
      console.log(
        `SVGLoader.extractViewBox: Fallback viewBox calculated: "${fallbackViewBox}" using width/height.`
      );
      return fallbackViewBox;
    }

    console.error(
      `SVGLoader.extractViewBox: Could not determine valid width/height for fallback viewBox. widthAttr="${widthAttr}", heightAttr="${heightAttr}"`
    );
    return null;
  }

  /**
   * Validates that the parsed SVG document does not contain parser errors.
   *
   * @param {Document} parsedDocument - The parsed XML/SVG document
   * @returns {boolean} True if valid, false if parser errors are present
   */
  validateSVG(parsedDocument) {
    const parserError = parsedDocument.querySelector('parsererror');
    return !parserError;
  }

  /**
   * Adds accessibility attributes to the SVG element for screen reader support.
   * Adds title, desc elements, and role="img" attribute.
   * Adds aria-labelledby to reference the title element.
   *
   * @param {SVGElement} svgElement - The SVG element to enhance with accessibility attributes
   */
  addAccessibilityAttributes(svgElement) {
    // Add role="img" for accessibility
    svgElement.setAttribute('role', 'img');

    // Check if title already exists, if not create one
    let titleElement = svgElement.querySelector('title');
    if (!titleElement) {
      titleElement = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      titleElement.id = 'svg-title-' + Date.now(); // Generate unique ID
      titleElement.textContent = 'Euler Yolu Haritası';
      svgElement.insertBefore(titleElement, svgElement.firstChild);
      console.log('SVGLoader.addAccessibilityAttributes: Added title element');
    } else if (!titleElement.id) {
      // If title exists but has no ID, add one
      titleElement.id = 'svg-title-' + Date.now();
    }

    // Check if desc already exists, if not create one
    let descElement = svgElement.querySelector('desc');
    if (!descElement) {
      descElement = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
      descElement.id = 'svg-desc-' + Date.now(); // Generate unique ID
      descElement.textContent =
        'Königsberg köprü problemi haritası. Tüm köprülerden bir kez geçerek yol çizin.';
      // Insert after title
      if (titleElement.nextSibling) {
        svgElement.insertBefore(descElement, titleElement.nextSibling);
      } else {
        svgElement.appendChild(descElement);
      }
      console.log('SVGLoader.addAccessibilityAttributes: Added desc element');
    } else if (!descElement.id) {
      // If desc exists but has no ID, add one
      descElement.id = 'svg-desc-' + Date.now();
    }

    // Add aria-labelledby referencing both title and desc
    svgElement.setAttribute('aria-labelledby', `${titleElement.id} ${descElement.id}`);

    console.log('SVGLoader.addAccessibilityAttributes: Accessibility attributes added');
  }
}
