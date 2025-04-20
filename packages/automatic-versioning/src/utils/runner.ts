import { getExecOutput } from "@actions/exec";

const executor = async (command: string) => {
  const output = await getExecOutput(command, []);
  return output.stdout.trim();
};

export default executor;
