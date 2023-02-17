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

describe("delete", () => {
  test("empty user collection", async () => {
    const res = await firestoreService.remove({ collection: "users" });
    expect(res.success).toBe(true);
  });
});
