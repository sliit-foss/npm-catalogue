import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runCli } from "../src";

const createTempProject = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "env-guard-"));
  const schemaPath = path.join(dir, "env.schema.cjs");
  const envPath = path.join(dir, ".env");

  fs.writeFileSync(
    schemaPath,
    `
const portValidator = {
  getMeta: () => ({
    required: false,
    hasDefault: true,
    defaultValue: 3000,
    sensitive: false,
    typeName: "port"
  }),
  parse: (value, key) => {
    const port = Number(value);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      return { ok: false, message: key + " must be a valid port number between 1 and 65535" };
    }
    return { ok: true, value: port };
  }
};

const urlValidator = {
  getMeta: () => ({
    required: true,
    hasDefault: false,
    sensitive: false,
    typeName: "url",
    description: "Database URL"
  }),
  parse: (value, key) => {
    try {
      new URL(value);
      return { ok: true, value };
    } catch {
      return { ok: false, message: key + " must be a valid URL" };
    }
  }
};

module.exports = {
  PORT: portValidator,
  DATABASE_URL: urlValidator
};
`
  );

  return { dir, envPath, schemaPath };
};

const createStream = () => {
  let output = "";

  return {
    stream: {
      write: (chunk: string) => {
        output += chunk;
        return true;
      }
    },
    getOutput: () => output
  };
};

describe("cli", () => {
  test("validates an env file", async () => {
    const { dir, envPath, schemaPath } = createTempProject();
    fs.writeFileSync(envPath, "PORT=4000\nDATABASE_URL=https://example.com\n");

    const stdout = createStream();
    const stderr = createStream();
    const code = await runCli(["node", "env-guard", "validate", "--schema", schemaPath, "--file", envPath], {
      cwd: dir,
      stdout: stdout.stream,
      stderr: stderr.stream
    });

    expect(code).toBe(0);
    expect(stdout.getOutput()).toContain("Environment validation passed");
    expect(stderr.getOutput()).toBe("");
  });

  test("returns a non-zero code for invalid env files", async () => {
    const { dir, envPath, schemaPath } = createTempProject();
    fs.writeFileSync(envPath, "PORT=abc\nDATABASE_URL=https://example.com\n");

    const stdout = createStream();
    const stderr = createStream();
    const code = await runCli(["node", "env-guard", "validate", "--schema", schemaPath, "--file", envPath], {
      cwd: dir,
      stdout: stdout.stream,
      stderr: stderr.stream
    });

    expect(code).toBe(1);
    expect(stderr.getOutput()).toContain("PORT must be a valid port number between 1 and 65535");
    expect(stdout.getOutput()).toBe("");
  });

  test("prints generated example content", async () => {
    const { dir, schemaPath } = createTempProject();
    const stdout = createStream();
    const stderr = createStream();

    const code = await runCli(["node", "env-guard", "example", "--schema", schemaPath], {
      cwd: dir,
      stdout: stdout.stream,
      stderr: stderr.stream
    });

    expect(code).toBe(0);
    expect(stdout.getOutput()).toContain("# Default: 3000\nPORT=3000");
    expect(stdout.getOutput()).toContain("# Database URL\nDATABASE_URL=");
    expect(stderr.getOutput()).toBe("");
  });

  test("writes generated example content to a file", async () => {
    const { dir, schemaPath } = createTempProject();
    const outputPath = path.join(dir, ".env.example");
    const stdout = createStream();

    const code = await runCli(["node", "env-guard", "example", "--schema", schemaPath, "--output", outputPath], {
      cwd: dir,
      stdout: stdout.stream
    });

    expect(code).toBe(0);
    expect(fs.readFileSync(outputPath, "utf8")).toContain("PORT=3000");
    expect(stdout.getOutput()).toContain("Wrote");
  });
});
