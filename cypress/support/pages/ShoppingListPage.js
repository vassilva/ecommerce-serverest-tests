class ShoppingListPage {
  elements = {
    productInShoppingList: (name) => cy.contains('[data-testid="shopping-cart-product-name"]', name),
    qtyContainerByProduct: (name) => cy.contains(name).closest(".card"),
    qtyIncreaseButton: ($container) =>
      cy.wrap($container).find('[data-testid="product-increase-quantity"]'),
    qtyDecreaseButton: ($container) =>
      cy.wrap($container).find('[data-testid="product-decrease-quantity"]'),
    quantityElement: ($container) =>
      cy.wrap($container).find('[data-testid="product-increase-quantity"]').prev(),
    clearListButton: () =>
      cy.fixture("products").then((productsData) => {
        const selector = productsData.labels.clearListButtonLabels
          .map((label) => `button:contains("${label}")`)
          .join(", ");
        return cy.get(selector).first();
      }),
    emptyListMessage: () =>
      cy.contains(/Sua lista está vazia|Seu carrinho está vazio|Lista vazia|Carrinho vazio/i),
  };

  verifyProductInShoppingList(productName) {
    cy.url().should("include", "minhaListaDeProdutos");
    this.elements.productInShoppingList(productName).should("be.visible");
  }

  verifyBothProductsInShoppingList(firstProduct, secondProduct) {
    cy.url().should("include", "minhaListaDeProdutos");
    this.elements.productInShoppingList(firstProduct).should("be.visible");
    this.elements.productInShoppingList(secondProduct).should("be.visible");
  }

  clearShoppingList() {
    cy.url().should("include", "minhaListaDeProdutos");
    this.elements.clearListButton().should("be.visible").click();
  }

  verifyShoppingListEmpty(productName) {
    this.elements.emptyListMessage().should("be.visible");
    this.elements.productInShoppingList(productName).should("not.exist");
  }

  increaseProductQuantity(productName) {
    this.elements.qtyContainerByProduct(productName).then(($container) => {
      this.elements.qtyIncreaseButton($container).should("be.visible").click();
    });
  }

  decreaseProductQuantity(productName) {
    this.elements.qtyContainerByProduct(productName).then(($container) => {
      this.elements.qtyDecreaseButton($container).should("be.visible").click();
    });
  }

  readProductQuantity(productName) {
    return this.elements.qtyContainerByProduct(productName).then(($container) => {
      return this.elements
        .quantityElement($container)
        .invoke("text")
        .then((raw) => {
          const n = Number(raw);
          if (Number.isFinite(n)) return n;
          const m = String(raw).match(/\b\d+\b/);
          return m ? Number(m[0]) : NaN;
        });
    });
  }

  verifyProductQuantityEquals(productName, value) {
    this.readProductQuantity(productName).then((qty) => {
      expect(qty, `Quantity of ${productName} should be ${value}`).to.eq(value);
    });
  }
}

export default new ShoppingListPage();
