import admin from 'firebase-admin';

const app = admin.initializeApp();
export const db = app.firestore();
