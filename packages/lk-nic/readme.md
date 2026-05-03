# @sliit-foss/lk-nic

Validate, parse, and convert Sri Lankan National Identity Card numbers.

## Installation

```bash
npm install @sliit-foss/lk-nic
```

```bash
yarn add @sliit-foss/lk-nic
```

```bash
pnpm add @sliit-foss/lk-nic
```

## Quick start

```ts
import { convertToNewNIC, isValidNIC, parseNIC } from "@sliit-foss/lk-nic";

isValidNIC("855420159V");
// true

convertToNewNIC("855420159V");
// "198554200159"

parseNIC("855420159V");
// {
//   isValid: true,
//   format: "old",
//   normalized: "855420159V",
//   birthYear: 1985,
//   birthDateString: "1985-02-11",
//   dayOfYear: 42,
//   gender: "female",
//   serialNumber: "015",
//   checkDigit: "9",
//   votingEligibilityLetter: "V",
//   oldFormat: "855420159V",
//   newFormat: "198554200159"
// }
```

## Supported formats

- Old NIC: 9 digits followed by `V` or `X`, for example `855420159V`.
- New NIC: 12 digits, for example `198554200159`.

Lowercase `v` and `x` are accepted and normalized to uppercase.

## Validation

```ts
import { isValidNIC, validateNIC } from "@sliit-foss/lk-nic";

isValidNIC("855420159v");
// true

validateNIC("198599900159");
// {
//   isValid: false,
//   format: "new",
//   normalized: "198599900159",
//   errors: [
//     {
//       code: "INVALID_DAY_OF_YEAR",
//       message: "Day-of-year value must be between 1-366 for male or 501-866 for female."
//     }
//   ]
// }
```

Birth years must be between `1900` and the current UTC year. Day-of-year values are decoded as `1-366` for male holders and `501-866` for female holders.

## Normalization

```ts
import { normalizeNIC } from "@sliit-foss/lk-nic";

normalizeNIC(" 855420159v ");
// "855420159V"

normalizeNIC("85542-0159-v", { removeSeparators: true });
// "855420159V"
```

By default, normalization trims leading/trailing whitespace and uppercases `V`/`X`. It does not remove separators unless `removeSeparators` is enabled.

## Parsing

```ts
import { parseNIC } from "@sliit-foss/lk-nic";

const result = parseNIC("198554200159");

if (result.isValid) {
  result.birthDateString; // "1985-02-11"
  result.gender; // "female"
  result.serialNumber; // "0015"
  result.checkDigit; // "9"
}
```

`serialNumber` does not include the final check digit. The check digit is exposed separately as `checkDigit`.

## Date and gender helpers

```ts
import { getBirthDateFromNIC, getBirthDateStringFromNIC, getGenderFromNIC } from "@sliit-foss/lk-nic";

getBirthDateFromNIC("855420159V");
// Date | null

getBirthDateStringFromNIC("855420159V");
// "1985-02-11"

getGenderFromNIC("850420159V");
// "male"
```

Date calculations use UTC calendar math to avoid timezone-dependent results.

## Conversion

```ts
import { convertToNewNIC, convertToOldNIC } from "@sliit-foss/lk-nic";

convertToNewNIC("855420159V");
// "198554200159"

convertToOldNIC("198554200159");
// "855420159V"

convertToOldNIC("198554200159", { votingEligibilityLetter: "X" });
// "855420159X"
```

New-to-old conversion returns `null` unless the birth year starts with `19` and the new-format serial section starts with `0`.

## TypeScript types

```ts
type NICFormat = "old" | "new" | "invalid";
type NICGender = "male" | "female";
type VotingEligibilityLetter = "V" | "X";
```

The package also exports `NICValidationResult`, `NICParseResult`, `NICValidationError`, `NICValidationErrorCode`, `NICOptions`, and `NormalizeNICOptions`.

## Validation error codes

- `EMPTY_INPUT`
- `INVALID_TYPE`
- `INVALID_FORMAT`
- `INVALID_LENGTH`
- `INVALID_CHARACTER`
- `INVALID_YEAR`
- `INVALID_DAY_OF_YEAR`
- `INVALID_DATE`
- `UNSUPPORTED_CONVERSION`

## React form example

```tsx
import { isValidNIC, parseNIC } from "@sliit-foss/lk-nic";

function handleNICChange(value: string) {
  if (!isValidNIC(value)) {
    setError("Please enter a valid Sri Lankan NIC number");
    return;
  }

  const parsed = parseNIC(value);

  if (parsed.isValid) {
    setDateOfBirth(parsed.birthDateString);
    setGender(parsed.gender);
  }
}
```

## Express API example

```ts
import express from "express";
import { validateNIC } from "@sliit-foss/lk-nic";

const app = express();

app.post("/register", (req, res) => {
  const result = validateNIC(req.body.nic);

  if (!result.isValid) {
    return res.status(400).json({
      message: "Invalid NIC number",
      errors: result.errors
    });
  }

  return res.json({
    message: "NIC is valid"
  });
});
```

## Limitations

The final check digit is validated as a structural digit only. No checksum validation is applied because no checksum rule is specified for this package.
