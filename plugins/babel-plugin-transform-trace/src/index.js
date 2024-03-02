import template from "@babel/template";
import { declare } from "@babel/helper-plugin-utils";
import { types as t } from "@babel/core";
import { default as defaultExclusions } from "./exclusions";

const exclusions = defaultExclusions;

export default declare((api, opts) => {
  api.assertVersion(7);

  if (opts["ignore-functions"]) exclusions.push(...opts["ignore-functions"]);

  const tracer = opts.clean ? "cleanTraced" : "traced";

  return {
    name: "transform-trace",
    visitor: {
      Program(path) {
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
          path.node.body.unshift(template.ast(`var { ${tracer} } = require('@sliit-foss/functions') ;\n`));
        }
      },
      CallExpression: {
        enter(path) {
          const { node } = path;

          const callee = node.callee?.callee ?? node.callee;

          if (!t.isCallExpression(node) || !callee.name || exclusions.includes(callee.name)) return;

          path.replaceWith(t.callExpression(t.callExpression(t.identifier(tracer), [node.callee]), node.arguments));
        }
      }
    }
  };
});
