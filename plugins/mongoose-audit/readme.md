# @sliit-foss/mongoose-audit

#### A rework of the [mongoose-audit-log](https://www.npmjs.com/package/mongoose-audit-log) package to support newer versions of mongoose and more flexible options<br>

#### IMPORTANT - The behaviour of this is different from the original `mongoose-audit-log` package and cannot be considered as a drop in replacement for it.

It is a mongoose plugin to manage an audit log of changes to a MongoDB database.

## Features

- Store changes to entities on persist (save, update, delete)
- Remember the user, that executed the change
- Log when the change has been done

## Storing the current user

In order to collect the information about who actually did a change to an entity, the user information is required.
This can be set on a per usage (1) or global (2) level:

1. Set the current user on an entity right before persisting:

```javascript
Order.findById(123)
  .then((order) => {
    order.__user = "me@test.de";
    order.amount = 1000;
  })
  .save();
```

2. Set it as an option when registering the plugin:

```javascript
const { plugin } = require("@sliit-foss/mongoose-audit");

SomeSchema.plugin(plugin, {
  getUser: () => "user details from wherever you wish to get it"
});
```

## Query history

Please find below an example express route, to request the history of a given type and id:

```javascript
const { plugin, Audit } = require("@sliit-foss/mongoose-audit");

router.get("/api/users/:id/history", (req, res, next) => {
  Audit.find({ entity_id: req.params.id, entity: "User" })
    .then((history) => res.json(history))
    .catch(next);
});
```

## All supported plugin options

- getUser - () => any

  - The user extractor function to use. This probably will be fetching the current user from a context or something similar.

- types - AuditType[]

  - The types of audit to record.

- include - string[]

  - The fields to consider for the audit. Cannot be used along with exclude.

- exclude - string[]

  - The fields to exclude from the audit. Cannot be used along with include.

- onAudit - (audit) => Promise<void>

  - Called before persisting the audit is saved. Use this to use your own audit model instead of the default one.

- background - boolean
  - By default audit logs are persisted asynchronously in the background. Change this to false if you want it to be synchronous.
