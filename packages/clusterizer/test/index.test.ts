import cluster from "node:cluster";
import EventEmitter from "events";
import { cpus } from "node:os";

import clusterize from "../src";

export const mockEventEmitter = new EventEmitter();

let eventEmmiterFired = false;

jest.mock("node:cluster", () => ({
  isPrimary: true,
  fork: jest.fn(),
  on: jest.fn().mockImplementation((event, cb) => {
    mockEventEmitter.on(event, (...params) => {
      eventEmmiterFired = true;
      cb(...params);
    });
  })
}));

const app = jest.fn();

describe("test clusterizer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("worker branch", async () => {
    // Mock isPrimary as false to test worker logic
    const clusterModule = require("node:cluster");
    clusterModule.isPrimary = false;
    const logger = { info: jest.fn(), error: jest.fn() };
    const appFn = jest.fn();
    await require("../src").default(appFn, { logger });
    expect(appFn).toHaveBeenCalledWith(expect.any(Number));
    expect(logger.info).toHaveBeenCalledWith(expect.stringMatching(/Process \d+ started/));
    // Reset isPrimary for other tests
    clusterModule.isPrimary = true;
  });

  test("worker branch with onWorker callback", async () => {
    const clusterModule = require("node:cluster");
    clusterModule.isPrimary = false;
    const logger = { info: jest.fn(), error: jest.fn() };
    const appFn = jest.fn();
    const onWorker = jest.fn();
    await require("../src").default(appFn, { logger, onWorker });
    expect(appFn).toHaveBeenCalledWith(expect.any(Number));
    expect(onWorker).toHaveBeenCalledTimes(1);
    clusterModule.isPrimary = true;
  });
  test("2 workers", () => {
    clusterize(app, { workers: 2 });
    expect(cluster.fork).toHaveBeenCalledTimes(2);
  });
  test("max workers", () => {
    clusterize(app);
    expect(cluster.fork).toHaveBeenCalledTimes(cpus().length);
  });
  test("custom logger", () => {
    const logger = { info: jest.fn(), error: jest.fn() };
    clusterize(app, { logger });
    expect(logger.info).toHaveBeenCalledTimes(1);
  });
  test("worker exit event", () => {
    clusterize(app);
    mockEventEmitter.emit("exit", { process: { pid: 123 } }, 1, "SIGTERM");
    expect(eventEmmiterFired).toBe(true);
  });
  test("custom callbacks", () => {
    const onMaster = jest.fn();
    const onWorker = jest.fn();
    const onWorkerExit = jest.fn();
    clusterize(app, { onMaster, onWorker, onWorkerExit });
    expect(onMaster).toHaveBeenCalledTimes(1);
    expect(onWorker).toHaveBeenCalledTimes(0);
    expect(onWorkerExit).toHaveBeenCalledTimes(0);
    mockEventEmitter.emit("exit", { process: { pid: 123 } }, 1, "SIGTERM");
    expect(onWorkerExit).toHaveBeenCalledTimes(1);
  });

  test("primary branch with onWorkerExit callback", () => {
    const clusterModule = require("node:cluster");
    clusterModule.isPrimary = true;
    const logger = { info: jest.fn(), error: jest.fn() };
    const appFn = jest.fn();
    const onWorkerExit = jest.fn();
    require("../src").default(appFn, { logger, onWorkerExit });
    mockEventEmitter.emit("exit", { process: { pid: 456 } }, 2, "SIGKILL");
    expect(onWorkerExit).toHaveBeenCalledWith({ process: { pid: 456 } }, 2, "SIGKILL");
  });
});
