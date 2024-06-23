import { mapFilters } from "./utils";

const mongooseFilterQuery = (req, res, next) => {
  try {
    req.query.filter = mapFilters(req.query.filter) ?? {};
    mapFilters(req.query.secondaryFilter);
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
    req.query.include = req.query.include?.split(",");
    req.query.select = req.query.select?.split(",")?.join(" ");
    req.query.prepaginate = req.query.prepaginate === "true";
  } catch (e) {
    console.error("[ FilterQuery ] - Failed to parse query", e);
  }
  next();
};

export default mongooseFilterQuery;
