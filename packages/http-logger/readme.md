# @sliit-foss/http-logger

### Http logging middleware for Express.js

<br/>

## Installation

```js
# using npm
npm install @sliit-foss/http-logger

# using yarn
yarn add @sliit-foss/http-logger
```

## Usage

```js
# using require
const httpLogger = require("@sliit-foss/http-logger").default;

# using import
import httpLogger from "@sliit-foss/http-logger";
```

## Example<br/><br/>

```js
import app from "express";

app.use(httpLogger());
```

## Usage With Options<br/><br/>

```js
import app from 'express';

app.use(httpLogger({
  whitelists: ["/public/*"] // An array of paths to exclude being logged if needed
  loggable: [
    "body"
  ], // An array of extra propeties in the request object to log. Defaults to the following: ['path', 'method', 'query', 'params']
}));

// or
import { pick, omit} from 'loadash';

app.use(httpLogger({
  whitelists: ["/public/*"],
  loggable: ( (req) => {
    // Pick the properties you want to log
    return {
      headers: pick(req.headers, ['x-user-email', 'user-agent']),
      payload: omit(req.body, ['password', 'new_password', 'old_password'])
    }
  }),
}));
```
