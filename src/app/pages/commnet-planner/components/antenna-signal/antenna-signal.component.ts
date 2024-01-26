import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  combineLatest,
  map,
  Observable,
  sampleTime,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { CameraService } from '../../../../services/camera.service';
import { AntennaSignal } from '../../models/antenna-signal';

@Component({
  selector: 'cp-antenna-signal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './antenna-signal.component.html',
  styleUrls: ['./antenna-signal.component.scss'],
  animations: [BasicAnimations.fade],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AntennaSignalComponent {

  signal: AntennaSignal;

  @Input() set antennaSignal(value: AntennaSignal) {
    this.stopChangeStream$.next();
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

    value.change$.pipe(
      sampleTime(16),
      // TODO: changing antennae types - no effect until hover over
      takeUntil(this.stopChangeStream$),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.cdr.markForCheck());
  }

  @Input() set scale(value: number) {
    let lineSpacingFactor = .02;
    this.inverseScale = lineSpacingFactor / value;
  }

  inverseScale = 1;
  worldViewScale = 100 * CameraService.normalizedScale;
  showText$: Observable<boolean>;

  private stopChangeStream$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef, private destroyRef: DestroyRef) {
    destroyRef.onDestroy(() => this.stopChangeStream$.complete());
  }

}
