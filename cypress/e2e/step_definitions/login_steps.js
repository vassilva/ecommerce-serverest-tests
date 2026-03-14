const { Given, When, Then } = require("@badeball/cypress-cucumber-preprocessor");
import LoginPage from "../../support/pages/LoginPage";
import HomePage from "../../support/pages/HomePage";

Given("the user is on the login page", () => {
  LoginPage.visit();
});

When("fills in the login form with valid data", () => {
  const email = "fulano@qa.com";
  const password = "teste";
  LoginPage.fillLogin(email, password);
});

When("submits the login form", () => {
  LoginPage.submit();
});

Then("the user should be redirected to the home page and be logged in", () => {
  cy.url({ timeout: 15000 }).should("include", "/home");
  HomePage.verifyLoggedIn();
});
