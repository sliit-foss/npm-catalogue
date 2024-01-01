/* eslint-disable no-console */

import { default as fs } from "fs";
import { default as path } from "path";
import { default as util } from "util";

const exec = util.promisify(require("child_process").exec);

const config = {
  presets: ["@babel/preset-env"],
  plugins: [["@sliit-foss/babel-plugin-transform-trace"]]
};

const runner = async (p, options) => {
  config.plugins[0].push({
    "ignore-functions": options.ignoreFunctions?.split(",") ?? [],
    clean: options.clean ?? false
  });

  fs.writeFileSync(path.join(__dirname, "..", "babel.config.js"), `module.exports = ${JSON.stringify(config)}`);

  console.info(`[Timekeeper] transpiling...`.green);

  await exec(
    `npx babel ${p} --out-dir ./out --copy-files --config-file=${path.join(__dirname, "..", "babel.config.js")}`
  );

  console.info(`[Timekeeper] executing...`.green);

  await exec(`bash -c "node out/${path.basename(p)}"`).then(({ stdout, stderr }) => {
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr.red);
  });
};

export default runner;
