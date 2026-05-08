import { BaseValidator } from "./base-validator";

export const string = () =>
  new BaseValidator<string>("string", (value, key) => {
    if (value.length === 0) {
      return {
        ok: false,
        message: `${key} must be a non-empty string`
      };
    }

    return { ok: true, value };
  });
