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

const getCurrentVersion = async () =>
  (await run("npm version"))?.split(",")?.[0]?.split(":")?.[1]?.replace(/'/g, "")?.trim();

const getPackageVersion = async (name, disableAutoSync) => {
  if (!disableAutoSync) {
    try {
      const versions = await run(`npm view ${name} time`).then((res) =>
        res
          .replace(/{|}|,|'/g, "")
          .trim()
          .split("\n")
          .filter((v) => !v.includes("modified:") && !v.includes("created:"))
      );
      versions.sort(
        (v1, v2) => new Date(v1.trim().split(" ")[1]).getTime() - new Date(v2.trim().split(" ")[1]).getTime()
      );
      return versions.pop().split(":")?.[0].trim();
    } catch (e) {
      return getCurrentVersion();
    }
  } else {
    return getCurrentVersion();
  }
};

const runner = (
  name,
  noCommit,
  recursive = false,
  disableAutoSync,
  prerelease,
  prereleaseTag,
  prereleaseBranch,
  ignorePrefixes
) => {
  return run("git show --first-parent ./").then(async (diff) => {
    if (diff) {
      console.info(`Diff found, running versioning for ${name}`.green);
      const { commitMessage, commitPrefix, noBump } = await getCommitPrefix(recursive, ignorePrefixes);
      if (!noBump) {
        let versionUpdate;
        if (["feature!", "feat!", "f!", "fix!", "patch!"].includes(commitPrefix)) {
          versionUpdate = "major";
        } else if (["feature", "feat", "f"].includes(commitPrefix)) {
          versionUpdate = "minor";
        } else if (["fix", "patch"].includes(commitPrefix)) {
          versionUpdate = "patch";
        } else if (["prerelease", "prepatch", "preminor", "premajor"].includes(commitPrefix)) {
          versionUpdate = commitPrefix;
        } else {
          console.info(`No suitable commit prefix found in commit message, skipping version bump`.yellow);
          return;
        }
        if ((prerelease || prereleaseBranch) && ["major", "minor", "patch"].includes(versionUpdate)) {
          if (!prerelease) {
            const currentBranch = (await run("git rev-parse --abbrev-ref HEAD"))?.trim();
            prerelease = currentBranch === prereleaseBranch;
          }
          if (prerelease) {
            prerelease = false;
            const currentVersion = await getPackageVersion(name, disableAutoSync);
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
        await run(
          `npm --workspaces-update=false --no-git-tag-version version ${versionUpdate} ${
            prereleaseTag ? `--preid=${prereleaseTag}` : ""
          }`
        ).then(async () => {
          if (!noCommit) {
            const successMsg = `$'CI: ${name} - ${
              versionUpdate === "prerelease" ? versionUpdate : `${versionUpdate} release`
            }\\n\\n\\nskip-checks: true'`;
            await run("git add .").then(async () => {
              await run(`git commit -m ${successMsg} --no-verify --cleanup=verbatim`).then(() =>
                console.info(successMsg.green)
              );
            });
          }
        });
      } else {
        console.info(`No bump found in commit message, skipping versioning and editing commit message`.yellow);
        await run(`git commit --amend -m "${commitMessage.replace(/--no-bump/g, "")}"`).then(() =>
          console.info("Successfully edited commit message".green)
        );
      }
    } else {
      console.info(`No diff found, skipping versioning for ${name}`.yellow);
    }
  });
};

export default runner;
