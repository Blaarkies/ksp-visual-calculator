import { Component, OnDestroy, ViewChild } from '@angular/core';
import { BasicAnimations } from '../../common/animations/basic-animations';
import { WithDestroy } from '../../common/with-destroy';
import { Icons } from '../../common/domain/icons';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BehaviorSubject,
  catchError,
  debounceTime, delay,
  EMPTY,
  filter,
  finalize,
  firstValueFrom,
  from,
  fromEvent,
  mapTo,
  mergeAll,
  Observable,
  of,
  startWith,
  switchMap,
  take,
  takeUntil, takeWhile,
  tap,
  timeout,
  withLatestFrom
} from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { AuthErrorCode } from './auth-error-code';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { UserData } from '../../services/data.service';
import { InputFieldComponent } from '../controls/input-field/input-field.component';
import { EventLogs } from '../../services/domain/event-logs';
import { AnalyticsService } from '../../services/analytics.service';
import { GlobalStyleClass } from '../../common/global-style-class';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  UploadImageDialogComponent,
  UploadImageDialogData
} from '../../overlays/upload-image-dialog/upload-image-dialog.component';
import { ConfigurableAnimations } from '../../common/animations/configurable-animations';
import { CommonModule } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDividerModule } from "@angular/material/divider";
import { AccountEditDetailsComponent } from "./account-edit-details/account-edit-details.component";
import { InputToggleComponent } from "../controls/input-toggle/input-toggle.component";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatFormFieldModule } from "@angular/material/form-field";

@Component({
  selector: 'cp-account-details',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    InputFieldComponent,
    ReactiveFormsModule,
    MatDividerModule,
    AccountEditDetailsComponent,
    InputToggleComponent,
    MatProgressBarModule,
    MatFormFieldModule,

    UploadImageDialogComponent,
  ],
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  animations: [
    BasicAnimations.expandX,
    ConfigurableAnimations.openCloseY(20),
    BasicAnimations.fade,
    BasicAnimations.flipVertical,
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
  signingInWithEmail$ = new BehaviorSubject<boolean>(false);
  signingInWithGoogle$ = new BehaviorSubject<boolean>(false);

  validatingCustomer$ = new BehaviorSubject<boolean>(false);
  uploadingImage$ = new BehaviorSubject<boolean>(false);
  editingDetails$ = new BehaviorSubject<boolean>(false);
  deletingAccount$ = new BehaviorSubject<boolean>(false);

  controlName = new FormControl(null, [Validators.required]);
  controlPolicy = new FormControl(false, [Validators.requiredTrue]);

  user$ = this.authService.user$;

  @ViewChild(InputFieldComponent) fieldDisplayName: InputFieldComponent;

  icons = Icons;
  isPromoteOpen = false;
  isSettingsOpen = false;

  constructor(private snackBar: MatSnackBar,
              private authService: AuthService,
              private analyticsService: AnalyticsService,
              private dialog: MatDialog) {
    super();

    this.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => this.controlName.setValue(user?.displayName, {emitEvent: false}));
    this.controlName.disable();

    this.controlName.valueChanges
      .pipe(
        debounceTime(1000),
        withLatestFrom(this.user$),
        switchMap(([newName, user]) => {
          this.analyticsService.logEventThrottled('Save edit user data via debounce',
            {category: EventLogs.Category.Account});

          return this.authService.editUserData({...user, displayName: newName});
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.signingInWithEmail$.complete();
    this.signingInWithGoogle$.complete();
  }

  async actionSignOut() {
    this.authService.signOut()
      .then(() => this.snackBar.open('Signed out'));
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
    await this.authService.googleSignIn(this.controlPolicy.value);
    this.signingInWithGoogle$.next(false);
    this.controlEmail.reset();
    this.controlPassword.reset();
    this.controlPolicy.reset();
  }

  async validateAccount(user: UserData) {
    this.validatingCustomer$.next(true);
    let isCustomer = await this.authService.verifySupporter(user.email);
    if (isCustomer) {
      await this.authService.reloadUserSignIn();
      this.snackBar.open(`Congratulations! Premium features have been unlocked on "${user.email}".
                          Thank you for your support`);
    } else {
      this.snackBar.open(`"${user.email}" could not be verified on buymeacoffee.com/Blaarkies`);
    }
    this.validatingCustomer$.next(false);

    this.analyticsService.logEvent('Validate account supporter status', {
      category: EventLogs.Category.Account,
      isCustomer,
    });
  }

  async uploadImage(user: UserData) {
    this.analyticsService.logEvent('Upload image start', {
      category: EventLogs.Category.Account,
    });

    this.uploadingImage$.next(true);

    let dialogResult$ = this.dialog
      .open(UploadImageDialogComponent, {
        data: {} as UploadImageDialogData,
      })
      .afterClosed()
      .pipe(
        tap(ok => {
          if (!ok) {
            this.analyticsService.logEvent('Upload image canceled', {
              category: EventLogs.Category.Account,
            });

            this.uploadingImage$.next(false);
          }
        }),
        filter(ok => ok),
        takeUntil(this.destroy$));

    let imageData = await firstValueFrom(dialogResult$);

    await this.authService.editUserData({
      ...user,
      photoURL: imageData,
    });

    this.uploadingImage$.next(false);

    this.snackBar.open(`Uploaded new profile picture`);

    this.analyticsService.logEvent('Upload image end', {
      category: EventLogs.Category.Account,
    });
  }

  async editDetails(user: UserData) {
    let isEditing = this.editingDetails$.value;
    if (isEditing) {
      this.analyticsService.logEvent('Complete edit user data', {
        category: EventLogs.Category.Account,
      });
      await this.authService.editUserData({
        ...user,
        displayName: this.controlName.value,
      });

      this.editingDetails$.next(false);
      this.controlName.disable({emitEvent: false});

      this.snackBar.open(`Details have been updated`);
    } else {
      this.analyticsService.logEvent('Start edit user data', {
        category: EventLogs.Category.Account,
      });

      this.controlName.setValue(user.displayName, {emitEvent: false});
      this.editingDetails$.next(true);
      this.controlName.enable({emitEvent: false});
      this.fieldDisplayName.focus();
    }
  }

  async deleteAccount(user: UserData) {
    this.analyticsService.logEvent('Started account deletion', {
      category: EventLogs.Category.Account,
    });

    this.deletingAccount$.next(true);

    this.snackBar.open(`This will permanently delete your account, and any associated information to it.
      Are you sure you want to remove your account?`,
      'Delete', {duration: 10e3, panelClass: GlobalStyleClass.SnackbarWarn})
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

  listenClickAway(callback: () => void) {
    fromEvent(window, 'pointerup')
      .pipe(
        delay(0),
        take(1),
        takeWhile(() => this.isPromoteOpen),
        takeUntil(this.destroy$))
      .subscribe(callback);
  }

  openReasons(event: MouseEvent) {
    event.stopPropagation();
    let wasOpen = this.isPromoteOpen;
    this.isPromoteOpen = !this.isPromoteOpen;

    if (!wasOpen) {
      this.listenClickAway(() => this.isPromoteOpen = false);
    }
  }
}
