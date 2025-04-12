import typeormFilterQuery from "../src";
import * as utils from "../src/utils";
import {
  basicFilterReq,
  basicFilterResult,
  complexRootKeyFilterReq,
  complexRootKeyFilterResult,
  sortsReq,
  sortResult,
  includeReq,
  includeResult,
  selectReq,
  selectResult,
  req
} from "./__mocks";

describe("test typeorm-filter-query", () => {
  describe("filter", () => {
    test("basic", async () => {
      typeormFilterQuery(basicFilterReq, {}, () => {});
      expect(basicFilterReq.query.filter).toEqual(basicFilterResult);
    });
    test("complex as root key", async () => {
      typeormFilterQuery(complexRootKeyFilterReq, {}, () => {});
      expect(complexRootKeyFilterReq.query.filter).toEqual(complexRootKeyFilterResult);
    });
    test("undefined", async () => {
      typeormFilterQuery(sortsReq, {}, () => {});
      expect(sortsReq.query.filter).toEqual({});
    });
  });
  describe("sort", () => {
    test("basic", async () => {
      typeormFilterQuery(sortsReq, {}, () => {});
      expect(sortsReq.query.sort).toEqual(sortResult);
    });
    test("undefined", async () => {
      typeormFilterQuery(req, {}, () => {});
      expect(req.query.sort).toEqual({});
    });
  });
  describe("include", () => {
    test("basic", async () => {
      typeormFilterQuery(includeReq, {}, () => {});
      expect(includeReq.query.include).toEqual(includeResult);
    });
    test("undefined", async () => {
      typeormFilterQuery(req, {}, () => {});
      expect(req.query.include).toEqual(undefined);
    });
  });
  describe("select", () => {
    test("basic", async () => {
      typeormFilterQuery(selectReq, {}, () => {});
      expect(selectReq.query.select).toEqual(selectResult);
    });
    test("undefined", async () => {
      typeormFilterQuery(req, {}, () => {});
      expect(req.query.select).toEqual(undefined);
    });
  });
  test("handle error", async () => {
    jest.spyOn(utils, "mapValue").mockImplementation(() => {
      throw new Error("test-error");
    });
    const next = jest.fn();
    typeormFilterQuery(req, {}, next);
    expect(next).toHaveBeenCalled();
  });
});

test("configure driver", () => {
  let driver = require("../src/utils/driver").driver;
  expect(driver).toBe("mysql");
  utils.configureDriver("postgres");
  driver = require("../src/utils/driver").driver;
  expect(driver).toBe("postgres");
});

test("automatic driver recognition", () => {
  process.env.DB_URL = "postgresql://user:pass@localhost:5432/dbname";
  expect(require("../src/utils/driver").getDriverFromConnectionStringOrDefault()).toBe("postgresql");
});
