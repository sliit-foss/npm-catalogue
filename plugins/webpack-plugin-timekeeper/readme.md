# webpack-plugin-timekeeper

A Webpack plugin for timekeeper tracing, inspired by `@sliit-foss/babel-plugin-transform-trace`.

## Features

- Injects tracing wrappers around function calls (excluding exclusions)
- Adds tracer import if missing
- Supports `ignore-functions` and `clean` options

## Usage

Add to your Webpack config:

```js
const TimekeeperPlugin = require("webpack-plugin-timekeeper");

module.exports = {
  // ...
  plugins: [
    new TimekeeperPlugin({
      ignoreFunctions: ["foo", "bar"],
      clean: true
    })
  ]
};
```
