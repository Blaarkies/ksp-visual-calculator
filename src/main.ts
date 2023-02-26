import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';

import './extensions';
import { bootstrapApplication } from '@angular/platform-browser';
import { appOptions, appRoot } from './app/app.bootstrap';

if (environment.production) {
  enableProdMode();
}

// platformBrowserDynamic()
//   .bootstrapModule(AppModule)
//   .catch(err => console.error(err));


bootstrapApplication(appRoot, appOptions)
  .catch(err => console.error(err));
