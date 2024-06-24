import { computeHash, getNodeJSAlgoName } from "../src";

describe("json-hash-node-js", () => {
  beforeAll(() => {
    console.log("Running tests for json-hash on Node.js");
  });

  afterAll(() => {
    console.log("Ending tests for json-hash on Node.js");
  });

  const objectToHash = { name: "Siri", age: 30, country: "Sri Lanka" };

  //tests for getNodeJSAlgoName
  it("should-get-node-js-algo-name", () => {
    expect(getNodeJSAlgoName("SHA-1")).toBe("sha1");
    expect(getNodeJSAlgoName("SHA-256")).toBe("sha256");
    expect(getNodeJSAlgoName("SHA-384")).toBe("sha384");
    expect(getNodeJSAlgoName("SHA-512")).toBe("sha512");
  });

  it("should-not-throw-error-for-invalid-algo-name", () => {
    expect(getNodeJSAlgoName("NIKE")).toBe(undefined);
    expect(getNodeJSAlgoName("")).toBe(undefined);
  });

  // tests for computeHash begins

  it("should-throw-error-for-invalid-algo-name", async () => {
    expect.assertions(1);

    try {
      await computeHash(objectToHash, { algorithm: "Sock" });
    } catch (error) {
      expect(error).toMatchObject(new Error("Provided algorithm is not available"));
    }
  });

  // without sorting
  it("should-compute-hash-with-SHA-1", async () => {
    expect.assertions(1);
    const hash = await computeHash(objectToHash, { algorithm: "SHA-1" });
    expect(hash).toBe("9edcbfaaba0af491b8f73961416a250655bf483c");
  });

  it("should-compute-hash-with-SHA-256", async () => {
    expect.assertions(1);
    const hash = await computeHash(objectToHash, { algorithm: "SHA-256" });
    expect(hash).toBe("f17f5b4a7b8d4f7258cfedff4b78982f6d472d856d1fc1a9da3562d633ffff72");
  });

  it("should-compute-hash-with-SHA-384", async () => {
    expect.assertions(1);
    const hash = await computeHash(objectToHash, { algorithm: "SHA-384" });
    expect(hash).toBe(
      "8096ba11adb69941ad3ff5cbfc8c4b00d9b8d092de640e8abf8b54e1fcb7ddfdeaa3f5df0f03af50ca2648e76ed704b5"
    );
  });

  it("should-compute-hash-with-SHA-512", async () => {
    expect.assertions(1);
    const hash = await computeHash(objectToHash, { algorithm: "SHA-512" });
    expect(hash).toBe(
      "e6dc6e4edb2de44db04a6611ce3bb7127d9c5e93d8cc8c2092fca748db04d676ebf12dd06f6819eb6b7b20f957025e2da490918511adf34775e869e17619180e"
    );
  });

  // with sorting
  it("should-sort-and-compute-hash-with-SHA-1", async () => {
    expect.assertions(1);
    const hash = await computeHash(objectToHash, { algorithm: "SHA-1", sort: true });
    expect(hash).toBe("10e3e5df394451377f778d7402b62b5134dca39a");
  });

  it("should-sort-and-compute-hash-with-SHA-256", async () => {
    expect.assertions(1);
    const hash = await computeHash(objectToHash, { algorithm: "SHA-256", sort: true });
    expect(hash).toBe("37d0042f1f11c95c8563b530cc8769d4229ef48b5a31f763e2f841783216d6f2");
  });

  it("should-sort-and-compute-hash-with-SHA-384", async () => {
    expect.assertions(1);
    const hash = await computeHash(objectToHash, { algorithm: "SHA-384", sort: true });
    expect(hash).toBe(
      "f43ccfc81ea4e92fc11bed100e7cd82a665ad359faf91ff666e51a947cba8a7c5e3931ed6e7cebaef1a66b4b3c0c5d41"
    );
  });

  it("should-sort-and-compute-hash-with-SHA-512", async () => {
    expect.assertions(1);
    const hash = await computeHash(objectToHash, { algorithm: "SHA-512", sort: true });
    expect(hash).toBe(
      "f6a03a2a8cf61713c4c2fc3bae86736f6f8322d5271d1c2b3046268871f3d6ca434b1414b910990c9ba2f13cbe629f54646b7430880f1e60a4a899c94f45b6b1"
    );
  });
});
