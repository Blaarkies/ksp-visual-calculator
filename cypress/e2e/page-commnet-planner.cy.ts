import {
  moveCamera,
  moveCameraToTarget,
  zoom,
} from './common/camera';
import { hasTextAndExists } from './common/common';
import { testTutorialBase } from './common/tutorial';

describe('Page CommNet Planner', () => {

  beforeEach(() => {
    cy.clearAllLocalStorage();
  });

  it.skip('page exists', () => {
    cy.visit('/commnet-planner');
    cy.get('cp-page-commnet-planner').should('exist');
  });

  it.skip('navigation menu works', () => {
    cy.window().then(w => {
      w.localStorage.setItem('ksp-visual-calculator-tutorial-viewed', 'true');
    });
    cy.visit('/commnet-planner');

    cy.get('cp-action-panel[color="green"]').first().click();

    cy.get('mat-list-item').first().should('contain.text', 'Introduction');
    cy.get('mat-list-item').first().click({multiple: false});

    cy.url().should('include', 'intro');
  });

  it('tutorial works', () => {
    testTutorialBase('/commnet-planner');


    // Adding spacecraft
    hasTextAndExists('cp-wizard-message', 'adding spacecraft');
    addCraft('craft1', 'Communotron 16', true);

    // Changing Communication Lines
    hasTextAndExists('cp-wizard-message', 'changing communication lines');
    moveCamera(0, 300);


    // Relay Satellites
    hasTextAndExists('cp-wizard-message', 'relay satellites');
    addCraft('craft2', 'ra-2 relay');


    // Relaying Signals
    hasTextAndExists('cp-wizard-message', 'relaying signals');
    moveCamera(0, 300);

    cy.get('cp-draggable-space-object')
      .contains('craft1', {matchCase: false})
      .then(e => e.siblings('div')).first()
      .trigger('pointerdown', {pointerType: 'mouse'})
      .get('cp-universe-map > div').trigger('mousemove',
      {buttons: 1, pageX: 530, pageY: 700})
      .get('cp-universe-map > div').trigger('mouseup');

    zoom(35);
    cy.document()
      .then(doc => cy.window().then(win => ({doc, win})))
      .then(pack => cy.get('cp-draggable-space-object')
        .contains('craft1', {matchCase: false})
        .then(e => ({...pack, e: e.get()[0].getBoundingClientRect()}))
      )
      .then(({doc, win, e}) => moveCameraToTarget(doc, win, e))

    // The End
    hasTextAndExists('cp-wizard-message', 'The End');
    cy.get('cp-wizard-message button').contains('ok', {matchCase: false})
      .click();
    cy.get('cp-wizard-message').should('not.exist');
  });

});

function addCraft(craftName: string, antennaName: string, waitAfterOpen = false): Cypress.Chainable {
  cy.get('mat-list-item[data-action-item-id="New Craft"]')
    .should('have.length.gte', 0)
    .then(list => {
      if (list.length) {
        list[0].click();
        return list;
      }

      return cy.get('button').contains('CommNet Planner')
        .click()
        .get('mat-list-item[data-action-item-id="New Craft"]')
        .click();
    });

  cy.get('cp-craft-details-dialog').should('exist');
  if (waitAfterOpen) {
    hasTextAndExists('cp-wizard-message', 'Selecting Antenna Types');
  }

  cy.get('mat-option').should('have.length.gte', 0)
    .then(list => {
      if (list.length) {
        list[0].click();
        return list;
      }

      return cy.get('cp-input-select[label="Antenna Type"]  mat-select')
        .click({force: true})
        .get('mat-option').contains(antennaName, {matchCase: false})
        .click();
    });

  cy.get('input')
    .filter((_, element: HTMLInputElement) =>
      element.value === 'Untitled Space Craft')
    .clear()
    .type(craftName, {force: true});

  return cy.get('button').contains('Create')
    .click();
}
