const { Given, When, Then } = require("@badeball/cypress-cucumber-preprocessor");
import LoginPage from "../../support/pages/LoginPage";
import SignupPage from "../../support/pages/SignupPage";
import HomePage from "../../support/pages/HomePage";

function readQty($container, productName) {
  const direct = $container.find(
    "input[type='number'], [data-testid*='quant'], .quantidade, [class*='qty'], [class*='quantidade'], [data-qa*='qty'], [aria-label*='quant']"
  );
  if (direct.length) {
    const isInput = direct.is("input");
    const raw = isInput ? direct.val() : direct.text();
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
    const m = String(raw).match(/\b\d+\b/);
    return m ? Number(m[0]) : NaN;
  }
  return NaN;
}

// --- GIVEN ---
Given("the user is on the registration page", () => {
  LoginPage.visit();
  LoginPage.clickSignUp();
});

Given("the user is logged into the system", () => {
  const userEmail = `qa.${Date.now()}.${Math.floor(Math.random() * 10000)}@test.com`;
  const userPassword = "testpassword";
  const adminEmail = `admin.${Date.now()}.${Math.floor(Math.random() * 10000)}@test.com`;
  const adminPwd = "testpassword";

  // 1. Create Admin and Product
  cy.request({
    method: "POST",
    url: "https://serverest.dev/usuarios",
    body: { nome: "Admin QA", email: adminEmail, password: adminPwd, administrador: "true" },
    failOnStatusCode: false,
  }).then(() => {
    cy.request({
      method: "POST",
      url: "https://serverest.dev/login",
      body: { email: adminEmail, password: adminPwd },
    }).then((adminRes) => {
      const adminToken = adminRes.body.authorization;
      cy.request({
        method: "POST",
        url: "https://serverest.dev/produtos",
        headers: { Authorization: adminToken },
        body: { nome: "Intel Core i5", preco: 1500, descricao: "Processor", quantidade: 10 },
        failOnStatusCode: false,
      }).then(() => {
        // 2. Create Regular User and Login via UI
        cy.request({
          method: "POST",
          url: "https://serverest.dev/usuarios",
          body: {
            nome: "QA User",
            email: userEmail,
            password: userPassword,
            administrador: "false",
          },
          failOnStatusCode: false,
        }).then(() => {
          LoginPage.visit();
          LoginPage.fillLogin(userEmail, userPassword);
          LoginPage.submit();
          cy.url({ timeout: 15000 }).should("include", "/home");
          HomePage.verifyLoggedIn();
        });
      });
    });
  });
});

Given("the user is on the home page", () => {
  cy.visit("/home");
  HomePage.verifyLoggedIn();
});

Given("a product has already been added to the shopping list", () => {
  const productName = "Intel Core i5";
  cy.visit("/home");
  HomePage.searchProduct(productName);
  cy.contains(productName, { timeout: 15000 }).should("be.visible");
  HomePage.clickProductDetails(productName);
  cy.contains("Adicionar a lista", { timeout: 10000 }).should("be.visible").click();
});

Given("products have been added to the shopping list", () => {
  const productName = "Intel Core i5";
  cy.visit("/home");
  HomePage.searchProduct(productName);
  cy.contains(productName, { timeout: 15000 }).should("be.visible");
  HomePage.clickProductDetails(productName);
  cy.contains("Adicionar a lista", { timeout: 10000 }).should("be.visible").click();
  cy.url().should("include", "minhaListaDeProdutos");
});

Given("a product has been added to the shopping list", () => {
  const productName = "Intel Core i5";
  cy.visit("/home");
  HomePage.searchProduct(productName);
  cy.contains(productName, { timeout: 15000 }).should("be.visible");
  HomePage.clickProductDetails(productName);
  cy.contains("Adicionar a lista", { timeout: 10000 }).should("be.visible").click();
  cy.url().should("include", "minhaListaDeProdutos");
});

Given("a product has been added to the shopping list with quantity greater than one", () => {
  const productName = "Intel Core i5";
  cy.visit("/home");
  HomePage.searchProduct(productName);
  cy.contains(productName, { timeout: 15000 }).should("be.visible");
  HomePage.clickProductDetails(productName);
  cy.contains("Adicionar a lista", { timeout: 10000 }).should("be.visible").click();
  cy.url().should("include", "minhaListaDeProdutos");
  cy.contains(productName)
    .parentsUntil('div[class*="row"], div[class*="col"]')
    .parent()
    .find("button")
    .contains("+")
    .click();
});

// --- WHEN ---
When("fills in the registration data with valid information", () => {
  const name = "Automation User";
  const uniqueEmail = `qa.${Date.now()}.${Math.floor(Math.random() * 100000)}@test.com`;
  const password = "testpassword";
  SignupPage.fillForm(name, uniqueEmail, password);
});

When("submits the registration form", () => {
  SignupPage.submit();
});

When("fills in the registration data with an existing email", () => {
  const name = "Automation User";
  const existingEmail = "fulano@qa.com";
  const password = "testpassword";
  SignupPage.fillForm(name, existingEmail, password);
});

