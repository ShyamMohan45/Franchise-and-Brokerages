if (!process.env.EXPO_NO_METRO_WORKSPACE_ROOT) {
  process.env.EXPO_NO_METRO_WORKSPACE_ROOT = '1';
}
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
