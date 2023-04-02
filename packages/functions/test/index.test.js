const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

const {
  traced,
  trace,
  bindKey,
  asyncHandler,
  tracedAsyncHandler,
  cached,
} = require("../src");

jest.mock("@sliit-foss/module-logger", () => ({
  moduleLogger: () => mockLogger,
}));

jest.mock("express-http-context", () => new Map());

beforeEach(() => {
  jest.clearAllMocks();
});

describe("traced", () => {
  test("test normal function", async () => {
    function testFunction() {
      return "test";
    }
    await traced(testFunction)();
    expect(mockLogger.info).toBeCalledWith(
      "_testFunction execution initiated",
      {}
    );
  });
  test("test arrow function", async () => {
    const testArrowFunction = () => "test";
    await traced(testArrowFunction)();
    expect(mockLogger.info).toBeCalledWith(
      "testArrowFunction execution initiated",
      {}
    );
  });
  test("test unnamed function", async () => {
    await traced(() => "test")();
    expect(mockLogger.info).toBeCalledWith(
      "Unnamed function execution initiated",
      {}
    );
  });
  test("test disabled tracing", async () => {
    process.env.DISABLE_FUNCTION_TRACING = "true";
    await traced(() => "test")();
    expect(mockLogger.info).not.toBeCalled();
    delete process.env.DISABLE_FUNCTION_TRACING;
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
describe("bindKey", () => {
  test("test-successfull-bind", async () => {
    const obj = {
      name: "test-object",
      foo() {
        mockLogger.info(`Inside ${this.name} function foo`);
      },
    };
    const preserved = bindKey(obj, "foo");
    expect(preserved.name).toBe("bound foo");
  });
});
describe("asyncHandler", () => {
  const mockReq = {};
  const mockRes = {};
  const mockNext = jest.fn();

  test("test async handler", async () => {
    function testFunction() {
      return "test";
    }
    await asyncHandler(testFunction)(mockReq, mockRes, mockNext);
    expect(mockLogger.info).not.toBeCalled();
    expect(mockNext).toBeCalled();
  });
  test("test async handler with error", async () => {
    function testFunction() {
      throw new Error("test error");
    }
    await asyncHandler(testFunction)(mockReq, mockRes, mockNext);
    expect(mockLogger.error).toBeCalled();
    expect(mockNext).toBeCalled();
  });
  test("test traced async handler", async () => {
    function testTracedFunction() {
      return "test";
    }
    await tracedAsyncHandler(testTracedFunction)(mockReq, mockRes, mockNext);
    expect(mockLogger.info).toBeCalledWith(
      "_testTracedFunction execution initiated",
      {}
    );
    expect(mockNext).toBeCalled();
  });
});

describe("cached", () => {
  test("test cache", () => {
    const key = "123";
    const fn = jest.fn(() => "function result");
    cached(key, fn);
    cached(key, fn);
    expect(fn).toBeCalledTimes(1);
  });
  test("test async cache", async () => {
    const key = "321";
    const fn = jest.fn(async () => "async function result");
    await cached(key, fn);
    await cached(key, fn);
    expect(fn).toBeCalledTimes(1);
  });
});
