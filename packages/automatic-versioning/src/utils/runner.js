const exec = require('@actions/exec');

const executor = (command) => {
  return new Promise((resolve, reject) => {
    let output = "";
    let err = "";
    exec
      .exec(command, [], {
        listeners: {
          stdout: (data) => {
            output += data.toString();
          },
          stderr: (data) => {
            err += data.toString();
          },
        },
      })
      .then(() => {
        return resolve(output);
      })
      .catch((error) => {
        if (error) console.log(error.red);
        return reject(error);
      });
  });
};

export default executor;