# @sliit-foss/timekeeper

### CLI tool for automated function tracing. More information can be found [here](https://timekeeper.sliitfoss.org/) at the official website.

<br/>

---

## Installation

```bash
# using npm
npm install -g @sliit-foss/timekeeper

# using yarn
yarn global add @sliit-foss/timekeeper
```

## Usage

> script.js

```js
const sum = (a, b) => {
  return a + b;
};

console.log(sum(4, 5));
```

> execute

```bash
timekeeper script.js
```

> output

```bash
{"correlationId": "34fedb32f80e6ac4cd329a948e5ac2cc", "level": "info", "message": "[tracer] - sum execution initiated", "timestamp": "2023-05-25T04:25:52.180Z"}
{"correlationId": "34fedb32f80e6ac4cd329a948e5ac2cc", "level": "info", "message": "[tracer] - sum execution completed - execution_time : 0.05579999997280538ms", "timestamp": "2023-05-25T04:25:52.180Z"}
9
```
