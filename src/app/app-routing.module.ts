import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsableRoutes } from './usable-routes';
import { environment } from '../environments/environment';

const routes: Routes = [
  {
    path: UsableRoutes.Intro,
    loadChildren: () => import('./article/article.module').then(m => m.ArticleModule)
  },

  {
    path: 'calculators',
    loadChildren: () => import('./calculators/calculators.module').then(m => m.CalculatorsModule)
  },

  {path: UsableRoutes.DvPlanner, redirectTo: `calculators/${UsableRoutes.DvPlanner}`},
  {path: UsableRoutes.SignalCheck, redirectTo: `calculators/${UsableRoutes.SignalCheck}`},

  {path: '**', redirectTo: UsableRoutes.Intro},
];

if (!environment.production) {
  let bookPath = 'blaarkies-book';
  let blaarkiesBook = {
    path: bookPath,
    loadComponent: () => import('./blaarkies-book/home/home.component').then(m => m.HomeComponent)
  };
  routes.splice(-1, 0, blaarkiesBook);
  routes[routes.length - 1].redirectTo = bookPath;
}

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
