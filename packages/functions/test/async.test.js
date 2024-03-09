const { mockLogger } = require("./__mocks__");

const { asyncHandler, tracedAsyncHandler, plainAsyncHandler } = require("../src");
const { coloredFnName } = require("../src/utils");

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
    expect(mockLogger.info).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
  test("test async handler with error", async () => {
    function testFunction() {
      throw new Error("test error");
    }
    await asyncHandler(testFunction)(mockReq, mockRes, mockNext);
    expect(mockLogger.error).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
  test("test traced async handler", async () => {
    await tracedAsyncHandler(function testTracedFunction() {
      return "test";
    })(mockReq, mockRes, mockNext);
    expect(mockLogger.info).toHaveBeenCalledWith(`${coloredFnName("testTracedFunction")} execution initiated`, {});
    expect(mockNext).toHaveBeenCalled();
  });
  test("test plain async handler with async function", async () => {
    await plainAsyncHandler(async () => {
      throw new Error("test")
    })(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
  test("test plain async handler with normal function", async () => {
    await plainAsyncHandler(() => {
      throw new Error("test")
    })(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
