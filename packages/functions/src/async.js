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
      next();
    } catch (err) {
      if (!trace) {
        fnName = fnName ?? _fnName(fn);
        logger.error(
          `${fnName} execution failed - error: ${err.message} - stack: ${err.stack}`
        );
      }
      res.errorLogged = true;
      next(err);
    }
  };

export const asyncHandler = (fn) => _asyncHandler(fn);

export const tracedAsyncHandler = (fn) => _asyncHandler(fn, true);

export default {
  asyncHandler,
  tracedAsyncHandler,
};
