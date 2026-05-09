export type EnvValueSource = Record<string, string | undefined>;

export type EnvValidationIssueType = "missing" | "invalid" | "warning";

export type EnvValidationIssue = {
  key: string;
  message: string;
  received?: string;
  type: EnvValidationIssueType;
  sensitive?: boolean;
};

export type ValidatorResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      message: string;
    };

export type ValidatorMeta<T> = {
  required: boolean;
  defaultValue?: T;
  hasDefault: boolean;
  description?: string;
  example?: T;
  sensitive: boolean;
  typeName: string;
  typeDescription?: string;
};

type Parser<T> = (value: string, key: string) => ValidatorResult<T>;

export class BaseValidator<TOutput> {
  private readonly parser: Parser<TOutput>;
  private readonly meta: ValidatorMeta<TOutput>;

  constructor(typeName: string, parser: Parser<TOutput>, meta?: Partial<ValidatorMeta<TOutput>>) {
    this.parser = parser;
    this.meta = {
      required: true,
      hasDefault: false,
      sensitive: false,
      typeName,
      ...meta
    };
  }

  required(): BaseValidator<TOutput> {
    return this.clone({ required: true });
  }

  optional(): BaseValidator<TOutput | undefined> {
    return this.clone<TOutput | undefined>({ required: false });
  }

  default(value: TOutput): BaseValidator<TOutput> {
    return this.clone({ defaultValue: value, hasDefault: true, required: false });
  }

  description(text: string): BaseValidator<TOutput> {
    return this.clone({ description: text });
  }

  example(value: TOutput): BaseValidator<TOutput> {
    return this.clone({ example: value });
  }

  sensitive(): BaseValidator<TOutput> {
    return this.clone({ sensitive: true });
  }

  parse(value: string, key: string): ValidatorResult<TOutput> {
    return this.parser(value, key);
  }

  getMeta(): ValidatorMeta<TOutput> {
    return { ...this.meta };
  }

  private clone<TNext = TOutput>(meta: Partial<ValidatorMeta<TNext>>): BaseValidator<TNext> {
    return new BaseValidator<TNext>(this.meta.typeName, this.parser as unknown as Parser<TNext>, {
      ...(this.meta as unknown as ValidatorMeta<TNext>),
      ...meta
    });
  }
}

export type AnyValidator = BaseValidator<any>;
export type InferValidator<TValidator> = TValidator extends BaseValidator<infer TOutput> ? TOutput : never;
export type EnvSchema = Record<string, AnyValidator>;
export type InferEnv<TSchema extends EnvSchema> = {
  [K in keyof TSchema]: InferValidator<TSchema[K]>;
};
