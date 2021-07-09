import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, of, zip } from 'rxjs';
import { Router } from '@angular/router';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { DataService, User } from './data.service';
import { StateService } from './state.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import UserCredential = firebase.auth.UserCredential;

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  user$: Observable<User>;

  constructor(private afAuth: AngularFireAuth,
              private router: Router,
              private dataService: DataService,
              private stateService: StateService,
              private snackBar: MatSnackBar) {
    this.user$ = afAuth.authState
      .pipe(
        tap(user => this.dataService.updateUserId(user?.uid)),
        switchMap(user => user
          ? this.dataService.getRef<User>(`users/${user.uid}`).valueChanges()
          : of(null)));

    stateService.earlyState
      .pipe(
        map(state => JSON.stringify(stateService.getTimelessState(state))),
        switchMap(state => zip(of(state), this.user$)),
        take(1),
        filter(([state, user]) => user !== null),
        switchMap(([state]) => zip(of(state), stateService.getStatesInContext())),
        switchMap(([earlyState, states]) => {
          if (states.length === 0) {
            return zip(of(false), of(states));
          }

          let newState = JSON.stringify(stateService.getTimelessState(stateService.state));
          if (earlyState !== newState) {
            return snackBar.open('Latest save game found, discard current changes and load that one?',
              'Discard Changes', {duration: 10e3})
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
    await this.updateUserData(credential.user);
    await this.loadUserLastSaveGame();
  }

  async signOut() {
    await this.afAuth.signOut();
    await this.router.navigate(['/']);
    await this.stateService.loadState().pipe(take(1)).toPromise();
  }

  private async updateUserData(user): Promise<void> {
    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };

    return this.dataService.getRef(`users/${user.uid}`).set(data, {merge: true});
  }

  async emailSignIn(email: string, password: string): Promise<UserCredential> {
    let credential = await this.afAuth.signInWithEmailAndPassword(email, password);
    await this.loadUserLastSaveGame();
    return credential;
  }

  async emailSignUp(email: string, password: string): Promise<UserCredential> {
    let credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
    await this.updateUserData(credential.user);
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
    await this.stateService.loadState(newestState?.state).pipe(take(1)).toPromise();
    // todo: add snackbar queue service to stop message overriding each other
    this.snackBar.open(`Loading latest save game "${newestState.name}"`);
  }
}
