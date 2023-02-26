import { Component, Input } from '@angular/core';
import { Orbit } from '../../common/domain/space-objects/orbit';
import { CameraService } from '../../services/camera.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cp-orbit-line',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orbit-line.component.html',
  styleUrls: ['./orbit-line.component.scss'],
})
export class OrbitLineComponent {

  @Input() orbit: Orbit;

  worldViewScale = 100 * CameraService.normalizedScale;

}
