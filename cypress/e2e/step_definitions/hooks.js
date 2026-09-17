const { Before, After } = require("@badeball/cypress-cucumber-preprocessor");

Before(() => {
  cy.log("Starting scenario execution...");

  cy.clearCookies();
  cy.clearLocalStorage();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });

  // Resources created via cy.trackForCleanup() during this scenario, removed in After().
  cy.wrap([], { log: false }).as("createdResources");
});

After(() => {
  cy.log("Finishing scenario execution.");

  // Delete only what this scenario created. Products are removed before their owning
  // admin user, since deleting the user first would invalidate the token needed to
  // delete the product. failOnStatusCode is false on the delete commands so an
  // already-removed resource (404) doesn't fail this hook or mask the real test result.
  cy.get("@createdResources", { log: false }).then((resources) => {
    const products = resources.filter((resource) => resource.type === "product");
    const users = resources.filter((resource) => resource.type === "user");

    products.forEach((product) => {
      cy.apiDeleteProduct(product.id, product.token);
    });

    users.forEach((user) => {
      cy.apiDeleteUser(user.id);
    });
  });

  cy.get("body").then(($body) => {
    const logoutBtn = $body.find(
      'button:contains("Logout"), a:contains("Logout"), button:contains("Sair"), a:contains("Sair")'
    );
    if (logoutBtn.length > 0) {
      cy.clearAuthToken();
      cy.visit("/login");
      cy.url().should("include", "/login");
    }
  });
});
