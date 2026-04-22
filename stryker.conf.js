export default {
  mutate: [
    "core/**/*.js",
    "extensionController.js",
    "extension.js",
    "!prefs/**/*.js",
    "!prefs.js"
  ],

  testRunner: "vitest",

  // ⭐ Put test file patterns here
  testFiles: [
    "tests/**/*.test.js",
    "tests/**/*.mutation.test.js"
  ],

  vitest: {
    configFile: "vitest.config.cjs"
  },

  reporters: ["html", "progress"],
  coverageAnalysis: "off",
  timeoutMS: 60000
};

