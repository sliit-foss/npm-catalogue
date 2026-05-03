import { EnvValidationIssue } from "../validators";
import { formatEnvValidationErrors } from "./format-errors";

export class EnvValidationError extends Error {
  issues: EnvValidationIssue[];

  constructor(issues: EnvValidationIssue[]) {
    super(formatEnvValidationErrors(issues));
    this.name = "EnvValidationError";
    this.issues = issues;
  }
}
