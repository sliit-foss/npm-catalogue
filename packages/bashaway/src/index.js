import { compactString, functionCallFollowedByAnd, functionCalls } from "./patterns";

export * from "./commands";
export * from "./git";
export * from "./patterns";
export * from "./restrict";
export * from "./scan";
export * from "./secrets";

export const cleanLogs = (code) =>
  compactString(
    code.replace(
      code.includes("console.log")
        ? functionCallFollowedByAnd("console.log")
        : functionCalls(["print", "System.out.println", "Console.WriteLine"]),
      ""
    )
  );
