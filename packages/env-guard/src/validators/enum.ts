import { BaseValidator } from "./base-validator";

export const enumValue = <TValue extends string>(values: readonly TValue[]) =>
  new BaseValidator<TValue>("enum", (value, key) => {
    if (!values.length) {
      return {
        ok: false,
        message: `${key} must define at least one allowed value`
      };
    }

    if (!(values as readonly string[]).includes(value)) {
      return {
        ok: false,
        message: `${key} must be one of: ${values.join(", ")}`
      };
    }

    return { ok: true, value: value as TValue };
  });
