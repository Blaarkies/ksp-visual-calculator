import { ValidationMessageComponent } from './validation-message.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../../app.module';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonValidators } from '../../../common/validators/common-validators';

let componentType = ValidationMessageComponent;
describe('ValidationMessageComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('set errors should setup correct message', () => {
    let fieldName = 'test field';
    let fixture = MockRender(componentType, {fieldName});
    let component = fixture.point.componentInstance;

    setAndTestControlError(component, null,
      Validators.required, `${fieldName} is required`);

    setAndTestControlError(component, 4,
      Validators.min(5), `${fieldName} must be at least 5`);

    setAndTestControlError(component, 6,
      Validators.max(5), `${fieldName} must be less than 5`);

    setAndTestControlError(component, 'four',
      Validators.minLength(5), `${fieldName} length must be at least 5`);

    setAndTestControlError(component, 'four',
      Validators.maxLength(1), `${fieldName} must be shorter than 1 characters`);

    setAndTestControlError(component, 'taken',
      CommonValidators.uniqueString(['taken']),
      `${fieldName} must be unique`);

    setAndTestControlError(component, 'R&D building #4',
      Validators.email, `${fieldName} is not valid`);

    setAndTestControlError(component, null,
      notImplementedValidator(), `${fieldName} is not correct`);
  });
});

function setAndTestControlError(component: ValidationMessageComponent,
                                value: any,
                                validator: Validators,
                                message: string) {
  let control = new FormControl(value, validator);
  component.errors = control.errors;
  expect(component.message).toBe(message);
}

function notImplementedValidator(invalid: boolean = true): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return invalid
      ? {notImplemented: true}
      : null;
  };
}
