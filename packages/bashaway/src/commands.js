import exec from "@sliit-foss/actions-exec-wrapper";

const countLines = (str) => str.split(/\r\n|\r|\n/).length;

export const dependencyCount = () => exec("npm ls --parseable").then((output) => countLines(output) - 2);

export const globalDependencyCount = () => exec("npm ls -g --parseable").then((output) => countLines(output) - 2);

export const prohibitedCommands = /(npm|pnpm|yarn|npx)\s+(i|install|add|exec|dlx)\s+\S+/g;
