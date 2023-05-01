import context from "express-http-context";

export const cached = (key, fn) => {
  let res = context.get(key);
  if (!res) {
    res = fn();
    if (res instanceof Promise) {
      return res.then((res) => {
        context.set(key, res);
        return res;
      });
    }
    context.set(key, res);
  }
  return res;
};

export default {
  cached,
};
