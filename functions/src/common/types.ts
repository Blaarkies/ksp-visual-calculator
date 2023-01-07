import { firestore } from 'firebase-admin';
import DocumentReference = firestore.DocumentReference;

export type TableName = 'users' | 'states' | 'feedback' | 'supporters';

type AccountType = 'once-off' | 'subscription'

export interface Supporter {
  email: string;
  joined: Date;
  type: AccountType;
  user?: DocumentReference
  trialEnd?: Date;
}

export interface UserData {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  myCustomData?: string;
  isCustomer: boolean;
}
