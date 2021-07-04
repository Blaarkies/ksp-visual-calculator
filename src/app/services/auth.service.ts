import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, of, zip } from 'rxjs';
import { Router } from '@angular/router';
import { filter, map, mapTo, switchMap, switchMapTo, take, takeUntil, tap } from 'rxjs/operators';
import { DataService, User } from './data.service';
import { StateService } from './state.service';
import UserCredential = firebase.auth.UserCredential;
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  user$: Observable<User>;

  constructor(private afAuth: AngularFireAuth,
              private router: Router,
              private dataService: DataService,
              stateService: StateService,
              snackBar: MatSnackBar) {
    this.user$ = afAuth.authState
      .pipe(
        switchMap(user => user
          ? this.dataService.getRef<User>(`users/${user.uid}`).valueChanges()
          : of(null)),
        tap(user => this.dataService.userId$.next(user?.uid)));

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
        tap(([shouldLoad, states]) => {
          let newestState = states[0];
          stateService.loadState(newestState.state);
        }),
      )
      .subscribe();
  }

  async googleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    await this.updateUserData(credential.user);
  }

  async signOut() {
    await this.afAuth.signOut();
    await this.router.navigate(['/']);
  }

  private updateUserData(user): Promise<void> {
    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };

    return this.dataService.getRef(`users/${user.uid}`).set(data, {merge: true});
  }

  async emailSignIn(email: string, password: string): Promise<UserCredential> {
    return await this.afAuth
      .signInWithEmailAndPassword(email, password);
  }

  async emailSignUp(email: string, password: string): Promise<UserCredential> {
    return await this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then(credential => this.updateUserData(credential.user).then(() => credential));
  }

  async resetPassword(email: string) {
    if (!email) {
      return;
    }

    return await this.afAuth.sendPasswordResetEmail(email);
  }
}
