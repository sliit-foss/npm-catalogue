module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  collectCoverageFrom: ["src/**/*.js", "src/**/*.ts"],
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 65,
      functions: 75,
      lines: 75
    }
  },
  testPathIgnorePatterns: ["./node_modules/"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.js$": "babel-jest"
  }
};
