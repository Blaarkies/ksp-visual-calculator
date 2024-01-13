import {
  FullscreenOverlayContainer,
  OverlayContainer,
} from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import {
  getAnalytics,
  provideAnalytics,
} from '@angular/fire/analytics';
import {
  initializeApp,
  provideFirebaseApp,
} from '@angular/fire/app';
import {
  getAuth,
  provideAuth,
} from '@angular/fire/auth';
import {
  getFirestore,
  provideFirestore,
} from '@angular/fire/firestore';
import { MatDialogModule } from '@angular/material/dialog';
import {
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import {
  AUTO_SAVE_INTERVAL,
  USER_IDLE_TIME,
} from './common/token';

export const appRoot = AppComponent;
export const appOptions: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore()),
      provideAnalytics(() => getAnalytics()),

      MatSnackBarModule,
      HttpClientModule,
      MatDialogModule,
    ),
    provideAnimations(),
    provideRouter(appRoutes),

    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {
        duration: 4e3,
      },
    },
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: {
        showDelay: 700,
      },
    },
    {provide: OverlayContainer, useClass: FullscreenOverlayContainer},
    {provide: Document, useValue: document},
    {provide: Window, useValue: window},
    {provide: Storage, useValue: localStorage},
    {provide: AUTO_SAVE_INTERVAL, useValue: 10e3},
    {provide: USER_IDLE_TIME, useValue: 30e3}
  ],
};
