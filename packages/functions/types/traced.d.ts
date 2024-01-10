/**
 * @description Invokes the given function with tracing
 * @param fn The function to be invoked asynchronously
 * @param loggable Object with extra information to be logged
 * @returns Returns the result of the function
 */
export function trace(fn: Function, loggable?: Record<any, any>): Promise<void>;

/**
 * @description Creates a new function which when invoked will invoke the given function with tracing
 * @param fn The function to be invoked asynchronously
 * @param loggable Object with extra information to be logged
 * @returns Returns the new function
 */
export function traced<T extends (...args: any[]) => any>(fn: T, loggable?: Record<any, any>): T;

/**
 * @description Invokes the given function with tracing. Tracing is however ignored if the function is an anonymous function
 * @param fn The function to be invoked asynchronously
 * @param loggable Object with extra information to be logged
 * @returns Returns the result of the function
 */
export function cleanTrace(fn: Function, loggable?: Record<any, any>): Promise<void>;

/**
 * @description Creates a new function which when invoked will invoke the given function with tracing. Tracing is however ignored if the function is an anonymous function
 * @param fn The function to be invoked asynchronously
 * @param loggable Object with extra information to be logged
 * @returns Returns the new function
 */
export function cleanTraced<T extends (...args: any[]) => any>(fn: T, loggable?: Record<any, any>): T;

export default {
  traced,
  trace,
  cleanTraced,
  cleanTrace
};
