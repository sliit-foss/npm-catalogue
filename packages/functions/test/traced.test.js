const { mockLogger } = require("./__mocks__");

const { traced, trace, cleanTrace, cleanTraced } = require("../src");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("traced", () => {
  test("test normal function", () => {
    traced(function testFunction() {
      return "test";
    })();
    expect(mockLogger.info).toBeCalledWith("testFunction execution initiated", {});
  });
  test("test async function", async () => {
    await traced(async function testFunction() {
      return "test";
    })();
    expect(mockLogger.info).toBeCalledWith("testFunction execution initiated", {});
  });
  test("test arrow function", () => {
    const testArrowFunction = () => "test";
    traced(testArrowFunction)();
    expect(mockLogger.info).toBeCalledWith("testArrowFunction execution initiated", {});
  });
  test("test unnamed function", () => {
    traced(() => "test")();
    expect(mockLogger.info).toBeCalledWith("Unnamed function execution initiated", {});
  });
  test("test disabled tracing", () => {
    process.env.DISABLE_FUNCTION_TRACING = "true";
    traced(() => "test")();
    expect(mockLogger.info).not.toBeCalled();
    delete process.env.DISABLE_FUNCTION_TRACING;
  });
  test("test cascading errors", () => {
    const tracedOuterFn = traced(function outerFn() {
      traced(function innerFn() {
        throw new Error("Failure in innner function");
      })();
    });
    try {
      tracedOuterFn();
    } catch (e) {
      expect(mockLogger.error).toBeCalledTimes(1);
    }
  });
});

describe("trace", () => {
  test("test trace execution", () => {
    trace(function foo() {
      return "test";
    });
    expect(mockLogger.info).toBeCalledWith("foo execution initiated", {});
  });
});

describe("clean-trace", () => {
  test("test normal function", () => {
    cleanTrace(function namedFunction() {
      return "test";
    });
    expect(mockLogger.info).toBeCalledWith("namedFunction execution initiated", {});
  });
  test("test unnamed function", () => {
    cleanTrace(() => "test");
    expect(mockLogger.info).not.toBeCalled();
  });
});

describe("clean-traced", () => {
  test("test normal function", () => {
    cleanTraced(function namedFunction() {
      return "test";
    })();
    expect(mockLogger.info).toBeCalledWith("namedFunction execution initiated", {});
  });
  test("test unnamed function", () => {
    cleanTraced(() => "test")();
    expect(mockLogger.info).not.toBeCalled();
  });
});
