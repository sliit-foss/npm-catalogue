import { Request, Response, NextFunction } from "express";
import { AsyncLocalStorage } from "async_hooks";

/** Express.js middleware that is responsible for initializing the context for each request. */
export declare function middleware(req: Request, res: Response, next: NextFunction): void;

/** Runs a given function in an isolated context */
export declare function isolate(fn: Function): void;

/**
 * Gets a value from the context by key.  Will return undefined if the context has not yet been initialized for this request or if a value is not found for the specified key.
 */
export declare function get(key: string): any;

/**
 * Adds a value to the context by key.  If the key already exists, its value will be overwritten.  No value will persist if the context has not yet been initialized.
 */
export declare function set(key: string, value: any): void;

/**
 * Gets the underlying store.
 */
export declare const store: AsyncLocalStorage<any>;

/**
 * @deprecated Since `async_hooks` uses a store instead of namespaces, this is no longer available. This property will be removed in a future release.
 */
export declare const ns: null;
