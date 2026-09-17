class LoginPage {
  visit() {
    cy.visit("/login");
  }

  clickSignUp() {
    cy.fixture("login").then((loginData) => {
      cy.contains(loginData.labels.signUpLink).click();
    });
  }

  fillLogin(email, password) {
    if (email !== "") {
      cy.get('[data-testid="email"]').type(email);
    }
    if (password !== "") {
      cy.get('[data-testid="senha"]').type(password, { log: false });
    }
  }

  submit() {
    cy.get('[data-testid="entrar"]').should("be.enabled").click();
  }

  verifyErrorMessage(message) {
    cy.contains(message).should("be.visible");
  }

  verifyLoginPageDisplayed() {
    cy.url().should("include", "/login");
    cy.get('h1, button, [data-testid="entrar"]')
      .contains(/Entrar|Login/i)
      .should("be.visible");
  }
}

export default new LoginPage();
