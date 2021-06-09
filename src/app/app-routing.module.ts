import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageSignalCheckComponent } from './pages/page-signal-check/page-signal-check.component';
import { UsableRoutes } from './usable-routes';

const routes: Routes = [
  {path: UsableRoutes.SignalCheck, component: PageSignalCheckComponent},

  {path: '**', redirectTo: UsableRoutes.SignalCheck},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
