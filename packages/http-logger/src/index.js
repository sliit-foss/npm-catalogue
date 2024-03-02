import { moduleLogger } from "@sliit-foss/module-logger";

const logger = moduleLogger("framework");

const defaultProperties = ["path", "method", "query", "params"];

const generateInfoObject = (req, properties) =>
  properties.reduce((acc, prop) => {
    acc[prop] = req[prop];
    return acc;
  }, {});

const httpLogger =
  ({ whitelists = [], loggable } = {}) =>
  (req, res, next) => {
    const info = generateInfoObject(req, defaultProperties);

    let additionalInfo;

    if (loggable) {
      if (Array.isArray(loggable)) {
        additionalInfo = generateInfoObject(req, loggable);
      } else {
        additionalInfo = loggable({ headers: req.headers, body: req.body });
      }
    }

    if (whitelists.find((route) => req.path.match(new RegExp(route)))) return next();

    logger.info(`request initiated`, { ...info, ...additionalInfo });

    const onFinish = (err) => {
      res.removeListener("error", onFinish);
      res.removeListener("finish", onFinish);

      const error = err || res.err;

      if (error || res.statusCode >= 500) {
        logger.error("request error", {
          ...info,
          status: res.statusCode,
          error: error
        });
        return;
      }

      logger.info("request completed", info);
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
