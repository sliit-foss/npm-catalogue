import fs from "fs";
import { globSync } from "glob";

export const scanDir = (pattern = "**", exclusions = []) => {
  const excludedPatterns = [
    ".turbo/**",
    "node_modules/**",
    "test/**",
    "coverage/**",
    "dist/**",
    "out/**",
    ".babelrc",
    "jest.config.js",
    "package.json",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "*.md",
    ...exclusions
  ];
  const paths = globSync(pattern, { cwd: ".", ignore: excludedPatterns });
  return paths.filter((path) => fs.statSync(path).isFile());
};

export const shellFiles = () => scanDir("**/*.sh");

export const jsFiles = () => scanDir("**/*.js");

export const pyFiles = () => scanDir("**/*.py");
