import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { EMPTY, interval, Observable, of, zip } from 'rxjs';
import { Router } from '@angular/router';
import { distinctUntilChanged, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { DataService, User } from './data.service';
import { StateService } from './state.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import UserCredential = firebase.auth.UserCredential;
import { HttpClient, HttpParams } from '@angular/common/http';
import { EventLogs } from './event-logs';
import { BuyMeACoffeeDialogComponent } from '../overlays/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AnalyticsService } from './analytics.service';

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
        tap(user => this.dataService.updateUserId(user?.uid)),
        switchMap(user => user
          ? this.dataService.getRef<User>(`users/${user.uid}`).valueChanges()
          : of(null)));

    this.user$.pipe(
      distinctUntilChanged(),
      tap(() => console.log('after distinct')),
      switchMap(u => u?.isCustomer
        ? EMPTY
        : interval(2 * 60 * 1e3)),
      tap(() => console.log('after customer check')),
      switchMap(() => this.snackBar.open('Would you like to support the developer?', 'Yes', {duration: 15e3}).onAction()),
      tap(() => console.log('after snackbar')),
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
    this.updateUserData(credential.user);
    await this.loadUserLastSaveGame();
  }

  async signOut() {
    await this.afAuth.signOut();
    await this.router.navigate(['/']);
    await this.stateService.loadState().pipe(take(1)).toPromise();
    this.stateService.setStateRecord();
  }

  private async updateUserData(user): Promise<void> {
    let isCustomer = user.isCustomer || await this.isCustomer(user.email);

    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      isCustomer,
    };

    return await this.dataService.getRef(`users/${user.uid}`).set(data, {merge: true});
  }

  async emailSignIn(email: string, password: string): Promise<UserCredential> {
    let credential = await this.afAuth.signInWithEmailAndPassword(email, password);
    this.updateUserData(credential.user);
    await this.loadUserLastSaveGame();
    return credential;
  }

  async emailSignUp(email: string, password: string): Promise<UserCredential> {
    let credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
    this.updateUserData(credential.user);
    // todo: check that current "tutorial" game is saved
    return credential;
  }

  async resetPassword(email: string): Promise<void> {
    if (!email) {
      return;
    }

    return await this.afAuth.sendPasswordResetEmail(email);
  }

  private async loadUserLastSaveGame(): Promise<void> {
    await this.user$.pipe(take(1)).toPromise();

    let states = await this.stateService.getStatesInContext()
      .pipe(take(1))
      .toPromise();
    let newestState = states[0];

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
}
