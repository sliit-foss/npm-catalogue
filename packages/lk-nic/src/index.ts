import { MIN_BIRTH_YEAR, NEW_NIC_REGEX, OLD_NIC_REGEX, VALIDATION_ERROR_MESSAGES } from "./constants";
import type {
  ConvertToOldNICOptions,
  NICFormat,
  NICGender,
  NICOptions,
  NICParseResult,
  NICValidationError,
  NICValidationErrorCode,
  NICValidationResult,
  NormalizeNICOptions,
  VotingEligibilityLetter
} from "./types";

export * from "./constants";
export * from "./types";

type DecodedDayOfYear = {
  dayOfYear: number;
  gender: NICGender;
};

type NICParts = {
  format: "old" | "new";
  birthYear: number;
  dayCode: number;
  serialNumber: string;
  checkDigit: string;
  votingEligibilityLetter?: VotingEligibilityLetter;
};

const pad = (value: number) => String(value).padStart(2, "0");

const getCurrentUTCYear = () => new Date().getUTCFullYear();

const createError = (code: NICValidationErrorCode): NICValidationError => ({
  code,
  message: VALIDATION_ERROR_MESSAGES[code]
});

const getFormatFromNormalized = (normalized: string): NICFormat => {
  if (OLD_NIC_REGEX.test(normalized)) return "old";
  if (NEW_NIC_REGEX.test(normalized)) return "new";

  return "invalid";
};

const isLeapYear = (year: number) => year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);

const getDaysInYear = (year: number) => (isLeapYear(year) ? 366 : 365);

const decodeDayOfYear = (value: number): DecodedDayOfYear | null => {
  if (value >= 1 && value <= 366) {
    return {
      dayOfYear: value,
      gender: "male"
    };
  }

  if (value >= 501 && value <= 866) {
    return {
      dayOfYear: value - 500,
      gender: "female"
    };
  }

  return null;
};

const getDateFromDayOfYear = (year: number, dayOfYear: number): Date | null => {
  if (dayOfYear < 1 || dayOfYear > getDaysInYear(year)) return null;

  return new Date(Date.UTC(year, 0, dayOfYear));
};

const formatDateUTC = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

const getNICParts = (normalized: string, format: "old" | "new"): NICParts => {
  if (format === "old") {
    return {
      format,
      birthYear: 1900 + Number(normalized.slice(0, 2)),
      dayCode: Number(normalized.slice(2, 5)),
      serialNumber: normalized.slice(5, 8),
      checkDigit: normalized.slice(8, 9),
      votingEligibilityLetter: normalized.slice(9, 10) as VotingEligibilityLetter
    };
  }

  return {
    format,
    birthYear: Number(normalized.slice(0, 4)),
    dayCode: Number(normalized.slice(4, 7)),
    serialNumber: normalized.slice(7, 11),
    checkDigit: normalized.slice(11, 12)
  };
};

const isValidBirthYear = (year: number) => year >= MIN_BIRTH_YEAR && year <= getCurrentUTCYear();

const normalizeVotingEligibilityLetter = (letter?: string): VotingEligibilityLetter | null => {
  const normalized = letter?.toUpperCase();

  if (normalized === "V" || normalized === "X") return normalized;

  return null;
};

const toInvalidParseResult = (validation: NICValidationResult): NICParseResult => ({
  isValid: false,
  format: validation.format,
  normalized: validation.normalized,
  errors: validation.errors
});

export const normalizeNIC = (nic: string, options: NormalizeNICOptions = {}) => {
  if (typeof nic !== "string") return "";

  const trimmed = nic.trim().toUpperCase();

  if (options.removeSeparators) return trimmed.replace(/[\s-]/g, "");

  return trimmed;
};

export const getNICFormat = (nic: string): NICFormat => getFormatFromNormalized(normalizeNIC(nic));

