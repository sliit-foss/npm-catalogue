const { globPlugin } = require("esbuild-plugin-glob");

require("esbuild")
  .build({
    entryPoints: ["./src/**/*.js"],
    bundle: false,
    outdir: "./dist",
    platform: "node",
    target: "node14.0",
    format: "cjs",
    minify: true,
    sourcemap: true,
    keepNames: true,
    plugins: [globPlugin()],
  })
  .catch(() => process.exit(1));
