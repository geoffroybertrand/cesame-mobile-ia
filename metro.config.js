const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .bin files (for whisper.rn model)
const defaultAssetExts = config.resolver.assetExts;
config.resolver.assetExts = [
  ...defaultAssetExts,
  'bin', // whisper.rn: ggml model binary
  'mil', // whisper.rn: CoreML model asset
];

module.exports = config;
