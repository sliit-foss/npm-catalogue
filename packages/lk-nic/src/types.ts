export type NICFormat = "old" | "new" | "invalid";

export type NICGender = "male" | "female";

export type VotingEligibilityLetter = "V" | "X";

export type NormalizeNICOptions = {
  removeSeparators?: boolean;
};

export type NICOptions = NormalizeNICOptions;

export type NICValidationErrorCode =
  | "EMPTY_INPUT"
  | "INVALID_TYPE"
  | "INVALID_FORMAT"
  | "INVALID_LENGTH"
  | "INVALID_CHARACTER"
  | "INVALID_YEAR"
  | "INVALID_DAY_OF_YEAR"
  | "INVALID_DATE"
  | "UNSUPPORTED_CONVERSION";

export type NICValidationError = {
  code: NICValidationErrorCode;
  message: string;
};

export type NICValidationResult = {
  isValid: boolean;
  format: NICFormat;
  normalized: string;
  errors: NICValidationError[];
};

export type NICParseResult =
  | {
      isValid: true;
      format: "old" | "new";
      normalized: string;
      birthYear: number;
      birthDate: Date;
      birthDateString: string;
      dayOfYear: number;
      gender: NICGender;
      serialNumber: string;
      checkDigit: string;
      votingEligibilityLetter?: VotingEligibilityLetter;
      oldFormat?: string;
      newFormat: string;
    }
  | {
      isValid: false;
      format: NICFormat;
      normalized: string;
      errors: NICValidationError[];
    };

export type ConvertToOldNICOptions = {
  votingEligibilityLetter?: VotingEligibilityLetter;
};
