export default {
  mutate: [
    "core/**/*.js",
    "extension.js",
    "!prefs/**/*.js",
    "!prefs.js"
  ],

  testRunner: "vitest",

  testFiles: [
    "tests/**/*.test.js",
    "tests/**/*.mutation.test.js"
  ],

  vitest: {
    configFile: "vitest.config.js"
  },

  reporters: ["html", "progress"],
  coverageAnalysis: "off",
  timeoutMS: 60000
};

