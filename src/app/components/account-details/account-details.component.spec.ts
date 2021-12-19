import { MockBuilder, MockedComponentFixture, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { AccountDetailsComponent } from './account-details.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { UserData } from '../../services/data.service';
import { fakeAsync } from '@angular/core/testing';
import { ineeda } from 'ineeda';
import { InputFieldComponent } from '../controls/input-field/input-field.component';
import { Common } from '../../common/common';

let componentType = AccountDetailsComponent;
describe('AccountDetailsComponent', () => {

  beforeEach(() => MockBuilder(componentType)
    .keep(InputFieldComponent)
    .mock(AppModule)
    .mock(MatSnackBar)
    .mock(AuthService, ineeda<AuthService>({
      user$: of(null),
    })));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  describe('authService.user$ signed in', () => {

    let mockUser: UserData = {uid: 'a', email: 'email', displayName: 'name', photoURL: 'http me', isCustomer: false};

    it('show user details', async () => {
      MockInstance(AuthService, 'user$', of(mockUser));

      let fixture = MockRender(componentType);
      let nativeElement = fixture.debugElement.nativeElement;

      fixture.detectChanges();

      let innerText = nativeElement.innerText;
      expect(innerText.includes(mockUser.email)).toBeTrue();
      expect(fixture.componentInstance.controlName.value).toBe(mockUser.displayName);
    });
  });

  describe('authService.user$ signed out', () => {

    let buttonText = {
      signInEmail: 'Sign in with email address',
      forgotPassword: 'Forgot password?',
    };

    let getButtonWithText = (fixture: MockedComponentFixture<AccountDetailsComponent, AccountDetailsComponent>,
                             buttonTextQuery: string) =>
      Common.getElementByInnerText<HTMLButtonElement>(
        fixture.debugElement.nativeElement, 'button', buttonTextQuery);

    it('valid details should allow sign-in-with-email', () => {
      let fixture = MockRender(componentType);
      let component = fixture.point.componentInstance;

      let signInEmailButton = getButtonWithText(fixture, buttonText.signInEmail);

      let buttonDisabledAtStart = Common.isNgDisabled(signInEmailButton);
      expect(buttonDisabledAtStart).toBe(true);

      component.controlEmail.setValue('test@test.test');
      component.controlPassword.setValue('more than 6 chars');
      component.controlEmail.markAsTouched();
      component.controlPassword.markAsTouched();

      fixture.detectChanges();

      let buttonDisabledAfter = Common.isNgDisabled(signInEmailButton);
      expect(buttonDisabledAfter).toBe(false);
    });

    it('invalid details should disable sign-in-with-email', fakeAsync(() => {
      let fixture = MockRender(componentType);
      let component = fixture.point.componentInstance;

      let signInEmailButton = getButtonWithText(fixture, buttonText.signInEmail);

      component.controlEmail.setValue('15 Mun street');
      component.controlPassword.setValue('5char');
      component.controlEmail.markAsTouched();
      component.controlPassword.markAsTouched();

      fixture.detectChanges();

      let buttonDisabled = Common.isNgDisabled(signInEmailButton);
      expect(buttonDisabled).toBeTrue();
    }));

    it('valid email should allow forgot password', fakeAsync(() => {
      let fixture = MockRender(componentType);
      let component = fixture.point.componentInstance;

      let forgotPasswordButton: HTMLButtonElement = getButtonWithText(fixture, buttonText.forgotPassword);

      component.controlEmail.setValue('test@test.test');
      component.controlEmail.markAsTouched();

      fixture.detectChanges();

      let buttonDisabled = Common.isNgDisabled(forgotPasswordButton);
      expect(buttonDisabled).toBeFalse();
    }));

    it('invalid email should disable forgot password', fakeAsync(() => {
      let fixture = MockRender(componentType);
      let component = fixture.point.componentInstance;

      let forgotPasswordButton: HTMLButtonElement = getButtonWithText(fixture, buttonText.forgotPassword);

      component.controlEmail.setValue('15 Mun street');
      component.controlEmail.markAsTouched();

      fixture.detectChanges();

      let buttonDisabled = Common.isNgDisabled(forgotPasswordButton);
      expect(buttonDisabled).toBeTrue();
    }));

    it('password visibility button should toggle input type', fakeAsync(() => {
      let fixture = MockRender(componentType);
      let component = fixture.point.componentInstance;

      let passwordDiv = Array.from(fixture.debugElement.nativeElement.querySelectorAll('.input-container'))
        .find((e: HTMLDivElement) => e.innerHTML.includes('label="Password"')) as HTMLDivElement;

      let passwordVisibilityButton: HTMLButtonElement = passwordDiv
        .querySelector('button[mat-icon-button]') as HTMLButtonElement;

      expect(component.passwordVisible).toBeFalse();

      passwordVisibilityButton.click();
      expect(component.passwordVisible).toBeTrue();
    }));


  });

});
