import { BaseValidator } from "./base-validator";

export const json = <TOutput = unknown>() =>
  new BaseValidator<TOutput>("json", (value, key) => {
    try {
      return { ok: true, value: JSON.parse(value) as TOutput };
    } catch {
      return {
        ok: false,
        message: `${key} must be valid JSON`
      };
    }
  });
