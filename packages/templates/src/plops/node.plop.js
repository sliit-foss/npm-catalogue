import fs from "fs";

const templates = [
  {
    name: "Express microservice",
    path: "express-microservice",
  },
  {
    name: "npm-package",
    path: "npm-package",
  }
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
      )?.path;
      if (!fs.existsSync(`./${path}`)) {
        return [
          {
            type: "addMany",
            destination: `.`,
            base: `../stacks/${global.stack}`,
            templateFiles: [
              `../stacks/${global.stack}/${path}/.*`,
              `../stacks/${global.stack}/${path}/.*/*`,
              `../stacks/${global.stack}/${path}/**`,
            ],
          },
        ];
      }
      console.info(
        "Project already exists in the current directory. Skipping template generation..."
      );
      return [];
    },
  });
}
