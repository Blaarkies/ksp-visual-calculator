import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, SetOptions } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

export interface User {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  myCustomData?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {

  userId$ = new BehaviorSubject<string>(undefined);

  constructor(private afs: AngularFirestore) {
  }

  getRef<T>(path: string): AngularFirestoreDocument<T> {
    return this.afs.doc<T>(path);
  }

  write(table: 'users' | 'states',
        fields: {},
        options: SetOptions = {}) {
    this.checkUserLogin();

    return this.afs.doc(`${table}/${this.userId$.value}`)
      .set(fields, options);
  }

  private checkUserLogin() {
    if (!this.userId$.value) {
      throw console.error('No user logged in, cannot use database without user authentication.');
    }
  }

}
