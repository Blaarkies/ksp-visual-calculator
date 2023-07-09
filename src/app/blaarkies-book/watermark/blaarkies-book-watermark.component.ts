import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { UsableRoutes } from '../../app.routes';
import { Icons } from '../../common/domain/icons';

@Component({
  selector: 'cp-bk-watermark',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './blaarkies-book-watermark.component.html',
  styleUrls: ['./blaarkies-book-watermark.component.scss'],
})
export class BlaarkiesBookWatermarkComponent {

  icons = Icons;
  routes = [
    UsableRoutes.Intro,
    UsableRoutes.CommnetPlanner,
    UsableRoutes.DvPlanner,
    UsableRoutes.MiningStation,
  ];

}
