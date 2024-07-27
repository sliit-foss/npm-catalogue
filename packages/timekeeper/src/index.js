#!/usr/bin/env node

/* eslint-disable no-console */

import { program } from "commander";
import { version } from "../package.json";
import { default as run } from "./runner";

require("@colors/colors");

program.name("timekeeper").description("CLI tool for automated function execution tracing").version(version);

program
  .option("--ignore-functions <string>", "comma separated list of functions to skip tracing")
  .option("--clean", "skip tracing of anonymous functions")
  .option("--live-reload", "live reload the script when it changes")
  .arguments("<path>", "path to the script to trace")
  .action(run)
  .parse(process.argv);

export default run;
