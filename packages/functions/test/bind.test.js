const { mockLogger } = require("./__mocks__");

const { bindKey } = require("../src");

describe("bindKey", () => {
  test("test-successfull-bind", async () => {
    const obj = {
      name: "test-object",
      foo() {
        mockLogger.info(`Inside ${this.name} function foo`);
      }
    };
    const preserved = bindKey(obj, "foo");
    expect(preserved.name).toBe("bound foo");
  });
});
