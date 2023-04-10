import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  authState,
  user,
} from 'rxfire/auth';
import {
  distinctUntilChanged,
  firstValueFrom,
  map,
  Observable,
  of,
  shareReplay,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { AuthErrorCode } from '../components/account-details/auth-error-code';
import {
  DataService,
  UserData,
} from './data.service';

@Injectable({providedIn: 'root'})
export class AuthService {

  user$: Observable<UserData>;
  signIn$ = new Subject<UserData>();
  signOut$ = new Subject<void>();

  constructor(private auth: Auth,
              private dataService: DataService,
              private snackBar: MatSnackBar,
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
  }

  async googleSignIn(agreedPolicy: boolean) {
    const credential = await signInWithPopup(this.auth, new GoogleAuthProvider());
    await this.updateDataService(credential);

    let user = await this.updateUserData(credential.user, {userAgreedToPrivacyPolicy: agreedPolicy});
    this.signIn$.next(user);
  }

  async emailSignIn(email: string, password: string, agreedPolicy: boolean): Promise<UserCredential> {
    let credential = await signInWithEmailAndPassword(this.auth, email, password);
    await this.updateDataService(credential);

    let user = await this.updateUserData(credential.user, {userAgreedToPrivacyPolicy: agreedPolicy});
    this.signIn$.next(user);
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
    this.signOut$.next();
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
