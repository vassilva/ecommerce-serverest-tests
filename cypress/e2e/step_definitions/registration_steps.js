const { Given, When, Then } = require("@badeball/cypress-cucumber-preprocessor");
import LoginPage from "../../support/pages/LoginPage";
import SignupPage from "../../support/pages/SignupPage";
import HomePage from "../../support/pages/HomePage";

Given("the user registration API is being intercepted", () => {
  cy.interceptUserRegister();
});

Given("the user is on the registration page", () => {
  LoginPage.visit();
  LoginPage.clickSignUp();
});

When("fills in the registration data with valid information", () => {
  cy.fixture("users").then((usersData) => {
    const uniqueEmail = `qa.${Date.now()}.${Math.floor(Math.random() * 100000)}@test.com`;
    SignupPage.fillForm(usersData.validUser.nome, uniqueEmail, usersData.validUser.password);
  });
});

When("submits the registration form", () => {
  SignupPage.submit();
});

When("fills in the registration data with an existing email", () => {
  cy.fixture("users").then((usersData) => {
    SignupPage.fillForm(
      usersData.validUser.nome,
      usersData.existingEmail,
      usersData.validUser.password
    );
  });
});

When("submits the registration form without filling required fields", () => {
  SignupPage.submit();
});

When("fills in the registration data with empty password", () => {
  cy.fixture("users").then((usersData) => {
    const uniqueEmail = `qa.${Date.now()}.${Math.floor(Math.random() * 100000)}@test.com`;
    SignupPage.fillForm(usersData.validUser.nome, uniqueEmail, usersData.emptyPassword);
  });
});

When("fills in the registration data with empty name", () => {
  cy.fixture("users").then((usersData) => {
    const uniqueEmail = `qa.${Date.now()}.${Math.floor(Math.random() * 100000)}@test.com`;
    SignupPage.fillForm(usersData.emptyName, uniqueEmail, usersData.validUser.password);
  });
});

When("fills in the registration data with an invalid email format", () => {
  cy.fixture("users").then((usersData) => {
    SignupPage.fillForm(
      usersData.validUser.nome,
      usersData.invalidEmailFormat,
      usersData.validUser.password
    );
  });
});

When("a new user is created via API call", () => {
  cy.apiCreateUser({}, { validateResponse: false }).then((result) => {
    cy.wrap(result.response).as("lastApiUserResponse");
  });
});

When("the users list is fetched via API call", () => {
  cy.apiGetUsers({ validateResponse: false }).then((response) => {
    cy.wrap(response).as("lastApiUserListResponse");
  });
});

Then("the account should be created successfully", () => {
  SignupPage.verifySuccessMessage();
  cy.url({ timeout: 15000 }).should("include", "/home");
  HomePage.verifyLoggedIn();
});

Then("a message should be displayed stating the email is already in use", () => {
  cy.fixture("users").then((usersData) => {
    cy.contains(usersData.messages.emailAlreadyInUse).should("be.visible");
  });
});

Then("validation messages should be displayed for the required fields", () => {
  cy.fixture("users").then((usersData) => {
    cy.contains(usersData.validationMessages.nameRequired).should("be.visible");
    cy.contains(usersData.validationMessages.emailRequired).should("be.visible");
    cy.contains(usersData.validationMessages.passwordRequired).should("be.visible");
  });
});

Then("a validation message about password should be displayed", () => {
  cy.fixture("users").then((usersData) => {
    cy.contains(usersData.validationMessages.passwordRequired).should("be.visible");
  });
});

Then("a validation message about name should be displayed", () => {
  cy.fixture("users").then((usersData) => {
    cy.contains(usersData.validationMessages.nameRequired).should("be.visible");
  });
});

Then("the registration form should reject the invalid email format", () => {
  SignupPage.elements.emailInput().then(($email) => {
    const input = $email[0];
    expect(input.validity.typeMismatch, "Email input should report a type mismatch").to.be.true;
    expect(input.checkValidity(), "Email input should fail native validity check").to.be.false;
  });
});

Then("the user registration API request should succeed with status 201", () => {
  cy.waitForRequest("registerRequest", { validateResponse: true }).then((interception) => {
    expect(interception.response.statusCode, "User creation status").to.eq(201);
    expect(interception.response.headers["content-type"], "Response content type").to.include(
      "application/json"
    );
  });
});

Then("the user registration API request should fail with status 400", () => {
  cy.waitForRequest("registerRequest", { validateResponse: true }).then((interception) => {
    expect(interception.response.statusCode, "User creation failure status").to.eq(400);
  });
});

Then("the user registration API response should contain a valid user ID", () => {
  cy.get("@registerRequest")
    .its("response.body")
    .then((body) => {
      expect(body._id, "User ID should exist").to.be.a("string").and.not.empty;
    });
});

Then("the user creation API response should have correct status and headers", () => {
  cy.fixture("api").then((apiData) => {
    cy.get("@lastApiUserResponse").then((lastApiUserResponse) => {
      expect(lastApiUserResponse.status, "User creation status").to.eq(apiData.success.userCreated);
      expect(lastApiUserResponse.headers["content-type"], "Content-Type header").to.include(
        "application/json"
      );
      expect(lastApiUserResponse.body._id, "User ID").to.be.a("string").and.not.empty;
    });
  });
});

Then("the users list API response should have correct structure and status", () => {
  cy.fixture("api").then((apiData) => {
    cy.get("@lastApiUserListResponse").then((lastApiUserListResponse) => {
      expect(lastApiUserListResponse.status, "Users list status").to.eq(apiData.success.getSuccess);
      expect(lastApiUserListResponse.headers["content-type"], "Content-Type header").to.include(
        "application/json"
      );
      expect(lastApiUserListResponse.body.quantidade, "Users count").to.be.a("number");
      expect(lastApiUserListResponse.body.usuarios, "Users array").to.be.an("array");
      expect(lastApiUserListResponse.body.usuarios.length, "Users array length").to.eq(
        lastApiUserListResponse.body.quantidade
      );
    });
  });
});
