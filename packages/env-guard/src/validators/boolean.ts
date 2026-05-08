import { parseBoolean } from "../utils/parse-boolean";
import { BaseValidator } from "./base-validator";

export const boolean = () =>
  new BaseValidator<boolean>("boolean", (value, key) => {
    const parsed = parseBoolean(value);

    if (parsed === undefined) {
      return {
        ok: false,
        message: `${key} must be a boolean value`
      };
    }

    return { ok: true, value: parsed };
  });
