import { initializeFirebase } from "../testBase";
import { databaseService } from "../../src";

let app;

beforeAll(() => {
  app = initializeFirebase();
  databaseService.initialize(app);
});

afterAll((done) => {
  done();
});

describe("read", () => {
  test("read root path", async () => {
    const res = await databaseService.read({ path: "/" });
    expect(res.success).toBe(false);
  });
});
