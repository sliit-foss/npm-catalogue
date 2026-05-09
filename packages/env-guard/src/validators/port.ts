import { BaseValidator } from "./base-validator";

export const port = () =>
  new BaseValidator<number>("port", (value, key) => {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
      return {
        ok: false,
        message: `${key} must be a valid port number between 1 and 65535`
      };
    }

    return { ok: true, value: parsed };
  });
