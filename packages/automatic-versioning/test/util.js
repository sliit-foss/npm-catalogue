import * as fs from "fs";
import run from "../src/utils/runner";

export const commit = async (message, empty) => {
  await run(`git add .`);
  await run(`git commit -m "${message}" ${empty ? "--allow-empty" : ""}`);
};

export const getLastCommitMessage = async () => (await run("git log -1 --pretty=%B"))?.trim();

export const getCurrentBranch = async () => (await run("git rev-parse --abbrev-ref HEAD"))?.trim();

export const getPackageVersion = () => JSON.parse(fs.readFileSync("./package.json").toString()).version;

export const setPackageVersion = (version) => {
  const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());
  packageJson.version = version;
  fs.writeFileSync("./package.json", JSON.stringify(packageJson, null, 2));
};

export const resetPackageJson = () => {
  fs.writeFileSync("./package.json", JSON.stringify({ name: "test", version: "0.0.0" }, null, 2));
};

export const executeVersionScript = async (args) => {
  process.argv = ["", "", ...(args?.split(" ") ?? [])];
  await require("../src/index").default();
};
