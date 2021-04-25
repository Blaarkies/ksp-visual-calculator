import { Component, ViewEncapsulation } from '@angular/core';
import { UsableRoutes } from './usable-routes';
import { Icons } from './common/domain/icons';
import { ActionOption } from './common/domain/action-option';

@Component({
  selector: 'cp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {

  routes = UsableRoutes;
  pages: ActionOption[] = [
    new ActionOption('Signal Check', Icons.PlanetSearch,
      {route: UsableRoutes.SignalCheck}),
    new ActionOption('Source Code - GitHub', Icons.External,
      {externalRoute: 'https://github.com/Blaarkies/ksp-commnet-planner'}),
  ];

}
