#!/usr/bin/env node

/* eslint-disable no-console */

import { default as path } from "path";
import { program, Option } from "commander";
import { version } from "../package.json";
import { defaultRunner, tagBasedRunner } from "./types";

import "@colors/colors";

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
  .option("--tag-based", "run versioning based on git tags")
  .option("--disable-auto-sync", "disable aligning the package version with the last published version");

[
  new Option("--recursive", "recursively search for a matching commit prefix"),
  new Option("--prerelease <boolean>", "run a prerelase version bump"),
  new Option("--prerelease-tag <string>", "prerelease identifier to use when creating a prerelease"),
  new Option("--prerelease-branch <string>", "run prereleases on this branch. This is useful for CI/CD workflows"),
  new Option(
    "--ignore-prefixes <string>",
    "comma separated list of commit prefixes to ignore when searching for a matching prefix"
  )
].forEach((option) => program.addOption(option.conflicts("tagBased")));

const opts = program.parse().opts();

const defaultRootDir = "../../../../";

opts.root ??= defaultRootDir;
opts.ignorePrefixes = opts.ignorePrefixes?.split(",") ?? [];

console.info(`Running versioning script for ${opts.name}`.green);

if (opts.root !== defaultRootDir) {
  const parentDir = path.resolve(__dirname, opts.root);
  process.chdir(parentDir);
}

const run = async () => {
  if (opts.tagBased) {
    await tagBasedRunner(opts.name, opts.skipCommit);
  } else {
    await defaultRunner(
      opts.name,
      opts.skipCommit,
      opts.recursive,
      opts.disableAutoSync,
      opts.prerelease,
      opts.prereleaseTag,
      opts.prereleaseBranch,
      opts.ignorePrefixes
    );
  }
};

if (!process.env.AUTOMATIC_VERSIONING_IS_TEST) {
  run();
}

export default run;
