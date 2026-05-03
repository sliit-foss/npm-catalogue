import { EnvValidationIssue } from "../validators";
import { redact } from "../utils/redact";

const none = "- None";

const formatIssue = (issue: EnvValidationIssue): string => {
  const received =
    issue.received === undefined ? "" : `. Received: "${issue.sensitive ? redact(issue.received) : issue.received}"`;
  return `- ${issue.message}${received}`;
};

export const formatEnvValidationErrors = (issues: EnvValidationIssue[]): string => {
  const missing = issues.filter((issue) => issue.type === "missing");
  const invalid = issues.filter((issue) => issue.type === "invalid");
  const warnings = issues.filter((issue) => issue.type === "warning");

  return [
    "Environment validation failed",
    "",
    "Missing variables:",
    missing.length ? missing.map(formatIssue).join("\n") : none,
    "",
    "Invalid variables:",
    invalid.length ? invalid.map(formatIssue).join("\n") : none,
    "",
    "Security warnings:",
    warnings.length ? warnings.map(formatIssue).join("\n") : none
  ].join("\n");
};
