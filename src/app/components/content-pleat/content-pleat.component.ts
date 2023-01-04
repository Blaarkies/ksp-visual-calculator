import { Component } from '@angular/core';
import { BasicAnimations } from '../../common/animations/basic-animations';
import { ConfigurableAnimations } from '../../common/animations/configurable-animations';

@Component({
  selector: 'cp-content-pleat',
  templateUrl: './content-pleat.component.html',
  styleUrls: ['./content-pleat.component.scss'],
  animations: [BasicAnimations.fade, ConfigurableAnimations.openCloseY(44)],
})
export class ContentPleatComponent {
  clampLines = true;
  isOpen = false;
}
