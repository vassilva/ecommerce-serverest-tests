const { Before, After } = require("@badeball/cypress-cucumber-preprocessor");
import HomePage from "../../support/pages/HomePage";

Before(() => {
  cy.log("Starting scenario execution...");
  
  // Setup: Clean up session and state to ensure isolation
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
  
  // Note: Database cleanup is handled via Isolation strategy 
  // (each test creates its own unique mass of data).
});

After(() => {
  cy.log("Finishing scenario execution.");
  
  // Ensure logout if logged in (Isolation/Teardown)
  cy.get("body").then(($body) => {
    // Check for logout button in multiple languages/selectors
    const logoutBtn = $body.find('button:contains("Logout"), a:contains("Logout"), button:contains("Sair"), a:contains("Sair")');
    if (logoutBtn.length > 0) {
      HomePage.logout(false);
    }
  });
});
