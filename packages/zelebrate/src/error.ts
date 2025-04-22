import { ZodError } from "zod";
import { Segments } from "./constants";

declare module "zod" {
  interface ZodError {
    /**
     * Formats and returns the first issue in a human-readable way.
     */
    pretty(): string;
  }
}

ZodError.prototype.pretty = function () {
  if (this.issues.length === 0) {
    return "No issues found";
  }
  return this.issues[0].expected
    ? `Expected ${this.issues[0].expected} but received ${this.issues[0].received} for \`${this.issues[0].path.join(".")}\``
    : this.issues[0].message;
};

export class ZelebrateError extends Error {
  public details: Map<Segments, ZodError>;
  public status: number;
  constructor(message = "Validation failed", status = 422) {
    super(message);
    this.details = new Map();
    this.status = status;
  }
}

export const isZelebrateError = (err: any) => err instanceof ZelebrateError;
