export const functionCall = (fn) => new RegExp(`${fn}\\([^)]*\\);?`, "g");

export const functionCallFollowedByAnd = (fn) => new RegExp(`${fn}\\([^)]*\\);?(\\s*&&\\s*)?`, "g");

export const functionCalls = (fns) => new RegExp(`(${fns.join("|")})\\([^)]*\\);?`, "g");

export const compactString = (str) =>
  str
    .replace(/\/\/.*\n/g, "")
    .replace(/\s/g, "")
    .trim();

export const isStrongPassword = (str) => str.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/);
