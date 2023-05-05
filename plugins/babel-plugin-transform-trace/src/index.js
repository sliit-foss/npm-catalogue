import template from "@babel/template";
import { declare } from "@babel/helper-plugin-utils";
import { types as t } from "@babel/core";

export default declare((api) => {
  api.assertVersion(7);

  return {
    name: "transform-trace",
    visitor: {
      Program(path, state) {
        const tracer = state.opts.clean ? "cleanTraced" : "traced";
        let tracedImportExists = false;
        path.traverse({
          Identifier(p) {
            if (p.node.name === tracer) {
              tracedImportExists = true;
              p.stop();
            }
          }
        });
        if (!tracedImportExists) {
          path.node.body.unshift(template.ast(`const { ${tracer} } = require('@sliit-foss/functions') ;\n`));
        }
      },
      CallExpression: {
        enter(path, state) {
          const { node } = path;

          const callee = node.callee?.callee ?? node.callee;

          let exclusions = ["traced", "trace", "cleanTrace", "cleanTraced", "require", "import"];

          if (state.opts["ignore-functions"]) exclusions = exclusions.concat(state.opts["ignore-functions"]);

          if (!t.isCallExpression(node) || !callee.name || exclusions.includes(callee.name)) return;

          path.replaceWith(
            t.callExpression(
              t.callExpression(t.identifier(state.opts.clean ? "cleanTraced" : "traced"), [node.callee]),
              node.arguments
            )
          );
        }
      }
    }
  };
});
