const { Given, When, Then } = require("@badeball/cypress-cucumber-preprocessor");
import LoginPage from "../../support/pages/LoginPage";
import HomePage from "../../support/pages/HomePage";

Given("the login API is being intercepted", () => {
  cy.interceptLogin();
});

Given("the user is on the login page", () => {
  LoginPage.visit();
});

When("fills in the login form with valid data", () => {
  cy.createRegularUser().then((user) => {
    LoginPage.fillLogin(user.email, user.password);
  });
});

When("fills in the login form with a valid user but wrong password", () => {
  cy.fixture("login").then((loginData) => {
    cy.createRegularUser().then((user) => {
      LoginPage.fillLogin(user.email, loginData.invalid.wrongPassword.password);
    });
  });
});

When("fills in the login form with a nonexistent email", () => {
  cy.fixture("login").then((loginData) => {
    LoginPage.fillLogin(
      loginData.invalid.nonexistentEmail.email,
      loginData.invalid.nonexistentEmail.password
    );
  });
});

When("fills in the login form with empty email", () => {
  cy.fixture("login").then((loginData) => {
    LoginPage.fillLogin(loginData.invalid.emptyEmail.email, loginData.invalid.emptyEmail.password);
  });
});

When("fills in the login form with empty password", () => {
  cy.fixture("login").then((loginData) => {
    LoginPage.fillLogin(
      loginData.invalid.emptyPassword.email,
      loginData.invalid.emptyPassword.password
    );
  });
});

When("submits the login form without filling any field", () => {
  LoginPage.submit();
});

When("submits the login form", () => {
  LoginPage.submit();
});

When("a login API call is made with valid credentials via API", () => {
  cy.createRegularUser().then((user) => {
    cy.apiLogin(user.email, user.password, { failOnStatusCode: false, validateResponse: false }).as(
      "apiLoginResponse"
    );
  });
});

Then("the user should be redirected to the home page and be logged in", () => {
  cy.url({ timeout: 15000 }).should("include", "/home");
  HomePage.verifyLoggedIn();
});

Then("the login API request should succeed with status 200", () => {
  cy.waitForRequest("loginRequest", { validateResponse: true }).then((interception) => {
    expect(interception.response.statusCode, "Login API status code").to.eq(200);
    expect(interception.response.headers["content-type"], "Response content type").to.include(
      "application/json"
    );
  });
});

Then("the login API request should fail with status 401", () => {
  cy.waitForRequest("loginRequest", { validateResponse: true }).then((interception) => {
    expect(interception.response.statusCode, "Login API failure status").to.eq(401);
  });
});

Then("the login API response should contain a valid authorization token", () => {
  cy.fixture("login").then((loginData) => {
    cy.get("@loginRequest")
      .its("response.body")
      .then((body) => {
        expect(body.authorization, "Authorization token should be present").to.be.a("string").and
          .not.empty;
        expect(body.message, "Success message").to.eq(loginData.messages.loginSuccess);
      });
  });
});

Then("an error message about invalid credentials should be displayed", () => {
  cy.fixture("login").then((loginData) => {
    LoginPage.verifyErrorMessage(loginData.errors.invalidCredentials);
  });
});

Then("validation messages should be displayed for the required login fields", () => {
  cy.fixture("login").then((loginData) => {
    cy.contains(loginData.errors.emailRequired).should("be.visible");
    cy.contains(loginData.errors.passwordRequired).should("be.visible");
  });
});

Then("the email required validation message should be displayed", () => {
  cy.fixture("login").then((loginData) => {
    cy.contains(loginData.errors.emailRequired).should("be.visible");
  });
});

Then("the password required validation message should be displayed", () => {
  cy.fixture("login").then((loginData) => {
    cy.contains(loginData.errors.passwordRequired).should("be.visible");
  });
});

Then("the login API response should have correct status code body and headers", () => {
  cy.get("@apiLoginResponse").then((response) => {
    cy.fixture("api").then((apiData) => {
      cy.fixture("login").then((loginData) => {
        expect(response.status, "Response status").to.eq(apiData.success.loginSuccess);
        expect(response.headers["content-type"], "Content-Type header").to.include(
          "application/json"
        );
        expect(response.body, "Response body should exist").to.exist;
        expect(response.body.message, "Response message").to.eq(loginData.messages.loginSuccess);
        expect(response.body.authorization, "Authorization token").to.be.a("string").and.not.empty;
      });
    });
  });
});
