#!/usr/bin/env node

/* eslint-disable no-console */

import { default as path } from "path";
import { program, Option } from "commander";
import { version } from "../package.json";
import { defaultRunner, tagBasedRunner } from "./types";

require("@colors/colors");

program
  .name("automatic-versioning")
  .description("CLI for automated commit based semantic versioning with excellent support for monorepositories")
  .version(version);

program
  .addOption(
    new Option("-n, --name <string>", "name of the library being versioned").default("@sliit-foss/automatic-versioning")
  )
  .option("-r, --root <string>", "root directory to use when executing the script")
  .option("--skip-commit", "do not commit the incremented version")
  .option("--tag-based", "run versioning based on git tags");

[
  new Option("--recursive", "recursively search for a matching commit prefix"),
  new Option("--prerelease-tag <string>", "prerelease tag to use when running on a prerelease branch"),
  new Option("--prerelease-branch <string>", "run prereleases on this branch"),
  new Option(
    "--ignore-prefixes <string>",
    "comma separated list of commit prefixes to ignore when searching for a matching prefix"
  )
].forEach((option) => program.addOption(option.conflicts("tagBased")));

const opts = program.parse().opts();

const defaultRootDir = "../../../../";

opts.root ??= defaultRootDir;
opts.ignorePrefixes = opts.ignorePrefixes?.split(",") ?? [];

console.log(`Running versioning script for ${opts.name}`.green);

if (opts.root !== defaultRootDir) {
  const parentDir = path.resolve(__dirname, opts.root);
  process.chdir(parentDir);
}

if (opts.tagBased) {
  tagBasedRunner(opts.name, opts.skipCommit);
} else {
  defaultRunner(
    opts.name,
    opts.skipCommit,
    opts.recursive,
    opts.prereleaseTag,
    opts.prereleaseBranch,
    opts.ignorePrefixes
  );
}
