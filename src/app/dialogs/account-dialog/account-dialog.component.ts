import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Icons } from '../../common/domain/icons';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, EMPTY, from, merge, Observable, of, Subject } from 'rxjs';
import { catchError, finalize, mapTo, startWith, take, takeUntil, timeout } from 'rxjs/operators';
import { WithDestroy } from '../../common/with-destroy';
import { CustomAnimation } from '../../common/domain/custom-animation';

@Component({
  selector: 'cp-account-dialog',
  templateUrl: './account-dialog.component.html',
  styleUrls: ['./account-dialog.component.scss'],
  animations: [CustomAnimation.animateFade],
})
export class AccountDialogComponent extends WithDestroy() {

  icons = Icons;
  controlEmail = new FormControl(null, [Validators.required, Validators.email]);
  controlPassword = new FormControl(null, [Validators.required, Validators.minLength(6)]);
  passwordVisible = false;
  emailSignInError$ = new Observable<string>();
  signingInWithEmail$ = new Subject<boolean>();
  signingInWithGoogle$ = new Subject<boolean>();

  constructor(private dialogRef: MatDialogRef<AccountDialogComponent>,
              private snackBar: MatSnackBar,
              public authService: AuthService) {
    super();
  }

  logout() {
    this.authService.signOut()
      .then(() => {
        this.dialogRef.close();
        this.snackBar.open('Signed out');
      });
  }

  signInWithEmailAddress() {
    this.signingInWithEmail$.next(true);

    let email = this.controlEmail.value;
    let password = this.controlPassword.value;

    from(this.authService.emailSignIn(email, password))
      .pipe(
        catchError(error => {
          let {code, message} = error;

          if (code === AuthErrorCode.WrongPassword) {
            let emailPasswordIncorrect = `Email/Password incorrect`;
            this.snackBar.open(emailPasswordIncorrect);
            this.setErrorMessageUntilInput(emailPasswordIncorrect);
            return EMPTY;
          }

          if (code === AuthErrorCode.WrongEmail) {
            // account does not exist
            return this.authService.emailSignUp(email, password);
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
      .subscribe(credential => this.snackBar.open(`Signed in with "${credential.user.email}"`));
  }

  private setErrorMessageUntilInput(message: string) {
    this.emailSignInError$ = merge(this.controlEmail.valueChanges, this.controlPassword.valueChanges)
      .pipe(
        timeout(10e3),
        catchError(() => of('')), // timeout throws error
        take(1),
        startWith(message),
        takeUntil(this.destroy$));
  }

  async forgotPassword() {
    if (this.controlEmail.invalid) {
      return;
    }
    let email = this.controlEmail.value;
    from(this.authService.resetPassword(email))
      .pipe(
        catchError(error => {
          let {code, message} = error;
          if (code === AuthErrorCode.WrongEmail) {
            this.snackBar.open(`Could not send password reset email`);
            return EMPTY;
          }
          throw error;
        }),
        takeUntil(this.destroy$))
      .subscribe(() => this.snackBar.open(`Sent password reset email to "${email}"`));
  }

  async signInWithGoogle() {
    this.signingInWithGoogle$.next(true);
    await this.authService.googleSignIn();
    this.signingInWithGoogle$.next(false);
  }
}

export class AuthErrorCode {
  static WrongPassword = 'auth/wrong-password';
  static WrongEmail = 'auth/user-not-found';
  static TooManyRequests = 'auth/too-many-requests';
}
