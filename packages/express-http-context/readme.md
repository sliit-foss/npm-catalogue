# @sliit-foss/express-http-context

#### A rework of the [express-http-context](https://www.npmjs.com/package/express-http-context) package to use the new async_hooks API <br><br>

**Built as the existing package does not work alongside the [Bun](https://bun.sh/) runtime**

---

Get and set request-scoped context anywhere. This is just an unopinionated, idiomatic ExpressJS implementation of [AsyncLocalStorage](https://nodejs.org/api/async_context.html#new-asynclocalstorage). It's a great place to store user state, claims from a JWT, request/correlation IDs, and any other request-scoped data. Context is preserved even over async/await.

## How to use it

Install: `bun install --save express-http-context`

Use the middleware immediately before the first middleware that needs to have access to the context.
You won't have access to the context in any middleware "used" before this one.

Note that some popular middlewares (such as body-parser, express-jwt) may cause context to get lost.
To workaround such issues, you are advised to use any third party middleware that does NOT need the context
BEFORE you use this middleware.

```js
const express = require("express");
const httpContext = require("express-http-context");

const app = express();
// Use any third party middleware that does not need access to the context here, e.g.
// app.use(some3rdParty.middleware);
app.use(httpContext.middleware);
// all code from here on has access to the same context for each request
```

Set values based on the incoming request:

```js
// Example authorization middleware
app.use((req, res, next) => {
  userService.getUser(req.get("Authorization"), (err, result) => {
    if (err) {
      next(err);
    } else {
      httpContext.set("user", result.user);
      next();
    }
  });
});
```

Get them from code that doesn't have access to the express `req` object:

```js
const httpContext = require("express-http-context");

// Somewhere deep in the Todo Service
function createTodoItem(title, content, callback) {
  const user = httpContext.get("user");
  db.insert({ title, content, userId: user.id }, callback);
}
```

You can access the store directly as follows

```js
const store = require("express-http-context").store;
```

## Troubleshooting

For users of Node below version 14

1. Unfortunatly, this package does not work with any version of Node below 14. This is due to the fact that the AsyncLocalStorage API was introduced in Node 14. If you are using Node below version 14, you can use the original [express-http-context](https://www.npmjs.com/package/express-http-context) package but as of writing this, it will not work with [Bun](https://bun.sh/).
