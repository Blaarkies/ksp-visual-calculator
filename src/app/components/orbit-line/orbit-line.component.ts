import { AfterViewInit, Component, Input } from '@angular/core';
import { Orbit } from '../../common/domain/space-objects/orbit';
import { CameraService } from '../../services/camera.service';

@Component({
  selector: 'cp-orbit-line',
  templateUrl: './orbit-line.component.html',
  styleUrls: ['./orbit-line.component.scss'],
})
export class OrbitLineComponent implements AfterViewInit {

  @Input() orbit: Orbit;
  @Input() scale: number;

  worldViewScale = CameraService.worldViewScale;
  pixelScale = CameraService.pixelScale;

  ngAfterViewInit() {
    console.log(this.orbit, this.scale);
  }

}
