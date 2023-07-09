import {Component} from '@angular/core';
import {BasicAnimations} from '../../animations/basic-animations';
import {ConfigurableAnimations} from '../../animations/configurable-animations';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'cp-content-pleat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-pleat.component.html',
  styleUrls: ['./content-pleat.component.scss'],
  animations: [BasicAnimations.fade, ConfigurableAnimations.openCloseY(44)],
})
export class ContentPleatComponent {
  clampLines = true;
  isOpen = false;
}
