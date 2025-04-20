import chalk from "chalk";

export const fnName = (fn: Function, prefix?: string) => {
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

export const coloredFnName = (fn: string, prefix?: string) =>
  chalk.bold(chalk.magentaBright(prefix ? `${prefix} >>> ${fn}` : fn));
