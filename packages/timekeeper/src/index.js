#!/usr/bin/env node

/* eslint-disable no-console */

import { default as fs } from "fs";
import { default as path } from "path";
import { default as util } from "util";
import { program } from "commander";
import { version } from "../package.json";

const exec = util.promisify(require("child_process").exec);

require("@colors/colors");

const run = async (p, options) => {
  const config = JSON.parse(fs.readFileSync("./babel.config.json", "utf-8"));

  config.plugins[0].push({
    "ignore-functions": options.ignoreFunctions?.split(",") ?? [],
    clean: options.clean ?? false
  });

  fs.writeFileSync("./babel.config.js", `module.exports = ${JSON.stringify(config)}`);

  console.info(`[Timekeeper] transpiling...`.green);

  await exec(`bash -c "node_modules/.bin/babel ${p} --out-dir ./out --copy-files --config-file=./babel.config.js"`);

  console.info(`[Timekeeper] executing...`.green);

  await exec(`bash -c "node out/${path.basename(p)}"`).then(({ stdout, stderr }) => {
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr.red);
  });
};

program.name("timekeeper").description("CLI tool for automated function tracing").version(version);

program
  .option("--ignore-functions <string>", "comma separated list of functions to skip tracing")
  .option("--clean", "skip tracing of anonymous functions")
  .option("--live-reload", "live reload the script when it changes")
  .arguments("<path>", "path to the script to trace")
  .action(run)
  .parse(process.argv);

export default run;
