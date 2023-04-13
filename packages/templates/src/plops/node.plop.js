import fs from "fs";

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
      )?.path;
      if (fs.existsSync(`./${path}`)) {
        console.info(
          "There already is a folder named in the current directory. Skipping template generation..."
        );
      } else {
        return [
          {
            type: "addMany",
            destination: `.`,
            base: `../stacks/${global.stack}`,
            templateFiles: `../stacks/${global.stack}/${path}/**`,
          },
        ];
      }
    },
  });
}
