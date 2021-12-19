declare const require: any;

const firebase = {
  apiKey: 'AIzaSyBriVLs7H947lm6wcXFQFMb0A7fKaEm-gw',
  authDomain: 'ksp-commnet-planner.firebaseapp.com',
  projectId: 'ksp-commnet-planner',
  storageBucket: 'ksp-commnet-planner.appspot.com',
  messagingSenderId: '71975525217',
  appId: '1:71975525217:web:961ea71d56756c61264320',
  measurementId: 'G-GHK3THKHKQ',
};

export const environment = {
  production: true,
  firebase,
  APP_VERSION: require('../../package.json').version,
};
