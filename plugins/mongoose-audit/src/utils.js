export const filter = (path, key) => path.length === 0 && ~["_id", "__v", "createdAt", "updatedAt"].indexOf(key);

export const isEmpty = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && Object.keys(value).length === 0) ||
  (typeof value === "string" && value.trim().length === 0);

export const extractArray = (data, path) => {
  if (path.length === 1) {
    return data[path[0]];
  }
  const parts = [].concat(path);
  const last = parts.pop();
  const value = parts.reduce((current, part) => {
    return current ? current[part] : undefined;
  }, data);
  return value ? value[last] : undefined;
};

export const flattenObject = (obj) =>
  Object.keys(obj).reduce((data, key) => {
    if (key.indexOf("$") === 0) {
      Object.assign(data, obj[key]);
    } else {
      data[key] = obj[key];
    }
    return data;
  }, {});
