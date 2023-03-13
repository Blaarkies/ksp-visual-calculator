import { Injectable } from '@angular/core';
import {
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  take,
  tap,
  zip
} from 'rxjs';
import { Router } from '@angular/router';
import { DataService, UserData } from './data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AnalyticsService } from './analytics.service';
import { AuthErrorCode } from '../components/account-details/auth-error-code';
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
import { AbstractStateService } from './state.abstract.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  user$: Observable<UserData>;

  constructor(private auth: Auth,
              private router: Router,
              private dataService: DataService,
              private stateService: AbstractStateService,
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
          ? this.dataService.getUser(uid)
          : of(null)) as Observable<UserData>),
        shareReplay(1));

/*    stateService.earlyState
      .pipe(
        map(state => JSON.stringify(stateService.getTimestamplessState(state))),
        switchMap(state => zip(of(state), this.user$)),
        take(1),
        filter(([, user]) => user !== null),
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
        switchMap(([, states]) => {
          let newestState = states[0];
          return stateService.loadState(newestState.state);
        }),
      )
      .subscribe();*/
  }

  async googleSignIn(agreedPolicy: boolean) {
    const credential = await signInWithPopup(this.auth, new GoogleAuthProvider());
    await this.updateDataService(credential);

    await this.updateUserData(credential.user, {userAgreedToPrivacyPolicy: agreedPolicy});
    await this.loadUserLastSaveGame();
  }

  async emailSignIn(email: string, password: string, agreedPolicy: boolean): Promise<UserCredential> {
    let credential = await signInWithEmailAndPassword(this.auth, email, password);
    await this.updateDataService(credential);

    await this.updateUserData(credential.user, {userAgreedToPrivacyPolicy: agreedPolicy});
    await this.loadUserLastSaveGame();
    return credential;
  }

  async emailSignUp(email: string, password: string, agreedPolicy: boolean): Promise<UserCredential> {
    let credential = await createUserWithEmailAndPassword(this.auth, email, password);
    await this.updateDataService(credential);

    await this.updateUserData(credential.user, {userAgreedToPrivacyPolicy: agreedPolicy});
    // todo: check that current "tutorial" game is saved
    return credential;
  }

  async signOut() {
    await signOut(this.auth);
    await firstValueFrom(this.stateService.loadState());
    this.stateService.setStateRecord();
  }

  async updateUserData(user: UserData | User, extra?: {userAgreedToPrivacyPolicy: boolean}): Promise<UserData> {
    let dbUser = await this.dataService.read<UserData>('users', user.uid);

    const data = {
      uid: user.uid,
      email: user.email,
      displayName: dbUser?.displayName || user.displayName || null,
      photoURL: dbUser?.photoURL || user.photoURL || null,
      isCustomer: dbUser?.isCustomer || false,
      ...extra,
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

    await firstValueFrom(this.stateService.loadState(newestState?.state as string));
    // todo: add snackbar queue service to stop message overriding each other
    this.snackBar.open(`Loading latest save game "${newestState?.name}"`);
  }

  /**
   * Calls functions/src/buy-me-a-coffee **isEmailACustomer** to determine if this email exists on
   * the Buy Me a Coffee supporters list.
   * @param email string
   */
  async verifySupporter(email: string): Promise<boolean> {
    try {
      let projectId = 'ksp-commnet-planner';
      let endpoint = 'isEmailACustomer';
      let isCustomer$ = this.http
        .get<{ isCustomer: boolean }>(`https://us-central1-${projectId}.cloudfunctions.net/${endpoint}`, {
          params: new HttpParams()
            .append('email', email),
        })
        .pipe(map(result => result.isCustomer));

      return await firstValueFrom(isCustomer$);
    } catch (e) {
      console.error(e);
      this.snackBar.open('Could not reach BuyMeACoffee.com to determine account status')
      return await firstValueFrom(of(false));
    }
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
