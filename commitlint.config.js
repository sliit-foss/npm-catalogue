module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "FEAT!",
        "FEAT",
        "FIX",
        "Feat!",
        "Feat",
        "Fix",
        "Patch",
        "Chore",
        "Build",
        "Refactor",
        "Revert",
        "CI",
        "Test",
        "Docs",
        "WIP",
      ],
    ],
    "type-case": [0],
    "subject-case": [0],
  },
};
