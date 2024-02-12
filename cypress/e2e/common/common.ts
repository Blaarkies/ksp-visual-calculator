export function hasTextAndExists(selector: string, text: string): Cypress.Chainable {
  return cy.get(selector).contains(text, {matchCase: false})
    .should('exist');
}

export function repeatTimes(count: number, callback: () => Cypress.Chainable): Cypress.Chainable {
  let result = callback();
  return count
    ? repeatTimes(count - 1, callback)
    : result;
}

export function repeatUntil(predicate: () => boolean, callback: () => Cypress.Chainable): Cypress.Chainable {
  let result = callback();
  return predicate()
    ? result
    : repeatUntil(predicate, callback);
}
