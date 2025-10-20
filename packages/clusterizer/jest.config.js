module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 65,
      functions: 65,
      lines: 75
    }
  }
};
