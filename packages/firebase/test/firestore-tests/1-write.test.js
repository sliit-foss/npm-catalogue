import { initializeFirebase, resetFirestore } from "../testBase";
import { firestoreService } from "../../src";

let app;

beforeAll(() => {
  app = initializeFirebase();
  firestoreService.initialize(app);
});

afterAll((done) => {
  resetFirestore();
  done();
});

describe("Write", () => {
  const name = "Akalanka";
  const age = 19;
  test("add user to user collection", async () => {
    const res = await firestoreService.write({
      collection: "users",
      payload: { name, age },
    });
    expect(res.success).toBe(true);
  });
  test("add user to user collection with custom id", async () => {
    const res = await firestoreService.write({
      collection: "users",
      payload: { name, age },
      documentId: "customId",
    });
    expect(res.success).toBe(true);
  });
});
