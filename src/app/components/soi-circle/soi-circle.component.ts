import { Component, Input } from '@angular/core';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { BasicAnimations } from '../../common/animations/basic-animations';
import { CameraService } from '../../services/camera.service';

@Component({
  selector: 'cp-soi-circle',
  templateUrl: './soi-circle.component.html',
  styleUrls: ['./soi-circle.component.scss'],
  animations: [BasicAnimations.fade],
})
export class SoiCircleComponent {

  @Input() body: SpaceObject;

  worldViewScale = 100 * CameraService.normalizedScale;

}
