const { Given, When, Then } = require("@badeball/cypress-cucumber-preprocessor");
import HomePage from "../../support/pages/HomePage";
import ProductDetailsPage from "../../support/pages/ProductDetailsPage";
import ShoppingListPage from "../../support/pages/ShoppingListPage";

Given("the products search API is being intercepted", () => {
  cy.interceptProductsSearch();
});

Given("the user is logged into the system", () => {
  const baseProductName = Cypress.env("searchProductName");
  cy.createAdminAndProduct(baseProductName).then((result) => {
    cy.wrap(result.product.nome).as("primaryProductName");
  });
  cy.createRegularUser().then((user) => {
    cy.loginViaUI(user.email, user.password);
  });
});

Given("the user is on the home page", () => {
  HomePage.visit();
  HomePage.verifyLoggedIn();
});

Given("a product has already been added to the shopping list", () => {
  cy.get("@primaryProductName").then((productName) => {
    HomePage.searchAndOpenProductDetails(productName);
    ProductDetailsPage.addToShoppingList();
  });
});

Given("a product has been added to the shopping list with quantity greater than one", () => {
  cy.get("@primaryProductName").then((productName) => {
    HomePage.searchAndOpenProductDetails(productName);
    ProductDetailsPage.addToShoppingList();
    ShoppingListPage.increaseProductQuantity(productName);
  });
});

When("an admin creates a new product via API call", () => {
  const productName = Cypress.env("searchProductName");
  cy.createAdminAndProduct(productName).then((result) => {
    cy.wrap(result.response).as("lastApiProductResponse");
  });
});

Given("an authenticated admin user is available via the API", () => {
  const adminDefaults = Cypress.env("defaultAdmin");
  const adminEmail = `admin.${Date.now()}.${Math.floor(Math.random() * 10000)}@test.com`;

  cy.apiCreateUser(
    {
      nome: adminDefaults.nome,
      email: adminEmail,
      password: adminDefaults.password,
      administrador: adminDefaults.administrador,
    },
    { validateResponse: false }
  )
    .then(() => cy.apiLogin(adminEmail, adminDefaults.password, { failOnStatusCode: true }))
    .then((loginResponse) => {
      cy.wrap(loginResponse.body.authorization).as("adminToken");
    });
});

When("invalid product data is submitted through the product API", () => {
  cy.get("@adminToken").then((adminToken) => {
    cy.fixture("products").then((productsData) => {
      cy.apiCreateProduct(
        adminToken,
        {
          nome: productsData.invalidProductData.emptyName,
          preco: productsData.invalidProductData.negativePrice,
          quantidade: productsData.invalidProductData.negativeQuantity,
        },
        { failOnStatusCode: false, validateResponse: false }
      ).then((result) => {
        cy.wrap(result.response).as("invalidProductResponse");
      });
    });
  });
});

When("the products list is fetched via API call", () => {
  cy.apiGetProducts({ validateResponse: false }).then((response) => {
    cy.wrap(response).as("lastApiProductListResponse");
  });
});

When("the user searches for a valid product in the search bar", () => {
  cy.get("@primaryProductName").then((productName) => {
    HomePage.waitForPageReady();
    HomePage.searchProduct(productName);
    HomePage.elements.productCardByName(productName).should("be.visible");
  });
});

When("the user searches for a nonexistent product in the search bar", () => {
  cy.fixture("products").then((productsData) => {
    cy.intercept({
      method: "GET",
      pathname: "/produtos",
      query: { nome: productsData.nonexistentProduct },
    }).as("nonexistentProductSearch");

    HomePage.visit();
    HomePage.waitForPageReady();
    HomePage.searchProduct(productsData.nonexistentProduct);

    cy.wait("@nonexistentProductSearch").then((interception) => {
      cy.wrap(interception).as("nonexistentProductSearchInterception");
    });
  });
});

When("the user selects the product Intel Core i5 directly from the list on the home page", () => {
  cy.get("@primaryProductName").then((productName) => {
    HomePage.clickProductDetails(productName);
  });
});

When("the user adds a product to the shopping list", () => {
  cy.get("@primaryProductName").then((productName) => {
    HomePage.searchAndOpenProductDetails(productName);
    ProductDetailsPage.addToShoppingList();
  });
});

When("the user adds another different product to the shopping list", () => {
  const baseSecondaryName = Cypress.env("secondaryProductName");
  cy.createAdminAndProduct(baseSecondaryName).then((result) => {
    const productName = result.product.nome;
    cy.wrap(productName).as("secondaryProductName");
    HomePage.searchAndOpenProductDetails(productName);
    ProductDetailsPage.addToShoppingList();
  });
});

When("the user clears the shopping list", () => {
  ShoppingListPage.clearShoppingList();
});

When("the user increases the product quantity", () => {
  cy.get("@primaryProductName").then((productName) => {
    ShoppingListPage.increaseProductQuantity(productName);
  });
});

