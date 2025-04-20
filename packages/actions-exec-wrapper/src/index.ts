import { getExecOutput, ExecOptions } from "@actions/exec";

/**
 * @description Runs a given CLI command and return's it's standard output(stdout)
 * @param command The command to be run
 * @returns Command output wrapped within a promise
 * @example
 * exec("npm --version")
 * .then((result) => {
 *   console.log(result);
 * })
 * .catch((error) => {
 *   console.log(error);
 * });
 */
export const execute = async (command: string, args: string[] = [], opts?: ExecOptions) => {
  const output = await getExecOutput(command, args, opts);
  return output.stdout.trim();
};

export default execute;
