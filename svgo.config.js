export default {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Preserve bridge IDs - critical for game functionality
          cleanupIds: {
            minify: false,
            preserve: ['bridge-'],
            preservePrefixes: ['bridge-'],
          },
          // Don't convert shapes to paths - breaks bridge detection
          convertShapeToPath: false,
          // Don't merge paths - breaks bridge structure
          mergePaths: false,
          // Don't remove unknown elements/attributes
          removeUnknownsAndDefaults: {
            keepDataAttrs: true,
            keepAriaAttrs: true,
            keepRoleAttr: true,
          },
        },
      },
    },
    {
      name: 'removeViewBox',
      active: false,
    },
    // Explicitly disable shape-to-path conversion
    {
      name: 'convertShapeToPath',
      active: false,
    },
  ],
};
