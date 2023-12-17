/* eslint-disable no-console */

import run from "../utils/runner";

const runner = (name, noCommit) => {
  return run(`npm pkg get version`).then(async (initialVersion) => {
    initialVersion = initialVersion.replace(/\n/g, "")?.replace(/"/g, "")?.trim();
    await run("git tag --sort=committerdate").then(async (tags) => {
      let latest = tags.split("\n")?.reverse()[1]?.trim()?.replace("v", "")?.replace(/_/g, "-");
      if (latest && /[0-9]{1,4}.[0-9]{1,2}.[0-9]{1,2}.rc/.test(latest)) {
        latest = latest?.split(".");
        latest = `${parseInt(latest[0])}.${parseInt(latest[1])}.${parseInt(latest[2])}-${latest[3]}`;
      }
      if (latest && latest !== initialVersion) {
        await run(`npm version ${latest} --no-git-tag-version --workspaces-update=false`)
          .then(async () => {
            if (!noCommit) {
              const successMsg = `"CI: Bumped version of ${name} from ${initialVersion} to ${latest}"`;
              await run("git add .").then(async () => {
                await run(`git commit -m ${successMsg}`).then(() => {
                  console.info(successMsg.green);
                });
              });
            }
          })
          .catch(() => {});
      } else {
        console.info(`No tag diff found, skipping version bump for ${name}`.yellow);
      }
    });
  });
};

export default runner;
