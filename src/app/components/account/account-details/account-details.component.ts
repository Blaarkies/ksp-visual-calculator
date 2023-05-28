import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
} from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import {
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  firstValueFrom,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import { BasicAnimations } from '../../../animations/basic-animations';
import { Icons } from '../../../common/domain/icons';
import { GlobalStyleClass } from '../../../common/global-style-class';
import { WithDestroy } from '../../../common/with-destroy';
import { AnalyticsDialogComponent } from '../../../overlays/analytics-dialog/analytics-dialog.component';
import { BuyMeACoffeeDialogComponent } from '../../../overlays/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import {
  UploadImageDialogComponent,
  UploadImageDialogData,
} from '../../../overlays/upload-image-dialog/upload-image-dialog.component';
import { AnalyticsService } from '../../../services/analytics.service';
import { AuthService } from '../../../services/auth.service';
import { UserData } from '../../../services/data.service';
import { EventLogs } from '../../../services/domain/event-logs';
import {
  ThemeService,
  ThemeTypeEnum,
} from '../../../services/theme.service';
import { InputFieldComponent } from '../../controls/input-field/input-field.component';
import { InputToggleComponent } from '../../controls/input-toggle/input-toggle.component';
import { AccountSignUpComponent } from '../sign-up/account-sign-up.component';

@Component({
  selector: 'cp-account-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatRippleModule,
    MatMenuModule,
    ReactiveFormsModule,

    InputFieldComponent,
    InputToggleComponent,
    AccountSignUpComponent,
  ],
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  animations: [BasicAnimations.fade],
})
export class AccountDetailsComponent extends WithDestroy() implements OnDestroy {

  validatingCustomer$ = new BehaviorSubject<boolean>(false);
  uploadingImage$ = new BehaviorSubject<boolean>(false);
  deletingAccount$ = new BehaviorSubject<boolean>(false);
  controlName = new FormControl(null, [Validators.required]);
  user$ = this.authService.user$;
  icons = Icons;

  controlTheme = new FormControl(this.themeService.theme === ThemeTypeEnum.Light, {});
  controlAnalytics = new FormControl(this.analyticsService.isTracking, {});

  constructor(private snackBar: MatSnackBar,
              private authService: AuthService,
              private analyticsService: AnalyticsService,
              private themeService: ThemeService,
              private dialog: MatDialog) {
    super();

    themeService.isLightTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => this.controlTheme.setValue(v, {emitEvent: false}));
    this.controlTheme.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$))
      .subscribe(() => this.themeService.toggleTheme());

    this.controlAnalytics.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$))
      .subscribe(track => this.analyticsService.setActive(track));

    this.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => this.controlName.setValue(user?.displayName, {emitEvent: false}));

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

  openBmacDialog() {
    this.dialog.closeAll();
    this.dialog.open(BuyMeACoffeeDialogComponent);
  }

  openAnalyticsDialog() {
    this.dialog.closeAll();
    this.dialog.open(AnalyticsDialogComponent);
  }

  async actionSignOut() {
    this.authService.signOut()
      .then(() => this.snackBar.open('Signed out'));
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
    await this.authService.editUserData({
      ...user,
      displayName: this.controlName.value,
    });
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


}
