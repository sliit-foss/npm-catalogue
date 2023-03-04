# @sliit-foss/functions

### Just a small set of utility functions

<br/>

## Installation

```js
# using npm
npm install @sliit-foss/functions

# using yarn
yarn add @sliit-foss/functions
```

## Usage

```js
# using require
const { traced, asyncHandler, tracedAsyncHandler } = require("@sliit-foss/functions");

# using import
import { traced, asyncHandler, tracedAsyncHandler } from "@sliit-foss/functions";
```

## Example<br/><br/>

- ### traced

```js
traced(function foo() {
  console.log(123);
});

/*
  _foo execution initiated
  _foo execution completed - execution_time : 0.2069999985396862
*/
```

- ### tracedAsyncHandler

```js
tracedAsyncHandler(async function hello(req, res) => {
  res.send("Hello World");
});
/*
  _hello execution initiated
  _hello execution completed - execution_time : 0.2069999985396862
*/
```

- ### asyncHandler

  - Same as tracedAsyncHandler but without the tracing. Useful when you don't want to trace the execution time of the function.

```js
asyncHandler(async function hello(req, res) => {
  res.send("Hello World");
});
```

## Disabling tracing<br/><br/>

- Set the environment variable `DISABLE_FUNCTION_TRACING` to `true` or `1` to disable tracing.
