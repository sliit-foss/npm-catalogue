/* eslint-disable no-console */

import run from "../utils/runner";

const getCommitPrefix = async (recursive, ignorePrefixes, n = 1) => {
  const log = await run(`git show -s --format='%s' -${n} ./`);
  const commits = log?.split("\n") || [];
  commits.splice(-1);
  const commitMessage = commits.pop()?.trim()?.slice(1, -1);
  let commitPrefix = commitMessage?.includes(":") ? commitMessage?.split(":")?.[0]?.trim()?.toLowerCase() : "";
  if (commitPrefix?.includes("https")) commitPrefix = "";
  if (commitPrefix?.includes("(")) {
    commitPrefix = commitPrefix.split("(")?.[0]?.trim();
  }
  const noBump = commitMessage?.includes("--no-bump");
  if ((commitPrefix && !ignorePrefixes.includes(commitPrefix)) || !recursive) {
    return { commitPrefix, commitMessage, noBump };
  }
  return getCommitPrefix(recursive, ignorePrefixes, n + 1);
};

const runner = (name, noCommit, noCommitEdit, recursive = false, prereleaseTag, prereleaseBranch, ignorePrefixes) => {
  run("git show --first-parent ./").then(async (diff) => {
    if (diff) {
      console.log(`Diff found, running versioning for ${name}`.green);
      const { commitMessage, commitPrefix, noBump } = await getCommitPrefix(recursive, ignorePrefixes);
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
        if (prereleaseBranch && ["major", "minor", "patch"].includes(versionUpdate)) {
          const currentBranch = (await run("git rev-parse --abbrev-ref HEAD"))?.trim();
          if (currentBranch === prereleaseBranch) {
            let prerelease = false;
            const currentVersion = (
              await run(`npm view ${name} time`)
                .then((res) => res?.split(",")?.pop()?.split(":")?.[0])
                .catch(async () => (await run("npm version"))?.split(",")?.[0]?.split(":")?.[1])
            )
              ?.replace(/[{}'']/g, "")
              ?.trim();
            if (currentVersion?.includes(prereleaseTag)) {
              await run(
                `npm --workspaces-update=false --no-git-tag-version version --allow-same-version ${currentVersion}`
              );
              const [, minor, patch] = currentVersion?.split("-")?.[0]?.split(".") ?? [];
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
              run(`git commit -m ${successMsg} --no-verify`).then(() => {
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
