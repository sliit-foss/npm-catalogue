import {
  Between,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Raw
} from "typeorm";
import { driver } from "./driver";

export * from "./driver";

const complexOperators = ["and", "or"];

const replaceOperator = (value, operator) => value.replace(`${operator}(`, "").slice(0, -1);

const parseOperatorValue = (value, operator) => {
  if (operator) value = replaceOperator(value, operator);
  if (isNaN(value)) {
    if (!isNaN(Date.parse(value))) {
      value = new Date(value);
    }
  } else {
    value = Number(value);
  }
  return value;
};

export const mapValue = (value) => {
  if (value.startsWith("eq(")) {
    value = parseOperatorValue(value, "eq");
    if (value === "true" || value === "false") {
      return value === "true";
    }
    return value;
  } else if (value.startsWith("ne(")) {
    value = parseOperatorValue(value, "ne");
    if (value === "true" || value === "false") {
      return Not(value === "true");
    }
    return Not(value);
  } else if (value.startsWith("gt(")) {
    return MoreThan(parseOperatorValue(value, "gt"));
  } else if (value.startsWith("gte(")) {
    return MoreThanOrEqual(parseOperatorValue(value, "gte"));
  } else if (value.startsWith("lt(")) {
    return LessThan(parseOperatorValue(value, "lt"));
  } else if (value.startsWith("lte(")) {
    return LessThanOrEqual(parseOperatorValue(value, "lte"));
  } else if (value.startsWith("between(")) {
    return Between(
      ...parseOperatorValue(value, "between")
        .split(",")
        .map((v) => parseOperatorValue(v))
    );
  } else if (value.startsWith("contains(")) {
    if (driver === "postgres" || driver === "postgresql") {
      return Raw((alias) => `:value = ANY(${alias})`, { value: replaceOperator(value, "contains") });
    }
    return Raw((alias) => `JSON_CONTAINS(${alias}, :val)`, { val: `"${replaceOperator(value, "contains")}"` });
  } else if (value.startsWith("excludes(")) {
    if (driver === "postgres" || driver === "postgresql") {
      return Raw((alias) => `NOT (:value = ANY(${alias}))`, { value: replaceOperator(value, "excludes") });
    }
    return Raw((alias) => `NOT JSON_CONTAINS(${alias}, :val)`, { val: `"${replaceOperator(value, "excludes")}"` });
  } else if (value.startsWith("in(")) {
    return In(
      replaceOperator(value, "in")
        .split(",")
        .map((v) => parseOperatorValue(v))
    );
  } else if (value.startsWith("nin(")) {
    return Not(
      In(
        replaceOperator(value, "nin")
          .split(",")
          .map((v) => parseOperatorValue(v))
      )
    );
  } else if (value.startsWith("like(")) {
    return Like(`%${parseOperatorValue(value, "like")}%`);
  } else if (value.startsWith("ilike(")) {
    return ILike(`%${parseOperatorValue(value, "ilike")}%`);
  } else if (value.startsWith("reg(")) {
    /* istanbul ignore next */
    return Raw((alias) => `${alias} REGEXP :pattern`, { pattern: replaceOperator(value, "reg") });
  } else if (value.startsWith("exists(")) {
    return parseOperatorValue(value, "exists") === "true" ? Not(IsNull()) : IsNull();
  }
  if (value === "true" || value === "false") return value === "true";
  return value;
};

export const mapFilters = (filter = {}) => {
  if (filter) {
    Object.keys(filter).forEach((key) => {
      const value = filter[key];
      if (complexOperators.includes(key)) {
        filter = value.split(",").reduce(
          (acc, kv) => {
            const [childKey, value] = kv.split("=");
            if (key === "or") {
              acc.push({ [childKey]: mapValue(value) });
            } else {
              acc[childKey] = mapValue(value);
            }
            return acc;
          },
          key === "or" ? [] : {}
        );
      } else {
        filter[key] = mapValue(value);
      }
    });
  }
  return filter;
};
