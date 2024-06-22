import { default as deepDiff } from "deep-diff";
import { dot } from "dot-object";
import { isEmpty, set } from "lodash";
import { default as Audit } from "./model";
import { AuditType, ChangeAuditType } from "./constants";
import { extractArray, filter, flattenObject } from "./utils";

const options = {
  getUser: () => undefined,
  types: [AuditType.Add, AuditType.Edit, AuditType.delete],
  background: true
};

const addAuditLogObject = (currentObject, original) => {
  const user = currentObject.__user || options.getUser?.() || "Unknown";
  delete currentObject.__user;
  let changes = deepDiff(
    JSON.parse(JSON.stringify(original ?? {})),
    JSON.parse(JSON.stringify(currentObject ?? {})),
    filter
  );
  if (changes?.length) {
    changes = changes.reduce((obj, change) => {
      const key = change.path.join(".");
      if (options.exclude?.includes(key)) return obj;
      if (options.include && !options.include?.includes(key)) return obj;
      if (change.kind === "A") {
        if (!obj[key] && change.path.length) {
          const data = {
            from: extractArray(original, change.path),
            to: extractArray(currentObject, change.path)
          };
          if (data.from.length && data.to.length) {
            data.type = AuditType.Edit;
          } else if (data.from.length) {
            data.type = AuditType.Delete;
          } else if (data.to.length) {
            data.type = AuditType.Add;
          }
          set(obj, key, data);
        }
      } else if (change.lhs && typeof change.lhs === "object") {
        Object.entries(dot(change.lhs)).forEach(([subKeys, value]) => {
          set(obj, `${key}.${subKeys}`, {
            from: value,
            type: ChangeAuditType[change.kind]
          });
        });
      } else if (change.rhs && typeof change.rhs === "object") {
        Object.entries(dot(change.rhs)).forEach(([subKeys, value]) => {
          set(obj, `${key}.${subKeys}`, {
            to: value,
            type: ChangeAuditType[change.kind]
          });
        });
      } else {
        set(obj, key, {
          from: change.lhs,
          to: change.rhs,
          type: ChangeAuditType[change.kind]
        });
      }
      return obj;
    }, {});
    if (isEmpty(changes)) return;
    const audit = {
      entity_id: currentObject._id,
      entity: currentObject.constructor.modelName,
      changes,
      user
    };
    if (options.onAudit) {
      return options.onAudit(audit);
    }
    return new Audit(audit).save();
  }
  return;
};

const addAuditLog = async (currentObject) => {
  const original = await currentObject.constructor.findOne({ _id: currentObject._id }).lean();
  const result = addAuditLogObject(currentObject, original);
  /* istanbul ignore else */
  if (!options.background) await result;
};

const addUpdate = async (query, multi) => {
  const updated = flattenObject(query._update);
  let counter = 0;
  if (query.clone) query = query.clone();
  const originalDocs = await query.find(query._conditions).lean(true);
  const promises = originalDocs.map((original) => {
    if (!multi && counter++) {
      return;
    }
    const currentObject = Object.assign({ __user: query.options.__user }, original, updated);
    currentObject.constructor.modelName = query.model.modelName;
    return addAuditLogObject(currentObject, original);
  });
  /* istanbul ignore else */
  if (!options.background) await Promise.allSettled(promises);
};

const addDelete = async (currentObject, options) => {
  const result = addAuditLogObject(
    {
      _id: currentObject._id,
      __user: options.__user
    },
    JSON.parse(JSON.stringify(currentObject))
  );
  /* istanbul ignore else */
  if (!options.background) await result;
};

const addFindAndDelete = async (query) => {
  if (query.clone) query = query.clone();
  const originalDocs = await query.find().lean(true);
  const promises = originalDocs.map((original) => {
    return addDelete(original, query.options);
  });
  /* istanbul ignore else */
  if (!options.background) await Promise.allSettled(promises);
};

const plugin = (schema, opts = {}) => {
  Object.assign(options, opts);
  if (options.types.includes(AuditType.Add)) {
    schema.pre("save", function () {
      return addAuditLog(this);
    });
  }
  if (options.types.includes(AuditType.Edit)) {
    schema.pre("update", function () {
      return addUpdate(this, !!this.options.multi);
    });
    schema.pre("updateOne", function () {
      return addUpdate(this, false);
    });
    schema.pre("findOneAndUpdate", function () {
      return addUpdate(this, false);
    });
    schema.pre("updateMany", function () {
      return addUpdate(this, true);
    });
    schema.pre("replaceOne", function () {
      return addUpdate(this, false);
    });
  }
  if (options.types.includes(AuditType.delete)) {
    schema.pre("remove", function (_, options) {
      return addDelete(this, options);
    });
    schema.pre("findOneAndDelete", function () {
      return addFindAndDelete(this);
    });
    schema.pre("findOneAndRemove", function () {
      return addFindAndDelete(this);
    });
  }
};

export default plugin;
