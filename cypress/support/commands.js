// Custom Cypress commands live here.

Cypress.Commands.add('getByTestId', (testId, options) => {
  return cy.get(`[data-testid="${testId}"]`, options);
});

Cypress.Commands.add('containsCaseInsensitive', (selector, text) => {
  const regex = new RegExp(text, 'i');
  return cy.contains(selector, regex);
});

Cypress.Commands.add('safeType', { prevSubject: true }, (subject, text) => {
  return cy.wrap(subject).type(text, { log: false });
});
