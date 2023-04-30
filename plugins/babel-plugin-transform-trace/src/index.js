import template from "@babel/template";
import { declare } from "@babel/helper-plugin-utils";
import { types as t } from "@babel/core";

export default declare((api) => {
  api.assertVersion(7);

  return {
    name: "transform-trace",
    visitor: {
      Program(path) {
        let tracedImportExists = false;
        path.traverse({
          Identifier(p) {
            if (p.node.name === "traced") {
              tracedImportExists = true;
              p.stop();
            }
          },
        });
        if (!tracedImportExists) {
          const tracedImport = template.ast(
            `const { traced } = require('@sliit-foss/functions') ;\n`
          );
          path.node.body.unshift(tracedImport);
        }
      },
      CallExpression: {
        enter(path) {
          const { node } = path;

          const callee = node.callee?.callee ?? node.callee;

          const exclusions = ["traced", "require"];

          if (
            !t.isCallExpression(node) ||
            !callee.name ||
            exclusions.includes(callee.name)
          )
            return;

          path.replaceWith(
            t.callExpression(
              t.callExpression(t.identifier("traced"), [node.callee]),
              node.arguments
            )
          );
        },
      },
    },
  };
});
