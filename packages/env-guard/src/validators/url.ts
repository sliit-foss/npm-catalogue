import { BaseValidator } from "./base-validator";

export const url = () =>
  new BaseValidator<string>("url", (value, key) => {
    try {
      new URL(value);
      return { ok: true, value };
    } catch {
      return {
        ok: false,
        message: `${key} must be a valid URL`
      };
    }
  });
