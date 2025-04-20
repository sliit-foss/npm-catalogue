/**
 * @description Creates a function that invokes the method at object[key] with partials prepended to the arguments it receives. This method is distint from the `bindKey` function of lodash as this preserves the function's `name` property where lodash sets it as `wrapper`
 * @param object The object to invoke the method on
 * @param key The key of the method to invoke
 * @param partials The arguments to prepend to those provided to the new function
 * @returns Returns the new bound function
 * @example
 * const object = {
 *    name: 'John',
 *    greet: function(greeting: string, punctuation: string) {
 *       return greeting + ' ' + this.name + punctuation;
 *    }
 * };
 * const bound = bindKey(object, 'greet', 'hi');
 * console.log(bound('!')); // => 'hi John!'
 */
export const bindKey = (object: Record<any, any>, key: string, ...partials: any[]) => {
  const temp = { [key]: object[key].bind(object, ...partials) };
  return temp[key];
};

export default {
  bindKey
};
