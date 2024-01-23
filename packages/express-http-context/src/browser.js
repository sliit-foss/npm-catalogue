/* eslint no-unused-vars: 0 */

export const middleware = (req, res, next) => {
  throw new Error("`middleware` cannot be called from the browser code.");
};

export const get = () => null;

export const set = (key, value) => {};

export const store = null;

export const ns = null;

export default {
  middleware,
  get,
  set,
  store: null,
  ns: null
};
