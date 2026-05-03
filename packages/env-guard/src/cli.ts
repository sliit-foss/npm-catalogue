#!/usr/bin/env node

/* eslint-disable no-console */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Command } from "commander";
import dotenv from "dotenv";
import { createEnv } from "./create-env";
import { EnvValidationError } from "./errors/env-validation-error";
import { generateEnvExample } from "./utils/generate-env-example";
import { EnvSchema } from "./validators";

const packageVersion = "1.0.0";

type CliRunOptions = {
  cwd?: string;
  stdout?: Pick<typeof process.stdout, "write">;
  stderr?: Pick<typeof process.stderr, "write">;
};

type SchemaModule = {
  default?: EnvSchema;
  schema?: EnvSchema;
  envSchema?: EnvSchema;
};

const writeLine = (stream: Pick<typeof process.stdout, "write">, message: string) => {
  stream.write(`${message}\n`);
};

const resolvePath = (filePath: string, cwd: string): string => {
  if (path.isAbsolute(filePath)) return filePath;
  return path.resolve(cwd, filePath);
};

const loadSchema = async (schemaPath: string, cwd: string): Promise<EnvSchema> => {
  const resolvedPath = resolvePath(schemaPath, cwd);
  const schemaModule =
    path.extname(resolvedPath) === ".mjs"
      ? ((await import(pathToFileURL(resolvedPath).href)) as SchemaModule)
      : (require(resolvedPath) as SchemaModule);

  if ("default" in schemaModule && schemaModule.default) return schemaModule.default;
  if ("schema" in schemaModule && schemaModule.schema) return schemaModule.schema;
  if ("envSchema" in schemaModule && schemaModule.envSchema) return schemaModule.envSchema;

  return schemaModule as unknown as EnvSchema;
};

const loadEnvFile = (filePath: string | undefined, cwd: string): Record<string, string | undefined> => {
  if (!filePath) return process.env;

  const resolvedPath = resolvePath(filePath, cwd);
  const parsed = dotenv.parse(fs.readFileSync(resolvedPath));

  return parsed;
};

export const runCli = async (argv = process.argv, options: CliRunOptions = {}): Promise<number> => {
  const cwd = options.cwd ?? process.cwd();
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const program = new Command();

  program
    .name("env-guard")
    .description("Validate environment variables with an env-guard schema")
    .version(packageVersion)
    .exitOverride();

  program
    .command("validate")
    .description("Validate an environment file with a schema")
    .requiredOption("-s, --schema <path>", "path to a JS, CJS, or MJS schema module")
    .option("-f, --file <path>", "path to an env file")
    .action(async (commandOptions) => {
      const schema = await loadSchema(commandOptions.schema, cwd);
      const source = loadEnvFile(commandOptions.file, cwd);

      createEnv(schema, { source });
      writeLine(stdout, "Environment validation passed");
    });

  program
    .command("example")
    .description("Generate .env.example content from a schema")
    .requiredOption("-s, --schema <path>", "path to a JS, CJS, or MJS schema module")
    .option("-o, --output <path>", "write the generated example to a file")
    .action(async (commandOptions) => {
      const schema = await loadSchema(commandOptions.schema, cwd);
      const output = `${generateEnvExample(schema)}\n`;

      if (commandOptions.output) {
        fs.writeFileSync(resolvePath(commandOptions.output, cwd), output);
        writeLine(stdout, `Wrote ${commandOptions.output}`);
        return;
      }

      stdout.write(output);
    });

  try {
    await program.parseAsync(argv);
    return 0;
  } catch (error) {
    if (error instanceof EnvValidationError) {
      writeLine(stderr, error.message);
      return 1;
    }

    if (error && typeof error === "object" && "code" in error && error.code === "commander.helpDisplayed") {
      return 0;
    }

    const message = error instanceof Error ? error.message : String(error);
    writeLine(stderr, message);
    return 1;
  }
};

if (require.main === module) {
  runCli().then((code) => {
    process.exitCode = code;
  });
}
