# @sliit-foss/env-guard

Type-safe environment variable validation and configuration guard for Node.js applications.

## Why?

Environment variables are usually read as raw strings from `process.env`. This can cause runtime failures when required values are missing, mistyped, or too weak for production. `env-guard` validates your environment configuration at startup and returns a typed config object.

## Installation

```bash
pnpm add @sliit-foss/env-guard
```

## Basic Usage

```ts
import { createEnv, validators } from "@sliit-foss/env-guard";

export const env = createEnv({
  NODE_ENV: validators.enum(["development", "test", "production"]).default("development"),
  PORT: validators.port().default(3000),
  DATABASE_URL: validators.url(),
  JWT_SECRET: validators.secret({ minLength: 32 }),
  ENABLE_EMAILS: validators.boolean().default(false),
  ALLOWED_ORIGINS: validators.array(",").default([])
});
```

`env.PORT` is typed as `number`, `env.ENABLE_EMAILS` is typed as `boolean`, and `env.DATABASE_URL` is typed as `string`.

## Advanced Usage

```ts
const env = createEnv(
  {
    PORT: validators.port().default(3000),
    DATABASE_URL: validators.url()
  },
  {
    source: process.env,
    throwOnError: true,
    redactSecrets: true,
    allowUnknown: true
  }
);
```

## Validators

```ts
validators.string();
validators.number();
validators.integer();
validators.boolean();
validators.array(",");
validators.json();
validators.url();
validators.email();
validators.enum(["development", "production"]);
validators.port();
validators.secret({ minLength: 32 });
```

Each validator is required by default and supports:

```ts
validators.string().required();
validators.string().optional();
validators.string().default("hello");
validators.string().description("Application name");
validators.string().example("Student API");
validators.string().sensitive();
```

## Default And Optional Values

```ts
const env = createEnv({
  PORT: validators.port().default(3000),
  SENTRY_DSN: validators.url().optional()
});
```

Missing variables with defaults use the default value. Missing optional variables return `undefined`.

## Secret Redaction

Sensitive validators and secret-like keys are redacted in error messages. Keys containing `SECRET`, `TOKEN`, `PASSWORD`, `PRIVATE_KEY`, `API_KEY`, `AUTH`, or `CREDENTIAL` are treated as sensitive.

```txt
JWT_SECRET must be at least 32 characters long. Received: "[REDACTED]"
```

## Generate .env.example

```ts
import { generateEnvExample, validators } from "@sliit-foss/env-guard";

const schema = {
  DATABASE_URL: validators.url().description("Database connection string"),
  PORT: validators.port().default(3000),
  JWT_SECRET: validators.secret({ minLength: 32 })
};

console.log(generateEnvExample(schema));
```

Output:

```env
# Database connection string
DATABASE_URL=

# Default: 3000
PORT=3000

# Secret value. Minimum length: 32
JWT_SECRET=
```

## CLI Usage

Create a schema file:

```js
const { validators } = require("@sliit-foss/env-guard");

module.exports = {
  PORT: validators.port().default(3000),
  DATABASE_URL: validators.url(),
  JWT_SECRET: validators.secret({ minLength: 32 })
};
```

Validate an env file:

```bash
env-guard validate --schema ./env.schema.js --file .env
```

Generate example content:

```bash
env-guard example --schema ./env.schema.js --output .env.example
```

## Error Output

```txt
Environment validation failed

Missing variables:
- DATABASE_URL is required
- JWT_SECRET is required

Invalid variables:
- PORT must be a valid port number between 1 and 65535. Received: "abc"
- NODE_ENV must be one of: development, test, production. Received: "prod"

Security warnings:
- None
```

## TypeScript Support

`createEnv` infers types from the schema:

```ts
const env = createEnv({
  PORT: validators.port().default(3000),
  ENABLE_EMAILS: validators.boolean().default(false),
  DATABASE_URL: validators.url()
});

env.PORT; // number
env.ENABLE_EMAILS; // boolean
env.DATABASE_URL; // string
```
