import { default as context } from "@sliit-foss/express-http-context";
import { cached } from "../src";

jest.mock("express-http-context", () => new Map());

beforeEach(() => {
  jest.clearAllMocks();
});

describe("cached", () => {
  test("test cache", () => {
    const key = "123";
    const fn = jest.fn(() => "function result");
    context.isolate(() => {
      cached(key, fn);
      cached(key, fn);
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });
  test("test async cache", () => {
    const key = "321";
    const fn = jest.fn(async () => "async function result");
    context.isolate(async () => {
      await cached(key, fn);
      await cached(key, fn);
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
