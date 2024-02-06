import {
  Component,
  Input,
} from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MountResponse } from 'cypress/angular';
import { InputFieldComponent } from '../input-field/input-field.component';
import { InputAngleComponent } from './input-angle.component';

describe('InputAngleComponent', () => {

  @Component({
    selector: 'contain-test', standalone: true,
    template: '<cp-input-angle [formControl]="control" [label]="label"/>',
    imports: [InputAngleComponent, ReactiveFormsModule],
  })
  class Containment {
    @Input() label;
    control = new FormControl(null);
  }

  function createContainment() {
    return cy.mount(Containment, {
      providers: [
        {provide: Document, useValue: document},
      ],
      imports: [NoopAnimationsModule],
    });
  }

  describe('if basic', () => {

    let mr: MountResponse<Containment>;
    beforeEach(() => createContainment().then(m => mr = m));

    it('exists', () => {
      cy.get('div.input-angle-layout').should('exist');
    });

    it('displays label when provided', () => {
      let testLabel = 'test';
      mr.component.label = testLabel;
      mr.fixture.detectChanges();
      cy.get('div.label').should('contain.text', testLabel);
    });

    it('is responsive to mouse click&move', () => {
      let control = new FormControl(0);
      mr.component.control = control;

      cy.get('div.hand-container')
        .trigger('pointerdown')
        .then(() => cy.get('body'))
        .trigger('pointermove', {
          buttons: 1,
          pageX: 50, pageY: 50,
          pointerType: 'mouse',
        })
        .then(() => expect(control.value).to.not.equal(0));
    });

    it('is responsive to touch drag', () => {
      let control = new FormControl(0);
      mr.component.control = control;

      cy.get('div.hand-container')
        .trigger('pointerdown')
        .then(() => cy.get('body'))
        .trigger('pointermove', {
          pageX: 50, pageY: 50,
          pointerType: 'touch',
        })
        .then(() => expect(control.value).to.not.equal(0));
    });

    it('focuses the input when focus() is called', () => {
      let inputAngleComponent = mr.fixture.debugElement
        .query(By.directive(InputAngleComponent));
      let inputFieldComponent = mr.fixture.debugElement
        .query(By.directive(InputFieldComponent));
      inputFieldComponent.componentInstance.focus = cy.spy();

      inputAngleComponent.componentInstance.focus();
      expect(inputFieldComponent.componentInstance.focus).to.have.been.calledOnce;
    });

    it('given a form control, it displays the value', () => {
      let testValue = 42;
      let control = new FormControl(testValue);
      mr.component.control = control;
      mr.fixture.detectChanges();

      cy.cssVar('--angle', 'div.hand-container').should('equal', '-42');
      cy.get('input').should('have.value', 42);
    });

    it('setting a form control value should alter the display value', () => {
      let control = new FormControl(0);
      mr.component.control = control;
      mr.fixture.detectChanges();

      let testValue = 42;
      control.setValue(testValue);
      mr.fixture.detectChanges();

      cy.cssVar('--angle', 'div.hand-container').should('equal', '-42');
      cy.get('input').should('have.value', 42);
    });

  });

  describe('if disabled/enable', () => {

    let mr: MountResponse<Containment>;
    beforeEach(() => createContainment().then(m => mr = m));

    it('is enabled given enabled control', () => {
      let control = new FormControl(null);
      mr.component.control = control;

      mr.fixture.detectChanges();

      let dial = mr.fixture.debugElement.query(By.css('div.dial-and-input'));
      let classList = Array.from(dial.nativeElement.classList);
      expect(classList).to.not.contain('disabled');
    });

    it('is disabled given disabled control', () => {
      let control = new FormControl(null);
      control.disable();
      mr.component.control = control;

      mr.fixture.detectChanges();

      let dial = mr.fixture.debugElement.query(By.css('div.dial-and-input'));
      let classList = Array.from(dial.nativeElement.classList);
      expect(classList).to.contain('disabled');
    });

    it('does disable when control disables', () => {
      let control = new FormControl(null);
      mr.component.control = control;

      mr.fixture.detectChanges();

      control.disable();

      mr.fixture.detectChanges();

      let dial = mr.fixture.debugElement.query(By.css('div.dial-and-input'));
      let classList = Array.from(dial.nativeElement.classList);
      expect(classList).to.contain('disabled');
    });

    it('is unresponsive when disabled', () => {
      let control = new FormControl(0);
      control.disable();
      mr.component.control = control;
      mr.fixture.detectChanges();

      cy.get('div.hand-container')
        .should('have.css', 'pointer-events', 'none');
    });

    it('when disabled, does nothing when focus() is called', () => {
      let control = new FormControl(0);
      control.disable();
      mr.component.control = control;

      mr.fixture.detectChanges();

      let inputAngleComponent = mr.fixture.debugElement
        .query(By.directive(InputAngleComponent));
      let inputFieldComponent = mr.fixture.debugElement
        .query(By.directive(InputFieldComponent));
      inputFieldComponent.componentInstance.focus = cy.spy();

      inputAngleComponent.componentInstance.focus();
      expect(inputFieldComponent.componentInstance.focus).to.not.have.been.called;
    });

  });

  describe('if user inputs', () => {

    let mr: MountResponse<Containment>;
    beforeEach(() => createContainment().then(m => mr = m));

    it('typing into input updates dial and value', () => {
      cy.get('input')
        .type('42').then(() => {
        mr.fixture.detectChanges();

        cy.cssVar('--angle', 'div.hand-container').should('equal', '-42');
        let inputAngleComponent = mr.fixture.debugElement.query(By.directive(InputAngleComponent));
        expect(inputAngleComponent.componentInstance.value).to.equal(42);
      });
    });

    function measurePointerInput(offset: number[], isTouch: boolean): Cypress.Chainable<JQuery<HTMLBodyElement>> {
      let makePointermoveOptions = (center: number[]) => {
        let base = {
          // drag to SSW
          pageX: center[0] + offset[0], pageY: center[1] + offset[1],
        };
        return isTouch
          ? {...base, pointerType: 'touch'}
          : {...base, pointerType: 'mouse', buttons: 1};
      };

      return cy.get('div.hand-container')
        .then(e => e.get()[0].getBoundingClientRect())
        .then(rect => [rect.x + rect.width / 2, rect.y + rect.height / 2])
        .then(center => cy.get('div.hand-container')
          .trigger('pointerdown').then(() => center))
        .then(center => cy.get('body')
          .trigger('pointermove', makePointermoveOptions(center)));
    }

    it('mouse dragging the dial updates input and value', () => {
      measurePointerInput([4, 9], false)
        .then(() => {
          cy.cssVar('--angle', 'div.hand-container').should('equal', '-294');
          cy.get('input').should('have.value', '294');

          let inputAngleComponent = mr.fixture.debugElement.query(By.directive(InputAngleComponent));
          expect(inputAngleComponent.componentInstance.value).to.equal(294);
        });
    });

    it('touch dragging the dial updates input and value', () => {
      measurePointerInput([4, 9], true)
        .then(() => {
          cy.cssVar('--angle', 'div.hand-container').should('equal', '-294');
          cy.get('input').should('have.value', '294');

          let inputAngleComponent = mr.fixture.debugElement.query(By.directive(InputAngleComponent));
          expect(inputAngleComponent.componentInstance.value).to.equal(294);
        });
    });

  });

});
