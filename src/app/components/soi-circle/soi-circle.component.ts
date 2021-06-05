import { Component, Input } from '@angular/core';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { CustomAnimation } from '../../common/domain/custom-animation';

@Component({
  selector: 'cp-soi-circle',
  templateUrl: './soi-circle.component.html',
  styleUrls: ['./soi-circle.component.scss'],
  animations: [CustomAnimation.animateFade],
})
export class SoiCircleComponent {

  @Input() scale: number;
  @Input() body: SpaceObject;

}
