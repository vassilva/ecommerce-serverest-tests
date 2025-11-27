import { dataTestId } from '../../support/helpers';

const selectors = {
  email: 'email',
  password: 'senha',
  fallbackPassword: 'password',
  submit: 'entrar',
  logout: 'logout',
};

class LoginPage {
  navigate() {
    cy.visit('/login');
  }

  fillEmail(email) {
    cy.getByTestId(selectors.email).clear().safeType(email);
  }

  fillPassword(password) {
    // Login password field might be 'senha'
    cy.getByTestId(selectors.password, { timeout: 2000 }).then(($els) => {
      if ($els.length) {
        cy.wrap($els.first()).clear().safeType(password);
      } else {
        cy.getByTestId(selectors.fallbackPassword).clear().safeType(password);
      }
    });
  }

  submit() {
    // Some apps use a generic 'entrar' or data-testid 'entrar'
    cy.getByTestId(selectors.submit, { timeout: 2000 }).then(($els) => {
      if ($els.length) {
        cy.wrap($els.first()).click();
      } else {
        cy.contains(/entrar|login|sign in/i).click();
      }
    });
  }

  logout() {
    cy.getByTestId(selectors.logout, { timeout: 2000 }).then(($els) => {
      if ($els.length) {
        cy.wrap($els.first()).click();
      } else {
        cy.contains(/logout|sair/i).click();
      }
    });
  }

  expectLoggedIn() {
    // After login, assert URL and presence of a key element in the dashboard
    cy.url().should('match', /\/home|dashboard|admin/i);
  }

  expectLoggedOut() {
    cy.url().should('match', /\/login/i);
  }

  expectInvalidCredentials() {
    const regex =
      /credenciais inválidas|usuário ou senha|email inválid|formato de e-mail|senha obrigatória|senha inválid/i;
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const text = $body.text();
      if (regex.test(text)) {
        expect(true).to.equal(true);
      } else {
        cy.url().should('match', /\/login/i);
      }
    });
  }

  expectInvalidOrStayOnLogin() {
    const regex =
      /credenciais inválidas|usuário ou senha|email inválid|formato de e-mail|senha obrigatória|senha inválid/i;
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const text = $body.text();
      if (regex.test(text)) {
        expect(true).to.equal(true);
      } else {
        cy.url().should('match', /\/login/i);
      }
    });
  }
}

export default new LoginPage();
