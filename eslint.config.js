const cypress = require("eslint-plugin-cypress/flat");
const prettier = require("eslint-plugin-prettier/recommended");

module.exports = [
  cypress.configs.recommended,
  prettier,
  {
    rules: {
      "cypress/no-assigning-return-values": "error",
      "cypress/no-unnecessary-waiting": "error",
      "cypress/assertion-before-screenshot": "warn",
      "cypress/no-force": "warn",
      "cypress/no-async-tests": "error",
      "cypress/no-pause": "error",
    },
  },
];
