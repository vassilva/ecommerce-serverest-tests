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
Given("que o usuário está na página de cadastro", () => {
  LoginPage.visit();
  LoginPage.clickSignUp();
});

Given("que o usuário está logado no sistema", () => {
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

Given("que o usuário está na página inicial", () => {
  cy.visit("/home");
  HomePage.verifyLoggedIn();
});

Given("que um produto já foi adicionado à lista de compras", () => {
  const productName = "Intel Core i5";
  cy.visit("/home");
  HomePage.searchProduct(productName);
  cy.contains(productName, { timeout: 15000 }).should("be.visible");
  HomePage.clickProductDetails(productName);
  cy.contains("Adicionar a lista", { timeout: 10000 }).should("be.visible").click();
});

Given("que produtos foram adicionados à lista de compras", () => {
  const productName = "Intel Core i5";
  cy.visit("/home");
  HomePage.searchProduct(productName);
  cy.contains(productName, { timeout: 15000 }).should("be.visible");
  HomePage.clickProductDetails(productName);
  cy.contains("Adicionar a lista", { timeout: 10000 }).should("be.visible").click();
  cy.url().should("include", "minhaListaDeProdutos");
});

Given("que um produto foi adicionado à lista de compras", () => {
  const productName = "Intel Core i5";
  cy.visit("/home");
  HomePage.searchProduct(productName);
  cy.contains(productName, { timeout: 15000 }).should("be.visible");
  HomePage.clickProductDetails(productName);
  cy.contains("Adicionar a lista", { timeout: 10000 }).should("be.visible").click();
  cy.url().should("include", "minhaListaDeProdutos");
});

Given("que um produto foi adicionado à lista de compras com quantidade maior que um", () => {
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
When("preenche os dados de cadastro com informações válidas", () => {
  const name = "Automation User";
  const uniqueEmail = `qa.${Date.now()}.${Math.floor(Math.random() * 100000)}@test.com`;
  const password = "testpassword";
  SignupPage.fillForm(name, uniqueEmail, password);
});

When("submete o formulário de cadastro", () => {
  SignupPage.submit();
});

When("preenche os dados de cadastro com um e-mail já existente", () => {
  const name = "Automation User";
  const existingEmail = "fulano@qa.com";
  const password = "testpassword";
  SignupPage.fillForm(name, existingEmail, password);
});

When("submete o formulário de cadastro sem preencher os campos obrigatórios", () => {
  SignupPage.submit();
});

When("o usuário busca por um produto válido na barra de pesquisa", () => {
  const productName = "Intel Core i5";
  cy.visit("/home");
  HomePage.searchProduct(productName);
  cy.contains(productName, { timeout: 15000 }).should("be.visible");
});

When("o usuário seleciona o produto Intel Core i5 diretamente da lista na home", () => {
  HomePage.clickProductDetails("Intel Core i5");
});

When("o usuário adiciona um produto à lista de compras", () => {
  const productName = "Intel Core i5";
  cy.visit("/home");
  HomePage.searchProduct(productName);
  cy.contains(productName, { timeout: 15000 }).should("be.visible");
  HomePage.clickProductDetails(productName);
  cy.contains("Adicionar a lista", { timeout: 10000 }).should("be.visible").click();
});

When("o usuário adiciona outro produto diferente à lista de compras", () => {
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

When("o usuário limpa a lista de compras", () => {
  cy.url().should("include", "minhaListaDeProdutos");
  cy.contains(/Limpar|Clear/i).click();
});

When("o usuário aumenta a quantidade do produto", () => {
  cy.contains("Intel Core i5")
    .parentsUntil('div[class*="row"], div[class*="col"]')
    .parent()
    .find("button")
    .contains("+")
    .click();
});

When("o usuário diminui a quantidade do produto", () => {
  cy.contains("Intel Core i5")
    .parentsUntil('div[class*="row"], div[class*="col"]')
    .parent()
    .find("button")
    .contains("-")
    .click();
});

// --- THEN ---
Then("a conta deve ser criada com sucesso", () => {
  SignupPage.verifySuccessMessage();
  cy.url({ timeout: 15000 }).should("include", "/home");
  HomePage.verifyLoggedIn();
});

Then("deve ser exibida uma mensagem informando que o e-mail já está em uso", () => {
  cy.contains("Este email já está sendo usado").should("be.visible");
});

Then("devem ser exibidas mensagens de validação para os campos obrigatórios", () => {
  cy.contains("Nome é obrigatório").should("be.visible");
  cy.contains("Email é obrigatório").should("be.visible");
  cy.contains("Password é obrigatório").should("be.visible");
});

Then("o produto correspondente deve ser exibido nos resultados", () => {
  cy.contains("Intel Core i5").should("be.visible");
});

Then("a página de detalhes do produto deve ser exibida", () => {
  cy.url().should("include", "/detalhesProduto/");
});

Then("o produto deve ser exibido na lista de compras", () => {
  cy.url().should("include", "minhaListaDeProdutos");
  cy.contains("Intel Core i5").should("be.visible");
});

Then("ambos os produtos devem ser exibidos na lista de compras", () => {
  cy.url().should("include", "minhaListaDeProdutos");
  cy.contains("Intel Core i5").should("be.visible");
  cy.contains("iPhone 16").should("be.visible");
});

Then("a lista de compras deve estar vazia", () => {
  cy.contains(/Sua lista está vazia|Seu carrinho está vazio/i).should("be.visible");
});

Then("a quantidade do produto deve ser atualizada", () => {
  cy.contains("Intel Core i5")
    .parentsUntil('div[class*="row"], div[class*="col"]')
    .parent()
    .then(($container) => {
      const current = readQty($container, "Intel Core i5");
      expect(current).to.be.greaterThan(1);
    });
});

Then("a quantidade do produto deve ser reduzida para um", () => {
  cy.contains("Intel Core i5")
    .parentsUntil('div[class*="row"], div[class*="col"]')
    .parent()
    .then(($container) => {
      const current = readQty($container, "Intel Core i5");
      expect(current).to.eq(1);
    });
});
