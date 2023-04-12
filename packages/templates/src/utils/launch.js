import path from "path";
import { Plop, run } from "plop";

const args = process.argv.slice(2);

const argv = require("minimist")(args);

export const launchPlop = (plopFilePath) => {
  Plop.launch(
    {
      cwd: argv.cwd,
      configPath: path.join(__dirname, plopFilePath),
      require: argv.require,
      completion: argv.completion,
    },
    run
  );
};
