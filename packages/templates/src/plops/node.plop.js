import fs from "fs";

let appRoot = require("app-root-path");

appRoot = appRoot?.path ?? appRoot;

const templates = [
  {
    name: "Express microservice",
    path: "express-microservice",
  },
];

export default function (plop) {
  plop.setGenerator("templates", {
    description: "Template options",
    prompts: [
      {
        type: "list",
        name: "template",
        message: "Which template do you want to generate ?",
        choices: templates.map((template) => template.name),
      },
    ],
    actions(config) {
      const path = templates.find(
        (template) => template.name === config.template
      );
      if (fs.existsSync(`${appRoot}/${path}`)) {
        console.info(
          "There already is a folder named in the current directory. Skipping template generation..."
        );
      } else {
        return [
          {
            type: "addMany",
            destination: `${appRoot}/${path}`,
            templateFiles: `../stacks/${config.name}/${path}/**/*.js`,
          },
        ];
      }
    },
  });
}
