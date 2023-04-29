const { cached } = require("../src");

jest.mock("express-http-context", () => new Map());

beforeEach(() => {
  jest.clearAllMocks();
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
