import run from "../utils/runner";

const getCommitPrefix = async (recursive, n = 1) => {
  const log = await run(`git show -s --format='%s' -${n}`);
  const commits = log?.split("\n") || [];
  commits.splice(-1);
  const commitMessage = commits.pop()?.trim()
.slice(1, -1);
  const commitPrefix = commitMessage?.includes(":")
    ? commitMessage?.split(":")?.[0]?.trim()?.toLowerCase()
    : "";
  const noBump = commitMessage?.includes("--no-bump");
  if (commitPrefix || !recursive) {
    return { commitPrefix, commitMessage, noBump };
  }
  return getCommitPrefix(recursive, n + 1);
};

const runner = (name, noCommit, noCommitEdit, recursive = false) => {
  run("git show --first-parent ./").then(async (diff) => {
    if (diff) {
      console.log(`Diff found, running versioning for ${name}`.green);
      const { commitMessage, commitPrefix, noBump } = await getCommitPrefix(
        recursive
      );
      if (!noBump) {
        let versionUpdate;
        if (
          commitPrefix === "feature!" ||
          commitPrefix === "feat!" ||
          commitPrefix === "f!"
        ) {
          versionUpdate = "major";
        } else if (
          commitPrefix === "feature" ||
          commitPrefix === "feat" ||
          commitPrefix === "f"
        ) {
          versionUpdate = "minor";
        } else if (commitPrefix === "fix" || commitPrefix === "patch") {
          versionUpdate = "patch";
        } else {
          console.log(
            `No suitable commit prefix found in commit message, skipping version bump`
              .yellow
          );
          return;
        }
        run(
          `npm --workspaces-update=false --no-git-tag-version version ${versionUpdate}`
        ).then(() => {
          if (!noCommit) {
            const successMsg = `"CI: ${name} - ${versionUpdate} release"`;
            run("git add .").then(() => {
              run(`git commit -m ${successMsg}`).then(() => {
                console.log(successMsg.green);
              });
            });
          }
        });
      } else {
        if (noCommitEdit) {
          console.log(
            `No bump found in commit message, skipping version bump`.yellow
          );
        } else {
          console.log(
            `No bump found in commit message, skipping version bump and editing commit message`
              .yellow
          );
          run(
            `git commit --amend -m ${commitMessage.replace(/--no-bump/g, "")}`
          ).then(() => {
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
