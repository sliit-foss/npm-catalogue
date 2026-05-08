import {
  convertToNewNIC,
  convertToOldNIC,
  getBirthDateFromNIC,
  getBirthDateStringFromNIC,
  getGenderFromNIC,
  getNICFormat,
  isValidNIC,
  normalizeNIC,
  parseNIC,
  validateNIC
} from "../src";

const getErrorCodes = (nic: string) => validateNIC(nic).errors.map((error) => error.code);

describe("normalizeNIC", () => {
  test("trims values and uppercases old NIC letters", () => {
    expect(normalizeNIC(" 855420159v ")).toBe("855420159V");
  });

  test("removes spaces and hyphens only when requested", () => {
    expect(normalizeNIC("85542-0159-v")).toBe("85542-0159-V");
    expect(normalizeNIC("85542-0159-v", { removeSeparators: true })).toBe("855420159V");
  });
});

describe("getNICFormat", () => {
  test("detects old, new, and invalid formats", () => {
    expect(getNICFormat("855420159V")).toBe("old");
    expect(getNICFormat("198554200159")).toBe("new");
    expect(getNICFormat("abc")).toBe("invalid");
  });
});

describe("validateNIC and isValidNIC", () => {
  test("accepts valid old and new NIC values", () => {
    expect(isValidNIC("855420159V")).toBe(true);
    expect(isValidNIC("855420159v")).toBe(true);
    expect(isValidNIC("198554200159")).toBe(true);
  });

  test("supports relaxed separator removal during validation", () => {
    expect(isValidNIC("85542-0159-v")).toBe(false);
    expect(isValidNIC("85542-0159-v", { removeSeparators: true })).toBe(true);
  });

  test("reports empty and non-string values", () => {
    expect(getErrorCodes("")).toContain("EMPTY_INPUT");
    expect(validateNIC(123 as any).errors[0].code).toBe("INVALID_TYPE");
  });

  test("reports invalid length, characters, and format", () => {
    expect(getErrorCodes("123")).toContain("INVALID_LENGTH");
    expect(getErrorCodes("ABCDEFGHIJ")).toContain("INVALID_CHARACTER");
    expect(getErrorCodes("855420159A")).toContain("INVALID_CHARACTER");
    expect(getErrorCodes("1234567890")).toContain("INVALID_FORMAT");
  });

  test("rejects years outside 1900 through the current UTC year", () => {
    expect(getErrorCodes("189900100159")).toContain("INVALID_YEAR");
    expect(getErrorCodes("299900100159")).toContain("INVALID_YEAR");
  });

  test("rejects unsupported day codes", () => {
    expect(getErrorCodes("853700159V")).toContain("INVALID_DAY_OF_YEAR");
    expect(getErrorCodes("198537000159")).toContain("INVALID_DAY_OF_YEAR");
    expect(getErrorCodes("198586700159")).toContain("INVALID_DAY_OF_YEAR");
  });

  test("validates leap-year dates with UTC calendar math", () => {
    expect(isValidNIC("200036600001")).toBe(true);
    expect(getBirthDateStringFromNIC("200036600001")).toBe("2000-12-31");
    expect(getErrorCodes("198536600159")).toContain("INVALID_DATE");
  });
});

describe("parseNIC", () => {
  test("parses old NIC details", () => {
    const result = parseNIC("855420159V");

    expect(result).toMatchObject({
      isValid: true,
      format: "old",
      normalized: "855420159V",
      birthYear: 1985,
      birthDateString: "1985-02-11",
      dayOfYear: 42,
      gender: "female",
      serialNumber: "015",
      checkDigit: "9",
      votingEligibilityLetter: "V",
      oldFormat: "855420159V",
      newFormat: "198554200159"
    });
  });

  test("parses new NIC details", () => {
    const result = parseNIC("198554200159");

    expect(result).toMatchObject({
      isValid: true,
      format: "new",
      normalized: "198554200159",
      birthYear: 1985,
      birthDateString: "1985-02-11",
      dayOfYear: 42,
      gender: "female",
      serialNumber: "0015",
      checkDigit: "9",
      oldFormat: "855420159V",
      newFormat: "198554200159"
    });
  });

  test("returns validation details for invalid values", () => {
    expect(parseNIC("ABC123")).toMatchObject({
      isValid: false,
      format: "invalid"
    });
  });
});

describe("date and gender helpers", () => {
  test("extracts birth dates", () => {
    const date = getBirthDateFromNIC("850420159V");

    expect(date?.getUTCFullYear()).toBe(1985);
    expect(date?.getUTCMonth()).toBe(1);
    expect(date?.getUTCDate()).toBe(11);
    expect(getBirthDateStringFromNIC("855420159V")).toBe("1985-02-11");
    expect(getBirthDateStringFromNIC("invalid")).toBeNull();
  });

  test("extracts gender", () => {
    expect(getGenderFromNIC("850420159V")).toBe("male");
    expect(getGenderFromNIC("855420159V")).toBe("female");
    expect(getGenderFromNIC("invalid")).toBeNull();
  });
});

describe("conversion", () => {
  test("converts old NIC values to new NIC values", () => {
    expect(convertToNewNIC("855420159V")).toBe("198554200159");
    expect(convertToNewNIC("855420159v")).toBe("198554200159");
    expect(convertToNewNIC("198554200159")).toBeNull();
  });

  test("converts compatible new NIC values to old NIC values", () => {
    expect(convertToOldNIC("198554200159")).toBe("855420159V");
    expect(convertToOldNIC("198554200159", { votingEligibilityLetter: "X" })).toBe("855420159X");
  });

  test("rejects unsupported new to old conversions", () => {
    expect(convertToOldNIC("200012300123")).toBeNull();
    expect(convertToOldNIC("199954212349")).toBeNull();
    expect(convertToOldNIC("198554200159", { votingEligibilityLetter: "A" as any })).toBeNull();
  });
});
