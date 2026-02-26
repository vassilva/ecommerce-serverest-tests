class SignupPage {
  elements = {
    nameInput: () => cy.get('[data-testid="nome"]'),
    emailInput: () => cy.get('[data-testid="email"]'),
    passwordInput: () => cy.get('[data-testid="password"]'),
    submitButton: () => cy.get('[data-testid="cadastrar"]'),
    successMessage: () => cy.contains("Cadastro realizado com sucesso"),
  };

  fillForm(name, email, password) {
    this.elements.nameInput().type(name);
    this.elements.emailInput().type(email);
    this.elements.passwordInput().type(password, { log: false });
  }

  submit() {
    this.elements.submitButton().should("be.enabled").click();
  }

  verifySuccessMessage() {
    this.elements.successMessage().should("be.visible", { timeout: 10000 });
  }
}

export default new SignupPage();
