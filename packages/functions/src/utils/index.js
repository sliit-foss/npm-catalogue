import chalk from "chalk";

export const fnName = (fn) => {
  let name = fn.name;
  while (1) {
    const replaced = name?.replace("bound", "");
    if (name.startsWith("bound") && replaced?.startsWith(" ")) name = replaced?.trim();
    else break;
  }
  if (!name) return coloredFnName("Unnamed function");
  if (name.startsWith(" ")) return name.slice(1);
  return coloredFnName(name);
};

export const coloredFnName = (fn) => chalk.bold(chalk.magentaBright(fn));
