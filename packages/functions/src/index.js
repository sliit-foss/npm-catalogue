import { performance } from "perf_hooks";
import context from "express-http-context";
import { moduleLogger } from "@sliit-foss/module-logger";

const logger = moduleLogger("tracer");

const _fnName = (fn) => {
  let name = fn.name;
  while (1) {
    const replaced = name?.replace("bound", "");
    if (name.startsWith("bound") && replaced?.startsWith(" "))
      name = replaced?.trim();
    else break;
  }
  if (!name) return "Unnamed function";
  if (name.startsWith(" ")) return name.slice(1);
  return name;
};

export const _traced = async (fn, loggable = {}, fnName) => {
  let startTime;
  const disableTracing =
    process.env.DISABLE_FUNCTION_TRACING === "true" ||
    process.env.DISABLE_FUNCTION_TRACING === "1";
  if (!disableTracing) {
    fnName = fnName ?? _fnName(fn);
    logger.info(`${fnName} execution initiated`, loggable);
    startTime = performance.now();
  }
  try {
    let result;
    if (fn.constructor.name === "AsyncFunction") {
      result = await fn();
    } else {
      result = fn();
    }
    !disableTracing &&
      logger.info(
        `${fnName} execution completed - execution_time : ${
          performance.now() - startTime
        }ms`,
        loggable
      );
    return result;
  } catch (err) {
    !disableTracing &&
      logger.error(
        `${fnName} execution failed - error: ${err.message} - stack: ${err.stack}`
      );
    throw err;
  }
};

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

export const traced =
  (fn, loggable) =>
  (...params) =>
    _traced(fn.bind(this, ...params), loggable);

export const trace = (fn, loggable) => _traced(fn, loggable);

export const bindKey = (object, key, ...partials) => {
  const temp = { [key]: object[key].bind(object, ...partials) };
  return temp[key];
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
