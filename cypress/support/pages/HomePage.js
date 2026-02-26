class HomePage {
  elements = {
    logoutButton: () => cy.contains("Logout"),
    searchInput: () => cy.get('[data-testid="pesquisar"]'),
    searchButton: () => cy.get('[data-testid="botaoPesquisar"]'),
    productList: () => cy.get(".card"),
  };

  visit() {
    cy.visit("/home");
  }

  verifyLoggedIn() {
    cy.url({ timeout: 10000 }).should("include", "/home");
    this.elements.logoutButton().should("be.visible");
  }

  searchProduct(productName) {
    this.elements.searchInput().clear().type(productName);
    this.elements.searchButton().click();
  }

  clickProductDetails(productName) {
    // Try to find the link near the product name, regardless of container class
    cy.contains(productName)
      .parentsUntil('div[class*="col"]')
      .find("a[href*='detalhesProduto']")
      .first()
      .click();
  }

  addProductToList(productName) {
    // Try to find the button near the product name
    cy.contains(productName)
      .parentsUntil('div[class*="col"]')
      .find("button")
      .contains("Adicionar a lista")
      .click();
  }

  logout(wait = true) {
    if (wait) {
      cy.then(() => new Promise((resolve) => setTimeout(resolve, 2000)));
    }
    cy.window().then((win) => {
      try {
        win.localStorage.removeItem("serverest/userToken");
      } catch {}
    });
    cy.visit("/login");
    cy.url().should("include", "/login");
  }
}

export default new HomePage();
