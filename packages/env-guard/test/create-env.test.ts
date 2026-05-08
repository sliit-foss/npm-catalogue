import { createEnv, EnvValidationError, validators } from "../src";

describe("createEnv", () => {
  test("throws for missing required variables", () => {
    expect(() =>
      createEnv(
        {
          DATABASE_URL: validators.string()
        },
        {
          source: {}
        }
      )
    ).toThrow("DATABASE_URL is required");
  });

  test("applies default values", () => {
    const env = createEnv(
      {
        PORT: validators.port().default(3000)
      },
      {
        source: {}
      }
    );

    expect(env.PORT).toBe(3000);
  });

  test("returns undefined for optional values", () => {
    const env = createEnv(
      {
        SENTRY_DSN: validators.url().optional()
      },
      {
        source: {}
      }
    );

    expect(env.SENTRY_DSN).toBeUndefined();
  });

  test("uses custom source and returns typed output", () => {
    const env: {
      PORT: number;
      ENABLE_EMAILS: boolean;
      DATABASE_URL: string;
    } = createEnv(
      {
        PORT: validators.port().default(3000),
        ENABLE_EMAILS: validators.boolean().default(false),
        DATABASE_URL: validators.url()
      },
      {
        source: {
          PORT: "4000",
          ENABLE_EMAILS: "true",
          DATABASE_URL: "https://example.com"
        }
      }
    );

    expect(env).toEqual({
      PORT: 4000,
      ENABLE_EMAILS: true,
      DATABASE_URL: "https://example.com"
    });
  });

  test("reports unknown variables when disallowed", () => {
    expect(() =>
      createEnv(
        {
          PORT: validators.port().default(3000)
        },
        {
          source: {
            PORT: "3000",
            EXTRA_TOKEN: "secret-value"
          },
          allowUnknown: false
        }
      )
    ).toThrow("EXTRA_TOKEN is not defined in the environment schema");
  });

  test("exits when throwOnError is false", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation();
    const exitSpy = jest.spyOn(process, "exit").mockImplementation((() => undefined) as never);

    createEnv(
      {
        DATABASE_URL: validators.url()
      },
      {
        source: {},
        throwOnError: false
      }
    );

    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("DATABASE_URL is required"));
    expect(exitSpy).toHaveBeenCalledWith(1);

    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  test("throws EnvValidationError with issues", () => {
    try {
      createEnv(
        {
          PORT: validators.port()
        },
        {
          source: {
            PORT: "abc"
          }
        }
      );
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      expect((error as EnvValidationError).issues).toHaveLength(1);
    }
  });
});
