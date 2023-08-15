const execSync = require("child_process").execSync;

execSync("npx rimraf ./dist && mkdir dist");

require("esbuild")
  .build({
    entryPoints: ["./src/index.js"],
    bundle: true,
    outdir: "./dist",
    platform: "node",
    target: "node14.0",
    format: "cjs",
    minify: true
  })
  .catch(() => process.exit(1));
