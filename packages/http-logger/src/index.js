import { moduleLogger } from "@sliit-foss/module-logger";

const logger = moduleLogger("Framework");

const defaultProperties = ["path", "method", "query", "params"];

const generateInfoObject = (req, properties) =>
  properties.reduce((acc, prop) => {
    acc[prop] = req[prop];
    return acc;
  }, {});

const httpLogger =
  ({ whitelists = [], loggable = [] } = {}) =>
  (req, res, next) => {
    const info = generateInfoObject(
      req,
      loggable.length ? [...defaultProperties, ...loggable] : defaultProperties
    );

    if (whitelists.find((route) => req.path.match(new RegExp(route))))
      return next();

    logger.info(`Request Initiated`, info);

    const onFinish = (err) => {
      res.removeListener("error", onFinish);
      res.removeListener("finish", onFinish);

      const error = err || res.err;

      if (error || res.statusCode >= 500) {
        logger.error("Request error", {
          ...info,
          status: res.statusCode,
          error: error,
        });
        return;
      }

      logger.info("Request Completed", info);
    };

    res.on("finish", onFinish);
    res.on("error", onFinish);

    next();

    // eslint-disable-next-line turbo/no-undeclared-env-vars
    if (process.env.HTTP_LOGGER_IS_TEST === "true") {
      onFinish();
    }
  };

export default httpLogger;
