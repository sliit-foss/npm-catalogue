import { RequestHandler, Request } from "express";

/**
 * @description Options for logging middleware function
 */
type HttpLoggerOptions = {
  whitelists?: string[];
  loggable?: string[] | ((req: Request) => object);
};

/**
 * @description Creates a HTTP logging middleware for Express.js
 * @param {HttpLoggerOptions} options Add options to customize logging
 * @returns {RequestHandler} A middleware function which will log http requests
 */
declare const httpLogger: (options: HttpLoggerOptions) => RequestHandler;

export default httpLogger;
