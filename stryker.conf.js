export default {
  mutate: [
    "core/**/*.js",
    "extensionController.js",
    "extension.js",
    "!prefs/**/*.js",
    "!prefs.js"
  ],

  testRunner: "vitest",

  vitest: {
    configFile: "vitest.config.cjs"
  },

  reporters: ["html", "progress"],
  coverageAnalysis: "off",
  timeoutMS: 60000
};

