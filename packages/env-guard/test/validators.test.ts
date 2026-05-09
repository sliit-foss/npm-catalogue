import { createEnv, validators } from "../src";

describe("validators", () => {
  test("parses strings", () => {
    const env = createEnv(
      {
        APP_NAME: validators.string()
      },
      {
        source: {
          APP_NAME: "Student API"
        }
      }
    );

    expect(env.APP_NAME).toBe("Student API");
  });

  test("rejects empty strings", () => {
    expect(() =>
      createEnv(
        {
          APP_NAME: validators.string()
        },
        {
          source: {
            APP_NAME: "   "
          }
        }
      )
    ).toThrow("APP_NAME is required");
  });

  test("parses numbers", () => {
    const env = createEnv(
      {
        PORT: validators.number()
      },
      {
        source: {
          PORT: "4000"
        }
      }
    );

    expect(env.PORT).toBe(4000);
  });

  test("rejects invalid numbers", () => {
    expect(() =>
      createEnv(
        {
          PORT: validators.number()
        },
        {
          source: {
            PORT: "abc"
          }
        }
      )
    ).toThrow("PORT must be a valid number");
  });

  test("parses integers", () => {
    const env = createEnv(
      {
        WORKERS: validators.integer()
      },
      {
        source: {
          WORKERS: "10"
        }
      }
    );

    expect(env.WORKERS).toBe(10);
  });

  test("rejects non-integer values", () => {
    expect(() =>
      createEnv(
        {
          WORKERS: validators.integer()
        },
        {
          source: {
            WORKERS: "3.14"
          }
        }
      )
    ).toThrow("WORKERS must be a valid integer");
  });

  test.each([
    ["true", true],
    ["false", false],
    ["1", true],
    ["0", false],
    ["yes", true],
    ["no", false],
    ["on", true],
    ["off", false]
  ])("parses boolean value %s", (input, expected) => {
    const env = createEnv(
      {
        ENABLE_CACHE: validators.boolean()
      },
      {
        source: {
          ENABLE_CACHE: input
        }
      }
    );

    expect(env.ENABLE_CACHE).toBe(expected);
  });

  test("rejects invalid boolean values", () => {
    expect(() =>
      createEnv(
        {
          ENABLE_CACHE: validators.boolean()
        },
        {
          source: {
            ENABLE_CACHE: "maybe"
          }
        }
      )
    ).toThrow("ENABLE_CACHE must be a boolean value");
  });

  test("parses arrays", () => {
    const env = createEnv(
      {
        ALLOWED_ORIGINS: validators.array(",")
      },
      {
        source: {
          ALLOWED_ORIGINS: "http://localhost:3000, https://example.com"
        }
      }
    );

    expect(env.ALLOWED_ORIGINS).toEqual(["http://localhost:3000", "https://example.com"]);
  });

  test("parses empty arrays", () => {
    const env = createEnv(
      {
        ALLOWED_ORIGINS: validators.array(",").default([])
      },
      {
        source: {
          ALLOWED_ORIGINS: ""
        }
      }
    );

    expect(env.ALLOWED_ORIGINS).toEqual([]);
  });

  test("parses JSON", () => {
    const env = createEnv(
      {
        FLAGS: validators.json<{ enabled: boolean }>()
      },
      {
        source: {
          FLAGS: '{"enabled":true}'
        }
      }
    );

    expect(env.FLAGS.enabled).toBe(true);
  });

  test("rejects invalid JSON", () => {
    expect(() =>
      createEnv(
        {
          FLAGS: validators.json()
        },
        {
          source: {
            FLAGS: "{bad"
          }
        }
      )
    ).toThrow("FLAGS must be valid JSON");
  });

  test("validates URLs and email addresses", () => {
    const env = createEnv(
      {
        DATABASE_URL: validators.url(),
        ADMIN_EMAIL: validators.email()
      },
      {
        source: {
          DATABASE_URL: "https://example.com",
          ADMIN_EMAIL: "admin@test.com"
        }
      }
    );

    expect(env.DATABASE_URL).toBe("https://example.com");
    expect(env.ADMIN_EMAIL).toBe("admin@test.com");
  });

  test("rejects invalid URLs and email addresses", () => {
    expect(() =>
      createEnv(
        {
          DATABASE_URL: validators.url(),
          ADMIN_EMAIL: validators.email()
        },
        {
          source: {
            DATABASE_URL: "not a url",
            ADMIN_EMAIL: "admin"
          }
        }
      )
    ).toThrow("DATABASE_URL must be a valid URL");
  });

  test("validates enum values", () => {
    const env = createEnv(
      {
        NODE_ENV: validators.enum(["development", "test", "production"] as const)
      },
      {
        source: {
          NODE_ENV: "production"
        }
      }
    );

    expect(env.NODE_ENV).toBe("production");
  });

  test("rejects invalid enum values", () => {
    expect(() =>
      createEnv(
        {
          NODE_ENV: validators.enum(["development", "test", "production"] as const)
        },
        {
          source: {
            NODE_ENV: "prod"
          }
        }
      )
    ).toThrow("NODE_ENV must be one of");
  });

  test("rejects empty enum definitions", () => {
    expect(() =>
      createEnv(
        {
          NODE_ENV: validators.enum([])
        },
        {
          source: {
            NODE_ENV: "production"
          }
        }
      )
    ).toThrow("NODE_ENV must define at least one allowed value");
  });

  test.each(["0", "-1", "65536", "abc", "3.14"])("rejects invalid port %s", (input) => {
    expect(() =>
      createEnv(
        {
          PORT: validators.port()
        },
        {
          source: {
            PORT: input
          }
        }
      )
    ).toThrow("PORT must be a valid port number between 1 and 65535");
  });

  test("validates secret minimum length", () => {
    const env = createEnv(
      {
        JWT_SECRET: validators.secret({ minLength: 8 })
      },
      {
        source: {
          JWT_SECRET: "long-secret"
        }
      }
    );

    expect(env.JWT_SECRET).toBe("long-secret");
  });

  test("uses a minimal default secret length", () => {
    const env = createEnv(
      {
        JWT_SECRET: validators.secret()
      },
      {
        source: {
          JWT_SECRET: "x"
        }
      }
    );

    expect(env.JWT_SECRET).toBe("x");
  });

  test("rejects weak secrets", () => {
    expect(() =>
      createEnv(
        {
          JWT_SECRET: validators.secret({ minLength: 32 })
        },
        {
          source: {
            JWT_SECRET: "short-secret"
          }
        }
      )
    ).toThrow("JWT_SECRET must be at least 32 characters long");
  });

  test("does not mutate reused validators while chaining", () => {
    const appName = validators.string();
    const optionalName = appName.optional();

    expect(() =>
      createEnv(
        {
          APP_NAME: appName
        },
        {
          source: {}
        }
      )
    ).toThrow("APP_NAME is required");

    const env = createEnv(
      {
        APP_NAME: optionalName
      },
      {
        source: {}
      }
    );

    expect(env.APP_NAME).toBeUndefined();
  });
});
