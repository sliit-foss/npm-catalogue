const complexOperators = ["and", "or"];

const replaceOperator = (value, operator) => value.replace(`${operator}(`, "").slice(0, -1)

const parseOperatorValue = (value, operator) => {
  value = replaceOperator(value, operator);
  if (isNaN(value)) {
    if (!isNaN(Date.parse(value))) {
      value = new Date(value);
    } else if (/^[0-9a-fA-F]{24}$/.test(value)) {
      const ObjectId = require("bson").ObjectId;
      value = new ObjectId(value);
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
      return { $eq: value === "true" };
    }
    return { $eq: value };
  } else if (value.startsWith("ne(")) {
    return { $ne: parseOperatorValue(value, "ne") };
  } else if (value.startsWith("gt(")) {
    return { $gt: parseOperatorValue(value, "gt") };
  } else if (value.startsWith("gte(")) {
    return { $gte: parseOperatorValue(value, "gte") };
  } else if (value.startsWith("lt(")) {
    return { $lt: parseOperatorValue(value, "lt") };
  } else if (value.startsWith("lte(")) {
    return { $lte: parseOperatorValue(value, "lte") };
  } else if (value.startsWith("in(")) {
    return { $in: parseOperatorValue(value, "in").split(",") };
  } else if (value.startsWith("nin(")) {
    return { $nin: parseOperatorValue(value, "nin").split(",") };
  } else if (value.startsWith("reg(")) {
    return { $regex: new RegExp(replaceOperator(value, "reg")) };
  } else if (value.startsWith("exists(")) {
    return { $exists: parseOperatorValue(value, "exists") === "true" };
  }
  if (value === "true" || value === "false") return value === "true"
  return value;
};

export const mapFilters = (filter = {}) => {
  if (filter) {
    Object.keys(filter).forEach((key) => {
      const value = filter[key];
      if (complexOperators.includes(key)) {
        filter[`$${key}`] = value.split(",").map((kv) => {
          const [key, value] = kv.split("=");
          return { [key]: mapValue(value) };
        });
        delete filter[key];
      } else {
        const complexOp = complexOperators.find((op) => value.startsWith(`${op}(`));
        if (complexOp) {
          const values = parseOperatorValue(value, complexOp)?.split(",");
          filter[`$${complexOp}`] = values.map((subValue) => ({
            [key]: mapValue(subValue)
          }));
          delete filter[key];
        } else {
          filter[key] = mapValue(value);
        }
      }
    });
  }
  return filter;
};
