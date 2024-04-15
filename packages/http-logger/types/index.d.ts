import { RequestHandler, Request } from "express";

/**
 * @description A function to customize additional logging info
 * @param req The express request object
 * @returns additional data to be logged as key value pairs
 */
interface LoggableFn {
  (req: Request): Record<string, any>;
}

/**
 * @description Options for logging middleware function
 */
interface HttpLoggerOptions {
  whitelists?: string[];
  loggable?: string[] | LoggableFn;
}

/**
 * @description HTTP logging middleware function for Express.js
 * @param {HttpLoggerOptions} options Add options to customize logging
 * @returns {RequestHandler} A middleware function which will log http requests
 */
declare const httpLogger: (options: HttpLoggerOptions) => RequestHandler;

export default httpLogger;
