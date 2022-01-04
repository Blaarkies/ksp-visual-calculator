import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsableRoutes } from './usable-routes';
import { PageIntroComponent } from './pages/page-intro/page-intro.component';
import { PageCalculatorsComponent } from './pages/page-calculators/page-calculators.component';

const routes: Routes = [
  {path: UsableRoutes.Intro, component: PageIntroComponent},

  {path: UsableRoutes.DvPlanner, component: PageCalculatorsComponent},
  {path: UsableRoutes.SignalCheck, component: PageCalculatorsComponent},

  {path: '**', redirectTo: UsableRoutes.Intro},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
