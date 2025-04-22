import type { Request, Response, NextFunction, RequestHandler } from "express";
import { moduleLogger } from "@sliit-foss/module-logger";
import { fnName as _fnName } from "./utils";
import { _traced } from "./traced";

const logger = moduleLogger("tracer");

const _asyncHandler =
  (fn, trace = false) =>
  async (req: Request, res: Response & Record<string, any>, next: NextFunction) => {
    let fnName: string;
    try {
      if (trace) {
        fnName = _fnName(fn);
        await _traced(fn.bind(this, req, res, next), {}, fnName);
      } else {
        const result = fn(req, res, next) as any;
        if (result instanceof Promise) {
          await result;
        }
      }
      if (!res.headersSent) next();
    } catch (err) {
      if (!trace) {
        fnName = fnName ?? _fnName(fn);
        logger.error(`${fnName} execution failed - error: ${err.message} - stack: ${err.stack}`);
      }
      res.errorLogged = true;
      if (!res.headersSent) next(err);
    }
  };

/**
 * @description Creates a function which invokes the given function asynchronously and calls the `next` function in case of an error thereby preventing the application from crashing.
 * @param fn The function to be invoked asynchronously
 */
export const asyncHandler = <P = RequestHandler>(fn: P) => _asyncHandler(fn) as P;

/**
 * @description Creates a function which invokes the given function asynchronously with tracing and calls the `next` function in case of an error thereby preventing the application from crashing.
 * @param fn The function to be invoked asynchronously
 */
export const tracedAsyncHandler = <P = RequestHandler>(fn: P) => _asyncHandler(fn, true) as P;

/**
 * @description Same as the `tracedAsyncHandler` but the log upon failure is a warning log
 * @param fn The function to be invoked asynchronously
 */
export const fallibleAsyncHandler = <P extends RequestHandler>(fn: P) =>
  (async (req, res: Response & Record<string, any>, next) => {
    try {
      await _traced(fn.bind(this, req, res, next), {}, _fnName(fn), null, true);
      if (!res.headersSent) next();
    } catch (err) {
      res.errorLogged = true;
      if (!res.headersSent) next(err);
    }
  }) as P;

/**
 * @description A more stripped down version of asyncHandler without any logs
 * @param fn The function to be invoked asynchronously
 */
export const plainAsyncHandler = <P extends RequestHandler>(fn: P) =>
  (async (req, res, next) => {
    try {
      const result = fn(req, res, next) as any;
      if (result instanceof Promise) await result;
    } catch (e) {
      next(e);
    }
  }) as P;

export default {
  asyncHandler,
  tracedAsyncHandler,
  fallibleAsyncHandler,
  plainAsyncHandler
};
