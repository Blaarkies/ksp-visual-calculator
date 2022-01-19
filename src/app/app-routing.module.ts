import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsableRoutes } from './usable-routes';

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

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
