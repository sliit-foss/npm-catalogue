/* eslint-disable no-console */

import { default as fs } from "fs";
import { default as path } from "path";
import { default as util } from "util";

const exec = util.promisify(require("child_process").exec);

const config = {
  presets: ["@babel/preset-env"],
  plugins: [["@sliit-foss/babel-plugin-transform-trace"]]
};

const outputDir = path.join(__dirname, "..", "out");
const configPath = path.join(__dirname, "..", "babel.config.js");

const runner = async (p, options) => {
  config.plugins[0].push({
    "ignore-functions": options.ignoreFunctions?.split(",") ?? [],
    clean: options.clean ?? false
  });

  fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(config)}`);

  console.info(`[Timekeeper] transpiling...`.green);

  await exec(`npx babel ${p} --out-dir ${outputDir} --copy-files --config-file=${configPath}`);

  console.info(`[Timekeeper] executing...`.green);

  await exec(`bash -c "node ${outputDir}/${path.basename(p)}"`).then(({ stdout, stderr }) => {
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr.red);
  });
};

export default runner;