When("submits the registration form without filling required fields", () => {
  SignupPage.submit();
});

When("the user searches for a valid product in the search bar", () => {
  const productName = "Intel Core i5";
  cy.visit("/home");
  HomePage.searchProduct(productName);
  cy.contains(productName, { timeout: 15000 }).should("be.visible");
});

When("the user selects the product Intel Core i5 directly from the list on the home page", () => {
  HomePage.clickProductDetails("Intel Core i5");
});

When("the user adds a product to the shopping list", () => {
  const productName = "Intel Core i5";
  cy.visit("/home");
  HomePage.searchProduct(productName);
  cy.contains(productName, { timeout: 15000 }).should("be.visible");
  HomePage.clickProductDetails(productName);
  cy.contains("Adicionar a lista", { timeout: 10000 }).should("be.visible").click();
});

When("the user adds another different product to the shopping list", () => {
  const productName = "iPhone 16";
  const adminEmail = `admin.${Date.now()}.${Math.floor(Math.random() * 10000)}@test.com`;
  const adminPwd = "testpassword";

  cy.request({
    method: "POST",
    url: "https://serverest.dev/usuarios",
    body: { nome: "Admin QA", email: adminEmail, password: adminPwd, administrador: "true" },
    failOnStatusCode: false,
  }).then(() => {
    cy.request({
      method: "POST",
      url: "https://serverest.dev/login",
      body: { email: adminEmail, password: adminPwd },
    }).then((adminRes) => {
      const adminToken = adminRes.body.authorization;
      cy.request({
        method: "POST",
        url: "https://serverest.dev/produtos",
        headers: { Authorization: adminToken },
        body: { nome: productName, preco: 6000, descricao: "Phone", quantidade: 50 },
        failOnStatusCode: false,
      }).then(() => {
        cy.visit("/home");
        HomePage.searchProduct(productName);
        cy.contains(productName, { timeout: 15000 }).should("be.visible");
        HomePage.clickProductDetails(productName);
        cy.contains("Adicionar a lista", { timeout: 10000 }).should("be.visible").click();
      });
    });
  });
});

When("the user clears the shopping list", () => {
  cy.url().should("include", "minhaListaDeProdutos");
  cy.contains(/Limpar|Clear/i).click();
});

When("the user increases the product quantity", () => {
  cy.contains("Intel Core i5")
    .parentsUntil('div[class*="row"], div[class*="col"]')
    .parent()
    .find("button")
    .contains("+")
    .click();
});

When("the user decreases the product quantity", () => {
  cy.contains("Intel Core i5")
    .parentsUntil('div[class*="row"], div[class*="col"]')
    .parent()
    .find("button")
    .contains("-")
    .click();
});

When("the user performs the logout", () => {
  HomePage.logout();
});

// --- THEN ---
Then("the account should be created successfully", () => {
  SignupPage.verifySuccessMessage();
  cy.url({ timeout: 15000 }).should("include", "/home");
  HomePage.verifyLoggedIn();
});

Then("a message should be displayed stating the email is already in use", () => {
  cy.contains("Este email já está sendo usado").should("be.visible");
});

Then("validation messages should be displayed for the required fields", () => {
  cy.contains("Nome é obrigatório").should("be.visible");
  cy.contains("Email é obrigatório").should("be.visible");
  cy.contains("Password é obrigatório").should("be.visible");
});

Then("the matching product should be displayed in the results", () => {
  cy.contains("Intel Core i5").should("be.visible");
});

Then("the product details page should be displayed", () => {
  cy.url().should("include", "/detalhesProduto/");
});

Then("the product should be displayed in the shopping list", () => {
  cy.url().should("include", "minhaListaDeProdutos");
  cy.contains("Intel Core i5").should("be.visible");
});

Then("both products should be displayed in the shopping list", () => {
  cy.url().should("include", "minhaListaDeProdutos");
  cy.contains("Intel Core i5").should("be.visible");
  cy.contains("iPhone 16").should("be.visible");
});

Then("the shopping list should be empty", () => {
  cy.contains(/Sua lista está vazia|Seu carrinho está vazio/i).should("be.visible");
});

Then("the user should be logged out successfully", () => {
  cy.url().should("include", "/login");
  cy.get('h1, button, [data-testid="entrar"]')
    .contains(/Entrar|Login/i)
    .should("be.visible");
});

Then("the product quantity should be updated", () => {
  cy.contains("Intel Core i5")
    .parentsUntil('div[class*="row"], div[class*="col"]')
    .parent()
    .then(($container) => {
      const current = readQty($container, "Intel Core i5");
      expect(current).to.be.greaterThan(1);
    });
});

Then("the product quantity should be reduced to one", () => {
  cy.contains("Intel Core i5")
    .parentsUntil('div[class*="row"], div[class*="col"]')
    .parent()
    .then(($container) => {
      const current = readQty($container, "Intel Core i5");
      expect(current).to.eq(1);
    });
});
