class LoginPage {
  visit() {
    cy.visit("/login");
  }

  clickSignUp() {
    cy.contains("Cadastre-se").click();
  }

  fillLogin(email, password) {
    cy.get('[data-testid="email"]').type(email);
    cy.get('[data-testid="senha"]').type(password, { log: false });
  }

  submit() {
    cy.get('[data-testid="entrar"]').should("be.enabled").click();
  }

  verifyErrorMessage(message) {
    cy.contains(message).should("be.visible");
  }
}

export default new LoginPage();
