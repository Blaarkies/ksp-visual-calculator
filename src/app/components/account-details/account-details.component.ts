import { Component, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { WithDestroy } from '../../common/with-destroy';
import { Icons } from '../../common/domain/icons';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, EMPTY, from, Observable, of, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { catchError, finalize, mapTo, mergeAll, startWith, switchMap, take, takeUntil, timeout } from 'rxjs/operators';
import { AuthErrorCode } from './auth-error-code';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { User } from '../../services/data.service';
import { InputFieldComponent } from '../controls/input-field/input-field.component';
import { EventLogs } from '../../services/event-logs';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'cp-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  animations: [
    CustomAnimation.fade,
    CustomAnimation.width,
    CustomAnimation.flipVertical,
    trigger('slideOutVertical', [
      state('false', style({height: 0, overflow: 'hidden', borderColor: '#0000'})),
      state('true', style({height: '*', overflow: 'hidden'})),
      transition('false => true', [
        animate('.3s ease-in', style({height: '*', borderColor: '#0003'})),
      ]),
      transition('true => false', [
        animate('.2s ease-out', style({height: 0})),
      ]),
    ])
  ],
})
export class AccountDetailsComponent extends WithDestroy() implements OnDestroy {

  controlEmail = new FormControl(null, [Validators.required, Validators.email]);
  controlPassword = new FormControl(null, [Validators.required, Validators.minLength(6)]);
  passwordVisible = false;
  emailSignInError$ = new Observable<string>();
  signingInWithEmail$ = new Subject<boolean>();
  signingInWithGoogle$ = new Subject<boolean>();

  validatingCustomer$ = new Subject<boolean>();
  uploadingImage$ = new Subject<boolean>();
  editingDetails$ = new BehaviorSubject<boolean>(false);
  deletingAccount$ = new Subject<boolean>();

  nameControl = new FormControl(null, [Validators.required]);

  user$ = this.authService.user$;

  @Output() signOut = new EventEmitter();

  @ViewChild(InputFieldComponent) fieldDisplayName: InputFieldComponent;

  icons = Icons;
  isPromoteOpen = false;
  isSettingsOpen = false;

  constructor(private snackBar: MatSnackBar,
              private authService: AuthService,
              private analyticsService: AnalyticsService) {
    super();

    this.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => this.nameControl.setValue(user?.displayName));
    this.nameControl.disable();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.signingInWithEmail$.complete();
    this.signingInWithGoogle$.complete();
  }

  async actionSignOut() {
    this.authService.signOut()
      .then(() => {
        this.snackBar.open('Signed out');
        this.signOut.emit();
      });
  }

  signInWithEmailAddress() {
    this.signingInWithEmail$.next(true);

    let email = this.controlEmail.value;
    let password = this.controlPassword.value;

    from(this.authService.emailSignIn(email, password))
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

  async signInWithGoogle() {
    this.signingInWithGoogle$.next(true);
    await this.authService.googleSignIn();
    this.signingInWithGoogle$.next(false);
  }

  async validateAccount(user: User) {
    this.validatingCustomer$.next(true);
    let newUserData = await this.authService.updateUserData(user);
    if (newUserData.isCustomer) {
      await this.authService.reloadUserSignIn();
      this.snackBar.open(`Congratulations! Premium features have been unlocked on "${user.email}".
                          Thank you for your support`);
    } else {
      this.snackBar.open(`"${user.email}" could not be verified on buymeacoffee.com/Blaarkies`);
    }
    this.validatingCustomer$.next(false);

    this.analyticsService.logEvent('Validate account supporter status', {
      category: EventLogs.Category.Account,
      isCustomer: newUserData.isCustomer,
    });
  }

  async uploadImage(user: User) {
    this.snackBar.open(`Custom profile pictures coming soon!`);

    this.analyticsService.logEvent('Upload profile image', {
      category: EventLogs.Category.Account,
    });
  }

  async editDetails(user: User) {
    let isEditing = this.editingDetails$.value;
    if (isEditing) {
      this.analyticsService.logEvent('Complete edit user data', {
        category: EventLogs.Category.Account,
      });
      await this.authService.editUserData({
        ...user,
        displayName: this.nameControl.value,
      });

      this.editingDetails$.next(false);
      this.nameControl.disable();

      this.snackBar.open(`Details have been updated`);
    } else {
      this.analyticsService.logEvent('Start edit user data', {
        category: EventLogs.Category.Account,
      });

      this.nameControl.setValue(user.displayName);
      this.editingDetails$.next(true);
      this.nameControl.enable();
      this.fieldDisplayName.focus();
    }
  }

  async deleteAccount(user: User) {
    this.analyticsService.logEvent('Started account deletion', {
      category: EventLogs.Category.Account,
    });

    this.deletingAccount$.next(true);

    this.snackBar.open(`This will permanently delete your account, and any associated information to it.
      Are you sure you want to remove your account?`,
      'Delete', {duration: 10e3, panelClass: 'snackbar-warn'})
      .onAction()
      .pipe(
        switchMap(() => this.authService.deleteAccount(user)),
        finalize(() => this.deletingAccount$.next(false)),
        takeUntil(this.destroy$))
      .subscribe(() => {
        this.snackBar.open(`"${user.email}" account has been deleted`);

        this.analyticsService.logEvent('Completed account deletion', {
          category: EventLogs.Category.Account,
        });
      });
  }

}
