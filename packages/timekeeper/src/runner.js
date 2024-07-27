/* eslint-disable no-console */

import { default as fs } from "fs";
import { default as path } from "path";
import { default as util } from "util";

const exec = util.promisify(require("child_process").exec);

const config = {
  presets: ["@babel/preset-env"],
  plugins: [["@sliit-foss/babel-plugin-transform-trace"]]
};

const configPath = path.join(__dirname, "..", "babel.config.js").replace(/\\/g, path.sep);

const runner = async (p, options) => {
  config.plugins[0].push({
    "ignore-functions": options.ignoreFunctions?.split(",") ?? [],
    "clean": options.clean ?? false
  });
  fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(config)}`);
  await exec(
    `npx -p @babel/core@7 -p @babel/node@7 -p @sliit-foss/babel-plugin-transform-trace@0.3.0 -p @sliit-foss/functions@2.10.0 babel-node --config-file=${configPath} ${p}`
  ).then(({ stdout, stderr }) => {
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr.red);
  });
};

export default runner;
