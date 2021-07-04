import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, SetOptions } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/app';
import FieldValue = firebase.firestore.FieldValue;
import GetOptions = firebase.firestore.GetOptions;

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
        options: SetOptions = {}): Promise<void> {
    this.checkUserSignIn();

    return this.afs.doc(`${table}/${this.userId$.value}`)
      .set(fields, options);
  }

  delete(table: 'users' | 'states', field: string): Promise<void> {
    return this.afs.doc(`${table}/${this.userId$.value}`)
      .update({[field]: FieldValue.delete()});
  }

  private checkUserSignIn() {
    if (!this.userId$.value) {
      throw console.error('No user signed in, cannot use database without user authentication.');
    }
  }

  readAll<T>(table: 'users' | 'states', options: GetOptions = {}) {
    let userUid = this.userId$.value;
    return this.afs.doc<T>(`${table}/${userUid}`)
      .get(options)
      .pipe(map(ref => Object.values(ref.data() ?? {} as T)));
  }

}
