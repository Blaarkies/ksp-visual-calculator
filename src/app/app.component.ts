import { Component, ViewEncapsulation } from '@angular/core';
import { UsableRoutes } from './usable-routes';
import { Icons } from './common/domain/icons';
import { Page } from './common/domain/page';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {

  routes = UsableRoutes;
  pages: Page[] = [
    new Page('Signal Check', UsableRoutes.DistanceCheck, Icons.PlanetSearch),

    new Page('Blaarkies.com', '../blaarkies.com', Icons.Blaarkies),
  ];

}
