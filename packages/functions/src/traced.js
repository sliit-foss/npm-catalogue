import { performance } from "perf_hooks";
import { default as chalk } from "chalk";
import { moduleLogger } from "@sliit-foss/module-logger";
import { fnName as _fnName } from "./utils";

const logger = moduleLogger("tracer");

export const _traced = (fn, loggable = {}, fnName, layer) => {
  let startTime;
  const disableTracing =
    process.env.DISABLE_FUNCTION_TRACING === "true" || process.env.DISABLE_FUNCTION_TRACING === "1";
  if (!disableTracing) {
    fnName = fnName ?? _fnName(fn, layer);
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

const _proxyHandlers = { get: (target, prop) => (fn, loggable) => target(fn, loggable, prop) };

export const traced = new Proxy(
  (fn, loggable, layer) =>
    (...params) =>
      _traced(fn.bind(this, ...params), loggable, null, layer),
  _proxyHandlers
);

export const trace = new Proxy((fn, loggable, layer) => _traced(fn, loggable, null, layer), _proxyHandlers);

export const cleanTrace = new Proxy((fn, loggable, layer) => {
  if (fn.name) return _traced(fn, loggable, null, layer);
  return fn();
}, _proxyHandlers);

export const cleanTraced = new Proxy(
  (fn, loggable, layer) =>
    (...params) => {
      if (fn.name) return _traced(fn.bind(this, ...params), loggable, null, layer);
      return fn.call(this, ...params);
    },
  _proxyHandlers
);

export default {
  traced,
  trace,
  cleanTrace,
  cleanTraced
};
