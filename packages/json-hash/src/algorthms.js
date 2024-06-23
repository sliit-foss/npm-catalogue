export const algos = {
  "SHA-1": "sha1",
  "SHA-256": "sha256",
  "SHA-384": "sha384",
  "SHA-512": "sha512"
};

export const getNodeJSAlgoName = (algorithm) => {
  return algos[algorithm];
};

export const isAvailableAlgo = (algorithm) => {
  if (Object.prototype.hasOwnProperty.call(algos, algorithm)) {
    return true;
  }

  return false;
};
