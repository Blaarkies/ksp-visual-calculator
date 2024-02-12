import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  Input,
  Signal,
  signal,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  combineLatest,
  map,
  mergeWith,
  sampleTime,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { CameraService } from '../../../../services/camera.service';
import { AntennaSignal } from '../../models/antenna-signal';

type UpdateType = 'camera' | 'location';

@Component({
  selector: 'cp-antenna-signal',
  standalone: true,
  imports: [
    DecimalPipe,
  ],
  templateUrl: './antenna-signal.component.html',
  styleUrls: ['./antenna-signal.component.scss'],
  animations: [BasicAnimations.fade],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AntennaSignalComponent {

  @Input() set antennaSignal(value: AntennaSignal) {
    this.stopChangeStream$.next();
    if (!value) {
      return;
    }

    this.idSig.set(value.id);
    let [nodeA, nodeB] = value.nodes;
    let showText$ = combineLatest([
      nodeA.draggable.isHover$.pipe(startWith(false)),
      nodeB.draggable.isHover$.pipe(startWith(false)),
    ]).pipe(
      map(([a, b]) => a || b),
      mergeWith(value.change$.pipe(map(() => true))));
    this.showTextSig = toSignal(showText$, {injector: this.injector});

    let cameraUpdates = this.cameraService.parameters$.pipe(map(() => 'camera' as UpdateType));
    value.change$.pipe(
      map(() => 'location' as UpdateType),
      mergeWith(cameraUpdates),
      sampleTime(17),
      startWith(null),
      takeUntil(this.stopChangeStream$),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(updateType => {
      let inverseScaleWithSpacing = this.lineSpacingFactor / this.cameraService.scale;
      let offsetVector = value.offsetVector;
      let inverseScaledX = inverseScaleWithSpacing * offsetVector.x;
      let inverseScaledY = inverseScaleWithSpacing * offsetVector.y;

      this.directX1Sig.set(this.worldViewScale * value.nodes[0].location.x + inverseScaledX + '%');
      this.directY1Sig.set(this.worldViewScale * value.nodes[0].location.y + inverseScaledY + '%');
      this.directX2Sig.set(this.worldViewScale * value.nodes[1].location.x + inverseScaledX + '%');
      this.directY2Sig.set(this.worldViewScale * value.nodes[1].location.y + inverseScaledY + '%');

      this.relayX1Sig.set(this.worldViewScale * value.nodes[0].location.x - inverseScaledX + '%');
      this.relayY1Sig.set(this.worldViewScale * value.nodes[0].location.y - inverseScaledY + '%');
      this.relayX2Sig.set(this.worldViewScale * value.nodes[1].location.x - inverseScaledX + '%');
      this.relayY2Sig.set(this.worldViewScale * value.nodes[1].location.y - inverseScaledY + '%');

      if (updateType === 'camera') {
        return;
      }

      this.colorTotalSig.set(value.colorTotal + 'A');
      this.colorRelaySig.set(value.colorRelay + 'A');
      this.strengthTotalSig.set(value.strengthTotal);
      this.strengthRelaySig.set(value.strengthRelay);
      this.angleDegSig.set(value.angleDeg + 90);
      this.displayDistanceSig.set(value.displayDistance);

      let textLocation = value.textLocation;
      this.textXSig.set(this.worldViewScale * textLocation.x + '%');
      this.textYSig.set(this.worldViewScale * textLocation.y + '%');
    });
  }

  idSig = signal('');
  showTextSig: Signal<boolean> = signal(false);
  angleDegSig = signal(0);
  displayDistanceSig = signal('');
  strengthTotalSig = signal(0);
  strengthRelaySig = signal(0);

  colorTotalSig = signal('#0000');
  directX1Sig = signal('0%');
  directY1Sig = signal('0%');
  directX2Sig = signal('0%');
  directY2Sig = signal('0%');

  colorRelaySig = signal('#0000');
  relayX1Sig = signal('0%');
  relayY1Sig = signal('0%');
  relayX2Sig = signal('0%');
  relayY2Sig = signal('0%');

  textXSig = signal('0%');
  textYSig = signal('0%');

  private worldViewScale = 100 * CameraService.normalizedScale;
  private lineSpacingFactor = .02;
  private stopChangeStream$ = new Subject<void>();

  constructor(
    private destroyRef: DestroyRef,
    private cameraService: CameraService,
    private injector: Injector,
  ) {
    destroyRef.onDestroy(() => this.stopChangeStream$.complete());
  }

}
