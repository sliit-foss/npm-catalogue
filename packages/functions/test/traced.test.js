const { mockLogger } = require("./__mocks__");

const { traced, trace } = require("../src");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("traced", () => {
  test("test normal function", async () => {
    function testFunction() {
      return "test";
    }
    await traced(testFunction)();
    expect(mockLogger.info).toBeCalledWith("_testFunction execution initiated", {});
  });
  test("test arrow function", async () => {
    const testArrowFunction = () => "test";
    await traced(testArrowFunction)();
    expect(mockLogger.info).toBeCalledWith("testArrowFunction execution initiated", {});
  });
  test("test unnamed function", async () => {
    await traced(() => "test")();
    expect(mockLogger.info).toBeCalledWith("Unnamed function execution initiated", {});
  });
  test("test disabled tracing", async () => {
    process.env.DISABLE_FUNCTION_TRACING = "true";
    await traced(() => "test")();
    expect(mockLogger.info).not.toBeCalled();
    delete process.env.DISABLE_FUNCTION_TRACING;
  });
  test("test cascading errors", async () => {
    const tracedOuterFn = traced(async function outerFn() {
      await traced(function innerFn() {
        throw new Error("Failure in innner function");
      })();
    });
    await tracedOuterFn().catch(() => {
      expect(mockLogger.error).toBeCalledTimes(1);
    });
  });
});

describe("trace", () => {
  test("test trace execution", async () => {
    function foo() {
      return "test";
    }
    await trace(foo);
    expect(mockLogger.info).toBeCalledWith("_foo execution initiated", {});
  });
});
