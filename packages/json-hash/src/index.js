export const getNodeJSAlgoName = (algorithm) => {
  const algos = {
    "SHA-1": "sha1",
    "SHA-256": "sha256",
    "SHA-384": "sha384",
    "SHA-512": "sha512"
  };

  return algos[algorithm];
};

export const computeHash = async (obj, { algorithm = "SHA-1", sort = false }) => {
  const nodeJSAlgoName = getNodeJSAlgoName(algorithm);

  if (nodeJSAlgoName === undefined) {
    throw new Error("Provided algorithm is not available");
  }

  if (typeof obj !== "string") {
    if (sort) {
      const { default: stringify } = await import("json-stable-stringify");
      obj = stringify(obj);
    } else {
      obj = JSON.stringify(obj);
    }
  }

  // For browser
  // eslint-disable-next-line no-undef
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const msgUint8 = new TextEncoder().encode(obj); // encode as (utf-8) Uint8Array

    // eslint-disable-next-line no-undef
    const hashBuffer = await window.crypto.subtle.digest(algorithm, msgUint8); // hash data
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join(""); // convert bytes to hex string
    return hashHex;
  }

  // For Node.js
  if (typeof global !== "undefined" && global.crypto) {
    const { createHash } = await import("crypto");
    const hash = createHash(nodeJSAlgoName).update(obj).digest("hex");
    return hash;
  }
};
