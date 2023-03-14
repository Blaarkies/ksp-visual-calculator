import { Route, Routes } from '@angular/router';
import { environment } from '../environments/environment';

/** Legacy routes (Route name + App version) */
const COMMNET_ROUTE_100 = 'signal-check';
const DV_ROUTE_120 = 'dv-planner';
const COMMNET_ROUTE_130 = 'calculators/signal-check';
const DV_ROUTE_130 = 'calculators/dv-planner';

export enum UsableRoutes {
  CommnetPlanner = 'commnet-planner',
  DvPlanner = 'dv-planner',
  Intro = 'intro',
  Policy = 'policy',
  Feedback = 'feedback',
  PocketCalculators = 'pocket-calculators',
}

const routes: Routes = [
  {
    path: UsableRoutes.CommnetPlanner,
    loadComponent: () => import('./pages/commnet-planner/provider/page-commnet-planner.provider'),
  },

  {
    path: UsableRoutes.DvPlanner,
    loadComponent: () => import('./pages/page-dv-planner/page-dv-planner.component')
      .then(m => m.PageDvPlannerComponent),
  },

  {path: COMMNET_ROUTE_130, redirectTo: UsableRoutes.CommnetPlanner},
  {path: DV_ROUTE_130, redirectTo: UsableRoutes.DvPlanner},
  {path: COMMNET_ROUTE_100, redirectTo: UsableRoutes.CommnetPlanner},
  {path: DV_ROUTE_120, redirectTo: UsableRoutes.DvPlanner},

  {
    path: 'pocket-calculators',
    loadComponent: () => import('./components/isru-heat-and-power-widget/page-displayer/page-displayer.component')
      .then(m => m.PageDisplayerComponent)
  },

  {
    path: UsableRoutes.Intro,
    loadComponent: () => import('./pages/article/page-article.component')
      .then(m => m.PageArticleComponent),
  },
  {
    path: UsableRoutes.Policy,
    loadComponent: () => import('./pages/policy/page-policy.component')
      .then(m => m.PagePolicyComponent),
  },
  {
    path: UsableRoutes.Feedback,
    loadComponent: () => import('./pages/feedback/page-feedback.component')
      .then(m => m.PageFeedbackComponent),
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
