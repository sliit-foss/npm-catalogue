module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: ["src/**/*.js"],
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 75,
      functions: 75,
      lines: 75,
    },
  },
  testPathIgnorePatterns: ["./node_modules/"],
};
