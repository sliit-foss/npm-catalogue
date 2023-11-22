import fs from "fs";
import { globSync } from "glob";

export const scan = (pattern = "**", exclusions = []) => {
  exclusions = [
    ".turbo/**",
    "node_modules/**",
    "test/**",
    "coverage/**",
    "types/**",
    "dist/**",
    "out/**",
    ".babelrc",
    ".gitignore",
    ".gitkeep",
    "jest.config.js",
    "package.json",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "*.md",
    ...exclusions
  ];
  const paths = globSync(pattern, { cwd: ".", ignore: exclusions });
  return paths.filter((path) => fs.statSync(path).isFile());
};

export const scanPure = (pattern = "**", exclusions = []) => {
  const paths = globSync(pattern, { cwd: ".", ignore: exclusions });
  return paths.filter((path) => fs.statSync(path).isFile());
};

export const shellFiles = (exclusions = []) => scan("**/*.sh", exclusions);

export const jsFiles = (exclusions = []) => scan("**/*.js", exclusions);

export const pyFiles = (exclusions = []) => scan("**/*.py", exclusions);
