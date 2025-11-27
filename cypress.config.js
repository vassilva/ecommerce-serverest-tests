const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild'); // 👈 alteração aqui!

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://front.serverest.dev',
    specPattern: 'cypress/e2e/features/**/*.feature',
    supportFile: 'cypress/support/e2e.js',
    chromeWebSecurity: false,
    viewportWidth: 1366,
    viewportHeight: 800,

    async setupNodeEvents(on, config) {
      // Registra o preprocessor do Cucumber
      await addCucumberPreprocessorPlugin(on, config);

      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin(config)], // 👈 plugin agora exportado corretamente
        }),
      );

      return config;
    },
  },

  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports/mocha',
    overwrite: false,
    html: true,
    json: true,
    reportTitle: 'E-commerce Serverest - Cypress Report',
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
  },
});
