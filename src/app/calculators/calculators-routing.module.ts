import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { UsableRoutes } from '../usable-routes';
import { PageCalculatorsComponent } from './components/page-calculators/page-calculators.component';

export interface RouteData {
  calculatorType?: UsableRoutes;
}

const routes: Routes = [
  {
    path: UsableRoutes.DvPlanner,
    component: PageCalculatorsComponent,
    data: {calculatorType: UsableRoutes.DvPlanner} as RouteData,
  },

  {
    path: UsableRoutes.SignalCheck,
    component: PageCalculatorsComponent,
    data: {calculatorType: UsableRoutes.SignalCheck} as RouteData,
  },

  {path: '**', redirectTo: UsableRoutes.DvPlanner},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalculatorsRoutingModule {
}
