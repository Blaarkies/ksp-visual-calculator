import { Component } from '@angular/core';
import {
  BehaviorSubject,
  scan,
  Subject,
  timer,
} from 'rxjs';
import { ZoomIndicatorComponent } from '../../components/zoom-indicator/zoom-indicator.component';
import { CameraService } from '../../services/camera.service';

@Component({
  selector: 'cp-bk-home',
  standalone: true,
  imports: [
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
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
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
        console.log(v);
        cameraService.scale = v;
        cameraService.cameraChange$.next();
      });
  }
}
