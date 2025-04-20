import { performance } from "perf_hooks";
import { default as chalk } from "chalk";
import { moduleLogger } from "@sliit-foss/module-logger";
import { fnName as _fnName } from "./utils";

type BaseTracedFunction = <T extends (...args: any[]) => any>(fn: T, loggable?: Record<any, any>) => T;

interface TracedFunction extends BaseTracedFunction {
  [key: string]: BaseTracedFunction;
}

type TraceFunction = (fn: Function, loggable?: Record<any, any>) => Promise<void>;

const logger = moduleLogger("tracer");

export const _traced = (fn: Function, loggable = {}, fnName?: string, layer?: string, fallible?: boolean) => {
  let startTime: number;
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
      logger[fallible ? "warn" : "error"](
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

const _proxyHandlers = {
  get: (target, prop) => (fn: Function, loggable?: Record<string, any>) => target(fn, loggable, prop)
};

/**
 * @description Creates a new function which when invoked will invoke the given function with tracing
 * @param fn The function to be invoked asynchronously
 * @param loggable Object with extra information to be logged
 * @returns Returns the new function
 */
export const traced: TracedFunction = new Proxy(
  (fn: Function, loggable?: Record<any, any>, layer?: string) =>
    (...params: any[]) =>
      _traced(fn.bind(this, ...params), loggable, null, layer),
  _proxyHandlers
);

/**
 * @description Invokes the given function with tracing
 * @param fn The function to be invoked asynchronously
 * @param loggable Object with extra information to be logged
 * @returns Returns the result of the function
 */
export const trace = new Proxy(
  (fn: Function, loggable?: Record<any, any>, layer?: string) => _traced(fn, loggable, null, layer),
  _proxyHandlers
) as TraceFunction;

/**
 * @description Invokes the given function with tracing. Tracing is however ignored if the function is an anonymous function
 * @param fn The function to be invoked asynchronously
 * @param loggable Object with extra information to be logged
 * @returns Returns the result of the function
 */
export const cleanTrace = new Proxy((fn: Function, loggable?: Record<any, any>, layer?: string) => {
  if (fn.name) return _traced(fn, loggable, null, layer);
  return fn();
}, _proxyHandlers) as TraceFunction;

/**
 * @description Creates a new function which when invoked will invoke the given function with tracing. Tracing is however ignored if the function is an anonymous function
 * @param fn The function to be invoked asynchronously
 * @param loggable Object with extra information to be logged
 * @returns Returns the new function
 */
export const cleanTraced: TracedFunction = new Proxy(
  (fn: Function, loggable?: Record<any, any>, layer?: string) =>
    (...params: any[]) => {
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
