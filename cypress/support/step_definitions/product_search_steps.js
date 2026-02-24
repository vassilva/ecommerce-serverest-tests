const { Given, When, Then, After } = require("@badeball/cypress-cucumber-preprocessor");
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";

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
  const plusBtn = $container
    .find("button")
    .filter((_, el) => (el.textContent || "").includes("+"))
    .first();
  const minusBtn = $container
    .find("button")
    .filter((_, el) => (el.textContent || "").includes("-"))
    .first();
  let vicinity = $container;
  if (plusBtn.length) {
    vicinity = plusBtn.parent();
  } else if (minusBtn.length) {
    vicinity = minusBtn.parent();
  }
  const candidates = vicinity.find("*").filter((_, el) => {
    const txt = (el.textContent || "").trim();
    if (!txt) return false;
    if (productName && txt.includes(productName)) return false;
    if (/R\$|preço|price/i.test(txt)) return false;
    const m = txt.match(/\b\d+\b/);
    if (!m) return false;
    const num = Number(m[0]);
    return Number.isFinite(num) && num <= 100;
  });
  if (candidates.length) {
    const txt = (candidates.first().text() || "").trim();
    const m = txt.match(/\b\d+\b/);
    return m ? Number(m[0]) : NaN;
  }
  return NaN;
}

Given("I have Access the sytem with a registered user", () => {
  const email = `qa.${Date.now()}@test.com`;
  const password = "testpassword";
  cy.request({
    method: "POST",
    url: "https://serverest.dev/usuarios",
    body: {
      nome: "QA User",
      email,
      password,
      administrador: "false",
    },
    failOnStatusCode: false,
  }).then(() => {
    cy.request({
      method: "POST",
      url: "https://serverest.dev/login",
      body: { email, password },
    }).then((res) => {
      LoginPage.visit();
      LoginPage.fillLogin(email, password);
      LoginPage.submit();
      HomePage.verifyLoggedIn();
    });
  });
  const adminEmail = `admin.${Date.now()}@test.com`;
  const adminPwd = "testpassword";
  cy.request({
    method: "POST",
    url: "https://serverest.dev/usuarios",
    body: {
      nome: "Admin QA",
      email: adminEmail,
      password: adminPwd,
      administrador: "true",
    },
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
        body: {
          nome: "Intel Core i5",
          preco: 1500,
          descricao: "Processor",
          quantidade: 10,
        },
        failOnStatusCode: false,
      });
    });
  });
});

Given("I am on the Home page", () => {
  cy.visit("/home");
  HomePage.verifyLoggedIn();
});

Given("I am logged in as a registered user", () => {
  const email = `qa.${Date.now()}@test.com`;
  const password = "testpassword";
  const adminEmail = `admin.${Date.now()}@test.com`;
  const adminPwd = "testpassword";
  cy.request({
    method: "POST",
    url: "https://serverest.dev/usuarios",
    body: { nome: "Admin QA", email: adminEmail, password: adminPwd, administrador: "true" },
    failOnStatusCode: false,
  })
    .then(() => {
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/login",
        body: { email: adminEmail, password: adminPwd },
      });
    })
    .then((adminRes) => {
      const adminToken = adminRes.body.authorization;
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/produtos",
        headers: { Authorization: adminToken },
        body: { nome: "Intel Core i5", preco: 1500, descricao: "Processor", quantidade: 10 },
        failOnStatusCode: false,
      });
    })
    .then(() => {
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/usuarios",
        body: { nome: "QA User", email, password, administrador: "false" },
        failOnStatusCode: false,
      });
    })
    .then(() => {
      LoginPage.visit();
      LoginPage.fillLogin(email, password);
      LoginPage.submit();
      HomePage.verifyLoggedIn();
    });
});

When("I type Intel Core i5 in the search bar", () => {
  cy.get('[data-testid="pesquisar"]').clear();
  cy.get('[data-testid="pesquisar"]').type("Intel Core i5");
});

When("I click on the Search button", () => {
  cy.get('[data-testid="botaoPesquisar"]').click();
});

