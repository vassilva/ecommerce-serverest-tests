const selectors = {
  name: 'nome',
  email: 'email',
  password: 'password',
  fallbackPassword: 'senha',
  submit: 'cadastrar',
};

class RegisterPage {
  navigate() {
    cy.visit('/login');
    // The login page typically has a link/button to the registration page
    cy.contains(/cadastre-se/i).click();
  }

  fillName(name) {
    cy.getByTestId(selectors.name).clear().type(name);
  }

  fillEmail(email) {
    cy.getByTestId(selectors.email).clear().safeType(email);
  }

  fillPassword(password) {
    // Often the register form uses 'password' but on login it may be 'senha'
    // We attempt both to increase robustness.
    cy.getByTestId(selectors.password, { timeout: 2000 }).then(($els) => {
      if ($els.length) {
        cy.wrap($els.first()).clear().safeType(password);
      } else {
        cy.getByTestId(selectors.fallbackPassword).clear().safeType(password);
      }
    });
  }

  submit() {
    // Serverest uses 'cadastrar' on the register submit button
    cy.getByTestId(selectors.submit).click();
  }

  expectSuccessToast() {
    // Validate success message after registration
    cy.contains(/cadastro realizado com sucesso/i, { timeout: 10000 }).should('be.visible');
  }
}

export default new RegisterPage();
