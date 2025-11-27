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

export function randomPassword() {
  const base = Math.random().toString(36).slice(-8);
  const ts = Date.now().toString().slice(-4);
  return `P@${base}${ts}!`;
}
