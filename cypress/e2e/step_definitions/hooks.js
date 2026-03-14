const { Before, After } = require("@badeball/cypress-cucumber-preprocessor");

Before(() => {
  // Limpeza inicial se necessário ou logs de início de teste
  cy.log("Iniciando execução do cenário...");
});

After(() => {
  // Ações de limpeza após cada cenário
  cy.log("Finalizando execução do cenário.");
});