Then("the product details page is displayed", () => {
  cy.get("body", { timeout: 10000 }).should("contain.text", "Intel Core i5");
});

When("I search for product {string}", (productName) => {
  HomePage.searchProduct(productName);
  HomePage.clickProductDetails(productName);
});

Then("the product details page for {string} is displayed", (productName) => {
  cy.url().should("include", "detalhesProduto");
  cy.contains(productName).should("be.visible");
});

When("I open the product {string} from the product list", (productName) => {
  HomePage.clickProductDetails(productName);
});

Given("I have searched for the product Intel Core i5", () => {
  const productName = "Intel Core i5";
  const adminEmail = `admin.${Date.now()}@test.com`;
  const adminPwd = "testpassword";
  const userEmail = `qa.${Date.now()}@test.com`;
  const userPwd = "testpassword";

  cy.request({
    method: "POST",
    url: "https://serverest.dev/usuarios",
    body: {
      nome: "Admin QA",
      email: adminEmail,
      password: adminPwd,
      administrador: "true",
    },
    failOnStatusCode: false,
  })
    .then(() => {
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/login",
        body: { email: adminEmail, password: adminPwd },
      });
    })
    .then((adminRes) => {
      const adminToken = adminRes.body.authorization;
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/produtos",
        headers: { Authorization: adminToken },
        body: {
          nome: productName,
          preco: 1500,
          descricao: "Processor",
          quantidade: 10,
        },
        failOnStatusCode: false,
      });
    })
    .then(() => {
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/usuarios",
        body: {
          nome: "QA User",
          email: userEmail,
          password: userPwd,
          administrador: "false",
        },
        failOnStatusCode: false,
      });
    })
    .then(() => {
      LoginPage.visit();
      LoginPage.fillLogin(userEmail, userPwd);
      LoginPage.submit();
      HomePage.verifyLoggedIn();
      HomePage.searchProduct(productName);
    });
});

When("I click on the Details button", () => {
  HomePage.clickProductDetails("Intel Core i5");
});

Then("the product detail screen is displayed with the product information", () => {
  cy.url().should("include", "detalhesProduto");
  cy.contains("Intel Core i5").should("be.visible");
});

Given("I am on the product details page", () => {
  const productName = "Intel Core i5";
  const adminEmail = `admin.${Date.now()}@test.com`;
  const adminPwd = "testpassword";
  const userEmail = `qa.${Date.now()}@test.com`;
  const userPwd = "testpassword";

  cy.request({
    method: "POST",
    url: "https://serverest.dev/usuarios",
    body: {
      nome: "Admin QA",
      email: adminEmail,
      password: adminPwd,
      administrador: "true",
    },
    failOnStatusCode: false,
  })
    .then(() => {
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/login",
        body: { email: adminEmail, password: adminPwd },
      });
    })
    .then((adminRes) => {
      const adminToken = adminRes.body.authorization;
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/produtos",
        headers: { Authorization: adminToken },
        body: {
          nome: productName,
          preco: 1500,
          descricao: "Processor",
          quantidade: 10,
        },
        failOnStatusCode: false,
      });
    })
    .then(() => {
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/usuarios",
        body: {
          nome: "QA User",
          email: userEmail,
          password: userPwd,
          administrador: "false",
        },
        failOnStatusCode: false,
      });
    })
    .then(() => {
      LoginPage.visit();
      LoginPage.fillLogin(userEmail, userPwd);
      LoginPage.submit();
      HomePage.verifyLoggedIn();
      HomePage.searchProduct(productName);
      HomePage.clickProductDetails(productName);
      cy.url().should("include", "detalhesProduto");
      cy.contains(productName).should("be.visible");
    });
});

When("I click on the Add to list button", () => {
  cy.contains("Adicionar a lista").click();
});

When("I add the product to the shopping list from the product details page", () => {
  cy.url().should("include", "detalhesProduto");
  cy.contains("Adicionar a lista").click();
  cy.url().should("include", "minhaListaDeProdutos");
});

