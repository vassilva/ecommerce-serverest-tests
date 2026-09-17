const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const { addCucumberPreprocessorPlugin } = require("@badeball/cypress-cucumber-preprocessor");
const { createEsbuildPlugin } = require("@badeball/cypress-cucumber-preprocessor/esbuild");

module.exports = defineConfig({
  e2e: {
    specPattern: "cypress/e2e/features/**/*.feature",
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);
      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      );
      return config;
    },
    baseUrl: "https://front.serverest.dev",
    downloadsFolder: "cypress/downloads",
    screenshotsFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",
    fixturesFolder: "cypress/fixtures",
    supportFolder: "cypress/support",
    env: {
      apiUrl: "https://serverest.dev",
      endpoints: {
        users: "/usuarios",
        login: "/login",
        products: "/produtos",
        carts: "/carrinhos",
      },
      defaultUser: {
        nome: "QA User",
        password: "testpassword",
        administrador: "false",
      },
      defaultAdmin: {
        nome: "Admin QA",
        password: "testpassword",
        administrador: "true",
      },
      defaultProduct: {
        preco: 1500,
        descricao: "Automated Product",
        quantidade: 100,
      },
      searchProductName: "Intel Core i5",
      secondaryProductName: "iPhone 16",
      existingEmail: "fulano@qa.com",
      apiWaitTimeout: 15000,
    },
  },
});
