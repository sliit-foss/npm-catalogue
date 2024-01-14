import chalk from "chalk";

export const fnName = (fn, prefix) => {
  let name = fn.name;
  while (1) {
    const replaced = name?.replace("bound", "");
    if (name.startsWith("bound") && replaced?.startsWith(" ")) name = replaced?.trim();
    else break;
  }
  if (!name) return coloredFnName("Unnamed function", prefix);
  if (name.startsWith(" ")) return name.slice(1);
  return coloredFnName(name, prefix);
};

export const coloredFnName = (fn, prefix) => chalk.bold(chalk.magentaBright(prefix ? `${prefix}->${fn}` : fn));