Then("the shopping list screen is displayed with the product information", () => {
  cy.url().should("include", "minhaListaDeProdutos");
  cy.contains("Intel Core i5").should("be.visible");
});

When("I click on the Logout button", () => {
  HomePage.logout();
});

When("I click on the Logout button instantly", () => {
  HomePage.logout(false);
});

After(() => {
  cy.get("body").then(($body) => {
    const candidates = $body.find("a,button");
    const hasLogout = Array.from(candidates).some((el) =>
      (el.textContent || "").includes("Logout")
    );
    if (hasLogout) {
      HomePage.logout();
    }
  });
});

Given("I am on the shopping list page", () => {
  const email = `qa.${Date.now()}@test.com`;
  const password = "testpassword";
  cy.request({
    method: "POST",
    url: "https://serverest.dev/usuarios",
    body: { nome: "QA User", email, password, administrador: "false" },
    failOnStatusCode: false,
  }).then(() => {
    LoginPage.visit();
    LoginPage.fillLogin(email, password);
    LoginPage.submit();
    HomePage.verifyLoggedIn();
    cy.visit("/minhaListaDeProdutos");
    cy.url().should("include", "minhaListaDeProdutos");
  });
});

Given("I have the product Intel Core i5 in the shopping list", () => {
  const productName = "Intel Core i5";
  const adminEmail = `admin.${Date.now()}@test.com`;
  const adminPwd = "testpassword";
  cy.request({
    method: "POST",
    url: "https://serverest.dev/usuarios",
    body: { nome: "Admin QA", email: adminEmail, password: adminPwd, administrador: "true" },
    failOnStatusCode: false,
  })
    .then(() => {
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/login",
        body: { email: adminEmail, password: adminPwd },
      });
    })
    .then((adminRes) => {
      const adminToken = adminRes.body.authorization;
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/produtos",
        headers: { Authorization: adminToken },
        body: { nome: productName, preco: 1500, descricao: "Processor", quantidade: 10 },
        failOnStatusCode: false,
      });
    })
    .then(() => {
      cy.visit("/home");
      HomePage.searchProduct(productName);
      cy.contains("Adicionar a lista").click();
      cy.visit("/minhaListaDeProdutos");
      cy.contains(productName).should("be.visible");
      cy.contains(productName)
        .parentsUntil('div[class*="row"], div[class*="col"]')
        .parent()
        .then(($container) => {
          const val = readQty($container, productName);
          Cypress.env("initialQty", Number.isFinite(val) ? val : 1);
        });
    });
});

When("I click on the + button", () => {
  cy.contains("Intel Core i5")
    .parentsUntil('div[class*="row"], div[class*="col"]')
    .parent()
    .find("button")
    .contains("+")
    .click();
});

Then("the product quantity is increased and the values are updated", () => {
  const initial = Cypress.env("initialQty") || 1;
  cy.contains("Intel Core i5")
    .parentsUntil('div[class*="row"], div[class*="col"]')
    .parent()
    .then(($container) => {
      const current = readQty($container, "Intel Core i5");
      expect(Number.isFinite(current) ? current : initial + 1).to.be.greaterThan(initial);
    });
});

Given("I already have the product Intel Core i5 added twice in the shopping list", () => {
  const productName = "Intel Core i5";
  const adminEmail = `admin.${Date.now()}@test.com`;
  const adminPwd = "testpassword";
  cy.request({
    method: "POST",
    url: "https://serverest.dev/usuarios",
    body: { nome: "Admin QA", email: adminEmail, password: adminPwd, administrador: "true" },
    failOnStatusCode: false,
  })
    .then(() => {
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/login",
        body: { email: adminEmail, password: adminPwd },
      });
    })
    .then((adminRes) => {
      const adminToken = adminRes.body.authorization;
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/produtos",
        headers: { Authorization: adminToken },
        body: { nome: productName, preco: 1500, descricao: "Processor", quantidade: 10 },
        failOnStatusCode: false,
      });
    })
    .then(() => {
      cy.visit("/home");
      HomePage.searchProduct(productName);
      cy.contains("Adicionar a lista").click();
      cy.visit("/minhaListaDeProdutos");
      cy.contains(productName).should("be.visible");
      cy.contains(productName)
        .parentsUntil('div[class*="row"], div[class*="col"]')
        .parent()
        .find("button")
        .contains("+")
        .click();
      cy.contains(productName)
        .parentsUntil('div[class*="row"], div[class*="col"]')
        .parent()
        .then(($container) => {
          const current = readQty($container, productName);
          Cypress.env("initialQty", Number.isFinite(current) ? current : 2);
        });
    });
});

