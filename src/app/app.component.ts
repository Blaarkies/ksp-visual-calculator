import { Component, ViewEncapsulation } from '@angular/core';
import { UsableRoutes } from './usable-routes';
import { Icons } from './common/domain/icons';
import { ActionOption } from './common/domain/action-option';
import { environment } from 'src/environments/environment';

import firebase from 'firebase/app';
import 'firebase/analytics';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {

  routes = UsableRoutes;
  pages: ActionOption[] = [
    new ActionOption('Signal Check', Icons.PlanetSearch,
      {route: UsableRoutes.DistanceCheck}),
    new ActionOption('Source Code - GitHub', Icons.External,
      {externalRoute: 'https://github.com/Blaarkies/ksp-commnet-planner'}),
  ];

  constructor() {
    firebase.apps.length
      ? firebase.app()
      : firebase.initializeApp(environment.firebase);

    const analytics = firebase.analytics();

    analytics.logEvent('AppComponent constructor', {customText: 'log events to the moon!'});

    // analytics.setAnalyticsCollectionEnabled(false);
  }

}