When("the user decreases the product quantity", () => {
  cy.get("@primaryProductName").then((productName) => {
    ShoppingListPage.decreaseProductQuantity(productName);
  });
});

Then("the products search API request should succeed with status 200", () => {
  cy.waitForRequest("productsSearchRequest", { validateResponse: true }).then((interception) => {
    expect(interception.response, "Products search response should exist").to.exist;
    expect(interception.response.statusCode, "Products search status").to.eq(200);
    expect(interception.response.headers["content-type"], "Response content type").to.include(
      "application/json"
    );
  });
});

Then("the products search API response should contain the searched product", () => {
  cy.get("@primaryProductName").then((productName) => {
    cy.get("@productsSearchRequest")
      .its("response.body")
      .then((body) => {
        expect(body.produtos, "Products array should exist").to.be.an("array");
        const found = body.produtos.some((p) =>
          p.nome.toLowerCase().includes(productName.toLowerCase())
        );
        expect(found, `Product '${productName}' should be in the results`).to.be.true;
      });
  });
});

Then("the matching product should be displayed in the results", () => {
  cy.get("@primaryProductName").then((productName) => {
    cy.contains(productName, { timeout: 15000 }).should("be.visible");
  });
});

Then("the nonexistent product search API response should confirm zero results", () => {
  cy.get("@nonexistentProductSearchInterception").then((interception) => {
    expect(interception.response.statusCode, "Nonexistent product search status").to.eq(200);
    expect(interception.response.body.quantidade, "Products quantity").to.eq(0);
    expect(interception.response.body.produtos, "Products array").to.be.an("array");
    expect(interception.response.body.produtos.length, "Products array length").to.eq(0);
  });
});

Then("a message indicating no products found should be displayed", () => {
  HomePage.verifyNoProductsFoundOrEmptyList();
});

Then("the product details page should be displayed", () => {
  ProductDetailsPage.verifyDetailsPageDisplayed();
});

Then("the product should be displayed in the shopping list", () => {
  cy.get("@primaryProductName").then((productName) => {
    ShoppingListPage.verifyProductInShoppingList(productName);
  });
});

Then("both products should be displayed in the shopping list", () => {
  cy.get("@primaryProductName").then((primaryName) => {
    cy.get("@secondaryProductName").then((secondaryName) => {
      ShoppingListPage.verifyBothProductsInShoppingList(primaryName, secondaryName);
    });
  });
});

Then("the shopping list should be empty", () => {
  cy.get("@primaryProductName").then((productName) => {
    ShoppingListPage.verifyShoppingListEmpty(productName);
  });
});

Then("the product quantity should be updated", () => {
  cy.get("@primaryProductName").then((productName) => {
    ShoppingListPage.verifyProductQuantityEquals(productName, 2);
  });
});

Then("the product quantity should be reduced to one", () => {
  cy.get("@primaryProductName").then((productName) => {
    ShoppingListPage.verifyProductQuantityEquals(productName, 1);
  });
});

Then("the product creation API response should have correct status and headers", () => {
  cy.fixture("api").then((apiData) => {
    cy.get("@lastApiProductResponse").then((lastApiProductResponse) => {
      expect(lastApiProductResponse.status, "Product creation status").to.eq(
        apiData.success.productCreated
      );
      expect(lastApiProductResponse.headers["content-type"], "Content-Type header").to.include(
        "application/json"
      );
      expect(lastApiProductResponse.body._id, "Product ID").to.be.a("string").and.not.empty;
    });
  });
});

Then("the products list API response should have correct structure and status", () => {
  cy.fixture("api").then((apiData) => {
    cy.get("@lastApiProductListResponse").then((lastApiProductListResponse) => {
      expect(lastApiProductListResponse.status, "Products list status").to.eq(
        apiData.success.getSuccess
      );
      expect(lastApiProductListResponse.headers["content-type"], "Content-Type header").to.include(
        "application/json"
      );
      expect(lastApiProductListResponse.body.quantidade, "Products count").to.be.a("number");
      expect(lastApiProductListResponse.body.produtos, "Products array").to.be.an("array");
      expect(lastApiProductListResponse.body.produtos.length, "Products array length").to.eq(
        lastApiProductListResponse.body.quantidade
      );
    });
  });
});

Then(
  "product creation should be rejected with validation errors for name, price and quantity",
  () => {
    cy.fixture("products").then((productsData) => {
      cy.get("@invalidProductResponse").then((response) => {
        expect(response.status, "Invalid product creation status").to.eq(400);
        expect(response.body.nome, "Name validation message").to.eq(
          productsData.invalidProductMessages.nome
        );
        expect(response.body.preco, "Price validation message").to.eq(
          productsData.invalidProductMessages.preco
        );
        expect(response.body.quantidade, "Quantity validation message").to.eq(
          productsData.invalidProductMessages.quantidade
        );
      });
    });
  }
);
