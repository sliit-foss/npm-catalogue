const { transform } = require("@babel/core");
const plugin = require("../src/index");

const ignoreWhiteSpaces = (str) => str.replace(/\s/g, "");

const transformCode = (code, ignore = [], clean = false) => {
  return ignoreWhiteSpaces(
    transform(code, {
      plugins: [
        [
          plugin,
          {
            "ignore-functions": ignore,
            clean: clean
          }
        ]
      ]
    }).code
  );
};

describe("babel-plugin-transform-trace", () => {
  it("should add import statement if not present", () => {
    const expectedCode = `var { traced } = require('@sliit-foss/functions');`;
    expect(transformCode(``)).toBe(ignoreWhiteSpaces(expectedCode));
  });
  it("should not add import statement if it's already present", () => {
    const code = `var { traced, trace } = require('@sliit-foss/functions');`;
    expect(transformCode(code)).toBe(ignoreWhiteSpaces(code));
  });
  it("should transform function calls", () => {
    const code = `
      function foo() {
        bar();
      }
    `;
    const expectedCode = `
      var { traced } = require('@sliit-foss/functions');

      function foo() {
        traced(bar)();
      } 
    `;
    expect(transformCode(code)).toBe(ignoreWhiteSpaces(expectedCode));
  });

  it("should skip exluded function calls", () => {
    const code = `
      function foo() {
        bar();
        baz();
      }
    `;
    const expectedCode = `
      var { traced } = require('@sliit-foss/functions') ;

      function foo() {
        traced(bar)();
        baz();
      } 
    `;
    expect(transformCode(code, ["baz"])).toBe(ignoreWhiteSpaces(expectedCode));
  });

  it("should use cleanTraced if option is true", () => {
    const code = `
      function foo() {
        bar();
      }
    `;
    const expectedCode = `
      var { cleanTraced } = require('@sliit-foss/functions') ;
    
      function foo() {
        cleanTraced(bar)();
      }
    `;
    expect(transformCode(code, [], true)).toBe(ignoreWhiteSpaces(expectedCode));
  });
});
