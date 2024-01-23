"use strict";

import { AsyncLocalStorage } from "async_hooks";

export const store = new AsyncLocalStorage();

/** Express.js middleware that is responsible for initializing the context for each request. */
export const middleware = (req, res, next) => {
  store.run({}, () => {
    next();
  });
};

/**
 * Gets a value from the context by key.  Will return undefined if the context has not yet been initialized for this request or if a value is not found for the specified key.
 * @param {string} key
 */
export const get = (key) => {
  const storeData = store.getStore() || {};
  return storeData[key];
};

/**
 * Adds a value to the context by key.  If the key already exists, its value will be overwritten.  No value will persist if the context has not yet been initialized.
 * @param {string} key
 * @param {*} value
 */
export const set = (key, value) => {
  const storeData = store.getStore() || {};
  storeData[key] = value;
  store.enterWith(storeData);
};

export const ns = null;

export default {
  middleware,
  get: get,
  set: set,
  store: store,
  ns: null
};
