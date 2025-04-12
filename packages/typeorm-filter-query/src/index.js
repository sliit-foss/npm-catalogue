import { mapFilters, configureDriver } from "./utils";

export { configureDriver };

const typeormFilterQuery = (req, _, next) => {
  try {
    req.query.filter = mapFilters(req.query.filter) ?? {};
    mapFilters(req.query.secondaryFilter);
    if (req.query.sort) {
      Object.keys(req.query.sort).forEach((key) => {
        const dir = req.query.sort[key];
        if (dir === "1" || dir === "-1") {
          req.query.sort[key] = parseInt(dir);
        } else if (dir === "asc" || dir === "desc") {
          req.query.sort[key] = dir === "asc" ? 1 : -1;
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

export default typeormFilterQuery;
