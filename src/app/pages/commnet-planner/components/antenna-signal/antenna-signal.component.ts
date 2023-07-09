import {
  Component,
  Input,
  OnDestroy,
} from '@angular/core';
import { AntennaSignal } from '../../../../common/domain/antenna.signal';
import { Subject } from 'rxjs';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { CameraService } from '../../../../services/camera.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cp-antenna-signal',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './antenna-signal.component.html',
  styleUrls: ['./antenna-signal.component.scss'],
  animations: [BasicAnimations.fade],
})
export class AntennaSignalComponent implements OnDestroy {

  @Input() antennaSignal: AntennaSignal;

  @Input() set scale(value: number) {
    let lineSpacingFactor = .02;
    this.inverseScale = lineSpacingFactor / value;
  }

  inverseScale = 1;
  worldViewScale = 100 * CameraService.normalizedScale;
  textHover$ = new Subject<boolean>();

  ngOnDestroy() {
    this.textHover$.complete();
  }

}
