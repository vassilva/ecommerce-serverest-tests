class ProductDetailsPage {
  elements = {
    addToListButton: () =>
      cy
        .fixture("products")
        .then((productsData) => cy.contains(productsData.labels.addToListButton)),
  };

  verifyDetailsPageDisplayed() {
    cy.url().should("include", "/detalhesProduto/");
  }

  addToShoppingList() {
    this.elements.addToListButton().should("be.visible").click();
    cy.url({ timeout: 10000 }).should("include", "minhaListaDeProdutos");
  }
}

export default new ProductDetailsPage();
