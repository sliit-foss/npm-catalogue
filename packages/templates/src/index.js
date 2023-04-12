import { launchPlop } from "./utils";

export default function (plop) {
  plop.setActionType("stack-resolver", (config) => {
    switch (config.stack) {
      case "Node.js":
        return launchPlop(`./plops/node.plop.js`);
      default:
        console.info(
          "Requested stack is not available in the current version of this generator"
        );
        break;
    }
  });

  plop.setGenerator("templates", {
    description: "Generator options",
    prompts: [
      {
        type: "list",
        name: "stack",
        message: "Which tech stack are you interested in ?",
        choices: ["Node.js"],
      },
    ],
    actions: [
      {
        type: "stack-resolver",
      },
    ],
  });
}
