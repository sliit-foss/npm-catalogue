import { default as deepDiff } from "deep-diff";
import { default as Audit } from "./model";
import { AuditType } from "./constants";
import { extractArray, filter, flattenObject, isEmpty } from "./utils";

const options = {
  getUser: () => undefined,
  types: [AuditType.Add, AuditType.Edit, AuditType.delete],
  exclude: [],
  onAudit: undefined
};

const addAuditLogObject = (currentObject, original) => {
  const user = currentObject.__user || options.getUser() || "Unknown User";
  delete currentObject.__user;
  let changes = deepDiff(original._doc || original, currentObject._doc || currentObject, filter);
  if (changes && changes.length) {
    changes = changes.reduce((obj, change) => {
      const key = change.path.join(".");
      if (options.exclude.includes(key)) {
        return obj;
      }
      if (change.kind === "D") {
        handleAudits(change.lhs, "from", AuditType.delete, obj, key);
      } else if (change.kind === "N") {
        handleAudits(change.rhs, "to", AuditType.Add, obj, key);
      } else if (change.kind === "A") {
        if (!obj[key] && change.path.length) {
          const data = {
            from: extractArray(original, change.path),
            to: extractArray(currentObject, change.path)
          };
          if (data.from.length && data.to.length) {
            data.type = AuditType.Edit;
          } else if (data.from.length) {
            data.type = AuditType.delete;
          } else if (data.to.length) {
            data.type = AuditType.Add;
          }
          obj[key] = data;
        }
      } else {
        obj[key] = {
          from: change.lhs,
          to: change.rhs,
          type: AuditType.Edit
        };
      }
      return obj;
    }, {});
    if (isEmpty(changes)) return Promise.resolve();
    const audit = {
      entity_id: currentObject._id,
      entity: currentObject.constructor.modelName,
      collection: currentObject.constructor.collection.collectionName,
      changes,
      user
    };
    if (options.onAudit) {
      return options.onAudit(audit);
    }
    return new Audit(audit).save();
  }
  return Promise.resolve();
};

const handleAudits = (changes, target, type, obj, key) => {
  if (typeof changes === "object") {
    if (Object.keys(changes).filter((key) => key === "_id" || key === "id").length) {
      // entity found
      obj[key] = { [target]: changes, type };
    } else {
      // sibling/sub-object
      Object.entries(changes).forEach(([sub, value]) => {
        if (!isEmpty(value)) {
          obj[`${key}.${sub}`] = { [target]: value, type };
        }
      });
    }
  } else {
    // primitive value
    obj[key] = { [target]: changes, type };
  }
};

const addAuditLog = (currentObject, next) => {
  currentObject.constructor
    .findOne({ _id: currentObject._id })
    .then((original) => addAuditLogObject(currentObject, original))
    .then(next)
    .catch(next);
};

const addUpdate = (query, next, multi) => {
  const updated = flattenObject(query._update);
  let counter = 0;
  return query
    .find(query._conditions)
    .lean(true)
    .cursor()
    .eachAsync((fromDb) => {
      if (!multi && counter++) {
        // handle 'multi: false'
        return next();
      }
      const orig = Object.assign({ __user: query.options.__user }, fromDb, updated);
      orig.constructor.modelName = query._collection.collectionName;
      return addAuditLogObject(orig, fromDb);
    })
    .then(next)
    .catch(next);
};

const addDelete = (currentObject, options, next) => {
  const orig = Object.assign({}, currentObject._doc || currentObject);
  orig.constructor.modelName = currentObject.constructor.modelName;
  return addAuditLogObject(
    {
      _id: currentObject._id,
      __user: options.__user
    },
    orig
  )
    .then(next)
    .catch(next);
};

const addFindAndDelete = (query, next) => {
  query
    .find()
    .lean(true)
    .cursor()
    .eachAsync((fromDb) => addDelete(fromDb, query.options, next))
    .then(next)
    .catch(next);
};

const plugin = (schema, opts = {}) => {
  Object.assign(options, opts);
  if (options.types.includes(AuditType.Add)) {
    schema.pre("save", function (next) {
      if (this.isNew) {
        return next();
      }
      addAuditLog(this, next);
    });
  }
  if (options.types.includes(AuditType.Edit)) {
    schema.pre("update", function (next) {
      addUpdate(this, next, !!this.options.multi);
    });
    schema.pre("updateOne", function (next) {
      addUpdate(this, next, false);
    });
    schema.pre("findOneAndUpdate", function (next) {
      addUpdate(this, next, false);
    });
    schema.pre("updateMany", function (next) {
      addUpdate(this, next, true);
    });
    schema.pre("replaceOne", function (next) {
      addUpdate(this, next, false);
    });
  }
  if (options.types.includes(AuditType.delete)) {
    schema.pre("remove", function (next, options) {
      addDelete(this, options, next);
    });
    schema.pre("findOneAndDelete", function (next) {
      addFindAndDelete(this, next);
    });
    schema.pre("findOneAndRemove", function (next) {
      addFindAndDelete(this, next);
    });
  }
};

export default plugin;
