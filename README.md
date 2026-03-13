# Automacao-ServeRest

End-to-End (E2E) test automation project for the ServeRest application using Cypress with Gherkin (BDD).

The test suite validates critical user flows, keeps scenarios independent, and provides a fast regression (core) test executed in CI.

Technologies used include Cypress, Cucumber, Cypress Cucumber Preprocessor (@badeball), JavaScript, ESLint, Prettier and Node.js.

Project structure:
The `cypress/e2e` directory is organized into specialized folders:
- `exploratory/`: Scenarios for exploratory testing.
- `smoke/`: Critical "smoke" tests for fast verification.
- `regression/`: Comprehensive regression suite (signup, search, shopping-list).
- `monitoring/`: Scenarios designed for environment monitoring.

Step definitions and page objects are located under `cypress/support`. CI workflows are defined under `.github/workflows`.

The E2E strategy focuses on scenario independence, minimal duplication, and categorized test execution.

To run the tests locally, install dependencies with `npm install`, execute all tests with `npx cypress run`, or run only the regression tests using `npm run cy:run:regression`.

The project uses GitHub Actions to run linting, unit tests, and the regression E2E test on every pull request and merge.
