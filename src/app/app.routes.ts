import {
  Route,
  Routes,
} from '@angular/router';
import { environment } from '../environments/environment';

/** Legacy routes (Route name + App version) */
const COMMNET_ROUTE_100 = 'signal-check';
const DV_ROUTE_120 = 'dv-planner';
const COMMNET_ROUTE_130 = 'calculators/signal-check';
const DV_ROUTE_130 = 'calculators/dv-planner';

export enum UsableRoutes {
  CommnetPlanner = 'commnet-planner',
  DvPlanner = 'dv-planner',
  MiningStation = 'mining-station',
  Intro = 'intro',
  Policy = 'policy',
  Feedback = 'feedback',
}

const routes: Routes = [
  {
    path: UsableRoutes.CommnetPlanner,
    title: 'CommNet Planner',
    loadComponent: () => import('./pages/commnet-planner/page-commnet-planner.component'),
  },

  {
    path: UsableRoutes.DvPlanner,
    title: 'DV Planner',
    loadComponent: () => import('./pages/dv-planner/page-dv-planner.component'),
  },

  {path: COMMNET_ROUTE_130, redirectTo: UsableRoutes.CommnetPlanner},
  {path: DV_ROUTE_130, redirectTo: UsableRoutes.DvPlanner},
  {path: COMMNET_ROUTE_100, redirectTo: UsableRoutes.CommnetPlanner},
  {path: DV_ROUTE_120, redirectTo: UsableRoutes.DvPlanner},

  {
    path: UsableRoutes.MiningStation,
    title: 'ISRU Mining Station',
    loadComponent: () => import('./pages/mining-station/page-mining-station.component'),
  },

  {
    path: UsableRoutes.Intro,
    title: 'KSP Visual Calculator',
    loadComponent: () => import('./pages/article/page-article.component')
      .then(m => m.PageArticleComponent),
  },
  {
    path: UsableRoutes.Policy,
    title: 'KSP Visual Calculator',
    loadComponent: () => import('./pages/policy/page-policy.component')
      .then(m => m.PagePolicyComponent),
  },
  {
    path: UsableRoutes.Feedback,
    title: 'KSP Visual Calculator',
    loadComponent: () => import('./pages/feedback/page-feedback.component')
      .then(m => m.PageFeedbackComponent),
  },

  {path: '**', redirectTo: UsableRoutes.Intro},
];

if (!environment.production) {
  let bookPath = 'blaarkies-book';
  let blaarkiesBook: Route = {
    path: bookPath,
    title: 'Blaarkies Book',
    loadComponent: () => import('./blaarkies-book/home/blaarkies-book-home.component').then(m => m.BlaarkiesBookHomeComponent),
  };
  routes.splice(-1, 0, blaarkiesBook);
  routes[routes.length - 1].redirectTo = bookPath;
}

export const appRoutes = routes;
