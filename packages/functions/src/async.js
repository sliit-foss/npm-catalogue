import { moduleLogger } from "@sliit-foss/module-logger";
import { fnName as _fnName } from "./utils";
import { _traced } from "./traced";

const logger = moduleLogger("tracer");

const _asyncHandler =
  (fn, trace = false) =>
  async (req, res, next) => {
    let fnName;
    try {
      if (trace) {
        fnName = _fnName(fn);
        await _traced(fn.bind(this, req, res, next), {}, fnName);
      } else {
        await fn(req, res, next);
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

export const asyncHandler = (fn) => _asyncHandler(fn);

export const tracedAsyncHandler = (fn) => _asyncHandler(fn, true);

export const fallibleAsyncHandler = (fn) => async (req, res, next) => {
  try {
    await _traced(fn.bind(this, req, res, next), {}, _fnName(fn), null, true);
    if (!res.headersSent) next();
  } catch (err) {
    res.errorLogged = true;
    if (!res.headersSent) next(err);
  }
};

export const plainAsyncHandler = (fn) => async (req, res, next) => {
  try {
    const result = fn(req, res, next);
    if (result instanceof Promise) await result;
  } catch (e) {
    next(e);
  }
};

export default {
  asyncHandler,
  tracedAsyncHandler,
  fallibleAsyncHandler,
  plainAsyncHandler
};
