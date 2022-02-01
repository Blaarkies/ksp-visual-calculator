import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageIntroComponent } from './page-intro/page-intro.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ArticleRoutingModule } from './article-routing.module';
import { AdsenseManagerModule } from '../adsense-manager/adsense-manager.module';


@NgModule({
  declarations: [
    PageIntroComponent,
  ],
  imports: [
    CommonModule,
    ArticleRoutingModule,

    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,

    AdsenseManagerModule,
  ]
})
export class ArticleModule {
}
