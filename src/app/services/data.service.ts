import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, SetOptions } from '@angular/fire/firestore';
import { BehaviorSubject, timer } from 'rxjs';
import { map, mapTo, take } from 'rxjs/operators';
import firebase from 'firebase/app';
import FieldValue = firebase.firestore.FieldValue;
import GetOptions = firebase.firestore.GetOptions;

export interface User {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  myCustomData?: string;
  isCustomer: boolean;
}

export type TableName = 'users' | 'states';

@Injectable({
  providedIn: 'root',
})
export class DataService {

  private userId$ = new BehaviorSubject<string>(undefined);

  constructor(private afs: AngularFirestore) {
  }

  getRef<T>(path: string): AngularFirestoreDocument<T> {
    return this.afs.doc<T>(path);
  }

  private checkUserSignIn(): Promise<void> {
    return new Promise((resolve, reject) => this.userId$.value
      ? resolve()
      : reject('No user signed in, cannot use database without user authentication.'));
  }

  async write(table: TableName, fields: {}, options: SetOptions = {}): Promise<void> {
    await this.checkUserSignIn();

    return this.afs.doc(`${table}/${this.userId$.value}`)
      .set(fields, options);
  }

  async delete(table: TableName, field: string): Promise<void> {
    await this.checkUserSignIn();

    return this.afs.doc(`${table}/${this.userId$.value}`)
      .update({[field]: FieldValue.delete()});
  }

  async deleteAll(table: TableName): Promise<void> {
    await this.checkUserSignIn();

    return this.afs.doc(`${table}/${this.userId$.value}`).delete();
  }

  async read<T>(table: TableName, id: string, options: GetOptions = {}): Promise<T> {
    await this.checkUserSignIn();

    let entry = await this.afs.doc<T>(`${table}/${id}`)
      .get(options)
      .toPromise();
    return entry.data();
  }

  async readAll<T>(table: TableName, options: GetOptions = {}): Promise<T[]> {
    await this.checkUserSignIn();

    let userUid = this.userId$.value;
    return this.afs.doc<T>(`${table}/${userUid}`)
      .get(options)
      .pipe(map(ref => Object.values(ref.data() ?? {} as T)), take(1))
      .toPromise();
  }

  async updateUserId(uid: string): Promise<void> {
    this.userId$.next(uid);
    return timer(0).pipe(mapTo(void 0)).toPromise();
  }

}
