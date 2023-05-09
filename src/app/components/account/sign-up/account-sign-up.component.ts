import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  BehaviorSubject,
  catchError,
  delay,
  EMPTY,
  finalize,
  from,
  fromEvent,
  mapTo,
  mergeAll,
  Observable,
  of,
  startWith,
  take,
  takeUntil,
  takeWhile,
  timeout,
} from 'rxjs';
import { BasicAnimations } from '../../../animations/basic-animations';
import { Icons } from '../../../common/domain/icons';
import { WithDestroy } from '../../../common/with-destroy';
import { AuthService } from '../../../services/auth.service';
import { InputFieldComponent } from '../../controls/input-field/input-field.component';
import { InputToggleComponent } from '../../controls/input-toggle/input-toggle.component';
import { AuthErrorCode } from '../account-details/auth-error-code';
import { ReasonsToSignUpComponent } from '../reasons-to-sign-up/reasons-to-sign-up.component';

@Component({
  selector: 'cp-account-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    InputFieldComponent,
    MatTooltipModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatDividerModule,
    InputToggleComponent,
    ReasonsToSignUpComponent,
  ],
  providers: [{provide: Window, useValue: window}],
  templateUrl: './account-sign-up.component.html',
  styleUrls: ['./account-sign-up.component.scss'],
  animations: [
    BasicAnimations.fade,
  ],
})
export class AccountSignUpComponent extends WithDestroy() {

  icons = Icons;
  isPromoteOpen = false;

  controlEmail = new FormControl(null, [Validators.required, Validators.email]);
  controlPassword = new FormControl(null, [Validators.required, Validators.minLength(6)]);
  passwordVisible = false;
  emailSignInError$ = new Observable<string>();
  signingInWithEmail$ = new BehaviorSubject<boolean>(false);
  signingInWithGoogle$ = new BehaviorSubject<boolean>(false);
  controlPolicy = new FormControl(false, [Validators.requiredTrue]);

  constructor(private snackBar: MatSnackBar,
              private authService: AuthService,
              private window: Window) {
    super();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.signingInWithEmail$.complete();
    this.signingInWithGoogle$.complete();
  }

  async signInWithGoogle() {
    this.signingInWithGoogle$.next(true);
    await this.authService.googleSignIn(this.controlPolicy.value);
    this.signingInWithGoogle$.next(false);
    this.controlEmail.reset();
    this.controlPassword.reset();
    this.controlPolicy.reset();
  }

  signInWithEmailAddress() {
    this.signingInWithEmail$.next(true);

    let email = this.controlEmail.value;
    let password = this.controlPassword.value;

    from(this.authService.emailSignIn(email, password, this.controlPolicy.value))
      .pipe(
        catchError(error => {
          let {code} = error;

          if (code === AuthErrorCode.WrongPassword) {
            let emailPasswordIncorrect = `Email/Password incorrect`;
            this.snackBar.open(emailPasswordIncorrect);
            this.setErrorMessageUntilInput(emailPasswordIncorrect);
            return EMPTY;
          }

          if (code === AuthErrorCode.WrongEmail) {
            // account does not exist
            return this.authService.emailSignUp(email, password, this.controlPolicy.value);
          }

          throw error;
        }),
        catchError(error => {
          let {code, message} = error;

          if (code === AuthErrorCode.TooManyRequests) {
            this.snackBar.open('Too many sign in attempts, please wait 5 minutes to try again');
            this.setErrorMessageUntilInput('Too many sign in attempts');
            return EMPTY;
          }

          this.snackBar.open(message);
          throw error;
        }),
        finalize(() => this.signingInWithEmail$.next(false)),
        takeUntil(this.destroy$))
      .subscribe(credential => {
        this.snackBar.open(`Signed in with "${credential.user.email}"`);
        this.controlEmail.reset();
        this.controlPassword.reset();
        this.controlPolicy.reset();
      });
  }

  async forgotPassword() {
    if (this.controlEmail.invalid) {
      return;
    }
    let email = this.controlEmail.value;
    from(this.authService.resetPassword(email))
      .pipe(
        catchError(error => {
          let {code} = error;
          if (code === AuthErrorCode.WrongEmail) {
            this.snackBar.open(`Could not send password reset email`);
            return EMPTY;
          }
          throw error;
        }),
        takeUntil(this.destroy$))
      .subscribe(() => this.snackBar.open(`Sent password reset email to "${email}"`));
  }

  openReasons(event: MouseEvent) {
    event.stopPropagation();
    let wasOpen = this.isPromoteOpen;
    this.isPromoteOpen = !this.isPromoteOpen;

    if (!wasOpen) {
      this.listenClickAway(() => this.isPromoteOpen = false);
    }
  }


  private setErrorMessageUntilInput(message: string) {
    this.emailSignInError$ = of(this.controlEmail.valueChanges, this.controlPassword.valueChanges)
      .pipe(
        mergeAll(),
        timeout(10e3),
        take(1),
        mapTo(''),
        startWith(message),
        catchError(() => of('')), // timeout throws error
        takeUntil(this.destroy$));
  }

  private listenClickAway(callback: () => void) {
    fromEvent(this.window, 'pointerup')
      .pipe(
        delay(0),
        take(1),
        takeWhile(() => this.isPromoteOpen),
        takeUntil(this.destroy$))
      .subscribe(callback);
  }


}
