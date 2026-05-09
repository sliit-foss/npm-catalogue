import { BaseValidator } from "./base-validator";

export const array = (separator = ",") =>
  new BaseValidator<string[]>("array", (value) => {
    if (value.trim().length === 0) {
      return { ok: true, value: [] };
    }

    return {
      ok: true,
      value: value.split(separator).map((item) => item.trim())
    };
  });
