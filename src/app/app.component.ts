import { Component, ViewEncapsulation } from '@angular/core';
import { UsableRoutes } from './usable-routes';
import { Icons } from './common/domain/icons';
import { Page } from './common/domain/page';
import { ActionOption } from './common/domain/action-option';

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
      {externalRoute: 'https://github.com/Blaarkies/ksp-comms-planner'}),
  ];

}
