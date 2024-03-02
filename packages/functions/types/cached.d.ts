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
export function cached(key: string, fn: Function): any;

export default {
  cached
};
