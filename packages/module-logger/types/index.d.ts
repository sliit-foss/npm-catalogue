import { Logger } from 'winston';
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
}

/**
 * Configures the module logger with a given user configuration.
 */
declare function configure(userConfig: Config): void;

/**
 * Returns a modularized logger instance for a given module name.
 */
declare function moduleLogger(moduleName?: string): Logger;

export {
  configure,
  moduleLogger,
};
