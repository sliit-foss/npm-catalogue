module.exports = {
  extends: ["eslint:recommended"],
  plugins: ["import"],
  env: {
    browser: false,
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    requireConfigFile: false
  },
  rules: {
    "arrow-parens": ["error", "always"],
    "arrow-spacing": "error",
    "default-case": "error",
    "newline-per-chained-call": ["error", { ignoreChainWithDepth: 5 }],
    "no-confusing-arrow": "error",
    "no-console": "warn",
    "no-duplicate-imports": [
      "error",
      {
        includeExports: true
      }
    ],
    "no-else-return": "error",
    "no-eq-null": "error",
    "no-extra-bind": "error",
    "no-lone-blocks": "error",
    "no-multiple-empty-lines": ["error", { max: 1 }],
    "no-nested-ternary": ["error"],
    "no-return-assign": "error",
    "no-return-await": "error",
    "no-self-compare": "error",
    "no-template-curly-in-string": "warn",
    "no-useless-concat": "error",
    "no-useless-constructor": "error",
    "no-useless-escape": "error",
    "no-var": "error",
    "prefer-const": "error",
    "prefer-promise-reject-errors": "error",
    "prefer-template": "error",
    "require-await": "error",
    "spaced-comment": "error",
    "symbol-description": "error",
    "object-curly-spacing": ["error", "always"],
    "import/newline-after-import": [
      "error",
      {
        count: 1
      }
    ],
    "import/order": 2,
    "import/first": 2
  }
};
