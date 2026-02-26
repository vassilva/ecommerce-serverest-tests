const { Given, When, Then } = require("@badeball/cypress-cucumber-preprocessor");
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import HomePage from "../pages/HomePage";

Given("I am on the login page", () => {
  LoginPage.visit();
});

When('I click on the "Sign Up" option', () => {
  LoginPage.clickSignUp();
});

When("I fill in the customer registration form with valid data", (dataTable) => {
  const data = dataTable.hashes()[0];
  const uniqueEmail = `qa.${Date.now()}@test.com`;
  const password = data.password === "********" ? "test1234" : data.password;

  SignupPage.fillForm(data.name, uniqueEmail, password);
});

When("I submit the registration form", () => {
  SignupPage.submit();
});

Then("I should see a success message confirming the registration", () => {
  SignupPage.verifySuccessMessage();
});

Then("I should be logged in as a customer", () => {
  HomePage.verifyLoggedIn();
});
