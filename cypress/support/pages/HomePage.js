class HomePage {
  elements = {
    logoutButton: () => cy.get('[data-testid="logout"]'),
    searchInput: () => cy.get('[data-testid="pesquisar"]'),
    searchButton: () => cy.get('[data-testid="botaoPesquisar"]'),
    productCardByName: (name) =>
      cy
        .contains('[class*="card"] [class*="title"], [class*="card"] h5, [class*="card"] h3', name)
        .closest(".card"),
    detailsLinkInCard: ($card) => cy.wrap($card).find("a[href*='detalhesProduto']").first(),
  };

  visit() {
    cy.visit("/home");
  }

  verifyLoggedIn() {
    cy.url({ timeout: 10000 }).should("include", "/home");
    this.elements.logoutButton().should("be.visible");
  }

  waitForPageReady() {
    this.elements.searchInput().should("be.visible");
    this.elements.searchButton().should("be.enabled");
  }

  searchProduct(productName) {
    this.elements.searchInput().should("be.visible").clear().type(productName);
    this.elements.searchButton().should("be.enabled").click();
  }

  findCardByProductName(productName) {
    return this.elements.productCardByName(productName).should("exist").and("be.visible");
  }

  clickProductDetails(productName) {
    this.findCardByProductName(productName).then(($card) => {
      this.elements.detailsLinkInCard($card).should("exist").and("be.visible").click();
    });
    cy.url({ timeout: 10000 }).should("include", "/detalhesProduto/");
  }

  verifyNoProductsFoundOrEmptyList() {
    cy.get("body").then(($body) => {
      const hasNoResultsMessage =
        $body.is(":contains('Nenhum produto encontrado')") ||
        $body.is(":contains('Nenhum resultado')") ||
        $body.is(":contains('Não encontrado')") ||
        $body.find('[class*="card"]').length === 0;
      expect(hasNoResultsMessage, "Should display no results or empty list").to.be.true;
    });
  }

  searchAndOpenProductDetails(productName) {
    this.visit();
    this.waitForPageReady();
    this.searchProduct(productName);
    this.findCardByProductName(productName);
    this.clickProductDetails(productName);
  }

  logout() {
    this.elements.logoutButton().should("be.visible").click();
    cy.url().should("include", "/login");
  }
}

export default new HomePage();
