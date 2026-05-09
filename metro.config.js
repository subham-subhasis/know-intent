const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'mjs'];
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  buffer: path.resolve(__dirname, 'node_modules/buffer'),
};

module.exports = config;
