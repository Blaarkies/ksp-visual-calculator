import { initializeApp } from 'firebase-admin';

const app = initializeApp();
export const db = app.firestore();
