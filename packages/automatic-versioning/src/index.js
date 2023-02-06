#!/usr/bin/env node

require('colors');
import path from "path";

import defaultRunner from "./types/default"
import tagBasedRunner from "./types/tag-based"

const args = process.argv.slice(2);

const defaultRootDir = "../../../../";

let name = "@sliit-foss/automatic-versioning", rootDir = defaultRootDir;
let noCommitEdit = false;

args.forEach((arg) => {
  if (arg.includes("--name=")) name = arg.replace("--name=", "");
  if (arg.includes("--run-from-root")) runFromRoot = true;
  if (arg.includes("--rootDir=")) rootDir += arg.replace("--rootDir=", "");
  if (arg.includes("--no-commit-edit")) noCommitEdit = true;
});

console.log(`Running version bump for ${name}`.green);

if (rootDir !== defaultRootDir) {
  const parentDir = path.resolve(__dirname, rootDir);
  process.chdir(parentDir);
}

if (args.includes("--tag-based")) {
  tagBasedRunner(name);
} else {
  defaultRunner(name, noCommitEdit);
}
