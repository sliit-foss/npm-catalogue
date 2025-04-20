const esbuild = require("esbuild");
const execSync = require("child_process").execSync;
const { globPlugin } = require("esbuild-plugin-glob");

execSync("npx rimraf ./dist && mkdir dist");

esbuild
  .build({
    entryPoints: ["./src/**/*.js", "./src/**/*.ts"],
    bundle: false,
    outdir: "./dist",
    platform: "node",
    target: "node14.0",
    format: "cjs",
    minify: true,
    sourcemap: true,
    keepNames: true,
    plugins: [globPlugin()]
  })
  .catch(() => process.exit(1));
