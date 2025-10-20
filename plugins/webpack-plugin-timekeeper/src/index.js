const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");
const exclusions = require("./exclusions");

class TimekeeperPlugin {
  constructor(options = {}) {
    this.ignoreFunctions = options.ignoreFunctions || [];
    this.clean = !!options.clean;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync("TimekeeperPlugin", (compilation, callback) => {
      const tracer = this.clean ? "cleanTraced" : "traced";
      const ignoreList = exclusions.concat(this.ignoreFunctions);

      Object.keys(compilation.assets).forEach((filename) => {
        if (!filename.endsWith(".js")) return;
        const source = compilation.assets[filename].source();
        let ast;
        try {
          ast = parse(source, { sourceType: "module", plugins: ["jsx", "typescript"] });
        } catch (e) {
          return;
        }
        let tracedImportExists = false;
        traverse(ast, {
          Identifier(path) {
            if (path.node.name === tracer) {
              tracedImportExists = true;
              path.stop();
            }
          }
        });
        if (!tracedImportExists) {
          ast.program.body.unshift(
            t.variableDeclaration("var", [
              t.variableDeclarator(
                t.objectPattern([t.objectProperty(t.identifier(tracer), t.identifier(tracer), false, true)]),
                t.callExpression(t.identifier("require"), [t.stringLiteral("@sliit-foss/functions")])
              )
            ])
          );
        }
        traverse(ast, {
          CallExpression(path) {
            const callee = path.node.callee?.callee ?? path.node.callee;
            if (!callee.name || ignoreList.includes(callee.name)) return;
            path.replaceWith(
              t.callExpression(t.callExpression(t.identifier(tracer), [path.node.callee]), path.node.arguments)
            );
          }
        });
        const output = generate(ast, {}, source).code;
        compilation.assets[filename] = {
          source: () => output,
          size: () => output.length
        };
      });
      callback();
    });
  }
}

module.exports = TimekeeperPlugin;
