/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const defaultAssetExts = require("metro-config/src/defaults/defaults").assetExts;

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        '\\.[jt]sx?$': 'babel-jest',
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    assetExts: [...defaultAssetExts, "css", "html"]
  }
};