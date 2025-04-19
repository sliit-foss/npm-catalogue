import { middleware, set, get } from "../src";

describe("test store", () => {
  beforeAll(() => {
    middleware({} as any, {} as any, () => {});
  });
  test("set and retrieve a value", () => {
    set("foo", "bar");
    expect(get("foo")).toBe("bar");
  });
});