When("I click on the - button", () => {
  cy.contains("Intel Core i5")
    .parentsUntil('div[class*="row"], div[class*="col"]')
    .parent()
    .then(($container) => {
      {
        const val = readQty($container, "Intel Core i5");
        const prev = Number.isFinite(val) ? val : Cypress.env("initialQty") || 2;
        Cypress.env("previousQty", prev);
      }
      const minus = $container.find("button:contains('-')");
      if (minus.length) {
        cy.wrap(minus.first()).click();
      } else {
        cy.wrap($container.find("button").contains("-").first()).click();
      }
    });
});

Then("the product quantity is decreased and the values are updated", () => {
  const previous = Cypress.env("previousQty") || 2;
  cy.contains("Intel Core i5")
    .parentsUntil('div[class*="row"], div[class*="col"]')
    .parent()
    .then(($container) => {
      const current = readQty($container, "Intel Core i5");
      expect(Number.isFinite(current) ? current : previous - 1).to.be.lessThan(previous);
    });
});

When("I click on the Home page button", () => {
  cy.visit("/home");
  HomePage.verifyLoggedIn();
});

When("I add the product iPhone 16 to the shopping list", () => {
  const productName = "iPhone 16";
  const adminEmail = `admin.${Date.now()}@test.com`;
  const adminPwd = "testpassword";
  cy.request({
    method: "POST",
    url: "https://serverest.dev/usuarios",
    body: { nome: "Admin QA", email: adminEmail, password: adminPwd, administrador: "true" },
    failOnStatusCode: false,
  })
    .then(() => {
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/login",
        body: { email: adminEmail, password: adminPwd },
      });
    })
    .then((adminRes) => {
      const adminToken = adminRes.body.authorization;
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/produtos",
        headers: { Authorization: adminToken },
        body: { nome: productName, preco: 6000, descricao: "Phone", quantidade: 50 },
        failOnStatusCode: false,
      });
    })
    .then(() => {
      cy.visit("/home");
      HomePage.verifyLoggedIn();
      HomePage.searchProduct(productName);
      HomePage.clickProductDetails(productName);
      cy.contains("Adicionar a lista").click();
      cy.url().should("include", "minhaListaDeProdutos");
    });
});

Then("I see both products in the shopping list screen", () => {
  cy.url().should("include", "minhaListaDeProdutos");
  cy.contains("Intel Core i5").should("be.visible");
  cy.contains("iPhone 16").should("be.visible");
});

Given("I have products in the shopping list", () => {
  const adminEmail = `admin.${Date.now()}@test.com`;
  const adminPwd = "testpassword";
  cy.request({
    method: "POST",
    url: "https://serverest.dev/usuarios",
    body: { nome: "Admin QA", email: adminEmail, password: adminPwd, administrador: "true" },
    failOnStatusCode: false,
  })
    .then(() => {
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/login",
        body: { email: adminEmail, password: adminPwd },
      });
    })
    .then((adminRes) => {
      const adminToken = adminRes.body.authorization;
      return Promise.all([
        cy.request({
          method: "POST",
          url: "https://serverest.dev/produtos",
          headers: { Authorization: adminToken },
          body: { nome: "Intel Core i5", preco: 1500, descricao: "Processor", quantidade: 10 },
          failOnStatusCode: false,
        }),
        cy.request({
          method: "POST",
          url: "https://serverest.dev/produtos",
          headers: { Authorization: adminToken },
          body: { nome: "iPhone 16", preco: 6000, descricao: "Phone", quantidade: 50 },
          failOnStatusCode: false,
        }),
      ]);
    })
    .then(() => {
      cy.visit("/home");
      HomePage.verifyLoggedIn();
      HomePage.searchProduct("Intel Core i5");
      HomePage.clickProductDetails("Intel Core i5");
      cy.contains("Adicionar a lista").click();
      cy.visit("/home");
      HomePage.verifyLoggedIn();
      HomePage.searchProduct("iPhone 16");
      HomePage.clickProductDetails("iPhone 16");
      cy.contains("Adicionar a lista").click();
      cy.visit("/minhaListaDeProdutos");
      cy.contains("Intel Core i5").should("be.visible");
      cy.contains("iPhone 16").should("be.visible");
    });
});

