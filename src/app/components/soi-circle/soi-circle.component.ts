import { Component, Input } from '@angular/core';
import { Planetoid } from '../../common/domain/space-objects/planetoid';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { BasicAnimations } from '../../animations/basic-animations';
import { CameraService } from '../../services/camera.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cp-soi-circle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './soi-circle.component.html',
  styleUrls: ['./soi-circle.component.scss'],
  animations: [BasicAnimations.fade],
})
export class SoiCircleComponent {

  @Input() body: Planetoid;

  worldViewScale = 100 * CameraService.normalizedScale;

}
