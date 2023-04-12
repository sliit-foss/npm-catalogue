const { exec } = require("child_process");

exec("npm run generate", (err, stdout, _stderr) => {
  if (err) {
    return console.error(err);
  }
  console.log(stdout);
});
