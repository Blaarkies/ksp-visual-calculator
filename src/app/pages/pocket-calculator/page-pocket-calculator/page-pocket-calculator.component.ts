import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HudService } from '../../../services/hud.service';

@Component({
  selector: 'cp-page-pocket-calculator',
  standalone: true,
  imports: [
    CommonModule,
    HudService,
  ],
  templateUrl: './page-pocket-calculator.component.html',
  styleUrls: ['./page-pocket-calculator.component.scss']
})
export class PagePocketCalculatorComponent {

}
