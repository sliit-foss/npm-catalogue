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

describe("Update", () => {
  const filters = [
    {
      key: "name",
      operator: "==",
      value: "Akalanka",
    },
  ];
  // Read and check value before update
  test("pre-read", async () => {
    const res = await firestoreService.read({
      collection: "users",
      filters: filters,
    });
    expect(res.success).toBe(true);
    expect(res.data.docs[0].data().age).toBe(19);
  });
  // Update record
  test("update user record", async () => {
    const res = await firestoreService.update({
      collection: "users",
      payload: { age: 20 },
      filters: filters,
    });
    expect(res.success).toBe(true);
  });
  test("update user record - with custom success handler", async () => {
    let ids = [];
    const res = await firestoreService.update({
      collection: "users",
      payload: { age: 20 },
      filters: filters,
      onSuccess: (result) => {
        ids = [...result];
      },
    });
    expect(res.success).toBe(true);
    expect(ids.length).toBeGreaterThan(0);
  });
  // Read and check value after update
  test("post-read", async () => {
    const res = await firestoreService.read({
      collection: "users",
      filters: filters,
    });
    expect(res.success).toBe(true);
    expect(res.data.docs[0].data().age).toBe(20);
  });
});
