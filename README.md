# E-commerce Serverest - Cypress BDD (Senior-Grade)

Automated BDD tests (Cypress + Cucumber) for the Serverest E-commerce site: https://front.serverest.dev/login

> Designed with senior QA best practices: POM, clean step definitions, ESLint/Prettier, CI pipeline, Mochawesome HTML reports, and dynamic test data.

## Tech Stack

- JavaScript (ES6+)
- Cypress 13
- Cucumber (Gherkin) via `@badeball/cypress-cucumber-preprocessor`
- Page Object Model (POM)
- ESLint (Airbnb) + Prettier
- Mochawesome (HTML reports)
- GitHub Actions (CI)

## Project Structure

```
cypress/
  e2e/
    features/           -> .feature files (Gherkin)
    step_definitions/   -> Cucumber steps mapping to POM methods
    pages/              -> Page Objects
  fixtures/             -> Static/dummy data
  support/              -> Commands, helpers, setup
.github/workflows/      -> CI pipeline
```

## Getting Started

```bash
# Node 18+ is recommended
npm install
npm run test           # Cypress UI
npm run test:headless  # Headless (CI-like)
```

### Reports

After a headless run, merge & generate a single HTML report:

```bash
npm run report
# Open: cypress/reports/html/index.html
```

## BDD Scenarios Covered

- Account creation (dynamic user)
- Login with the newly created account

## Conventions

- **Selectors:** centralized inside Page Objects for maintainability.
- **Data:** dynamic email addresses generated per run to avoid collisions.
- **Steps:** short, readable, and reusable; no raw selectors inside steps.
- **Assertions:** explicit and meaningful (URL, toasts, critical elements).

## CI (GitHub Actions)

Workflow runs on push/PR, executes Cypress headlessly, and uploads HTML report as an artifact.

```yaml
.github/workflows/cypress.yml
```

## Troubleshooting

- If Serverest UI changes, update selectors in `cypress/e2e/pages/*.js` only.
- To run with a different baseUrl, override via CLI: `cypress run --config baseUrl=https://...`
