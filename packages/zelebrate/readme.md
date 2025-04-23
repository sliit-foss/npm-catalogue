# @sliit-foss/zelebrate

### Express middleware which wraps around the [Zod](https://www.npmjs.com/package/zod) validation library to provide a simple way to validate request bodies, query parameters, and headers. Heavy inspiration from [celebrate](https://www.npmjs.com/package/celebrate) which is a middleware for the `Joi` validation library.

#### Zelebrate exposes the same API as [celebrate](https://www.npmjs.com/package/celebrate), but uses Zod for validation instead of Joi. This means that you can use Zelebrate in the same way you would use celebrate, but with the added benefits of Zod's type inference and validation capabilities.

#### Further this library exposes a utility function named `zelebrateStack` which preserves the request segment types within the express handlers at lower levels automatically. Use this to build rock solid typesafe express applications.

## Installation

```js
# using npm
npm install @sliit-foss/zelebrate

# using yarn
yarn add @sliit-foss/zelebrate
```

## Usage

```js
const express = require("express");
const bodyParser = require("body-parser");
const { zelebrate, z, errors, Segments } = require("@sliit-foss/zelebrate");

const app = express();

app.use(bodyParser.json());

app.post(
  "/signup",
  zelebrate({
    [Segments.BODY]: z.object({
      name: z.string(),
      age: z.number().int(),
      role: z.string().default("admin")
    }),
    [Segments.QUERY]: z.object({
      token: z.string().uuid()
    })
  }),
  (req, res) => {
    // At this point, req.body has been validated and
    // req.body.role is equal to req.body.role if provided in the POST or set to 'admin' by zod
  }
);
app.use(errors());
```

## Type Safe Express Handlers

```js
const express = require("express");
const bodyParser = require("body-parser");
const { zelebrateStack, z, errors, Segments } = require("@sliit-foss/zelebrate");

const app = express();

app.use(bodyParser.json());

app.post(
  "/signup",
  zelebrateStack({
    [Segments.BODY]: z.object({
      name: z.string(),
      age: z.number().int(),
      role: z.string().default("admin")
    }),
    [Segments.QUERY]: z.object({
      token: z.string().uuid()
    })
  })(
    /** Add any number of handlers. req.body and req.query will be typed within all of them */
    (req, res) => {
      // req.body and req.query are type safe.
    }
  )
);
app.use(errors());
```

## API

zelebrate does not have a default export. The following methods encompass the public API.

### `zelebrate(schema, [opts])`

Returns a `function` with the middleware signature (`(req, res, next)`).

