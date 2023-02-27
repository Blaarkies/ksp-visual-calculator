import { Route, Routes } from '@angular/router';
import { UsableRoutes } from './usable-routes';
import { environment } from '../environments/environment';

const routes: Routes = [
  {
    path: UsableRoutes.Intro,
    loadComponent: () => import('./pages/article/page-article.component')
      .then(m => m.PageArticleComponent),
  },

  {
    path: 'calculators',
    loadChildren: () => import('./calculators/calculators.module').then(m => m.CalculatorsModule)
  },

  {path: UsableRoutes.DvPlanner, redirectTo: `calculators/${UsableRoutes.DvPlanner}`},
  {path: UsableRoutes.SignalCheck, redirectTo: `calculators/${UsableRoutes.SignalCheck}`},

  {
    path: 'pocket-calculators',
    loadComponent: () => import('./components/isru-heat-and-power-widget/page-displayer/page-displayer.component')
      .then(m => m.PageDisplayerComponent)
  },

  {path: '**', redirectTo: UsableRoutes.Intro},
];

if (!environment.production) {
  let bookPath = 'blaarkies-book';
  let blaarkiesBook: Route = {
    path: bookPath,
    loadComponent: () => import('./blaarkies-book/home/home.component').then(m => m.HomeComponent)
  };
  routes.splice(-1, 0, blaarkiesBook);
  routes[routes.length - 1].redirectTo = bookPath;
}

export const appRoutes = routes;
