import { ZodError } from "zod";
import { Segments } from "./constants";

export const ZelebrateError = class extends Error {
  public details: Map<Segments, ZodError[]>;
  constructor(message = "Validation failed") {
    super(message);
    this.details = new Map();
  }
};

export const isZelebrateError = (err) => err instanceof ZelebrateError;
