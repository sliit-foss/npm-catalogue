/**
 * @description Creates a function which invokes the given function asynchronously and calls the `next` function in case of an error thereby preventing the application from crashing.
 * @param fn The function to be invoked asynchronously
 */
export function asyncHandler(fn: Function): (req: any, res: any, next: Function) => Promise<void>;

/**
 * @description Creates a function which invokes the given function asynchronously with tracing and calls the `next` function in case of an error thereby preventing the application from crashing.
 * @param fn The function to be invoked asynchronously
 */
export function tracedAsyncHandler(fn: Function): (req: any, res: any, next: Function) => Promise<void>;

export default {
  asyncHandler,
  tracedAsyncHandler
};
