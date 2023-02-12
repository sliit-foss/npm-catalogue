import run from "../utils/runner";

const runner = (name) => {
  run(`npm pkg get version`).then((initialVersion) => {
    initialVersion = initialVersion
      .replace(/\n/g, "")
      ?.replace(/"/g, "")
      ?.trim();
    run("git tag --sort=committerdate").then((tags) => {
      let latest = tags
        .split("\n")
        ?.reverse()[1]
        ?.trim()
        ?.replace("v", "")
        ?.replace(/_/g, "-");
      if (latest && /[0-9]{1,4}.[0-9]{1,2}.[0-9]{1,2}.rc/.test(latest)) {
        latest = latest?.split(".");
        latest = `${parseInt(latest[0])}.${parseInt(latest[1])}.${parseInt(
          latest[2]
        )}-${latest[3]}`;
      }
      if (latest && latest !== initialVersion) {
        run(`npm version ${latest} --no-git-tag-version`)
          .then(() => {
            const successMsg = `"CI: Bumped version of ${name} from ${initialVersion} to ${latest}"`;
            run("git add .").then(() => {
              run(`git commit -m ${successMsg}`).then(() => {
                console.log(successMsg.green);
              });
            });
          })
          .catch(() => {});
      } else {
        console.log(
          `No tag diff found, skipping version bump for ${name}`.yellow
        );
      }
    });
  });
};

export default runner;
