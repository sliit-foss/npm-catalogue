/**
 * @description Runs a given CLI command and return's it's standard output(stdout)
 * @param command The command to be run
 * @returns Command output wrapped around a promise
 * @example
 * exec("npm --version")
 * .then((result) => {
 *   console.log(result);
 * })
 * .catch((error) => {
 *   console.log(error);
 * });
 */
export default function execute(command: string): Promise<string>;