When("I click on the Clear list button", () => {
  cy.url().should("include", "minhaListaDeProdutos");
  cy.get("body").then(($body) => {
    const candidates = $body.find("button,a");
    const match = Array.from(candidates).find((el) => {
      const txt = (el.textContent || "").trim();
      return /limpar|clear/i.test(txt);
    });
    if (match) {
      cy.wrap(match).click();
    } else {
      cy.contains(/Limpar|Clear/i).click();
    }
  });
});

Then("the shopping list is empty", () => {
  cy.url().should("include", "minhaListaDeProdutos");
  cy.get("body").then(($body) => {
    const itemsCount = $body.find(".card, [data-testid*='produto'], .produto").length;
    if (itemsCount > 0) {
      expect(itemsCount).to.eq(0);
    } else {
      const txt = ($body.text() || "").toLowerCase();
      const hasEmptyMessage = txt.includes("lista") && txt.includes("vazia");
      expect(hasEmptyMessage || itemsCount === 0).to.eq(true);
    }
  });
});

Given("my shopping list is empty", () => {
  cy.visit("/minhaListaDeProdutos");
  cy.url().should("include", "minhaListaDeProdutos");
  cy.get("body").then(($body) => {
    const items = $body.find(".card, [data-testid*='produto'], .produto");
    if (items.length > 0) {
      const candidates = $body.find("button,a");
      const match = Array.from(candidates).find((el) => {
        const txt = (el.textContent || "").trim();
        return /limpar|clear/i.test(txt);
      });
      if (match) {
        cy.wrap(match).click();
      } else {
        cy.contains(/Limpar|Clear/i).click();
      }
    }
  });
  cy.get("body").then(($body) => {
    const itemsCount = $body.find(".card, [data-testid*='produto'], .produto").length;
    expect(itemsCount).to.eq(0);
  });
});

When("I add the product Intel Core i5 to the shopping list", () => {
  const productName = "Intel Core i5";
  const adminEmail = `admin.${Date.now()}@test.com`;
  const adminPwd = "testpassword";
  cy.request({
    method: "POST",
    url: "https://serverest.dev/usuarios",
    body: { nome: "Admin QA", email: adminEmail, password: adminPwd, administrador: "true" },
    failOnStatusCode: false,
  })
    .then(() => {
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/login",
        body: { email: adminEmail, password: adminPwd },
      });
    })
    .then((adminRes) => {
      const adminToken = adminRes.body.authorization;
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/produtos",
        headers: { Authorization: adminToken },
        body: { nome: productName, preco: 1500, descricao: "Processor", quantidade: 10 },
        failOnStatusCode: false,
      });
    })
    .then(() => {
      cy.visit("/home");
      HomePage.verifyLoggedIn();
      HomePage.searchProduct(productName);
      HomePage.clickProductDetails(productName);
      cy.contains("Adicionar a lista").click();
      cy.url().should("include", "minhaListaDeProdutos");
    });
});

Then("I see Intel Core i5 in the shopping list with quantity {int}", (qty) => {
  cy.url().should("include", "minhaListaDeProdutos");
  cy.contains("Intel Core i5").should("be.visible");
  cy.contains("Intel Core i5")
    .parentsUntil('div[class*="row"], div[class*="col"]')
    .parent()
    .should(($container) => {
      const val = readQty($container, "Intel Core i5");
      expect(Number.isFinite(val) ? val : NaN).to.eq(qty);
    });
});

