import type { RequestHandler, Request, Response, NextFunction } from "express";
import { moduleLogger } from "@sliit-foss/module-logger";

const logger = moduleLogger("framework");

const defaultProperties = ["path", "method", "query", "params"];

const generateInfoObject = (req, properties) =>
  properties.reduce(
    (acc, prop) => {
      acc[prop] = req[prop];
      return acc;
    },
    {} as Record<string, unknown>
  );

type HttpLoggerOptions = {
  whitelists?: string[];
  loggable?: string[] | ((req: Request) => object);
  onFinish?: () => void | Promise<void>;
};

/**
 * @description Creates a HTTP logging middleware for Express.js
 * @param options Add options to customize logging
 * @returns A middleware function which will log http requests
 */
export const httpLogger =
  ({ whitelists = [], loggable, onFinish: onFinishExternal }: HttpLoggerOptions = {}): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    const info = generateInfoObject(req, defaultProperties);

    let additionalInfo;

    if (loggable) {
      if (Array.isArray(loggable)) {
        additionalInfo = generateInfoObject(req, loggable);
      } else {
        additionalInfo = loggable(req);
      }
    }

    if (whitelists.find((route) => req.path.match(new RegExp(route)))) return next();

    logger.info(`request initiated`, { ...info, ...additionalInfo });

    const onFinish = (err?: Error) => {
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

      onFinishExternal?.();
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
