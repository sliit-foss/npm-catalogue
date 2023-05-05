import { getRequestQueryParams, getRequestFilters, getRequestSorts } from "../src";

let req = {
  originalUrl: "?filter[name]=Ciri&filter[age]=19&sort=-id&sort=height"
};

describe("test getRequestQueryParams func", () => {
  test("test function", async () => {
    const params = getRequestQueryParams({
      req
    });
    expect(Array.isArray(params)).toBe(true);
    expect(params.length).toEqual(4);
  });
  test("test object return type", async () => {
    const paramObj = getRequestQueryParams({
      req,
      returnObject: true
    });
    expect(Object.keys(paramObj).length).toEqual(4);
    expect(paramObj["filter[name]"]).toEqual("Ciri");
  });
});

describe("test getRequestFilters func", () => {
  test("test function", async () => {
    const params = getRequestFilters({
      req
    });
    expect(Array.isArray(params)).toBe(true);
    expect(params.length).toEqual(2);
  });
  test("test object return type", async () => {
    const paramObj = getRequestFilters({
      req,
      returnObject: true
    });
    expect(Object.keys(paramObj).length).toEqual(2);
    expect(paramObj.name).toEqual("Ciri");
  });
  test("test object return type - mongoose support", async () => {
    const paramObj = getRequestFilters({
      req: {
        originalUrl: "?filter[name]=Ciri&filter[age]=10,12,13,19&sort=-id&sort=height"
      },
      returnObject: true,
      mongooseSupport: true
    });
    expect(Object.keys(paramObj).length).toEqual(2);
    expect(paramObj.age.$in).toEqual(["10", "12", "13", "19"]);
  });
});

describe("test getRequestSorts func", () => {
  test("test function", async () => {
    const params = getRequestSorts({
      req
    });
    expect(Array.isArray(params)).toBe(true);
    expect(params.length).toEqual(2);
    expect(params.filter((param) => param.key == "id")[0].value).toEqual(-1);
    expect(params.filter((param) => param.key == "height")[0].value).toEqual(1);
  });
  test("test object return type", async () => {
    const paramObj = getRequestSorts({
      req,
      returnObject: true
    });
    expect(Object.keys(paramObj).length).toEqual(2);
    expect(paramObj.id).toEqual(-1);
    expect(paramObj.height).toEqual(1);
  });
});
