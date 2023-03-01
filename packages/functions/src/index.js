import context from "express-http-context";
import { moduleLogger } from "@sliit-foss/module-logger";

const logger = moduleLogger("tracer");

const _fnName = (fn) => {
  let name = fn.name;
  if (!fn.name) return "Unnamed function";
  if (name.startsWith("bound")) name = name?.replace("bound", "")?.trim();
  if (name.startsWith(" ")) return name.slice(1);
  return name;
};

export const traced = async (fn, loggable = {}) => {
  const startTime = performance.now();
  logger.info(`${_fnName(fn)} execution initiated`, loggable);
  const result = await fn();
  logger.info(
    `${_fnName(fn)} execution completed - execution_time : ${
      performance.now() - startTime
    }ms`,
    loggable
  );
  return result;
};

const _asyncHandler =
  (fn, trace = false) =>
  async (req, res, next) => {
    try {
      if (trace) {
        await traced(fn.bind(this, req, res, next));
      } else {
        await fn(req, res, next);
      }
      next();
    } catch (err) {
      res.errorLogged = true;
      logger.info(
        `${_fnName(fn)} execution failed - error: ${err.message} - stack: ${
          err.stack
        }`
      );
      next(err);
    }
  };

export const asyncHandler = (fn) => _asyncHandler(fn);

export const tracedAsyncHandler = (fn) => _asyncHandler(fn, true);

export const cached = (key, fn) => {
  let res = context.get(key);
  if (!res) {
    if (fn.constructor.name === "AsyncFunction") {
      return fn().then((res) => {
        context.set(key, res);
        return res;
      });
    }
    res = fn();
    context.set(key, res);
  }
  return res;
};

export default {
  traced,
  asyncHandler,
  tracedAsyncHandler,
  cached,
};
