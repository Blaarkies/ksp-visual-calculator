import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  scan,
  Subject,
  timer,
} from 'rxjs';
import { ZoomIndicatorComponent } from '../../components/zoom-indicator/zoom-indicator.component';
import { CameraService } from '../../services/camera.service';
import { BlaarkiesBookWatermarkComponent } from '../watermark/blaarkies-book-watermark.component';

@Component({
  selector: 'cp-bk-home',
  standalone: true,
  imports: [
    CommonModule,
    BlaarkiesBookWatermarkComponent,

    ZoomIndicatorComponent,
  ],
  providers: [
    {
      provide: CameraService, useValue: {
        cameraChange$: new Subject(),
        scale: .01,
      },
    },
  ],
  templateUrl: './blaarkies-book-home.component.html',
  styleUrls: ['./blaarkies-book-home.component.scss'],
})
export class BlaarkiesBookHomeComponent {

  constructor(cameraService: CameraService) {
    let directionUp = false;
    timer(0, 250)
      .pipe(
        scan(acc => {
            if (acc < CameraService.zoomLimits[0]) {
              directionUp = true;
            }
            if (acc > CameraService.zoomLimits[1]) {
              directionUp = false;
            }
            let nudge = 1 + Math.random() * 2e0;
            return directionUp ? acc * nudge : acc / nudge;
          },
          CameraService.zoomLimits[0]),
      )
      .subscribe(v => {
        cameraService.scale = v;
        cameraService.cameraChange$.next();
      });
  }
}
