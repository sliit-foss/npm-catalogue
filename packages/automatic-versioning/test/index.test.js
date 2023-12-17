import * as fs from "fs";
import run from "../src/utils/runner";
import {
  commit,
  getLastCommitMessage,
  getPackageVersion,
  executeVersionScript,
  setPackageVersion,
  getCurrentBranch
} from "./util";

import "./setup";

describe("default", () => {
  it("bump patch version", async () => {
    await commit("Fix: test commit");
    await executeVersionScript();
    expect(getPackageVersion()).toBe("0.0.1");
    expect(await getLastCommitMessage()).toBe("CI: @sliit-foss/automatic-versioning - patch release");
  });
  it("bump minor version", async () => {
    await commit("Feat: test commit");
    await executeVersionScript();
    expect(getPackageVersion()).toBe("0.1.0");
    expect(await getLastCommitMessage()).toBe("CI: @sliit-foss/automatic-versioning - minor release");
  });
  it("bump major version", async () => {
    await commit("Feat!: test commit");
    await executeVersionScript();
    expect(getPackageVersion()).toBe("1.0.0");
    expect(await getLastCommitMessage()).toBe("CI: @sliit-foss/automatic-versioning - major release");
  });
  it("bump patch version (with scope)", async () => {
    await commit("Fix(automatic-versioning): test commit");
    await executeVersionScript();
    expect(getPackageVersion()).toBe("0.0.1");
    expect(await getLastCommitMessage()).toBe("CI: @sliit-foss/automatic-versioning - patch release");
  });
  it("should not bump any version", async () => {
    await commit("Chore: something which doesn't affect the version");
    await executeVersionScript();
    expect(getPackageVersion()).toBe("0.0.0");
  });
  it("no diff", async () => {
    await commit("Feat!: test commit");
    await commit("Patch: empty commit", true);
    await executeVersionScript();
    expect(getPackageVersion()).toBe("0.0.0");
  });
  it("recursive", async () => {
    await commit("Feat!: test commit");
    fs.writeFileSync("./test.txt", "something which doesn't affect the version");
    await commit("Merge branch 'main' of https://github.com/sliit-foss/npm-catalogue");
    await executeVersionScript("--recursive");
    expect(getPackageVersion()).toBe("1.0.0");
  });
  it("ignore prefixes", async () => {
    await commit("Feat: test commit");
    fs.writeFileSync("./test.txt", "some automated commit");
    await commit("CI: automated commit");
    await executeVersionScript("--ignore-prefixes=ci --recursive");
    expect(getPackageVersion()).toBe("0.1.0");
  });
  it("no bump in commit", async () => {
    await commit("Fix: test commit --no-bump");
    await executeVersionScript();
    expect(getPackageVersion()).toBe("0.0.0");
    expect(await getLastCommitMessage()).toBe("Fix: test commit");
  });
  it("no commit", async () => {
    const commitMsg = "Fix: testing versioning without commit";
    await commit(commitMsg);
    await executeVersionScript("--skip-commit");
    expect(getPackageVersion()).toBe("0.0.1");
    expect(await getLastCommitMessage()).toBe(commitMsg);
  });
  describe("prerelease", () => {
    it("direct prefix", async () => {
      await commit("Prerelease: test commit");
      await executeVersionScript();
      expect(getPackageVersion()).toBe("0.0.1-0");
    });
    it("with custom tag", async () => {
      await commit("Prerelease: test commit");
      await executeVersionScript("--prerelease-tag=blizzard");
      expect(getPackageVersion()).toBe("0.0.1-blizzard.0");
    });
    describe("with prerelease branch", () => {
      const executePreleaseVersionScript = async () =>
        executeVersionScript(`--prerelease-branch=${await getCurrentBranch()} --prerelease-tag=blizzard`);
      it("single prerelease", async () => {
        await commit("Feat: test commit");
        await executePreleaseVersionScript();
        expect(getPackageVersion()).toBe("0.1.0-blizzard.0");
      });
      it("multiple prereleases", async () => {
        await commit("Feat: test commit");
        await executePreleaseVersionScript();
        fs.writeFileSync("./test.txt", "some fix");
        await commit("Feat: test commit");
        await executePreleaseVersionScript();
        expect(getPackageVersion()).toBe("0.2.0-blizzard.0");
      });
      it("multiple prereleases with patch", async () => {
        await commit("Feat: test commit");
        await executePreleaseVersionScript();
        fs.writeFileSync("./test.txt", "some fix");
        await commit("Fix: test commit");
        await executePreleaseVersionScript();
        expect(getPackageVersion()).toBe("0.1.1-blizzard.0");
      });
      it("promote prerelease", async () => {
        await commit("Feat: test commit");
        setPackageVersion("0.1.0-blizzard.5");
        await executeVersionScript("--prerelease-tag=blizzard");
        expect(getPackageVersion()).toBe("0.1.0");
      });
    });
  });
});

describe("tag-based", () => {
  it("default", async () => {
    await commit("Fix: test tag");
    await run("git tag v0.0.2-alpha.0");
    await executeVersionScript("--tag-based");
    expect(getPackageVersion()).toBe("0.0.2-alpha.0");
    expect(await getLastCommitMessage()).toBe(
      "CI: Bumped version of @sliit-foss/automatic-versioning from 0.0.0 to 0.0.2-alpha.0"
    );
  });
  it("no commit", async () => {
    const commitMsg = "Fix: test tag without commit";
    await commit(commitMsg);
    await run("git tag v1.2.3-beta.1");
    await executeVersionScript("--tag-based --skip-commit");
    expect(getPackageVersion()).toBe("1.2.3-beta.1");
    expect(await getLastCommitMessage()).toBe(commitMsg);
  });
  it("rc tag", async () => {
    await commit("Fix: test tag rc");
    await run("git tag v2022.07.18.rc6");
    await executeVersionScript("--tag-based");
    expect(getPackageVersion()).toBe("2022.7.18-rc6");
  });
  it("no tag diff", async () => {
    setPackageVersion("2023.7.18-rc6");
    await run("git tag v2023.07.18.rc6");
    await executeVersionScript("--tag-based");
    expect(getPackageVersion()).toBe("2023.7.18-rc6");
  });
});
