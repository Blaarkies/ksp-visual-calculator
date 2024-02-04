import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MountResponse } from 'cypress/angular';
import { InputFieldComponent } from '../input-field/input-field.component';
import { InputAngleComponent } from './input-angle.component';

describe('InputAngleComponent', () => {

  function createComponent() {
    return cy.mount(InputAngleComponent, {
      providers: [
        {provide: Document, useValue: document},
        {provide: Window, useValue: window},
      ],
      imports: [NoopAnimationsModule],
      override: {
        TestBed,
        imports: [InputFieldComponent],
      },
    });
  }

  describe.skip('if basic', () => {

    let mr: MountResponse<InputAngleComponent>;
    beforeEach(() => createComponent().then(m => mr = m));

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
      let value = mr.component.value;
      cy.task('log', 'value>>>' + value);

      cy.get('div.dial-and-input')
        .trigger('mousedown', {button: 0})
        .trigger('mousemove', {button: 0, pageX: 100, pageY: 100})
        .then(() => {


      let value2 = mr.component.value;
      cy.task('log', 'value2>>>' + value2);

        });

      
      // let dial = mr.fixture.debugElement.query(By.css('div.dial-and-input'));
      // let classList = Array.from(dial.nativeElement.classList);
      // expect(classList).to.contain('disabled');
    });

  });

  describe('if disabled/enable', () => {

    @Component({
      selector: 'contain-test', standalone: true,
      template: '<cp-input-angle [formControl]="control"/>',
      imports: [InputAngleComponent, ReactiveFormsModule],
    })
    class Containment {
      control = new FormControl(null);
    }

    let mr: MountResponse<Containment>;
    beforeEach(() => {
      cy.mount(Containment, {
        providers: [
          {provide: Document, useValue: document},
          {provide: Window, useValue: window},
        ],
        imports: [NoopAnimationsModule],
      }).then(m => mr = m);
    });

    // it('is enabled given enabled control', () => {
    //   let control = new FormControl(null);
    //   mr.component.control = control;
    //
    //   mr.fixture.detectChanges();
    //
    //   let dial = mr.fixture.debugElement.query(By.css('div.dial-and-input'));
    //   let classList = Array.from(dial.nativeElement.classList);
    //   expect(classList).to.not.contain('disabled');
    // });
    //
    // it('is disabled given disabled control', () => {
    //   let control = new FormControl(null);
    //   control.disable();
    //   mr.component.control = control;
    //
    //   mr.fixture.detectChanges();
    //
    //   let dial = mr.fixture.debugElement.query(By.css('div.dial-and-input'));
    //   let classList = Array.from(dial.nativeElement.classList);
    //   expect(classList).to.contain('disabled');
    // });
    //
    // it('does disable when control disables', () => {
    //   let control = new FormControl(null);
    //   mr.component.control = control;
    //
    //   mr.fixture.detectChanges();
    //
    //   control.disable();
    //
    //   mr.fixture.detectChanges();
    //
    //   let dial = mr.fixture.debugElement.query(By.css('div.dial-and-input'));
    //   let classList = Array.from(dial.nativeElement.classList);
    //   expect(classList).to.contain('disabled');
    // });

    // it('is unresponsive when disabled', () => {
    //   let control = new FormControl(null);
    //   control.disable();
    //   mr.component.control = control;
    //   mr.fixture.detectChanges();
    //
    //   cy.task('log', 'control.value>>>' + control.value);
    //
    //   cy.get('div.dial-and-input')
    //     .trigger('mousedown', {button: 0})
    //     .trigger('mousemove', {button: 0, pageX: 100, pageY: 100});
    //
    //   // let dial = mr.fixture.debugElement.query(By.css('div.dial-and-input'));
    //   // let classList = Array.from(dial.nativeElement.classList);
    //   // expect(classList).to.contain('disabled');
    // });
  });


});
