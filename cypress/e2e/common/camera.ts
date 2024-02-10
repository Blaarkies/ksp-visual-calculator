import { repeatTimes } from './common';

export function moveCamera(x: number, y: number): Cypress.Chainable {
  return cy.get('cp-camera .camera-controller')
    .trigger('mousedown', {buttons: 1})
    .get('cp-camera .camera-controller').trigger('mousemove',
      {movementX: x, movementY: y})
    .get('cp-camera .camera-controller').trigger('mouseup');
}

export function zoom(times: number, direction = -1): Cypress.Chainable {
  if (times < 0) {
    times = -times;
    direction = 1;
  }
  let controller = cy.get('cp-camera .camera-controller');
  return repeatTimes(
    times,
    () => controller
      .trigger('wheel', {deltaY: direction, x: 0, y: 0, force: true, log: false}));
}

export function moveCameraToTarget(doc: Document, win: Window, targetRect: DOMRect) {
  let cameraElement = doc.querySelector('.camera-controller');
  cameraElement.dispatchEvent(new MouseEvent('mousedown', {buttons: 2}));
  cameraElement.dispatchEvent(new MouseEvent('mousemove', {
    movementX: -targetRect.right + win.innerWidth * .5,
    movementY: -targetRect.top + win.innerHeight * .5,
  }));
  cameraElement.dispatchEvent(new MouseEvent('mouseup'));
}
