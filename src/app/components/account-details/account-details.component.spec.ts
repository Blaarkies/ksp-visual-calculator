import { MockBuilder, MockedComponentFixture, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { AccountDetailsComponent } from './account-details.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { User } from '../../services/data.service';
import { fakeAsync } from '@angular/core/testing';

let componentType = AccountDetailsComponent;
describe('AccountDetailsComponent', () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(MatSnackBar));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  describe('authService.user$ signed in', () => {

    let mockUser: User = {uid: 'a', email: 'email', displayName: 'name', photoURL: 'http me'};

    it('show user details', async () => {
      MockInstance(AuthService, 'user$', of(mockUser));

      let fixture = MockRender(componentType);

      let innerText = fixture.debugElement.nativeElement.innerText;
      expect(innerText.includes(mockUser.email)).toBeTrue();
      expect(innerText.includes(mockUser.displayName)).toBeTrue();
    });
  });

  describe('authService.user$ signed out', () => {

    let buttonText = {
      signInEmail: 'Sign in with email address',
      forgotPassword: 'Forgot password?',
    };

    let getSignInWithEmailButton = (fixture: MockedComponentFixture<AccountDetailsComponent, AccountDetailsComponent>,
                                    buttonTextQuery: string) => Array.from(
      fixture.debugElement.nativeElement.querySelectorAll('button'))
      .find((e: HTMLButtonElement) =>
        e.innerText.includes(buttonTextQuery)) as HTMLButtonElement;

    let getButtonDisabled = (signInEmailButton: HTMLButtonElement) =>
      signInEmailButton.attributes['ng-reflect-disabled']
        .value
        .toBoolean();

    it('valid details should allow sign-in-with-email', () => {
      let fixture = MockRender(componentType);
      let component = fixture.point.componentInstance;

      let signInEmailButton = getSignInWithEmailButton(fixture, buttonText.signInEmail);

      let buttonDisabledAtStart = getButtonDisabled(signInEmailButton);
      expect(buttonDisabledAtStart).toBeTrue();

      component.controlEmail.setValue('test@test.test');
      component.controlPassword.setValue('more than 6 chars');
      component.controlEmail.markAsTouched();
      component.controlPassword.markAsTouched();

      fixture.detectChanges();

      let buttonDisabledAfter = getButtonDisabled(signInEmailButton);
      expect(buttonDisabledAfter).toBeFalse();
    });

    it('invalid details should disable sign-in-with-email', fakeAsync(() => {
      let fixture = MockRender(componentType);
      let component = fixture.point.componentInstance;

      let signInEmailButton = getSignInWithEmailButton(fixture, buttonText.signInEmail);

      component.controlEmail.setValue('15 Mun street');
      component.controlPassword.setValue('5char');
      component.controlEmail.markAsTouched();
      component.controlPassword.markAsTouched();

      fixture.detectChanges();

      let buttonDisabled = getButtonDisabled(signInEmailButton);
      expect(buttonDisabled).toBeTrue();
    }));

    it('valid email should allow forgot password', fakeAsync(() => {
      let fixture = MockRender(componentType);
      let component = fixture.point.componentInstance;

      let forgotPasswordButton: HTMLButtonElement = getSignInWithEmailButton(fixture, buttonText.forgotPassword);

      component.controlEmail.setValue('test@test.test');
      component.controlEmail.markAsTouched();

      fixture.detectChanges();

      let buttonDisabled = getButtonDisabled(forgotPasswordButton);
      expect(buttonDisabled).toBeFalse();
    }));

    it('invalid email should disable forgot password', fakeAsync(() => {
      let fixture = MockRender(componentType);
      let component = fixture.point.componentInstance;

      let forgotPasswordButton: HTMLButtonElement = getSignInWithEmailButton(fixture, buttonText.forgotPassword);

      component.controlEmail.setValue('15 Mun street');
      component.controlEmail.markAsTouched();

      fixture.detectChanges();

      let buttonDisabled = getButtonDisabled(forgotPasswordButton);
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
