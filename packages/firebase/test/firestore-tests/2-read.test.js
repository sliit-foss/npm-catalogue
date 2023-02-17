import { initializeFirebase, fillFirestore, resetFirestore } from "../testBase";
import { firestoreService } from "../../src";

let app;

beforeAll(() => {
  app = initializeFirebase();
  firestoreService.initialize(app);
  fillFirestore();
});

afterAll((done) => {
  resetFirestore();
  done();
});

describe("read", () => {
  test("read users collection", async () => {
    const res = await firestoreService.read({ collection: "users" });
    expect(res.success).toBe(true);
  });
  test("read users collection with record limit", async () => {
    const res = await firestoreService.read({
      collection: "users",
      recordLimit: 1,
    });
    expect(res.success).toBe(true);
  });
  test("read users collection with filters", async () => {
    const res = await firestoreService.read({
      collection: "users",
      filters: [
        {
          key: "name",
          operator: "==",
          value: "Akalanka",
        },
        {
          key: "age",
          value: 19,
        },
      ],
    });
    expect(res.success).toBe(true);
  });
  test("read users collection with sort", async () => {
    let indexErrorOccurred = false;
    const res = await firestoreService.read({
      collection: "users",
      sorts: [
        {
          key: "name",
          direction: "desc",
        },
        {
          key: "age",
        },
      ],
      onSuccess: () => (indexErrorOccurred = false),
      onError: () => (indexErrorOccurred = true),
    });
    expect(res.success).toBe(false);
    expect(res.error?.message).toMatch(/The query requires an index/);
    expect(indexErrorOccurred).toBe(true);
  });
  test("read users collection with success handler", async () => {
    let succeeded = false;
    const res = await firestoreService.read({
      collection: "users",
      onSuccess: () => (succeeded = true),
      onError: () => (succeeded = false),
    });
    expect(res.success).toBe(true);
    expect(succeeded).toBe(true);
  });
});
