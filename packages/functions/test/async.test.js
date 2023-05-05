const { mockLogger } = require("./__mocks__");

const { asyncHandler, tracedAsyncHandler } = require("../src");

beforeEach(() => {
  jest.clearAllMocks();
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
    expect(mockLogger.info).toBeCalledWith("_testTracedFunction execution initiated", {});
    expect(mockNext).toBeCalled();
  });
});