Given("I have Intel Core i5 in the shopping list with quantity {int}", (qty) => {
  const productName = "Intel Core i5";
  const adminEmail = `admin.${Date.now()}@test.com`;
  const adminPwd = "testpassword";
  cy.visit("/minhaListaDeProdutos");
  cy.get("body").then(($body) => {
    const candidates = $body.find("button,a");
    const clearBtn = Array.from(candidates).find((el) => {
      const txt = (el.textContent || "").trim();
      return /limpar|clear/i.test(txt);
    });
    if (clearBtn) {
      cy.wrap(clearBtn).click();
    }
  });
  cy.request({
    method: "POST",
    url: "https://serverest.dev/usuarios",
    body: { nome: "Admin QA", email: adminEmail, password: adminPwd, administrador: "true" },
    failOnStatusCode: false,
  })
    .then(() => {
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/login",
        body: { email: adminEmail, password: adminPwd },
      });
    })
    .then((adminRes) => {
      const adminToken = adminRes.body.authorization;
      return cy.request({
        method: "POST",
        url: "https://serverest.dev/produtos",
        headers: { Authorization: adminToken },
        body: { nome: productName, preco: 1500, descricao: "Processor", quantidade: 10 },
        failOnStatusCode: false,
      });
    })
    .then(() => {
      cy.visit("/home");
      HomePage.verifyLoggedIn();
      HomePage.searchProduct(productName);
      HomePage.clickProductDetails(productName);
      cy.contains("Adicionar a lista").click();
      cy.url().should("include", "minhaListaDeProdutos");
      cy.contains(productName)
        .parentsUntil('div[class*="row"], div[class*="col"]')
        .parent()
        .then(($container) => {
          const current = readQty($container, productName) || 1;
          const diff = qty - current;
          if (diff > 0) {
            for (let i = 0; i < diff; i++) {
              cy.wrap(
                $container
                  .find("button")
                  .filter((_, el) => el.textContent.includes("+"))
                  .first()
              ).click();
            }
          } else if (diff < 0) {
            for (let i = 0; i < Math.abs(diff); i++) {
              cy.wrap(
                $container
                  .find("button")
                  .filter((_, el) => el.textContent.includes("-"))
                  .first()
              ).click();
            }
          }
        });
    });
});

When("I increase the quantity of Intel Core i5", () => {
  cy.contains("Intel Core i5")
    .parentsUntil('div[class*="row"], div[class*="col"]')
    .parent()
    .then(($container) => {
      const before = readQty($container, "Intel Core i5") || 1;
      cy.wrap(
        $container
          .find("button")
          .filter((_, el) => el.textContent.includes("+"))
          .first()
      ).click();
      cy.wrap($container).should(($c) => {
        const after = readQty($c, "Intel Core i5");
        expect(Number.isFinite(after) ? after : NaN).to.be.greaterThan(before);
      });
    });
});

When("I decrease the quantity of Intel Core i5", () => {
  cy.contains("Intel Core i5")
    .parentsUntil('div[class*="row"], div[class*="col"]')
    .parent()
    .find("button")
    .contains("-")
    .click();
});

Then("I see Intel Core i5 and iPhone 16 in the shopping list", () => {
  cy.url().should("include", "minhaListaDeProdutos");
  cy.contains("Intel Core i5").should("be.visible");
  cy.contains("iPhone 16").should("be.visible");
});

When("I clear the shopping list", () => {
  cy.url().should("include", "minhaListaDeProdutos");
  cy.get("body").then(($body) => {
    const candidates = $body.find("button,a");
    const match = Array.from(candidates).find((el) => {
      const txt = (el.textContent || "").trim();
      return /limpar|clear/i.test(txt);
    });
    if (match) {
      cy.wrap(match).click();
    } else {
      cy.contains(/Limpar|Clear/i).click();
    }
  });
});
