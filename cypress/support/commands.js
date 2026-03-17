import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

Cypress.Commands.add('login', (email, password) => {
  LoginPage.visit();
  LoginPage.fillLogin(email, password);
  LoginPage.submit();
  cy.url({ timeout: 15000 }).should('include', '/home');
  HomePage.verifyLoggedIn();
});

Cypress.Commands.add('loginViaUI', (email, password) => {
  cy.login(email, password);
});

Cypress.Commands.add('createAdminAndProduct', (productName) => {
  const adminEmail = `admin.${Date.now()}.${Math.floor(Math.random() * 10000)}@test.com`;
  const adminPwd = 'testpassword';

  return cy.request({
    method: 'POST',
    url: 'https://serverest.dev/usuarios',
    body: { nome: 'Admin QA', email: adminEmail, password: adminPwd, administrador: 'true' },
    failOnStatusCode: false,
  }).then(() => {
    return cy.request({
      method: 'POST',
      url: 'https://serverest.dev/login',
      body: { email: adminEmail, password: adminPwd },
    });
  }).then((adminRes) => {
    const adminToken = adminRes.body.authorization;
    return cy.request({
      method: 'POST',
      url: 'https://serverest.dev/produtos',
      headers: { Authorization: adminToken },
      body: { nome: productName, preco: 1500, descricao: 'Automated Product', quantidade: 100 },
      failOnStatusCode: false,
    });
  });
});

Cypress.Commands.add('createRegularUser', () => {
  const userEmail = `qa.${Date.now()}.${Math.floor(Math.random() * 10000)}@test.com`;
  const userPassword = 'testpassword';

  return cy.request({
    method: 'POST',
    url: 'https://serverest.dev/usuarios',
    body: { nome: 'QA User', email: userEmail, password: userPassword, administrador: 'false' },
    failOnStatusCode: false,
  }).then(() => {
    return cy.wrap({ email: userEmail, password: userPassword });
  });
});
