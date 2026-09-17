# Automacao-ServeRest

End-to-End (E2E) test automation project for the ServeRest application using Cypress with Gherkin (BDD).

The test suite validates critical user flows, keeps scenarios independent, and provides a fast regression (core) test executed in CI.

Technologies used include Cypress, Cucumber, Cypress Cucumber Preprocessor (@badeball), JavaScript, ESLint, Prettier and Node.js.

Project structure:
The `cypress/e2e` directory is organized as follows:

- `features/`: Contains all Gherkin `.feature` files (categorized by @smoke, @regression, @negative and @api tags).
- `step_definitions/`: Contains reusable JavaScript files mapping Gherkin steps to actions.

Page objects are located under `cypress/support/pages`. CI workflows are defined under `.github/workflows`.

The `jmeter/` directory contains non-functional performance tests:

- `tests/`: Contains JMX files for performance tests (e.g., `load_products.jmx`).
- `results/`: Contains execution results (e.g., `load-results.jtl`).
- `reports/`: Folder for generated HTML performance reports.

The E2E strategy focuses on scenario independence, minimal duplication, and categorized test execution.

To run the tests locally, install dependencies with `npm install`, execute all tests with `npx cypress run`, or run categorized tests:

- `npm run cy:run:smoke`: Runs critical tests tagged with @smoke.
- `npm run cy:run:regression`: Runs full regression suite tagged with @regression.

The project uses GitHub Actions to run linting, formatting checks, and the smoke test suite on every push and pull request, plus a separate job for the full regression E2E suite.

## Test Tag Strategy

This project uses four Cucumber tags to select different execution suites. Tags are **not mutually exclusive** — a scenario can belong to more than one suite at the same time. For example, a negative scenario (`@negative`) may also be part of the regression suite (`@regression`), and an API scenario (`@api`) may also represent meaningful regression coverage. The tags exist to support different execution strategies, not to split all scenarios into four independent, non-overlapping groups.

- **`@smoke`** — Critical business flows used for fast confidence that the main application functionality (login, product search, registration) is operational.
- **`@regression`** — Scenarios selected to detect meaningful functional regressions across the application. In `products.feature` and `users.feature`, every automated scenario is currently considered regression-worthy. In `login.feature`, `@regression` is a deliberately narrower subset that excludes the single-field-empty negative variants and the API contract scenario, which remain covered under `@negative`/`@api` but are not considered critical enough to gate every regression run.
- **`@negative`** — Scenarios validating invalid input, validation rules, error handling, or unsuccessful business behavior, whether driven through the UI or directly through the API.
- **`@api`** — Scenarios whose primary purpose is direct API/contract validation (status codes, headers, response structure), independent of the UI.

### Current scenario counts (validated baseline)

| Tag           | Scenarios |
| ------------- | --------- |
| `@smoke`      | 3         |
| `@regression` | 21        |
| `@negative`   | 12        |
| `@api`        | 4         |

These counts represent **selected** scenarios per suite and should not be summed to calculate a total, since tags overlap by design. The project currently contains **25 unique scenarios** in total.

### Running a suite

| Suite      | Command                     | Purpose                                                   |
| ---------- | --------------------------- | --------------------------------------------------------- |
| Smoke      | `npm run cy:run:smoke`      | Fast validation of critical flows.                        |
| Regression | `npm run cy:run:regression` | Broader validation after meaningful application changes.  |
| Negative   | `npm run cy:run:negative`   | Focused validation of validation/error behavior.          |
| API        | `npm run cy:run:api`        | Focused validation of API contracts/integration behavior. |
