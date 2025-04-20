import context from "@sliit-foss/express-http-context";

/**
 * @description Caches the result of a function within a request's context when invoked with the same key
 * @param key The key to cache the result against
 * @param fn The function to be invoked
 * @returns Returns the result of the function
 * @example
 * const result = cached('key', () => {
 *   return 'value';
 * });
 * console.log(result); // => 'value'
 * const result2 = cached('key', () => {
 *  return 'value2';
 * });
 * console.log(result2); // => 'value'
 */
export const cached = (key: string, fn: Function) => {
  let res = context.get(key);
  if (!res) {
    res = fn();
    if (res instanceof Promise) {
      return res.then((res) => {
        context.set(key, res);
        return res;
      });
    }
    context.set(key, res);
  }
  return res;
};

export default {
  cached
};
