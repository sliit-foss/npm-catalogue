import http from "http";
import { z } from "zod";
import { default as EscapeHtml } from "escape-html";
import { curry, flip } from "lodash";
import { NextFunction, Request, Response } from "express";
import { Segments, Modes } from "./constants";
import { RequestRules, ZelebrateOptions, ErrorOptions } from "./schema";
import { ZelebrateError, isZelebrateError } from "./error";

export { z };

const DEFAULT_ERRORS_OPTS: ErrorOptions = {
  statusCode: 400
};

const DEFAULT_ZELEBRATE_OPTS: ZelebrateOptions = {
  mode: Modes.PARTIAL
};

const validateSegment = (segment: Segments) => (spec: z.ZodObject<any>) => {
  const finalValidate = (req: Request) => spec.parse(req[segment]);
  finalValidate.segment = segment;
  return finalValidate;
};

const maybeValidateBody = (segment: Segments) => {
  const validateOne = validateSegment(segment);
  return (spec: z.ZodObject<any>) => {
    const validateBody = validateOne(spec);
    const finalValidate = (req: Request) => {
      const method = req.method.toLowerCase();

      if (method === "get" || method === "head") {
        // This resolve is to emulate how Zod validates when there isn't an error. I'm doing this to
        // standardize the resolve value.
        return Promise.resolve({
          value: null
        });
      }

      return validateBody(req);
    };
    finalValidate.segment = segment;
    return finalValidate;
  };
};

const REQ_VALIDATIONS = [
  {
    segment: Segments.HEADERS,
    validate: validateSegment(Segments.HEADERS)
  },
  {
    segment: Segments.PARAMS,
    validate: validateSegment(Segments.PARAMS)
  },
  {
    segment: Segments.QUERY,
    validate: validateSegment(Segments.QUERY)
  },
  {
    segment: Segments.COOKIES,
    validate: validateSegment(Segments.COOKIES)
  },
  {
    segment: Segments.SIGNEDCOOKIES,
    validate: validateSegment(Segments.SIGNEDCOOKIES)
  },
  {
    segment: Segments.BODY,
    validate: maybeValidateBody(Segments.BODY)
  }
];

// Lifted this idea from https://bit.ly/2vf3Xe0
const partialValidate = (steps, req) =>
  steps.reduce(
    (chain, validate) =>
      chain.then(() =>
        validate(req)
          .then(({ value }) => {
            if (value !== null) {
              Object.defineProperty(req, validate.segment, {
                value
              });
            }
            return null;
          })
          .catch((e) => {
            const error = new ZelebrateError();
            error.details.set(validate.segment, e);
            throw error;
          })
      ),
    Promise.resolve(null)
  );

const fullValidate = (steps, req: Request) => {
  const requestUpdates = [];
  const error = new ZelebrateError();
  return Promise.all(
    steps.map((validate) =>
      validate(req)
        .then(({ value }) => {
          if (value !== null) {
            requestUpdates.push([validate.segment, value]);
          }
          return null;
        })
        .catch((e) => {
          error.details.set(validate.segment, e);
          return null;
        })
    )
  ).then(() => {
    if (error.details.size) {
      return Promise.reject(error);
    }
    requestUpdates.forEach((result) => {
      Object.defineProperty(req, result[0], {
        value: result[1]
      });
    });
    return null;
  });
};

const validateFns = {
  [Modes.FULL]: fullValidate,
  [Modes.PARTIAL]: partialValidate
};

export const zelebrate = (requestRules: RequestRules, opts: ZelebrateOptions = {}) => {
  const finalOpts = {
    ...DEFAULT_ZELEBRATE_OPTS,
    ...opts
  };
  const middleware = (req: Request, res: Response, next: NextFunction) => {
    const steps = [];
    REQ_VALIDATIONS.forEach((value) => {
      // If there isn't a schema set up for this segment, early return
      if (requestRules[value.segment]) {
        steps.push(value.validate(requestRules[value.segment]));
      }
    });

    const validateRequest = validateFns[finalOpts.mode];

    // This promise is not part of the public API; it's only here to make the tests cleaner
    return validateRequest(steps, req).then(next).catch(next);
  };
  return middleware;
};

export const errors = (opts: ErrorOptions = {}) => {
  const finalOpts = { ...DEFAULT_ERRORS_OPTS, ...opts };
  return (err, _: Request, res: Response, next: NextFunction) => {
    // If this isn't a Zelebrate error, send it to the next error handler
    if (!isZelebrateError(err)) {
      return next(err);
    }

    const { statusCode, message } = finalOpts;

    const validation = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const [segment, zodErrors] of err.details.entries()) {
      validation[segment] = {
        source: segment,
        keys: zodErrors.map((e: any) => EscapeHtml(e.path.join("."))),
        messages: zodErrors.map((e) => e.message)
      };
    }

    const result = {
      statusCode,
      error: http.STATUS_CODES[statusCode],
      message: message || err.message,
      validation
    };

    return res.status(statusCode).send(result);
  };
};

export const zelebrator = curry(flip(zelebrate), 3);
