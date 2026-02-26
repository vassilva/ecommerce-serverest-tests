# Automacao-ServeRest

End-to-End (E2E) test automation project for the ServeRest application using Cypress with Gherkin (BDD).

The test suite validates critical user flows, keeps scenarios independent, and provides a fast regression (core) test executed in CI.

Technologies used include Cypress, Cucumber, Cypress Cucumber Preprocessor (@badeball), JavaScript, ESLint, Prettier and Node.js.

Project structure:
cypress/e2e contains the feature files, including the happy path regression test (4-shopping-list-searchmenu.feature). Step definitions and page objects are located under cypress/support. CI workflows are defined under .github/workflows.

The E2E strategy focuses on scenario independence, minimal duplication, and a single happy path regression covering the main user flow (search to shopping list).

To run the tests locally, install dependencies with npm install, execute all tests with npx cypress run, or run only the regression test using npm run cy:run:regression or npx cypress run --spec "cypress/e2e/4-shopping-list-searchmenu.feature".

The project uses GitHub Actions to run linting, unit tests, and the regression E2E test on every pull request and merge.
