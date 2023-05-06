/* eslint-disable no-console */

import run from "../utils/runner";

const getCommitPrefix = async (recursive, n = 1) => {
  const log = await run(`git show --first-parent -s --format='%s' -${n} ./`);
  const commits = log?.split("\n") || [];
  commits.splice(-1);
  const latestCommitInfo = commits.pop()?.trim();
  const commitMessage = latestCommitInfo?.slice(1, -1);
  const commitPrefix = commitMessage?.includes(":") ? commitMessage?.split(":")?.[0]?.trim()?.toLowerCase() : "";
  const noBump = commitMessage?.includes("--no-bump");
  if (commitPrefix || !recursive) {
    return { commitPrefix, commitMessage, noBump };
  }
  return getCommitPrefix(recursive, n + 1);
};

const runner = (name, noCommit, noCommitEdit, recursive = false, prereleaseTag, prereleaseBranch) => {
  run("git show --first-parent ./").then(async (diff) => {
    if (diff) {
      console.log(`Diff found, running versioning for ${name}`.green);
      const { commitMessage, commitPrefix, noBump } = await getCommitPrefix(recursive);
      if (!noBump) {
        let versionUpdate;
        if (["feature!", "feat!", "f!"].includes(commitPrefix)) {
          versionUpdate = "major";
        } else if (["feature", "feat", "f"].includes(commitPrefix)) {
          versionUpdate = "minor";
        } else if (["fix", "patch"].includes(commitPrefix)) {
          versionUpdate = "patch";
        } else if (["prerelease", "prepatch", "preminor", "premajor"].includes(commitPrefix)) {
          versionUpdate = commitPrefix;
        } else {
          console.log(`No suitable commit prefix found in commit message, skipping version bump`.yellow);
          return;
        }
        console.log(1122, prereleaseBranch, versionUpdate);
        if (prereleaseBranch && ["major", "minor", "patch"].includes(versionUpdate)) {
          const currentBranch = (await run("git rev-parse --abbrev-ref HEAD"))?.trim();
          console.log(1234, currentBranch);
          if (currentBranch === prereleaseBranch) {
            let prerelease = false;
            const currentVersion = (await run("npm version"))
              ?.replace("{", "")
              ?.split(",")?.[0]
              ?.split(":")?.[1]
              ?.trim();
            if (currentVersion.includes(prereleaseTag)) {
              const [, minor, patch] = process.env.npm_package_version?.split("-")?.[0]?.split(".") ?? [];
              if (
                versionUpdate === "patch" ||
                (versionUpdate === "minor" && patch === "0") ||
                (versionUpdate === "major" && minor === "0")
              ) {
                prerelease = true;
              }
            }
            versionUpdate = prerelease ? "prerelease" : `pre${versionUpdate}`;
          }
        }
        run(
          `npm --workspaces-update=false --no-git-tag-version version ${versionUpdate} ${
            prereleaseTag ? `--preid=${prereleaseTag}` : ""
          }`
        ).then(() => {
          if (!noCommit) {
            const successMsg = `"CI: ${name} - ${
              versionUpdate === "prerelease" ? versionUpdate : `${versionUpdate} release`
            }"`;
            run("git add .").then(() => {
              run(`git commit -m ${successMsg}`).then(() => {
                console.log(successMsg.green);
              });
            });
          }
        });
      } else {
        if (noCommitEdit) {
          console.log(`No bump found in commit message, skipping version bump`.yellow);
        } else {
          console.log(`No bump found in commit message, skipping version bump and editing commit message`.yellow);
          run(`git commit --amend -m ${commitMessage.replace(/--no-bump/g, "")}`).then(() => {
            console.log("Successfully edited commit message".green);
          });
        }
      }
    } else {
      console.log(`No diff found, skipping version bump for ${name}`.yellow);
    }
  });
};

export default runner;
