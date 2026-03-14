const { Given, When, Then } = require("@badeball/cypress-cucumber-preprocessor");
import LoginPage from "../../support/pages/LoginPage";
import HomePage from "../../support/pages/HomePage";

Given("que o usuário está na página de login", () => {
  LoginPage.visit();
});

When("preenche o formulário de login com dados válidos", () => {
  const email = "fulano@qa.com";
  const password = "teste";
  LoginPage.fillLogin(email, password);
});

When("submete o formulário de login", () => {
  LoginPage.submit();
});

Then("o usuário deve ser redirecionado para a home page e estar logado", () => {
  cy.url({ timeout: 15000 }).should("include", "/home");
  HomePage.verifyLoggedIn();
});
