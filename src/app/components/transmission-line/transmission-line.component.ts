import { Component, Input, OnDestroy } from '@angular/core';
import { TransmissionLine } from '../../common/domain/transmission-line';
import { Subject } from 'rxjs';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { CameraService } from '../../services/camera.service';

@Component({
  selector: 'cp-transmission-line',
  templateUrl: './transmission-line.component.html',
  styleUrls: ['./transmission-line.component.scss'],
  animations: [CustomAnimation.fade],
})
export class TransmissionLineComponent implements OnDestroy {

  @Input() transmissionLine: TransmissionLine;
  @Input() scale: number;

  worldViewScale = CameraService.normalizedScale;

  textHover$ = new Subject<boolean>();

  ngOnDestroy() {
    this.textHover$.complete();
  }

}
