const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude the jdk17 folder so Metro bundler doesn't try to index it and crash
config.resolver.blockList = [
  ...Array.from(config.resolver.blockList || []),
  /.*\/jdk17\/.*/,
  /.*\\jdk17\\.*/,
];

module.exports = config;
