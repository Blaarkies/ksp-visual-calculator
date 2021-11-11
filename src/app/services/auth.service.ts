import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, of, timer, zip } from 'rxjs';
import { Router } from '@angular/router';
import { distinctUntilChanged, filter, map, publishReplay, refCount, switchMap, take, tap } from 'rxjs/operators';
import { DataService, User } from './data.service';
import { StateService } from './state.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EventLogs } from './event-logs';
import { BuyMeACoffeeDialogComponent } from '../overlays/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AnalyticsService } from './analytics.service';
import UserCredential = firebase.auth.UserCredential;
import { AuthErrorCode } from '../components/account-details/auth-error-code';
import { GlobalStyleClass } from '../common/GlobalStyleClass';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  user$: Observable<User>;

  constructor(private afAuth: AngularFireAuth,
              private router: Router,
              private dataService: DataService,
              private stateService: StateService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private analyticsService: AnalyticsService,
              private http: HttpClient) {
    this.user$ = afAuth.authState
      .pipe(
        map(user => user?.uid),
        distinctUntilChanged(),
        tap(uid => this.dataService.updateUserId(uid)),
        switchMap(uid => uid
          ? this.dataService.getRef<User>(`users/${uid}`).valueChanges()
          : of(null)),
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
    const provider = new firebase.auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    await this.updateDataService(credential);

    await this.updateUserData(credential.user);
    await this.loadUserLastSaveGame();
  }

  async emailSignIn(email: string, password: string): Promise<UserCredential> {
    let credential = await this.afAuth.signInWithEmailAndPassword(email, password);
    await this.updateDataService(credential);

    await this.updateUserData(credential.user);
    await this.loadUserLastSaveGame();
    return credential;
  }

  async emailSignUp(email: string, password: string): Promise<UserCredential> {
    let credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
    await this.updateDataService(credential);

    await this.updateUserData(credential.user);
    // todo: check that current "tutorial" game is saved
    return credential;
  }

  async signOut() {
    await this.afAuth.signOut();
    await this.router.navigate(['/']);
    await this.stateService.loadState().pipe(take(1)).toPromise();
    this.stateService.setStateRecord();
  }

  async updateUserData(user: User | firebase.User): Promise<User> {
    let dbUser = await this.dataService.read<User>('users', user.uid);
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

  async editUserData(user: User | firebase.User): Promise<User> {
    let dbUser = await this.dataService.read<User>('users', user.uid);

    const data = {
      ...dbUser,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };

    await this.dataService.write('users', data);

    return data;
  }

  async resetPassword(email: string): Promise<void> {
    if (!email) {
      return;
    }

    return await this.afAuth.sendPasswordResetEmail(email);
  }

  private async loadUserLastSaveGame(): Promise<void> {
    await this.user$.pipe(take(1)).toPromise();

    let states = await this.stateService
      .getStatesInContext()
      .pipe(take(1))
      .toPromise();
    let newestState = states[0];
    if (!newestState) {
      return;
    }

    if (this.stateService.stateIsUnsaved) {
      let {dismissedByAction} = await this.snackBar
        .open(`Latest save game found, discard current changes and load "${newestState?.name}"?`,
          'Discard Changes', {duration: 15e3})
        .afterDismissed()
        .toPromise();
      if (!dismissedByAction) {
        return;
      }
    }

    await this.stateService.loadState(newestState?.state).pipe(take(1)).toPromise();
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

    return await this.http
      .get<{ isCustomer: boolean }>(`https://us-central1-${projectId}.cloudfunctions.net/${endpoint}`, {
        params: new HttpParams()
          .append('email', email),
      })
      .pipe(map(result => result.isCustomer))
      .toPromise();
  }

  private updateDataService(credential: UserCredential): Promise<void> {
    return this.dataService.updateUserId(credential.user.uid);
  }

  async reloadUserSignIn(): Promise<void> {
    let signedInUser = await this.afAuth.user.pipe(take(1)).toPromise();
    await signedInUser.reload();
  }

  async deleteAccount(user: User): Promise<void> {
    let signedInUser = await this.afAuth.user.pipe(take(1)).toPromise();
    await this.dataService.deleteAll('users');
    await this.dataService.deleteAll('states');
    await signedInUser.delete().catch(e => {
      if (e === AuthErrorCode.RequiresRecentLogin) {
        this.snackBar.open('This action requires a recent sign in, try this again to complete');
      }
    });
  }
}
