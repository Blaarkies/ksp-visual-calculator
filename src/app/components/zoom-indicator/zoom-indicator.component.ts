import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
} from '@angular/core';
import {
  debounceTime,
  finalize,
  sampleTime,
  skip,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { WithDestroy } from '../../common/with-destroy';
import { CameraService } from '../../services/camera.service';

@Component({
  selector: 'cp-zoom-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zoom-indicator.component.html',
  styleUrls: ['./zoom-indicator.component.scss'],
})
export class ZoomIndicatorComponent extends WithDestroy() implements OnDestroy {

  set cameraScale(value: number) {
    let adjusted = value - this.limits[0];
    let ratio = (adjusted ?? 1e-9) / this.range;
    ratio = this.transformToLinear(ratio);

    this.zoomPoint = (ratio * 100).coerceIn(0, 99);
    this.zoomChange$.next();
  }

  set zoomLimits(value: number[]) {
    this.limits = value;
    this.range = this.limits[1];

    let moonsRatio = this.transformToLinear(CameraService.scaleToShowMoons / this.range) + .01;
    let planetsRatio = moonsRatio * .5;
    this.positions = {
      planets: planetsRatio * 100,
      moons: moonsRatio * 100,
    };
  }

  zoomPoint = 0;
  positions: { planets, moons };
  show = false;

  private limits: number[];
  private range: number = CameraService.scaleToShowMoons;
  private zoomChange$ = new Subject<void>();

  constructor(cdr: ChangeDetectorRef,
              cameraService: CameraService) {
    super();

    cameraService.cameraMovement$
      .pipe(
        sampleTime(200),
        takeUntil(this.destroy$))
      .subscribe(() => this.cameraScale = cameraService.scale);

    this.zoomLimits = CameraService.zoomLimits;

    this.zoomChange$
      .pipe(
        skip(1),
        tap(() => this.show = true),
        debounceTime(1e3),
        tap(() => {
          this.show = false;
          cdr.markForCheck();
        }),
        finalize(() => this.show = false))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.zoomChange$.complete();
  }

  private transformToLinear(ratio: number) {
    // todo: constants added to fix small ratio to fractional power. use a proper transformation instead
    return (ratio.pow(.1) - 0.3187892865378054) * 1.4679745638725887;
  }


}
