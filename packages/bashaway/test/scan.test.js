import { scan, scanPure, jsFiles, pyFiles, shellFiles } from "../src";

describe("test root directory scan", () => {
  test("test file count", () => {
    const files = scan();
    expect(files.length).toBe(2);
  });
  test("test file names", () => {
    const files = scan();
    expect(files.find((file) => file.includes("index.js"))).toBeTruthy();
    expect(files.find((file) => file.includes("scan.js"))).toBeTruthy();
  });
});
describe("test root directory scan with exclusions", () => {
  test("test file count", () => {
    const files = scan("**", ["src/**"]);
    expect(files.length).toBe(0);
  });
});
describe("test pure directory scan", () => {
  test("test normal scan results to be 0", () => {
    expect(scan("./test").length).toBe(0);
  });
  test("test pure scan results to be 1", () => {
    expect(scanPure("./test/**").length).toBe(1);
  });
});
describe("test language specific scans", () => {
  test("test shell file count", () => {
    expect(shellFiles().length).toBe(0);
  });
  test("test javascript file count", () => {
    expect(jsFiles().length).toBe(2);
  });
  test("test python file count", () => {
    expect(pyFiles().length).toBe(0);
  });
});
