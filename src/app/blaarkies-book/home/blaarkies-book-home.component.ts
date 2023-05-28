import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BlaarkiesBookWatermarkComponent } from '../watermark/blaarkies-book-watermark.component';

@Component({
  selector: 'cp-bk-home',
  standalone: true,
  imports: [
    CommonModule,
    BlaarkiesBookWatermarkComponent,
  ],
  templateUrl: './blaarkies-book-home.component.html',
  styleUrls: ['./blaarkies-book-home.component.scss'],
})
export default class BlaarkiesBookHomeComponent {
}
