import mongooseFilterQuery from "../src";
import * as utils from "../src/utils";
import {
  basicFilterReq,
  basicFilterResult,
  complexFilterReq,
  complexFilterResult,
  sortsReq,
  sortResult,
  includeReq,
  includeResult,
  selectReq,
  selectResult,
  req
} from "./__mocks";

describe("test mongoose-filter-query", () => {
  describe("filter", () => {
    test("basic", async () => {
      mongooseFilterQuery(basicFilterReq, {}, () => {});
      expect(basicFilterReq.query.filter).toEqual(basicFilterResult);
    });
    test("complex", async () => {
      mongooseFilterQuery(complexFilterReq, {}, () => {});
      expect(complexFilterReq.query.filter).toEqual(complexFilterResult);
    });
    test("undefined", async () => {
      mongooseFilterQuery(sortsReq, {}, () => {});
      expect(sortsReq.query.filter).toEqual({});
    });
  });
  describe("sort", () => {
    test("basic", async () => {
      mongooseFilterQuery(sortsReq, {}, () => {});
      expect(sortsReq.query.sort).toEqual(sortResult);
    });
    test("undefined", async () => {
      mongooseFilterQuery(req, {}, () => {});
      expect(req.query.sort).toEqual({});
    });
  });
  describe("include", () => {
    test("basic", async () => {
      mongooseFilterQuery(includeReq, {}, () => {});
      expect(includeReq.query.include).toEqual(includeResult);
    });
    test("undefined", async () => {
      mongooseFilterQuery(req, {}, () => {});
      expect(req.query.include).toEqual(undefined);
    });
  });
  describe("select", () => {
    test("basic", async () => {
      mongooseFilterQuery(selectReq, {}, () => {});
      expect(selectReq.query.select).toEqual(selectResult);
    });
    test("undefined", async () => {
      mongooseFilterQuery(req, {}, () => {});
      expect(req.query.select).toEqual(undefined);
    });
  });
  test("handle error", async () => {
    jest.spyOn(utils, "mapValue").mockImplementation(() => {
      throw new Error("test-error");
    });
    const next = jest.fn();
    mongooseFilterQuery(req, {}, next);
    expect(next).toHaveBeenCalled();
  });
});
