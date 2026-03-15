# Automacao-ServeRest

End-to-End (E2E) test automation project for the ServeRest application using Cypress with Gherkin (BDD).

The test suite validates critical user flows, keeps scenarios independent, and provides a fast regression (core) test executed in CI.

Technologies used include Cypress, Cucumber, Cypress Cucumber Preprocessor (@badeball), JavaScript, ESLint, Prettier and Node.js.

Project structure:
The `cypress/e2e` directory is organized as follows:

- `features/`: Contains all Gherkin `.feature` files (categorized by @smoke and @regressivo tags).
- `step_definitions/`: Contains reusable JavaScript files mapping Gherkin steps to actions.

Page objects are located under `cypress/support/pages`. CI workflows are defined under `.github/workflows`.

The `jmeter/` directory contains non-functional performance tests:
- `tests/`: Contains JMX files for performance tests (e.g., `load_products.jmx`).
- `results/`: Contains execution results (e.g., `load-results.jtl`).
- `reports/`: Folder for generated HTML performance reports.

The E2E strategy focuses on scenario independence, minimal duplication, and categorized test execution.

To run the tests locally, install dependencies with `npm install`, execute all tests with `npx cypress run`, or run categorized tests:

- `npm run cy:run:smoke`: Runs critical tests tagged with @smoke.
- `npm run cy:run:regression`: Runs full regression suite tagged with @regressivo.

The project uses GitHub Actions to run linting, unit tests, and the regression E2E test on every pull request and merge.
