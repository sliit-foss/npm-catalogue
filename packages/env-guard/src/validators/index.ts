import { array } from "./array";
import { boolean } from "./boolean";
import { email } from "./email";
import { enumValue } from "./enum";
import { json } from "./json";
import { integer, number } from "./number";
import { port } from "./port";
import { secret } from "./secret";
import { string } from "./string";
import { url } from "./url";

export {
  BaseValidator,
  type AnyValidator,
  type EnvSchema,
  type EnvValidationIssue,
  type InferEnv,
  type InferValidator
} from "./base-validator";

export const validators = {
  array,
  boolean,
  email,
  enum: enumValue,
  integer,
  json,
  number,
  port,
  secret,
  string,
  url
};
