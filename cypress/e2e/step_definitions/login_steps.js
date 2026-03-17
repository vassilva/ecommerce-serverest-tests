const { Given, When, Then } = require("@badeball/cypress-cucumber-preprocessor");
import LoginPage from "../../support/pages/LoginPage";
import SignupPage from "../../support/pages/SignupPage";
import HomePage from "../../support/pages/HomePage";

Given("the user is on the login page", () => {
  LoginPage.visit();
});

When("fills in the login form with valid data", () => {
  // Instead of static data, create a user dynamically for isolation
  cy.createRegularUser().then((user) => {
    LoginPage.fillLogin(user.email, user.password);
  });
});

When("submits the login form", () => {
  LoginPage.submit();
});

Then("the user should be redirected to the home page and be logged in", () => {
  cy.url({ timeout: 15000 }).should("include", "/home");
  HomePage.verifyLoggedIn();
});
