import { formatEnvValidationErrors } from "../src/errors/format-errors";
import { createEnv, validators } from "../src";
import { redact } from "../src/utils/redact";

describe("redaction", () => {
  test("redacts sensitive issue values", () => {
    const output = formatEnvValidationErrors([
      {
        key: "JWT_SECRET",
        type: "invalid",
        message: "JWT_SECRET must be at least 32 characters",
        received: "short-secret",
        sensitive: true
      }
    ]);

    expect(output).not.toContain("short-secret");
    expect(output).toContain("[REDACTED]");
  });

  test("redacts values for secret-like key names", () => {
    expect(() =>
      createEnv(
        {
          API_KEY: validators.secret({ minLength: 20 })
        },
        {
          source: {
            API_KEY: "short-secret"
          }
        }
      )
    ).toThrow("[REDACTED]");
  });

  test("can disable secret redaction", () => {
    expect(() =>
      createEnv(
        {
          API_KEY: validators.secret({ minLength: 20 })
        },
        {
          source: {
            API_KEY: "short-secret"
          },
          redactSecrets: false
        }
      )
    ).toThrow("short-secret");
  });

  test("redacts missing raw values consistently", () => {
    expect(redact()).toBe("[REDACTED]");
  });
});
