import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map, mapTo, Observable, timer, zip } from 'rxjs';
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

type AccountType = 'once-off' | 'subscription'

export interface SupporterData {
  email: string;
  joined: Date;
  type: AccountType;
  user?: DocumentReference<UserData>;
  trialEnd?: Date;
}

export type TableName = 'users' | 'states' | 'feedback' | 'supporters';

export class CpError {
  constructor(public reason: 'no-user', public message: string) {
  }
}

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

  getChanges<T>(path: string): Observable<T> {
    return new Observable(subscriber => {
      let unsubscribeSnapshot = onSnapshot(
        this.getRef<T>(path),
        {},
        s => subscriber.next(s.data() as T),
        e => subscriber.error(e));

      return () => unsubscribeSnapshot();
    });
  }

  private checkUserSignIn(): Promise<void | CpError> {
    return new Promise((resolve, reject) => this.userId$.value
      ? resolve()
      : reject(new CpError('no-user', 'No user signed in, cannot use database without user authentication.')));
  }

  async write(table: TableName, fields: {}, options: SetOptions = {}) {
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

  private async setDeletedAt(table: TableName, field: string, value: Date | undefined): Promise<void> {
    await this.checkUserSignIn();

    return setDoc(this.getRef(`${table}/${this.userId$.value}`),
      {[field]: {deletedAt: value ?? deleteField()}},
      {merge: true});
  }

  async deleteSoft(table: TableName, field: string): Promise<void> {
    await this.setDeletedAt(table, field, new Date());
  }

  async recover(table: TableName, field: string): Promise<void> {
    await this.setDeletedAt(table, field, undefined);
  }

  async deleteAll(table: TableName): Promise<void> {
    await this.checkUserSignIn();

    return deleteDoc(this.getRef(`${table}/${this.userId$.value}`));
  }

  async read<T>(table: TableName, id: string): Promise<T> {
    await this.checkUserSignIn();

    let entry = await getDoc(this.getRef(`${table}/${id}`));
    return entry.data() as T;
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

  getUser(uid: string): Observable<UserData> {
    return zip(
      this.getChanges<UserData>(`${<TableName>'users'}/${uid}`),
      this.getChanges<SupporterData>(`${<TableName>'supporters'}/${uid}`),
    ).pipe(
      map(([user, supporter]) => {
        user = user ?? {} as any;
        user.isCustomer = !!supporter;
        return user;
      }),
    );
  }
}
