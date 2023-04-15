#!/usr/bin/env node

/* eslint-disable no-console */

import path from "path";

import defaultRunner from "./types/default";
import tagBasedRunner from "./types/tag-based";

require("@colors/colors");

const args = process.argv.slice(2);

const defaultRootDir = "../../../../";

let name = "@sliit-foss/automatic-versioning";
let rootDir = defaultRootDir;
let noCommitEdit = false,
  noCommit = false,
  recursive = false;

args.forEach((arg) => {
  if (arg.includes("--name=")) name = arg.replace("--name=", "");
  if (arg.includes("--rootDir=")) rootDir += arg.replace("--rootDir=", "");
  if (arg.includes("--no-commit-edit")) noCommitEdit = true;
  if (arg.includes("--no-commit")) noCommit = true;
  if (arg.includes("--recursive")) recursive = true;
});

console.log(`Running version bump for ${name}`.green);

if (rootDir !== defaultRootDir) {
  const parentDir = path.resolve(__dirname, rootDir);
  process.chdir(parentDir);
}

if (args.includes("--tag-based")) {
  tagBasedRunner(name, noCommit);
} else {
  defaultRunner(name, noCommit, noCommitEdit, recursive);
}
