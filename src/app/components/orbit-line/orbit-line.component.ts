import { Component, Input } from '@angular/core';
import { Orbit } from '../../common/domain/space-objects/orbit';

@Component({
  selector: 'cp-orbit-line',
  templateUrl: './orbit-line.component.html',
  styleUrls: ['./orbit-line.component.scss'],
})
export class OrbitLineComponent {

  @Input() orbit: Orbit;
  @Input() scale: number;

}
