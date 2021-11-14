import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageSignalCheckComponent } from './pages/page-signal-check/page-signal-check.component';
import { UsableRoutes } from './usable-routes';
import { PageDvPlannerComponent } from './pages/page-dv-planner/page-dv-planner.component';

const routes: Routes = [
  {path: UsableRoutes.DvPlanner, component: PageDvPlannerComponent},
  {path: UsableRoutes.SignalCheck, component: PageSignalCheckComponent},

  {path: '**', redirectTo: UsableRoutes.DvPlanner},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
