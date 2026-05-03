import { BaseValidator } from "./base-validator";

export type SecretValidatorOptions = {
  minLength?: number;
  requireNumber?: boolean;
  requireSpecialCharacter?: boolean;
};

export const secret = ({ minLength = 1 }: SecretValidatorOptions = {}) =>
  new BaseValidator<string>(
    "secret",
    (value, key) => {
      if (value.length < minLength) {
        return {
          ok: false,
          message: `${key} must be at least ${minLength} characters long`
        };
      }

      return { ok: true, value };
    },
    {
      typeDescription: minLength > 1 ? `Minimum length: ${minLength}` : undefined
    }
  ).sensitive();
