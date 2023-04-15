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
const { trace, traced, bindKey, asyncHandler, tracedAsyncHandler } = require("@sliit-foss/functions");

# using import
import { trace, traced, bindKey, asyncHandler, tracedAsyncHandler } from "@sliit-foss/functions";
```

## Examples<br/><br/>

- ### trace

```js
trace(function foo() {
  console.log(123);
});

/*
  _foo execution initiated
  _foo execution completed - execution_time : 0.2069999985396862
*/
```

- ### traced `(Same as trace but returns a decorated function)`

```js
traced(function foo() {
  console.log(123);
})();

/*
  _foo execution initiated
  _foo execution completed - execution_time : 0.2069999985396862
*/
```

- ### bindKey `(Creates a bounded function from a passed object and function key with its context preserved)`
  <br/>
  - This method is distint from the `bindKey` function of lodash as this preserves the function's `name` property where lodash sets it as `wrapper`

```js
const obj = {
  name: "test-object",
  foo() {
    console.log(`Inside ${this.name} function foo`);
  },
};
const preserved = bindKey(obj, "foo");
setTimeout(preserved, 0); // Outputs `Inside test-object function foo`
console.log(preserved.name); // Outputs `bound foo`
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

- ### asyncHandler `(Same as tracedAsyncHandler but without the tracing. Useful when you don't want to trace the execution time of the function)`

```js
asyncHandler(async function hello(req, res) => {
  res.send("Hello World");
});
```

## Disabling tracing<br/><br/>

- Set the environment variable `DISABLE_FUNCTION_TRACING` to `true` or `1` to disable tracing.
