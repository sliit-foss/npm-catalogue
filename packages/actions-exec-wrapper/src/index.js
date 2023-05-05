const exec = require("@actions/exec");

const execute = (command) => {
  return new Promise((resolve, reject) => {
    let output = "";
    exec
      .exec(command, [], {
        listeners: {
          stdout: (data) => {
            output += data.toString();
          }
        }
      })
      .then(() => {
        return resolve(output);
      })
      .catch((error) => {
        return reject(error);
      });
  });
};

export default execute;
