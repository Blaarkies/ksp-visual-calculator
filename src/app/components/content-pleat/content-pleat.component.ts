import { Component } from '@angular/core';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { ConfigurableAnimations } from '../../common/animations/configurable-animations';

@Component({
  selector: 'cp-content-pleat',
  templateUrl: './content-pleat.component.html',
  styleUrls: ['./content-pleat.component.scss'],
  animations: [CustomAnimation.fade, ConfigurableAnimations.openCloseY(44)],
})
export class ContentPleatComponent {
  clampLines = true;
  isOpen = false;
}
