import run from "../utils/runner";

const runner = (name, noCommitEdit) => {
  run("git show ./").then((diff) => {
    if (diff) {
      console.log(`Diff found, running versioning for ${name}`.green);
      run("git log -1").then((res) => {
        const commitMessage = res.split("\n")[4].trim();
        if (!commitMessage.startsWith("Merge")) {
          if (!commitMessage.startsWith("Revert")) {
            if (!commitMessage.includes("--no-bump")) {
              const changeType = commitMessage.split(":")[0].trim();
              let versionUpdate;
              if (
                changeType.toLowerCase() === "feature!" ||
                changeType.toLowerCase() === "feat!" ||
                changeType.toLowerCase() === "f!"
              ) {
                versionUpdate = "major";
              } else if (
                changeType.toLowerCase() === "feature" ||
                changeType.toLowerCase() === "feat" ||
                changeType.toLowerCase() === "f"
              ) {
                versionUpdate = "minor";
              } else if (changeType.toLowerCase() === "fix") {
                versionUpdate = "patch";
              } else {
                console.log(
                  `No commit prefix found in commit message, skipping version bump`
                    .yellow
                );
                return;
              }
              run(`npm --no-git-tag-version version ${versionUpdate}`).then(
                () => {
                  const successMsg = `"CI: ${name} - ${versionUpdate} release"`;
                  run("git add .").then(() => {
                    run(`git commit -m ${successMsg}`).then(() => {
                      console.log(successMsg.green);
                    });
                  });
                }
              );
            } else {
              if (noCommitEdit) {
                console.log(
                  `No bump found in commit message, skipping version bump`
                    .yellow
                );
              } else {
                console.log(
                  `No bump found in commit message, skipping version bump and editing commit message`
                    .yellow
                );
                run(
                  `git commit --amend -m ${commitMessage.replace(
                    /--no-bump/g,
                    ""
                  )}`
                ).then(() => {
                  console.log("Successfully edited commit message".green);
                });
              }
            }
          } else {
            console.log(`Revert commit found, skipping version bump`.yellow);
          }
        } else {
          console.log(`Merge commit found, skipping version bump`.yellow);
        }
      });
    } else {
      console.log(`No diff found, skipping version bump for ${name}`.yellow);
    }
  });
};

export default runner;
