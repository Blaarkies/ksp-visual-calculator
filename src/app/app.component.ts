import { Component } from '@angular/core';
import { UsableRoutes } from './usable-routes';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  title = 'ksp-comms-planner';

  routes = UsableRoutes;

}
