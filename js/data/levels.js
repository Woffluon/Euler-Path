/**
 * Level definitions for the Euler's Path game.
 * Each level contains a name and path to its SVG file.
 *
 * @module data/levels
 */

/**
 * Array of level definitions.
 * Each level object contains:
 * - name: Display name for the level (in Turkish)
 * - svgPath: Path to the SVG file containing the level map
 *
 * @type {Array<{name: string, svgPath: string}>}
 */
export const levels = [
  { name: 'Birinci Bölüm', svgPath: '/svgs/konigsberg.svg' },
  { name: 'İkinci Bölüm', svgPath: '/svgs/circular.svg' },
  { name: 'Üçüncü Bölüm', svgPath: '/svgs/third.svg' },
  { name: 'Dördüncü Bölüm', svgPath: '/svgs/fourth.svg' },
  // { name: "Üçüncü Bölüm", svgPath: konigsbergVariantSVGPath }, // Uncomment when ready
];
