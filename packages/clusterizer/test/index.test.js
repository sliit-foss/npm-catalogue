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
  test("2 workers", () => {
    clusterize(app, { workers: 2 });
    expect(cluster.fork).toHaveBeenCalledTimes(2);
  });
  test("max workers", () => {
    clusterize(app);
    expect(cluster.fork).toHaveBeenCalledTimes(cpus().length);
  });
  test("custom logger", () => {
    const logger = { info: jest.fn() };
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
});
