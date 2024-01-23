import { middleware, set, get } from "../src";
import { middleware as browserMiddleware, set as browserSet, get as browserGet } from "../src/browser";

describe("test store", () => {
  beforeAll(() => {
    middleware({}, {}, () => {});
  });
  test("set and retrieve a value", () => {
    set("foo", "bar");
    expect(get("foo")).toBe("bar");
  });
});

describe("test browser store", () => {
  beforeAll(() => {
    expect(() => browserMiddleware({}, {}, () => {})).toThrowError();
  });
  test("set and retrieve a value", () => {
    browserSet("foo", "bar");
    expect(browserGet("foo")).toBe(null);
  });
});
