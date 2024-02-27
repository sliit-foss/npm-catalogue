import { Logger } from "winston";
declare interface Config {
  transportOverrides?: any;
  console?: {
    enabled: boolean;
    options?: any;
  };
  file?: {
    enabled: boolean;
    options?: any;
  };
  globalAttributes?: any;
  traceKey?: string;
}

/**
 * Configures the module logger with a given user configuration.
 */
export function configure(userConfig: Config): void;

/**
 * Returns a modularized logger instance for a given module name.
 */
export function moduleLogger(moduleName?: string): Logger;
