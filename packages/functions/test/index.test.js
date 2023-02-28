const mockLogger = {
  info: jest.fn(),
};

const { traced, asyncHandler, tracedAsyncHandler } = require("../src");

jest.mock("@sliit-foss/module-logger", () => ({
  moduleLogger: () => mockLogger,
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("traced", () => {
  test("test normal function", async () => {
    function testFunction() {
      return "test";
    }
    await traced(testFunction);
    expect(mockLogger.info).toBeCalledWith(
      "_testFunction execution initiated",
      {}
    );
  });
  test("test arrow function", async () => {
    const testArrowFunction = () => "test";
    await traced(testArrowFunction);
    expect(mockLogger.info).toBeCalledWith(
      "testArrowFunction execution initiated",
      {}
    );
  });
  test("test unnamed function", async () => {
    await traced(() => "test");
    expect(mockLogger.info).toBeCalledWith(
      "Unnamed function execution initiated",
      {}
    );
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
    expect(mockLogger.info).toBeCalled();
    expect(mockNext).toBeCalled();
  });
  test("test traced async handler", async () => {
    function testTracedFunction() {
      return "test";
    }
    await tracedAsyncHandler(testTracedFunction)(mockReq, mockRes, mockNext);
    expect(mockLogger.info).toBeCalledWith(
      "bound _testTracedFunction execution initiated",
      {}
    );
    expect(mockNext).toBeCalled();
  });
});
