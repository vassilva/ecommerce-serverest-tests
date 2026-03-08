const { Given, When, Then } = require("@badeball/cypress-cucumber-preprocessor");
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import HomePage from "../pages/HomePage";

// --- GIVEN ---
Given("I am on the login page", () => {
  LoginPage.visit();
});

Given("the user is on the sign up page", () => {
  LoginPage.visit();
  LoginPage.clickSignUp();
});

// --- WHEN ---
When('I click on the "Sign Up" option', () => {
  LoginPage.clickSignUp();
});

When("I fill in the customer registration form with valid data", (dataTable) => {
  const data = dataTable.hashes()[0];
  const uniqueEmail = `qa.${Date.now()}.${Math.floor(Math.random() * 100000)}@test.com`;
  const password = data.password === "********" ? "test1234" : data.password;
  SignupPage.fillForm(data.name, uniqueEmail, password);
});

When("the user fills in valid registration data", () => {
  const name = "Automation User";
  const uniqueEmail = `qa.${Date.now()}.${Math.floor(Math.random() * 100000)}@test.com`;
  const password = "testpassword";
  SignupPage.fillForm(name, uniqueEmail, password);
});

When("the user fills in registration data with an existing email", () => {
  const name = "Automation User";
  const existingEmail = "fulano@qa.com"; // Use an email that we know exists or was already used
  const password = "testpassword";
  SignupPage.fillForm(name, existingEmail, password);
});

When("the user submits the sign up form without filling required fields", () => {
  SignupPage.submit();
});

When("I submit the registration form", () => {
  SignupPage.submit();
});

When("submits the sign up form", () => {
  SignupPage.submit();
});

// --- THEN ---
Then("I should see a success message confirming the registration", () => {
  SignupPage.verifySuccessMessage();
});

Then("the account should be created successfully", () => {
  SignupPage.verifySuccessMessage();
  // Wait for redirect to happen before verifying
  cy.url({ timeout: 15000 }).should("include", "/home");
  HomePage.verifyLoggedIn();
});

Then("an email already exists message should be displayed", () => {
  cy.contains("Este email já está sendo usado").should("be.visible");
});

Then("validation messages should be displayed for the required fields", () => {
  cy.contains("Nome é obrigatório").should("be.visible");
  cy.contains("Email é obrigatório").should("be.visible");
  cy.contains("Password é obrigatório").should("be.visible");
});

Then("I should be logged in as a customer", () => {
  HomePage.verifyLoggedIn();
});
