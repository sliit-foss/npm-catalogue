/* eslint-disable no-console */

import { EnvValidationError } from "./errors/env-validation-error";
import { formatEnvValidationErrors } from "./errors/format-errors";
import { EnvSchema, EnvValueSource, EnvValidationIssue, InferEnv } from "./validators/base-validator";
import { isSecretKey } from "./utils/is-secret-key";

export type CreateEnvOptions = {
  source?: EnvValueSource;
  throwOnError?: boolean;
  redactSecrets?: boolean;
  allowUnknown?: boolean;
};

const isMissing = (value: string | undefined): boolean => value === undefined || value.trim().length === 0;

export function createEnv<TSchema extends EnvSchema>(
  schema: TSchema,
  { source = process.env, throwOnError = true, redactSecrets = true, allowUnknown = true }: CreateEnvOptions = {}
): InferEnv<TSchema> {
  const env: Record<string, unknown> = {};
  const issues: EnvValidationIssue[] = [];
  const schemaKeys = new Set(Object.keys(schema));

  Object.entries(schema).forEach(([key, validator]) => {
    const meta = validator.getMeta();
    const rawValue = source[key];
    const sensitive = redactSecrets && (meta.sensitive || isSecretKey(key));

    if (isMissing(rawValue)) {
      if (meta.hasDefault) {
        env[key] = meta.defaultValue;
        return;
      }

      if (!meta.required) {
        env[key] = undefined;
        return;
      }

      issues.push({
        key,
        message: `${key} is required`,
        type: "missing",
        sensitive
      });
      return;
    }

    const result = validator.parse(rawValue as string, key);

    if ("message" in result) {
      issues.push({
        key,
        message: result.message,
        received: rawValue,
        type: "invalid",
        sensitive
      });
      return;
    }

    env[key] = result.value;
  });

  if (!allowUnknown) {
    Object.keys(source).forEach((key) => {
      if (!schemaKeys.has(key)) {
        issues.push({
          key,
          message: `${key} is not defined in the environment schema`,
          received: source[key],
          type: "invalid",
          sensitive: redactSecrets && isSecretKey(key)
        });
      }
    });
  }

  if (issues.length) {
    if (throwOnError) {
      throw new EnvValidationError(issues);
    }

    console.error(formatEnvValidationErrors(issues));
    process.exit(1);
  }

  return env as InferEnv<TSchema>;
}
