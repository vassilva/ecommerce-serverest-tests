/**
 * Utilities and helpers used across tests.
 */

export function randomEmail(prefix = 'user') {
  const ts = Date.now();
  return `${prefix}_${ts}@test.com`;
}

export function dataTestId(id) {
  // Encapsulate the common [data-testid="..."] selector
  return `[data-testid="${id}"]`;
}
