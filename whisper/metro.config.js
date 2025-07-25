const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Relax the ESM import rules
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
