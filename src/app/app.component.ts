import { Component, ViewEncapsulation } from '@angular/core';
import { UsableRoutes } from './usable-routes';
import { Icons } from './common/domain/icons';

class Page {

  constructor(public label: string,
              public route: string,
              public icon: string) {
  }

}

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
