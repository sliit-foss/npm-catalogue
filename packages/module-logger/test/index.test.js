import fs from "fs";
import { configure, moduleLogger, transports } from "../src";

describe("module-logger", () => {
  beforeAll(() => {
    global.unit_tests_running = true;
  });
  afterAll(() => {
    global.unit_tests_running = false;
  });
  it("should-log-to-console", () => {
    const mLogger = moduleLogger("console-logger");
    expect(() => mLogger.info("this is an info message")).not.toThrow(Error);
    expect(() => mLogger.error("this is an error message")).not.toThrow(Error);
    expect(() => mLogger.warn("this is a warning message")).not.toThrow(Error);
    expect(() => mLogger.info("this is a message with a custom object", { custom: "object" })).not.toThrow(Error);
  });
  it("should-log-to-file", () => {
    configure({
      file: {
        enabled: true
      },
      console: {
        enabled: false
      }
    });
    const mLogger = moduleLogger("file-logger");
    expect(() => mLogger.info("hello-world")).not.toThrow(Error);
    expect(fs.existsSync("./logs")).toBe(true);
    fs.rmSync("./logs", { recursive: true });
  });
  it("should-throw-error-when-both-default-transports-are-disable", () => {
    configure({
      transportOverrides: [],
      console: {
        enabled: false
      },
      file: {
        enabled: false
      }
    });
    expect(() => moduleLogger("this logger has no transports")).toThrow(Error);
  });
  it("should-take-overriden-transports", () => {
    configure({
      transportOverrides: [
        new transports.Http({
          host: "localhost",
          port: 8080,
          path: "/logs"
        })
      ],
      globalAttributes: null
    });
    const mLogger = moduleLogger("file-logger");
    expect(() => mLogger.info("this logger has a custom http transport")).not.toThrow(Error);
  });
  it("should-log-global-attributes", () => {
    configure({
      globalAttributes: {
        global: "attribute"
      }
    });
    const mLogger = moduleLogger();
    expect(() => mLogger.info("hello-world")).not.toThrow(Error);
  });
});
