import * as fs from "fs";
import * as crypto from "crypto";
import run from "../src/utils/runner";
import { resetPackageJson } from "./util";

jest.setTimeout(60000);

const initialDir = process.cwd();

beforeAll(async () => {
  if (fs.existsSync("./tmp")) fs.rmdirSync("./tmp", { recursive: true });
  fs.mkdirSync("./tmp");
  process.chdir("./tmp");
  await run("git init");
  await run("git config user.email 'infosliitfoss@gmail.com'");
  await run("git config user.name 'SLIIT FOSS'");
  resetPackageJson();
  process.env.AUTOMATIC_VERSIONING_IS_TEST = "true";
});

afterAll(() => {
  process.chdir(initialDir);
  fs.rmdirSync("./tmp", { recursive: true });
});

beforeEach(() => {
  jest.resetModules();
  fs.writeFileSync("./test.txt", crypto.randomBytes(16).toString("hex"));
});

afterEach(async () => {
  await run("git reset --hard");
  resetPackageJson();
});
