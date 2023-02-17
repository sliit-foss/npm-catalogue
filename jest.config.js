module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: ["src/**/*.js"],
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 65,
      functions: 75,
      lines: 75,
    },
  },
  testPathIgnorePatterns: ["./node_modules/"],
};
