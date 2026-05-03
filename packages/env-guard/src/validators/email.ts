import { BaseValidator } from "./base-validator";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const email = () =>
  new BaseValidator<string>("email", (value, key) => {
    if (!emailPattern.test(value)) {
      return {
        ok: false,
        message: `${key} must be a valid email address`
      };
    }

    return { ok: true, value };
  });
