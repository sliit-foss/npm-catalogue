const TimekeeperPlugin = require("../src/index");
const path = require("path");
const webpack = require("webpack");
const MemoryFS = require("memory-fs");

describe("TimekeeperPlugin", () => {
  it("wraps function calls with tracer", (done) => {
    const compiler = webpack({
      mode: "development",
      entry: path.resolve(__dirname, "sample.js"),
      output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
      },
      plugins: [new TimekeeperPlugin({ ignoreFunctions: ["foo"], clean: false })],
      module: {
        rules: [
          {
            test: /\.js$/,
            use: []
          }
        ]
      }
    });
    compiler.outputFileSystem = new MemoryFS();
    compiler.run((err, stats) => {
      expect(err).toBeNull();
      const output = compiler.outputFileSystem.readFileSync(path.resolve(__dirname, "dist/bundle.js")).toString();
      expect(output).toContain("traced");
      done();
    });
  });
});
