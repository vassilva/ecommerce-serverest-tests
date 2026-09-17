const { When, Then } = require("@badeball/cypress-cucumber-preprocessor");
import LoginPage from "../../support/pages/LoginPage";
import HomePage from "../../support/pages/HomePage";

// Genuinely cross-feature steps: the logout action and the logged-out assertion
// are reusable by any feature, not tied to a single business domain.
When("the user performs the logout", () => {
  HomePage.logout();
});

Then("the user should be logged out successfully", () => {
  LoginPage.verifyLoginPageDisplayed();
});
