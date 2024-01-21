import { MountResponse } from 'cypress/angular';

export interface MountResult<T> extends Cypress.Chainable<MountResponse<T>> {
}