export const validateNIC = (nic: string, options: NICOptions = {}): NICValidationResult => {
  if (typeof nic !== "string") {
    return {
      isValid: false,
      format: "invalid",
      normalized: "",
      errors: [createError("INVALID_TYPE")]
    };
  }

  const normalized = normalizeNIC(nic, options);
  const errors: NICValidationError[] = [];

  if (!normalized) {
    return {
      isValid: false,
      format: "invalid",
      normalized,
      errors: [createError("EMPTY_INPUT")]
    };
  }

  const hasInvalidCharacters = /[^0-9VX]/i.test(normalized);
  const format = getFormatFromNormalized(normalized);

  if (hasInvalidCharacters) errors.push(createError("INVALID_CHARACTER"));

  if (format === "invalid") {
    if (normalized.length !== 10 && normalized.length !== 12) errors.push(createError("INVALID_LENGTH"));
    if (!hasInvalidCharacters && (normalized.length === 10 || normalized.length === 12)) {
      errors.push(createError("INVALID_FORMAT"));
    }

    return {
      isValid: false,
      format,
      normalized,
      errors
    };
  }

  const parts = getNICParts(normalized, format);

  if (!isValidBirthYear(parts.birthYear)) errors.push(createError("INVALID_YEAR"));

  const decoded = decodeDayOfYear(parts.dayCode);

  if (!decoded) {
    errors.push(createError("INVALID_DAY_OF_YEAR"));
  } else if (isValidBirthYear(parts.birthYear) && !getDateFromDayOfYear(parts.birthYear, decoded.dayOfYear)) {
    errors.push(createError("INVALID_DATE"));
  }

  return {
    isValid: errors.length === 0,
    format,
    normalized,
    errors
  };
};

export const isValidNIC = (nic: string, options?: NICOptions) => validateNIC(nic, options).isValid;

export const convertToNewNIC = (oldNic: string): string | null => {
  const normalized = normalizeNIC(oldNic);
  const validation = validateNIC(normalized);

  if (!validation.isValid || validation.format !== "old") return null;

  const year = normalized.slice(0, 2);
  const dayCode = normalized.slice(2, 5);
  const serialNumber = normalized.slice(5, 8);
  const checkDigit = normalized.slice(8, 9);

  return `19${year}${dayCode}0${serialNumber}${checkDigit}`;
};

export const convertToOldNIC = (newNic: string, options: ConvertToOldNICOptions = {}): string | null => {
  const normalized = normalizeNIC(newNic);
  const validation = validateNIC(normalized);
  const votingEligibilityLetter = normalizeVotingEligibilityLetter(options.votingEligibilityLetter ?? "V");

  if (!votingEligibilityLetter || !validation.isValid || validation.format !== "new") return null;

  const year = normalized.slice(0, 4);
  const serialNumber = normalized.slice(7, 11);

  if (!year.startsWith("19") || !serialNumber.startsWith("0")) return null;

  return `${year.slice(2)}${normalized.slice(4, 7)}${serialNumber.slice(1)}${normalized.slice(11)}${votingEligibilityLetter}`;
};

export const parseNIC = (nic: string, options?: NICOptions): NICParseResult => {
  const validation = validateNIC(nic, options);

  if (!validation.isValid || validation.format === "invalid") return toInvalidParseResult(validation);

  const parts = getNICParts(validation.normalized, validation.format);
  const decoded = decodeDayOfYear(parts.dayCode);
  const birthDate = decoded ? getDateFromDayOfYear(parts.birthYear, decoded.dayOfYear) : null;

  if (!decoded || !birthDate) return toInvalidParseResult(validation);

  const newFormat = parts.format === "old" ? convertToNewNIC(validation.normalized) : validation.normalized;
  const oldFormat =
    parts.format === "old" ? validation.normalized : convertToOldNIC(validation.normalized) ?? undefined;

  return {
    isValid: true,
    format: parts.format,
    normalized: validation.normalized,
    birthYear: parts.birthYear,
    birthDate,
    birthDateString: formatDateUTC(birthDate),
    dayOfYear: decoded.dayOfYear,
    gender: decoded.gender,
    serialNumber: parts.serialNumber,
    checkDigit: parts.checkDigit,
    votingEligibilityLetter: parts.votingEligibilityLetter,
    oldFormat,
    newFormat: newFormat as string
  };
};

export const getBirthDateFromNIC = (nic: string): Date | null => {
  const result = parseNIC(nic);

  return result.isValid ? result.birthDate : null;
};

export const getBirthDateStringFromNIC = (nic: string): string | null => {
  const result = parseNIC(nic);

  return result.isValid ? result.birthDateString : null;
};

export const getGenderFromNIC = (nic: string): NICGender | null => {
  const result = parseNIC(nic);

  return result.isValid ? result.gender : null;
};
