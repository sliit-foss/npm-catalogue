import { mapValue, replaceOperator } from "./utils";

const complexOperators = ["and", "or"];

const mongooseFilterQuery = (req, res, next) => {
  try {
    if (req.query.filter) {
      Object.keys(req.query.filter).forEach((key) => {
        const value = req.query.filter[key];
        const complexOp = complexOperators.find((op) =>
          value.startsWith(`${op}(`)
        );
        if (complexOp) {
          const values = replaceOperator(value, complexOp)?.split(",");
          req.query.filter[`$${complexOp}`] = values.map((subValue) => ({
            [key]: mapValue(subValue),
          }));
          delete req.query.filter[key];
        } else {
          req.query.filter[key] = mapValue(value);
        }
      });
    } else {
      req.query.filter = {};
    }
    if (req.query.sort) {
      Object.keys(req.query.sort).forEach((key) => {
        const dir = req.query.sort[key];
        if (dir === "1" || dir === "-1") {
          req.query.sort[key] = parseInt(dir);
        }
      });
    } else {
      req.query.sort = {};
    }
  } catch (e) {
    console.error(
      "[ Mongoose-FilterQuery ] - Failed to parse filters from query",
      e
    );
  }
  next();
};

export default mongooseFilterQuery;
