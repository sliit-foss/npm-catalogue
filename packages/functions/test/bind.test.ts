const { mockLogger } = require("./__mocks__");

import { bindKey, preserveContext } from "../src";

describe("bindKey", () => {
  test("test-successful-bind", async () => {
    const obj = {
      name: "test-object",
      foo() {
        mockLogger.info(`Inside ${this.name} function foo`);
      }
    };
    const preserved = bindKey(obj, "foo");
    expect(preserved.name).toBe("bound foo");
  });
  test("test-successful-context-preserve", async () => {
    const obj = {
      name: "test-object",
      foo() {
        mockLogger.info(`Inside ${this.name} function foo`);
      }
    };
    const preserved = preserveContext(obj, "foo");
    expect(preserved.name).toBe("bound foo");
    preserved();
    expect(mockLogger.info).toHaveBeenCalledWith("Inside test-object function foo");
  });
});
