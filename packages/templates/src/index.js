#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import minimist from "minimist";
import { Plop, run } from "plop";

const args = process.argv.slice(2);

const argv = minimist(args);

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

export const launchPlop = (plopFilePath) => {
  Plop.prepare(
    {
      cwd: argv.cwd,
      configPath: path.join(__dirname, plopFilePath),
      preload: argv.preload || [],
      completion: argv.completion
    },
    (env) =>
      Plop.execute(env, (env) => {
        const options = {
          ...env,
          dest: process.cwd()
        };
        return run(options, undefined, true);
      })
  );
};

launchPlop("./plops/index.plop.js");
