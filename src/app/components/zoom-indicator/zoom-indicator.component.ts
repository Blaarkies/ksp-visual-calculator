import { ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { CameraService } from '../../services/camera.service';
import { debounceTime, finalize, skip, Subject, tap } from 'rxjs';

@Component({
  selector: 'cp-zoom-indicator',
  templateUrl: './zoom-indicator.component.html',
  styleUrls: ['./zoom-indicator.component.scss'],
})
export class ZoomIndicatorComponent implements OnDestroy {

  @Input() set cameraScale(value: number) {
    let ratio = value / this.range;
    ratio = this.transformToLinear(ratio);

    this.zoomPoint = ratio * 100;
    this.zoomChange$.next();
  }

  @Input() set zoomLimits(value: number[]) {
    this.limits = value;
    this.range = this.limits[1] - this.limits[0];

    let moonsRatio = this.transformToLinear(CameraService.scaleToShowMoons / this.range) + .01;
    let planetsRatio = moonsRatio * .5;
    this.positions = {
      planets: planetsRatio * 100,
      moons: moonsRatio * 100,
    };
  }

  @Input() moonScale: number;

  zoomPoint: number;
  positions: { planets, moons };
  show = false;

  private limits: number[];
  private range: number;
  private zoomChange$ = new Subject<void>();

  constructor(cdr: ChangeDetectorRef) {
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
