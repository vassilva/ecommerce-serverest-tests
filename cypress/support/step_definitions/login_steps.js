const { Given, When, Then } = require("@badeball/cypress-cucumber-preprocessor");
import LoginPage from "../pages/LoginPage";

Given("I have a registered user", () => {
  const uniqueEmail = `qa.${Date.now()}@test.com`;
  const password = "testpassword";

  cy.request({
    method: "POST",
    url: "https://serverest.dev/usuarios",
    body: {
      nome: "Test User",
      email: uniqueEmail,
      password: password,
      administrador: "true",
    },
    failOnStatusCode: false, // Prevent failure if user already exists (unlikely with timestamp)
  }).then((response) => {
    // Store credentials for the login step
    Cypress.env("userEmail", uniqueEmail);
    Cypress.env("userPassword", password);
  });
});

When("I fill in the login form with valid credentials", () => {
  const email = Cypress.env("userEmail");
  const password = Cypress.env("userPassword");
  LoginPage.fillLogin(email, password);
});

When("I fill in the login form with invalid credentials", (dataTable) => {
  const data = dataTable.hashes()[0];
  LoginPage.fillLogin(data.email, data.password);
});

When("I click on the login button", () => {
  LoginPage.submit();
});

Then("I should see an error message {string}", (message) => {
  LoginPage.verifyErrorMessage(message);
});
