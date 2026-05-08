import { generateEnvExample, validators } from "../src";

describe("generateEnvExample", () => {
  test("generates env example content from schema metadata", () => {
    const output = generateEnvExample({
      DATABASE_URL: validators.url().description("Database connection string"),
      PORT: validators.port().default(3000),
      APP_NAME: validators.string().example("Student API"),
      JWT_SECRET: validators.secret({ minLength: 32 })
    });

    expect(output).toContain("# Database connection string\nDATABASE_URL=");
    expect(output).toContain("# Default: 3000\nPORT=3000");
    expect(output).toContain("# Example: Student API\nAPP_NAME=");
    expect(output).toContain("# Secret value. Minimum length: 32\nJWT_SECRET=");
  });
});
