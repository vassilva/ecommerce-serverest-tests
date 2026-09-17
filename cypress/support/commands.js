import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";

function getApiUrl() {
  return Cypress.env("apiUrl");
}

function getEndpoint(name) {
  return `${getApiUrl()}${Cypress.env("endpoints")[name]}`;
}

function getUserDefaults(overrides = {}) {
  return { ...Cypress.env("defaultUser"), ...overrides };
}

function getAdminDefaults(overrides = {}) {
  return { ...Cypress.env("defaultAdmin"), ...overrides };
}

function getProductDefaults(overrides = {}) {
  return { ...Cypress.env("defaultProduct"), ...overrides };
}

function assertLoginSuccessMessage(response) {
  return cy.fixture("login").then((loginData) => {
    expect(response.body.message, "Success message").to.eq(loginData.messages.loginSuccess);
  });
}

Cypress.Commands.add("login", (email, password) => {
  LoginPage.visit();
  LoginPage.fillLogin(email, password);
  LoginPage.submit();
  cy.url({ timeout: 15000 }).should("include", "/home");
  HomePage.verifyLoggedIn();
});

Cypress.Commands.add("loginViaUI", (email, password) => {
  cy.login(email, password);
});

// Single reusable place for clearing the app's auth token from localStorage.
// Wrapped in try/catch because some browser contexts (e.g. no active session,
// storage access restricted) can throw on removeItem; that should never fail
// a logout action or the After() cleanup hook that calls this defensively.
Cypress.Commands.add("clearAuthToken", () => {
  return cy.window().then((win) => {
    try {
      win.localStorage.removeItem("serverest/userToken");
    } catch {
      // noop
    }
  });
});

Cypress.Commands.add("apiCreateUser", (userData = {}, options = {}) => {
  const defaults = userData.administrador === "true" ? getAdminDefaults() : getUserDefaults();
  const payload = {
    ...defaults,
    email: userData.email || `qa.${Date.now()}.${Math.floor(Math.random() * 10000)}@test.com`,
    ...userData,
  };

  const failOnStatusCode = options.failOnStatusCode !== undefined ? options.failOnStatusCode : true;

  return cy
    .request({
      method: "POST",
      url: getEndpoint("users"),
      body: payload,
      failOnStatusCode,
    })
    .then((response) => {
      if (options.validateResponse !== false) {
        expect(response.headers["content-type"], "Response content type").to.include(
          "application/json"
        );
        if (failOnStatusCode || response.status === 201) {
          expect(response.status, "User creation status").to.eq(201);
          expect(response.body.message, "Success message").to.eq("Cadastro realizado com sucesso");
          expect(response.body._id, "User ID should exist").to.be.a("string").and.not.empty;
        } else {
          expect(response.status, "User creation status").to.be.oneOf([201, 400, 409]);
          if (response.status === 201) {
            expect(response.body.message, "Success message").to.eq(
              "Cadastro realizado com sucesso"
            );
            expect(response.body._id, "User ID should exist").to.be.a("string").and.not.empty;
          }
        }
      }
      if (response.status === 201 && response.body._id) {
        return cy.trackForCleanup({ type: "user", id: response.body._id }).then(() => {
          return { response, user: payload };
        });
      }
      return { response, user: payload };
    });
});

Cypress.Commands.add("apiLogin", (email, password, options = {}) => {
  const failOnStatusCode = options.failOnStatusCode !== undefined ? options.failOnStatusCode : true;

  return cy
    .request({
      method: "POST",
      url: getEndpoint("login"),
      body: { email, password },
      failOnStatusCode,
    })
    .then((response) => {
      if (options.validateResponse !== false) {
        expect(response.headers["content-type"], "Response content type").to.include(
          "application/json"
        );
        if (failOnStatusCode || response.status === 200) {
          expect(response.status, "Login status").to.eq(200);
          return assertLoginSuccessMessage(response).then(() => {
            expect(response.body.authorization, "Authorization token should exist").to.be.a(
              "string"
            ).and.not.empty;
            return response;
          });
        } else {
          expect(response.status, "Login status").to.be.oneOf([200, 400, 401]);
          if (response.status === 200) {
            return assertLoginSuccessMessage(response).then(() => {
              expect(response.body.authorization, "Authorization token should exist").to.be.a(
                "string"
              ).and.not.empty;
              return response;
            });
          }
        }
      }
      return response;
    });
});

Cypress.Commands.add("apiCreateProduct", (token, productData = {}, options = {}) => {
  const payload = {
    ...getProductDefaults(),
    nome: productData.nome || `Product ${Date.now()}`,
    ...productData,
  };

  const failOnStatusCode = options.failOnStatusCode !== undefined ? options.failOnStatusCode : true;

  return cy
    .request({
      method: "POST",
      url: getEndpoint("products"),
      headers: { Authorization: token },
      body: payload,
      failOnStatusCode,
    })
    .then((response) => {
      if (options.validateResponse !== false) {
        expect(response.headers["content-type"], "Response content type").to.include(
          "application/json"
        );
        if (failOnStatusCode || response.status === 201) {
          expect(response.status, "Product creation status").to.eq(201);
          expect(response.body.message, "Success message").to.eq("Cadastro realizado com sucesso");
          expect(response.body._id, "Product ID should exist").to.be.a("string").and.not.empty;
        } else {
          expect(response.status, "Product creation status").to.be.oneOf([201, 400, 401, 403]);
          if (response.status === 201) {
            expect(response.body.message, "Success message").to.eq(
              "Cadastro realizado com sucesso"
            );
            expect(response.body._id, "Product ID should exist").to.be.a("string").and.not.empty;
          }
        }
      }
      if (response.status === 201 && response.body._id) {
        return cy.trackForCleanup({ type: "product", id: response.body._id, token }).then(() => {
          return { response, product: payload };
        });
      }
      return { response, product: payload };
    });
});

