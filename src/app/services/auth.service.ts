import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { filter, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { DataService, User } from './data.service';
import { StateService } from './state.service';
import UserCredential = firebase.auth.UserCredential;

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  user$: Observable<User>;

  constructor(private afAuth: AngularFireAuth,
              private router: Router,
              private dataService: DataService,
              stateService: StateService) {
    this.user$ = afAuth.authState
      .pipe(
        switchMap(user => user
          ? this.dataService.getRef<User>(`users/${user.uid}`).valueChanges()
          : of(null)),
        tap(user => this.dataService.userId$.next(user?.uid)));

    let stockState: string;
    let timestampPosition: number;
    stateService.earlyState
      .pipe(
        tap(state => {
          let string = JSON.stringify(state);
          timestampPosition = string.indexOf('timestamp');
          return stockState = string.slice(0, timestampPosition)
            + string.slice(timestampPosition + 40);
        }),
        switchMapTo(this.user$),
        filter(user => {
          if (user) {
            return true;
          } else {
            return false;
          }
        }),
        switchMap(() => stateService.getStatesInContext()),
        filter(states => {
          let newStateString = JSON.stringify(stateService.state);
          let newState = newStateString.slice(0, timestampPosition)
            + newStateString.slice(timestampPosition + 40);
          if (states.length === 0 || stockState !== newState) {
            return false;
          } else {
            return true;
          }
        }),
        tap(states => {
          let newestState = states.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)[0];
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
