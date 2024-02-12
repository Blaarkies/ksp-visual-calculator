import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  debounceTime,
  finalize,
  sampleTime,
  skip,
  Subject,
  tap,
} from 'rxjs';
import { CameraService } from '../../services/camera.service';

@Component({
  selector: 'cp-zoom-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zoom-indicator.component.html',
  styleUrls: ['./zoom-indicator.component.scss'],
})
export class ZoomIndicatorComponent {

  set cameraScale(value: number) {
    let rangeConstrainedScale = value - this.limits[0];
    let linearScale = this.expToLinearScale(rangeConstrainedScale);

    let newZoomPoint = (linearScale * 100).coerceIn(0, 100);
    this.zoomPointPercentageSig.set(newZoomPoint + '%');
    this.zoomChange$.next();
  }

  set zoomLimits(value: number[]) {
    this.limits = value;

    let moonsScale = this.expToLinearScale(CameraService.scaleToShowMoons);
    let planetsRatio = moonsScale * .5;
    this.positionPlanetsPercentageSig.set(planetsRatio * 100+'%');
    this.positionMoonsPercentageSig.set(moonsScale * 100+'%');
  }

  zoomPointPercentageSig = signal('0%');
  positionPlanetsPercentageSig = signal('0%');
  positionMoonsPercentageSig = signal('0%');
  showSig = signal(false);

  private limits: number[];
  private zoomChange$ = new Subject<void>();

  constructor(cameraService: CameraService, destroyRef: DestroyRef) {
    cameraService.cameraMovement$
      .pipe(
        sampleTime(200),
        takeUntilDestroyed())
      .subscribe(() => this.cameraScale = cameraService.scale);

    this.zoomLimits = CameraService.zoomLimits;

    this.zoomChange$
      .pipe(
        skip(1),
        tap(() => this.showSig.set(true)),
        debounceTime(1e3),
        tap(() => this.showSig.set(false)),
        finalize(() => this.showSig.set(false)),
        takeUntilDestroyed())
      .subscribe();

    destroyRef.onDestroy(() => this.zoomChange$.complete());
  }

  expToLinearScale(scale: number): number {
    let minZoom = this.limits[0];
    let maxZoom = this.limits[1];
    scale = Math.max(minZoom, Math.min(maxZoom, scale));

    let linearScale = (Math.log10(scale) - Math.log10(minZoom)) / (Math.log10(maxZoom) - Math.log10(minZoom));

    let skewFactor = .5;
    let skewedScale = Math.pow(linearScale, skewFactor);

    return skewedScale;
  }

}
