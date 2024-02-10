import {
  moveCamera,
  zoom,
} from './camera';
import { hasTextAndExists } from './common';

export function testTutorialBase(url: string): Cypress.Chainable {
  cy.window().then(w => {
    w.localStorage.setItem('ksp-visual-calculator-tutorial-viewed', 'false');
  });
  cy.visit(url);

  // First visit dialog
  hasTextAndExists('cp-simple-dialog', 'tutorial');
  cy.get('cp-simple-dialog button[color="primary"]').first().click();

  cy.get('cp-draggable-space-object').should('be.visible');


  // Tutorial start
  hasTextAndExists('cp-wizard-message', 'commnet planner');
  cy.get('cp-wizard-message button[color="primary"]').first().click();


  // Dragging planets
  hasTextAndExists('cp-wizard-message', 'dragging planets');
  cy.get('cp-draggable-space-object div.draggable-body')
    .contains('Eve').first()
    .trigger('pointerdown', {pointerType: 'mouse', force: true})
    .get('cp-universe-map > div').trigger('mousemove',
    {buttons: 1, pageX: 0, pageY: 1000})
    .get('cp-universe-map > div').trigger('mouseup');


  // Moving the camera
  hasTextAndExists('cp-wizard-message', 'moving the camera');
  moveCamera(-500, 5);


  // Zooming in
  hasTextAndExists('cp-wizard-message', 'zooming in');
  return cy.get('cp-draggable-space-object div.draggable-body > div.div-as-image[style*="kerbin"]')
    .first().trigger('mouseenter')
    .then(() => zoom(85),
    );
}
