import { Component, Input } from '@angular/core';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { CameraService } from '../../services/camera.service';

@Component({
  selector: 'cp-soi-circle',
  templateUrl: './soi-circle.component.html',
  styleUrls: ['./soi-circle.component.scss'],
  animations: [CustomAnimation.fade],
})
export class SoiCircleComponent {

  @Input() body: SpaceObject;

  worldViewScale = CameraService.normalizedScale;

}
