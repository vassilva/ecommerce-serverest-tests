afterEach(() => {
  cy.location("href", { log: false }).then((href) => {
    if (href.includes("about:blank")) {
      cy.visit("/login");
    }
  });
});
beforeEach(() => {
  cy.location("href", { log: false }).then((href) => {
    if (href.includes("about:blank")) {
      cy.visit("/login");
    }
  });
});