Cypress.Commands.add("apiGetProducts", (options = {}) => {
  const failOnStatusCode = options.failOnStatusCode !== undefined ? options.failOnStatusCode : true;

  return cy
    .request({
      method: "GET",
      url: getEndpoint("products"),
      failOnStatusCode,
    })
    .then((response) => {
      if (options.validateResponse !== false) {
        expect(response.status, "Get products status").to.eq(200);
        expect(response.headers["content-type"], "Response content type").to.include(
          "application/json"
        );
        expect(response.body.quantidade, "Products quantity should exist").to.be.a("number");
        expect(response.body.produtos, "Products array should exist").to.be.an("array");
      }
      return response;
    });
});

Cypress.Commands.add("apiGetUsers", (options = {}) => {
  const failOnStatusCode = options.failOnStatusCode !== undefined ? options.failOnStatusCode : true;

  return cy
    .request({
      method: "GET",
      url: getEndpoint("users"),
      failOnStatusCode,
    })
    .then((response) => {
      if (options.validateResponse !== false) {
        expect(response.status, "Get users status").to.eq(200);
        expect(response.headers["content-type"], "Response content type").to.include(
          "application/json"
        );
        expect(response.body.quantidade, "Users quantity should exist").to.be.a("number");
        expect(response.body.usuarios, "Users array should exist").to.be.an("array");
      }
      return response;
    });
});

Cypress.Commands.add("createAdminAndProduct", (productName) => {
  const adminDefaults = getAdminDefaults();
  const adminEmail = `admin.${Date.now()}.${Math.floor(Math.random() * 10000)}@test.com`;
  const adminPwd = adminDefaults.password;
  const baseName = productName || Cypress.env("searchProductName");
  const uniqueProductName = `${baseName} ${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  return cy
    .apiCreateUser({
      nome: adminDefaults.nome,
      email: adminEmail,
      password: adminPwd,
      administrador: adminDefaults.administrador,
    })
    .then(({ user }) => {
      return cy.apiLogin(user.email, user.password, { failOnStatusCode: true });
    })
    .then((adminRes) => {
      const adminToken = adminRes.body.authorization;
      return cy.apiCreateProduct(adminToken, { nome: uniqueProductName }).then((result) => {
        return { ...result, adminToken };
      });
    });
});

Cypress.Commands.add("createRegularUser", () => {
  return cy.apiCreateUser({}, { validateResponse: false }).then(({ user }) => {
    return cy.wrap({ email: user.email, password: user.password });
  });
});

Cypress.Commands.add("interceptLogin", () => {
  return cy.intercept("POST", `${getEndpoint("login")}**`).as("loginRequest");
});

Cypress.Commands.add("interceptUserRegister", () => {
  return cy.intercept("POST", `${getEndpoint("users")}**`).as("registerRequest");
});

Cypress.Commands.add("interceptProductsSearch", () => {
  return cy.intercept("GET", `${getEndpoint("products")}**`).as("productsSearchRequest");
});

Cypress.Commands.add("interceptProductRegister", () => {
  return cy.intercept("POST", `${getEndpoint("products")}**`).as("productRegisterRequest");
});

Cypress.Commands.add("waitForRequest", (alias, options = {}) => {
  const timeout = options.timeout || Cypress.env("apiWaitTimeout");
  return cy.wait(`@${alias}`, { timeout }).then((interception) => {
    if (options.validateRequest) {
      expect(interception.request, "Request exists").to.exist;
      expect(interception.request.headers, "Request headers should exist").to.exist;
    }
    if (options.validateResponse && interception.response) {
      expect(interception.response.headers["content-type"], "Response content type").to.include(
        "application/json"
      );
    }
    return interception;
  });
});

// --- TEST DATA CLEANUP ---
// Tracks a resource created during the current scenario so it can be removed in After().
// Relies on the "createdResources" alias initialized per-scenario in hooks.js Before().
Cypress.Commands.add("trackForCleanup", (resource) => {
  return cy.get("@createdResources").then((resources) => {
    resources.push(resource);
  });
});

Cypress.Commands.add("apiDeleteUser", (userId, options = {}) => {
  const failOnStatusCode =
    options.failOnStatusCode !== undefined ? options.failOnStatusCode : false;

  return cy.request({
    method: "DELETE",
    url: `${getEndpoint("users")}/${userId}`,
    failOnStatusCode,
  });
});

Cypress.Commands.add("apiDeleteProduct", (productId, token, options = {}) => {
  const failOnStatusCode =
    options.failOnStatusCode !== undefined ? options.failOnStatusCode : false;

  return cy.request({
    method: "DELETE",
    url: `${getEndpoint("products")}/${productId}`,
    headers: token ? { Authorization: token } : undefined,
    failOnStatusCode,
  });
});
