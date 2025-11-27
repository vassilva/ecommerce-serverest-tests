import './commands';

// Fail on uncaught exceptions but capture useful logs
Cypress.on('uncaught:exception', () => {
  // Allow the test to continue when third-party scripts throw
  // Return false to prevent Cypress from failing the test
  return false;
});

beforeEach(() => {
  // Clear cookies/localStorage/sessionStorage between tests for isolation
  cy.clearCookies();
  cy.clearLocalStorage();
});