- `requestRules` - an `object` where `key` can be one of the values from [`Segments`](#segments) and the `value` is a zod validation schema. Only the keys specified will be validated against the incoming request object. If you omit a key, that part of the `req` object will not be validated. A schema must contain at least one valid key.
- `[opts]` - an optional `object` with the following keys. Defaults to `{}`.
  - `mode` - optional [`Modes`](#modes) for controlling the validation mode zelebrate uses. Defaults to `partial`.

### `zelebrator([opts], schema)`

This is a curried version of `zelebrate` It is curried with `lodash.curryRight` so it can be called in all the various fashions that [API supports](https://lodash.com/docs/4.17.15#curryRight). Returns a `function` with the middleware signature (`(req, res, next)`).

- `[opts]` - an optional `object` with the following keys. Defaults to `{}`.
  - `mode` - optional [`Modes`](#modes) for controlling the validation mode zelebrate uses. Defaults to `partial`.
- `requestRules` - an `object` where `key` can be one of the values from [`Segments`](#segments) and the `value` is a zod validation schema. Only the keys specified will be validated against the incoming request object. If you omit a key, that part of the `req` object will not be validated. A schema must contain at least one valid key.

<details>
  <summary>Sample usage</summary>

This is an example use of curried zelebrate in a real server.

```js
const express = require("express");
const { zelebrator, z, errors, Segments } = require("@sliit-foss/zelebrate");
const app = express();

// now every instance of `zelebrate` will use these same options so you only
// need to do it once.
const zelebrate = zelebrator({ mode: Modes.FULL });

// validate all incoming request headers for the token header
// if missing or not the correct format, respond with an error
app.use(
  zelebrate({
    [Segments.HEADERS]: z
      .object({
        token: z.string().regex(/abc\d{3}/)
      })
      .catchall(z.unknown())
  })
);

app.get(
  "/",
  zelebrate({
    [Segments.HEADERS]: z
      .object({
        name: z.string()
      })
      .catchall(z.unknown())
  }),
  (req, res) => {
    res.send("hello world");
  }
);

app.use(errors());
```

</details>

### `errors([opts])`

Returns a `function` with the error handler signature (`(err, req, res, next)`). This should be placed with any other error handling middleware to catch zelebrate errors. If the incoming `err` object is an error originating from zelebrate, `errors()` will respond a pre-build error object. Otherwise, it will call `next(err)` and will pass the error along and will need to be processed by another error handler.

- `[opts]` - an optional `object` with the following keys
  - `statusCode` - `number` that will be used for the response status code in the event of an error. Must be greater than 399 and less than 600. It must also be a number available to the node [HTTP module](https://nodejs.org/api/http.html#http_http_status_codes). Defaults to 400.
  - `message` - `string` that will be used for the `message` value sent out by the error handler. Defaults to `'Validation failed'`

If the error response format does not suite your needs, you are encouraged to write your own and check `isZelebrateError(err)` to format zelebrate errors to your liking.

Zelebrate augments the error objects returned by `zod` and adds a `pretty` method to it. This method will return a human readable string of the first error in the validation chain.

Errors origintating from the `zelebrate()` middleware are `ZelebrateError` objects.

### `z`

zelebrate exports the version of zod it is using internally. For maximum compatibility, you should use this version when creating schemas used with zelebrate.

### `Segments`

An enum containing all the segments of `req` objects that zelebrate _can_ validate against.

```js
{
  BODY: 'body',
  COOKIES: 'cookies',
  HEADERS: 'headers',
  PARAMS: 'params',
  QUERY: 'query',
  SIGNEDCOOKIES: 'signedCookies',
}
```

### `Modes`

An enum containing all the available validation modes that zelebrate can support.

- `PARTIAL` - ends validation on the first failure.
- `FULL` - validates the entire request object and collects all the validation failures in the result.

### `new ZelebrateError([message], [status])`

Creates a new `ZelebrateError` object. Extends the built in `Error` object.

- `message` - optional `string` message. Defaults to `'Validation failed'`.
- `status` - optional `number` status code. Defaults to `422`.

`ZelebrateError` has the following public properties:

- `details` - a `Map` of all validation failures. The `key` is a [`Segments`](#segments) and the value is a zod validation error.

### `isZelebrateError(err)`

Returns `true` if the provided `err` object originated from the `zelebrate` middleware, and `false` otherwise. Useful if you want to write your own error handler for zelebrate errors.

- `err` - an error object

## Additional Details

### Validation Order

zelebrate validates request values in the following order:

1. `req.headers`
2. `req.params`
3. `req.query`
4. `req.cookies` (_assuming `cookie-parser` is being used_)
5. `req.signedCookies` (_assuming `cookie-parser` is being used_)
6. `req.body` (_assuming `body-parser` is being used_)

### Mutation Warning

If you use any of zods's transformation APIs (`transform`, `coerce`, etc.) `zelebrate` will override the source value with the changes applied by the transformation

For example, if you validate `req.query` and have a `default` value in your zod schema, if the incoming `req.query` is missing a value for default, during validation `zelebrate` will overwrite the original `req.query` with the transformed result.

### Additional Info

According the the HTTP spec, `GET` requests should _not_ include a body in the request payload. For that reason, `zelebrate` does not validate the body on `GET` requests.

## Issues

_Before_ opening issues on this repo, make sure your zod schema is correct and working as you intended. The bulk of this code is just exposing the zod API as express middleware. All of the heavy lifting still happens inside zod.
