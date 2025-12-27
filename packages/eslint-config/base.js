module.exports = {
  extends: ["eslint:recommended", "prettier"],
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-console": "warn",
  },
};
