import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageDistanceCheckComponent } from './pages/page-distance-check/page-distance-check.component';
import { UsableRoutes } from './usable-routes';

const routes: Routes = [
  {path: UsableRoutes.SignalCheck, component: PageDistanceCheckComponent},

  {path: '**', redirectTo: UsableRoutes.SignalCheck},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
