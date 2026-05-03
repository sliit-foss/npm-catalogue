import { BaseValidator } from "./base-validator";

export const number = () =>
  new BaseValidator<number>("number", (value, key) => {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return {
        ok: false,
        message: `${key} must be a valid number`
      };
    }

    return { ok: true, value: parsed };
  });

export const integer = () =>
  new BaseValidator<number>("integer", (value, key) => {
    const parsed = Number(value);

    if (!Number.isInteger(parsed)) {
      return {
        ok: false,
        message: `${key} must be a valid integer`
      };
    }

    return { ok: true, value: parsed };
  });
