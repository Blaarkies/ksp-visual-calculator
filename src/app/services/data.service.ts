import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, mapTo, Observable, timer } from 'rxjs';
import {
  deleteDoc,
  deleteField,
  doc,
  Firestore,
  getDoc,
  onSnapshot,
  setDoc,
  SetOptions,
  updateDoc
} from '@angular/fire/firestore';
import { DocumentData, DocumentReference } from 'rxfire/firestore/interfaces';

export interface UserData {
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

  constructor(private afs: Firestore) {
  }

  getRef<T>(path: string): DocumentReference<DocumentData> {
    return doc(this.afs, path);
  }

  getChanges<T>(path: string) {
    return new Observable(subscriber => {
      let unsubscribeSnapshot = onSnapshot(
        this.getRef<T>(path),
        {},
        s => subscriber.next(s.data()),
        e => subscriber.error(e));

      return () => unsubscribeSnapshot();
    });
  }

  private checkUserSignIn(): Promise<void> {
    return new Promise((resolve, reject) => this.userId$.value
      ? resolve()
      : reject('No user signed in, cannot use database without user authentication.'));
  }

  async write(table: TableName, fields: {}, options: SetOptions = {}): Promise<void> {
    await this.checkUserSignIn();

    return setDoc(this.getRef(`${table}/${this.userId$.value}`),
      fields,
      options);
  }

  async delete(table: TableName, field: string): Promise<void> {
    await this.checkUserSignIn();

    return updateDoc(
      this.getRef(`${table}/${this.userId$.value}`),
      {[field]: deleteField()});
  }

  async deleteAll(table: TableName): Promise<void> {
    await this.checkUserSignIn();

    return deleteDoc(this.getRef(`${table}/${this.userId$.value}`));
  }

  async read<T>(table: TableName, id: string): Promise<DocumentData> {
    await this.checkUserSignIn();

    let entry = await getDoc(this.getRef(`${table}/${id}`));
    return entry.data();
  }

  async readAll<T>(table: TableName): Promise<T[]> {
    await this.checkUserSignIn();

    let userUid = this.userId$.value;
    let docs = await getDoc(this.getRef(`${table}/${userUid}`));
    let data = (docs.data() ?? {});

    return Object.values(data);
  }

  async updateUserId(uid: string): Promise<void> {
    this.userId$.next(uid);
    return firstValueFrom(timer(0).pipe(mapTo(void 0)));
  }

}
