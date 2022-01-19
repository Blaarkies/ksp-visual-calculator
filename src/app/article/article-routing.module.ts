import { RouterModule, Routes } from '@angular/router';
import { PageIntroComponent } from './page-intro/page-intro.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: PageIntroComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArticleRoutingModule {
}
