import chalk from "chalk";

export const coloredString = (value: string, key?: string) => {
  // istanbul ignore next
  switch (key ?? value) {
    case "url":
    case "message":
      return chalk.bold(value);
    case "url-value":
      return chalk.magenta(value);
    case "get":
      return chalk.greenBright(value);
    case "post":
      return chalk.yellowBright(value);
    case "put":
      return chalk.blueBright(value);
    case "patch":
      return chalk.magentaBright(value);
    case "delete":
      return chalk.redBright(value);
    case "options":
      return chalk.cyanBright(value);
    default:
      return value;
  }
};
