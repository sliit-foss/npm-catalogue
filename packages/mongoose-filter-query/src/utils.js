export const replaceOperator = (value, operator) => {
  value = value.replace(`${operator}(`, "").slice(0, -1);
  return isNaN(value) ? value : Number(value);
};

export const mapValue = (value) => {
  if (value.startsWith("eq(")) {
    value = replaceOperator(value, "eq");
    if (value === "true" || value === "false") {
      return { $eq: value === "true" };
    }
    return { $eq: value };
  } else if (value.startsWith("ne(")) {
    return { $ne: replaceOperator(value, "ne") };
  } else if (value.startsWith("gt(")) {
    return { $gt: replaceOperator(value, "gt") };
  } else if (value.startsWith("gte(")) {
    return { $gte: replaceOperator(value, "gte") };
  } else if (value.startsWith("lt(")) {
    return { $lt: replaceOperator(value, "lt") };
  } else if (value.startsWith("lte(")) {
    return { $lte: replaceOperator(value, "lte") };
  } else if (value.startsWith("in(")) {
    return { $in: replaceOperator(value, "in").split(",") };
  } else if (value.startsWith("nin(")) {
    return { $nin: replaceOperator(value, "nin").split(",") };
  } else if (value.startsWith("reg(")) {
    return { $regex: new RegExp(replaceOperator(value, "reg")) };
  } else if (value.startsWith("exists(")) {
    return { $exists: replaceOperator(value, "exists") === "true" };
  }
  return value;
};
