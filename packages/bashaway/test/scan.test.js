import { scanDir, jsFiles, pyFiles, shellFiles } from "../src";

describe("test directory scan", () => {
  test("test file count", () => {
    const files = scanDir();
    expect(files.length).toBe(2);
  });
  test("test file names", () => {
    const files = scanDir();
    expect(files.find((file) => file.includes("index.js"))).toBeTruthy();
    expect(files.find((file) => file.includes("scan.js"))).toBeTruthy();
  });
});
describe("test directory scan with exclusions", () => {
  test("test file count", () => {
    const files = scanDir("**", ["src/**"]);
    expect(files.length).toBe(0);
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
