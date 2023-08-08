import fs from "fs";
import { globSync } from "glob";

export const scanDir = (pattern = "**", exclusions = []) => {
  const excludedPatterns = [
    ".turbo/**",
    "node_modules/**",
    "test/**",
    "coverage/**",
    "types/**",
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

export const shellFiles = (exclusions = []) => scanDir("**/*.sh", exclusions);

export const jsFiles = (exclusions = []) => scanDir("**/*.js", exclusions);

export const pyFiles = (exclusions = []) => scanDir("**/*.py", exclusions);
