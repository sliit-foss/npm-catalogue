const { mockLogger } = require("./__mocks__");

import { Request, Response } from "express";
import { asyncHandler, tracedAsyncHandler, fallibleAsyncHandler, plainAsyncHandler } from "../src";
import { coloredFnName } from "../src/utils";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("asyncHandler", () => {
  const mockReq = {} as Request;
  const mockRes = {} as Response;
  const mockNext = jest.fn();

  test("test async handler", async () => {
    function testFunction() {
      return;
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
      return;
    })(mockReq, mockRes, mockNext);
    expect(mockLogger.info).toHaveBeenCalledWith(`${coloredFnName("testTracedFunction")} execution initiated`, {});
    expect(mockNext).toHaveBeenCalled();
  });
  test("test fallible async handler", async () => {
    await fallibleAsyncHandler(function testTracedFunction() {
      throw new Error("test error");
    })(mockReq, mockRes, mockNext);
    expect(mockLogger.warn).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
  test("test plain async handler with async function", async () => {
    await plainAsyncHandler(async () => {
      throw new Error("test");
    })(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
  test("test plain async handler with normal function", async () => {
    await plainAsyncHandler(() => {
      throw new Error("test");
    })(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
