import { performance } from "perf_hooks";
import { default as chalk } from "chalk";
import { moduleLogger } from "@sliit-foss/module-logger";
import { fnName as _fnName } from "./utils";

const logger = moduleLogger("tracer");

export const _traced = (fn, loggable = {}, fnName) => {
  let startTime;
  const disableTracing =
    process.env.DISABLE_FUNCTION_TRACING === "true" || process.env.DISABLE_FUNCTION_TRACING === "1";
  if (!disableTracing) {
    fnName = fnName ?? _fnName(fn);
    logger.info(`${fnName} execution initiated`, loggable);
    startTime = performance.now();
  }
  const completionLog = () => {
    !disableTracing &&
      logger.info(
        `${fnName} execution completed - ${chalk.bold(chalk.magentaBright("execution_time"))} : ${chalk.bold(
          `${performance.now() - startTime}ms`
        )}`,
        loggable
      );
  };
  const failureLog = (err) => {
    if (!disableTracing && !err.isLogged) {
      logger.error(
        `${fnName} execution failed - ${chalk.bold("error")}: ${err.message} - ${chalk.bold("stack")}: ${err.stack}`
      );
      err.isLogged = true;
    }
    throw err;
  };
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result
        .then((res) => {
          completionLog();
          return res;
        })
        .catch((err) => failureLog(err));
    }
    completionLog();
    return result;
  } catch (err) {
    failureLog(err);
  }
};

export const traced =
  (fn, loggable) =>
  (...params) =>
    _traced(fn.bind(this, ...params), loggable);

export const trace = (fn, loggable) => _traced(fn, loggable);

export const cleanTrace = (fn, loggable) => {
  if (fn.name) {
    return _traced(fn, loggable);
  }
  return fn();
};

export const cleanTraced =
  (fn, loggable) =>
  (...params) => {
    if (fn.name) {
      return _traced(fn.bind(this, ...params), loggable);
    }
    return fn.call(this, ...params);
  };

export default {
  traced,
  trace,
  cleanTrace,
  cleanTraced
};
