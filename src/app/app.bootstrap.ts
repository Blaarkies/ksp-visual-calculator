import { AppComponent } from './app.component';
import { ApplicationConfig } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { importProvidersFrom } from '@angular/core';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appRoot = AppComponent;
export const appOptions: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideAnalytics(() => getAnalytics()),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore()),

      MatSnackBarModule,
      HttpClientModule,
      MatDialogModule,

      // ScreenTrackingService,
      // UserTrackingService,
    ),
    provideAnimations(),
    provideRouter(appRoutes),
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 4e3}},
  ],
};
