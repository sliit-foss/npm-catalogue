import type { NICValidationErrorCode } from "./types";

export const MIN_BIRTH_YEAR = 1900;

export const OLD_NIC_REGEX = /^[0-9]{9}[VX]$/i;

export const NEW_NIC_REGEX = /^[0-9]{12}$/;

export const VALIDATION_ERROR_MESSAGES: Record<NICValidationErrorCode, string> = {
  EMPTY_INPUT: "NIC value cannot be empty.",
  INVALID_TYPE: "NIC value must be a string.",
  INVALID_FORMAT: "NIC value must be either 9 digits followed by V/X or 12 digits.",
  INVALID_LENGTH: "NIC value must be 10 characters for old format or 12 digits for new format.",
  INVALID_CHARACTER: "NIC value can only contain digits and the V/X ending for old format.",
  INVALID_YEAR: "Birth year must be between 1900 and the current year.",
  INVALID_DAY_OF_YEAR: "Day-of-year value must be between 1-366 for male or 501-866 for female.",
  INVALID_DATE: "Day-of-year value is not valid for the birth year.",
  UNSUPPORTED_CONVERSION: "NIC value cannot be safely converted to the requested format."
};
