# @sliit-foss/clusterizer

### A wrapper around the node cluster module to make it easier to bootstrap a clusterized application<br><br>

## Installation

```js
# using npm
npm install @sliit-foss/clusterizer

# using yarn
yarn add @sliit-foss/clusterizer
```

## Usage

```js
const { default: clusterize } = require("@sliit-foss/clusterizer");

// or

import clusterize from "@sliit-foss/clusterizer";

.....
.....

const server = () => {
    const app = express();

    app.get("/", (req, res) => {
        res.send("Hello World");
    });

    app.listen(3000, () => {
        console.log("Server started on port 3000");
    });
};

clusterize(server);

```

## Custom Options

- `workers` - number of workers to spawn
  - default: `os.cpus().length`
- `onMaster` - callback to run on master process
  - default: `() => logger.info(`\`Clusterizer - Master ${process.pid} is running\``)`
- `onWorker` - callback to run on worker process
  - default: `() => logger.info(`\`Clusterizer - Process ${process.pid} started\``)`
- `onWorkerExit` - callback to run on worker exit
  - default: `() => logger.info(`\`Clusterizer - Worker \${process.pid} died - code: \${code} - signal: ${signal}\``)`
- `logger` - custom logger to use if default callback handlers are used
  - default: `console`

```js
clusterize(server, {
  workers: 4,
  onMaster: () => {
    console.log("Master process started");
  },
  onWorker: () => {
    console.log("Worker process started");
  },
  onExit: (worker, code, signal) => {
    console.log("Worker process exited");
  },
});
```
