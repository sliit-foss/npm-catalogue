"use strict";

import { AsyncLocalStorage } from "async_hooks";

export const store = new AsyncLocalStorage();

/** Express.js middleware that is responsible for initializing the context for each request. */
export const middleware = (_: Request, __: Response, next: () => unknown) => {
  store.run({}, next);
};

/** Runs a given function in an isolated context */
export const isolate = (fn: () => unknown) => {
  store.run({}, fn);
};

/**
 * Gets a value from the context by key.  Will return undefined if the context has not yet been initialized for this request or if a value is not found for the specified key.
 */
export const get = (key: string) => {
  const storeData = store.getStore() || {};
  return storeData[key];
};

/**
 * Adds a value to the context by key.  If the key already exists, its value will be overwritten.  No value will persist if the context has not yet been initialized.
 */
export const set = (key: string, value: any) => {
  const storeData = store.getStore() || {};
  storeData[key] = value;
  store.enterWith(storeData);
};

export default {
  middleware,
  isolate,
  get,
  set,
  store
};
