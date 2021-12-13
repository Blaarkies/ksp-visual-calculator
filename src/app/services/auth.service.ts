import { Injectable } from '@angular/core';
import {
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  Observable,
  of,
  publishReplay,
  refCount,
  switchMap,
  take,
  tap,
  timer,
  zip
} from 'rxjs';
import { Router } from '@angular/router';
import { DataService, UserData } from './data.service';
import { StateService } from './state.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EventLogs } from './event-logs';
import { BuyMeACoffeeDialogComponent } from '../overlays/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AnalyticsService } from './analytics.service';
import { AuthErrorCode } from '../components/account-details/auth-error-code';
import { GlobalStyleClass } from '../common/global-style-class';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  UserCredential,
} from '@angular/fire/auth';
import { authState, user } from 'rxfire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  user$: Observable<UserData>;

  constructor(private auth: Auth,
              private router: Router,
              private dataService: DataService,
              private stateService: StateService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private analyticsService: AnalyticsService,
              private http: HttpClient) {
    this.user$ = authState(auth)
      .pipe(
        map(user => user?.uid),
        distinctUntilChanged(),
        tap(uid => this.dataService.updateUserId(uid)),
        switchMap(uid => (uid
          ? this.dataService.getChanges<UserData>(`users/${uid}`)
          : of(null)) as Observable<UserData>),
        publishReplay(1),
        refCount());

    let minute = 60 * 1e3;
    this.user$.pipe(
      distinctUntilChanged(),
      filter(u => !(u?.isCustomer)),
      switchMap(() => timer(2 * minute, 5 * minute)),
      switchMap(() => this.snackBar.open(
        'Would you like to support the developer?',
        'Yes',
        {duration: 15e3, panelClass: GlobalStyleClass.SnackbarPromoteFlash})
        .onAction()),
      tap(() => {
        this.analyticsService.logEvent('Call coffee dialog from Snackbar', {category: EventLogs.Category.Coffee});
        this.dialog.open(BuyMeACoffeeDialogComponent);
      }),
    )
      .subscribe();

    stateService.earlyState
      .pipe(
        map(state => JSON.stringify(stateService.getTimestamplessState(state))),
        switchMap(state => zip(of(state), this.user$)),
        take(1),
        filter(([state, user]) => user !== null),
        switchMap(([state]) => zip(of(state), stateService.getStatesInContext())),
        switchMap(([earlyState, states]) => {
          if (states.length === 0) {
            return zip(of(false), of(states));
          }

          let newState = JSON.stringify(stateService.getTimestamplessState(stateService.state));
          if (earlyState !== newState) {
            return snackBar.open(`Latest save game found, discard current changes and load "${states[0]?.name}"?`,
              'Discard Changes', {duration: 15e3})
              .afterDismissed()
              .pipe(map(value => [value.dismissedByAction, states]));
          } else {
            return zip(of(true), of(states));
          }
        }),
        filter(([shouldLoad]) => !!shouldLoad),
        switchMap(([shouldLoad, states]) => {
          let newestState = states[0];
          return stateService.loadState(newestState.state);
        }),
      )
      .subscribe();
  }

  async googleSignIn() {
    const credential = await signInWithPopup(this.auth, new GoogleAuthProvider());
    await this.updateDataService(credential);

    await this.updateUserData(credential.user);
    await this.loadUserLastSaveGame();
  }

  async emailSignIn(email: string, password: string): Promise<UserCredential> {
    let credential = await signInWithEmailAndPassword(this.auth, email, password);
    await this.updateDataService(credential);

    await this.updateUserData(credential.user);
    await this.loadUserLastSaveGame();
    return credential;
  }

  async emailSignUp(email: string, password: string): Promise<UserCredential> {
    let credential = await createUserWithEmailAndPassword(this.auth, email, password);
    await this.updateDataService(credential);

    await this.updateUserData(credential.user);
    // todo: check that current "tutorial" game is saved
    return credential;
  }

  async signOut() {
    await signOut(this.auth);
    await this.router.navigate(['/']);
    await firstValueFrom(this.stateService.loadState());
    this.stateService.setStateRecord();
  }

  async updateUserData(user: UserData | User): Promise<UserData> {
    let dbUser = await this.dataService.read<UserData>('users', user.uid);
    let isCustomer = dbUser?.isCustomer || await this.isCustomer(user.email);

    const data = {
      uid: user.uid,
      email: user.email,
      displayName: dbUser?.displayName || user.displayName,
      photoURL: dbUser?.photoURL || user.photoURL,
      isCustomer,
    };

    await this.dataService.write('users', data);

    return data;
  }

  async editUserData(user: UserData): Promise<UserData> {
    const data = {
      displayName: user.displayName,
      photoURL: user.photoURL,
    };

    await this.dataService.write('users', data, {merge: true});

    return user as UserData;
  }

  async resetPassword(email: string): Promise<void> {
    if (!email) {
      return;
    }

    return await sendPasswordResetEmail(this.auth, email);
  }

  private async loadUserLastSaveGame(): Promise<void> {
    await firstValueFrom(this.user$);

    let states = await firstValueFrom(this.stateService.getStatesInContext());
    let newestState = states[0];
    if (!newestState) {
      return;
    }

    if (this.stateService.stateIsUnsaved) {
      let snackbarResult$ = this.snackBar
        .open(`Latest save game found, discard current changes and load "${newestState?.name}"?`,
          'Discard Changes', {duration: 15e3})
        .afterDismissed();
      let {dismissedByAction} = await firstValueFrom(snackbarResult$);
      if (!dismissedByAction) {
        return;
      }
    }

    await firstValueFrom(this.stateService.loadState(newestState?.state));
    // todo: add snackbar queue service to stop message overriding each other
    this.snackBar.open(`Loading latest save game "${newestState?.name}"`);
  }

  /**
   * Calls functions/src/buy-me-a-coffee **isEmailACustomer** to determine if this email exists on
   * the Buy Me a Coffee supporters list.
   * @param email string
   */
  private async isCustomer(email: string): Promise<boolean> {
    let projectId = 'ksp-commnet-planner';
    let endpoint = 'isEmailACustomer';

    let isCustomer$ = this.http
      .get<{ isCustomer: boolean }>(`https://us-central1-${projectId}.cloudfunctions.net/${endpoint}`, {
        params: new HttpParams()
          .append('email', email),
      })
      .pipe(map(result => result.isCustomer));

    return await firstValueFrom(isCustomer$);
  }

  private updateDataService(credential: UserCredential): Promise<void> {
    return this.dataService.updateUserId(credential.user.uid);
  }

  private async getSignedInUser(): Promise<User> {
    return firstValueFrom(user(this.auth));
  }

  async reloadUserSignIn(): Promise<void> {
    let signedInUser = await this.getSignedInUser();
    await signedInUser.reload();
  }

  async deleteAccount(user: UserData): Promise<void> {
    let signedInUser = await this.getSignedInUser();
    await this.dataService.deleteAll('users');
    await this.dataService.deleteAll('states');
    await signedInUser.delete().catch(e => {
      if (e === AuthErrorCode.RequiresRecentLogin) {
        this.snackBar.open('This action requires a recent sign in, try this again to complete');
      }
    });
  }
}
