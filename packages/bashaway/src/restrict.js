export const restrictJavascript = (script) => {
  expect(script).not.toContain("node --eval");
  expect(script).not.toContain("node -e");
  expect(script).not.toContain("deno run");
  expect(script).not.toContain("bun");
};

export const restrictPython = (script) => {
  expect(script).not.toContain("python");
  expect(script).not.toContain("python3");
  expect(script).not.toContain("pip install");
};
