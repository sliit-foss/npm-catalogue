# @sliit-foss/module-logger

### A modularized logger to make working with nodeJS microservices easier. <br/> <br/> <small>This package is wrapped around [winston](https://www.npmjs.com/package/winston) and exposes all of its functions and properties.</small>

<br/>

## Installation

```js
# using npm
npm install @sliit-foss/module-logger

# using yarn
yarn add @sliit-foss/module-logger
```

## Usage

```js
# using require
const { configure, moduleLogger } = require("@sliit-foss/module-logger");

# using import
import { configure, moduleLogger } from "@sliit-foss/module-logger";
```

## Examples<br/><br/>

### Default configuration

```js
const logger = moduleLogger("MY-MODULE-NAME");

logger.info("This is a modularized info log");

/*
  {"correlationId":"correlation-id-from-context","level":"info","message":"[MY-MODULE-NAME] - This is a modularized info log","timestamp":"2023-02-22T16:44:53.711Z"}
*/
```

### Custom configuration

```js
// configure the logger at the start of the application
configure({
  console: { enabled: false },
  file: {
    enabled: true,
    options: {
      filename: "my-custom-log-file.log",
    },
  },
});

const logger = moduleLogger("MY-MODULE-NAME");

logger.info("This is a modularized info log written to a file");

/* 
  logs to my-custom-log-file.log
  {"correlationId":"correlation-id-from-context","level":"info","message":"[MY-MODULE-NAME] - This is a modularized info log written to a file","timestamp":"2023-02-22T16:44:53.711Z"}
*/
```

### Default options which can be overridden by configure

```js
{
  console: {
    enabled: true,
    options: {
      handleRejections: true,
      handleExceptions: true,
    },
  },
  file: {
    enabled: true,
    options: {
      filename: '%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxFiles: '7d',
      dirname: './logs',
    },
  },
  transportOverrides: [], // array of transport overrides
  globalAttributes: {}, // attributes which will be added to all logs
}
```
