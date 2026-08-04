const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add WASM to asset extensions so Metro can bundle expo-sqlite's WebAssembly file
config.resolver.assetExts.push('wasm');

module.exports = config;
