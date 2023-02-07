import mongooseFilterQuery from "../src";
import * as utils from "../src/utils";
import {
  basicFilterReq,
  basicFilterResult,
  complexFilterReq,
  complexFilterResult,
  sortsReq,
  sortResult,
  req,
} from "./__mocks";

describe("test mongoose-filter-query", () => {
  test("test-basic-filters", async () => {
    mongooseFilterQuery(basicFilterReq, {}, () => {});
    expect(basicFilterReq.query.filter).toEqual(basicFilterResult);
  });
  test("test-complex-filters", async () => {
    mongooseFilterQuery(complexFilterReq, {}, () => {});
    expect(complexFilterReq.query.filter).toEqual(complexFilterResult);
  });
  test("test-filter-req - no filters specified", async () => {
    mongooseFilterQuery(sortsReq, {}, () => {});
    expect(sortsReq.query.filter).toEqual({});
  });
  test("test-sorts-req", async () => {
    mongooseFilterQuery(sortsReq, {}, () => {});
    expect(sortsReq.query.sort).toEqual(sortResult);
  });
  test("test-sorts-req - no sorts specified", async () => {
    mongooseFilterQuery(req, {}, () => {});
    expect(req.query.sort).toEqual({});
  });
  test("handle-error", async () => {
    jest.spyOn(utils, "mapValue").mockImplementation(() => {
      throw new Error("test-error");
    });
    const next = jest.fn();
    mongooseFilterQuery(req, {}, next);
    expect(next).toHaveBeenCalled();
  });
});
