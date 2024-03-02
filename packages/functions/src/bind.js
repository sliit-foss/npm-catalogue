export const bindKey = (object, key, ...partials) => {
  const temp = { [key]: object[key].bind(object, ...partials) };
  return temp[key];
};

export default {
  bindKey
};
