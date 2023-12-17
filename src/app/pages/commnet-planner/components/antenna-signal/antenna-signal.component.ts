import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';
import {
  combineLatest,
  map,
  Observable,
  startWith,
} from 'rxjs';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { AntennaSignal } from '../../../../common/domain/antenna-signal';
import { CameraService } from '../../../../services/camera.service';

@Component({
  selector: 'cp-antenna-signal',
  standalone: true,
  imports: [CommonModule],
  // TODO: performance: The template calls SpaceObject.hasRelay() infinitely
  // Likely through AntennaSignal.colorTotal ?
  templateUrl: './antenna-signal.component.html',
  styleUrls: ['./antenna-signal.component.scss'],
  animations: [BasicAnimations.fade],
})
export class AntennaSignalComponent {

  signal: AntennaSignal;

  @Input() set antennaSignal(value: AntennaSignal) {
    if (!value) {
      return;
    }

    this.signal = value;
    let [nodeA, nodeB] = value.nodes;
    this.showText$ = combineLatest([
      nodeA.draggable.isHover$.pipe(startWith(false)),
      nodeB.draggable.isHover$.pipe(startWith(false)),
    ])
      .pipe(map(([a, b]) => a || b));
  }

  @Input() set scale(value: number) {
    let lineSpacingFactor = .02;
    this.inverseScale = lineSpacingFactor / value;
  }

  inverseScale = 1;
  worldViewScale = 100 * CameraService.normalizedScale;
  showText$: Observable<boolean>;

}
