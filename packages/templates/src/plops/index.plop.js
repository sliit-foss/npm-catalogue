import { launchPlop } from "../index.js";

const stacks = [
  {
    name: "Node.js",
    path: "node"
  },
  {
    name: "Flutter",
    path: "flutter"
  }
];

export default function (plop) {
  plop.setActionType("Select tech stack", (config) => {
    global.stack = stacks.find((stack) => stack.name === config.stack)?.path;
    if (global.stack) {
      return launchPlop(`./plops/${global.stack}.plop.js`);
    }
    return console.info("Requested stack is not available in the current version of this generator");
  });

  plop.setGenerator("templates", {
    description: "Generator options",
    prompts: [
      {
        type: "list",
        name: "stack",
        message: "Which tech stack are you interested in?",
        choices: stacks.map((stack) => stack.name)
      }
    ],
    actions: [
      {
        type: "Select tech stack"
      }
    ]
  });
}
