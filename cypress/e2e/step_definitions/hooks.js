const { Before, After } = require("@badeball/cypress-cucumber-preprocessor");
import HomePage from "../../support/pages/HomePage";

Before(() => {
  // Limpeza inicial se necessário ou logs de início de teste
  cy.log("Iniciando execução do cenário...");
});

After(() => {
  // Ações de limpeza após cada cenário
  cy.log("Finalizando execução do cenário.");
  // Garantir logout se estiver logado (para não afetar o próximo teste)
  cy.get("body").then(($body) => {
    if ($body.find('button:contains("Logout"), a:contains("Logout")').length > 0) {
      HomePage.logout(false); // Logout rápido sem espera
    }
  });
});
