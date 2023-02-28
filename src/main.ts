import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { environment } from './environments/environment';
import { appOptions, appRoot } from './app/app.bootstrap';

import './extensions';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(appRoot, appOptions)
  .catch(err => console.error(err));
