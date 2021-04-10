import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Draggable } from '../../common/domain/space-objects/draggable';
import { Orbit } from '../../common/domain/space-objects/orbit';
import { SpaceObject, SpaceObjectType } from '../../common/domain/space-objects/space-object';
import { Craft } from '../../common/domain/space-objects/craft';
import { TransmissionLine } from '../../common/domain/transmission-line';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { CameraComponent } from '../../components/camera/camera.component';
import { SpaceObjectService } from '../../services/space-object.service';
import { Observable, Subject } from 'rxjs';
import { CraftDetailsDialogComponent, CraftDetailsDialogData } from '../../dialogs/craft-details-dialog/craft-details-dialog.component';
import { filter, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { CelestialBodyDetails } from '../../dialogs/celestial-body-details-dialog/celestial-body-details';
import {
  CelestialBodyDetailsDialogComponent,
  CelestialBodyDetailsDialogData,
} from '../../dialogs/celestial-body-details-dialog/celestial-body-details-dialog.component';

@Component({
  selector: 'cp-page-distance-check',
  templateUrl: './page-distance-check.component.html',
  styleUrls: ['./page-distance-check.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [CustomAnimation.animateFade],
})
export class PageDistanceCheckComponent implements OnDestroy {

  orbits$: Observable<Orbit[]>;
  transmissionLines$: Observable<TransmissionLine[]>;
  celestialBodies$: Observable<SpaceObject[]>;
  crafts$: Observable<Craft[]>;

  private unsubscribe$ = new Subject();
  spaceObjectTypes = SpaceObjectType;

  constructor(private _cdr: ChangeDetectorRef,
              private spaceObjectService: SpaceObjectService,
              private dialog: MatDialog) {
    this.orbits$ = this.spaceObjectService.orbits$;
    this.transmissionLines$ = this.spaceObjectService.transmissionLines$;
    this.celestialBodies$ = this.spaceObjectService.celestialBodies$;
    this.crafts$ = this.spaceObjectService.crafts$;
  }

  startBodyDrag(body: Draggable, event: MouseEvent, screen: HTMLDivElement, camera?: CameraComponent) {
    body.startDrag(event, screen, () => this.updateUniverse(), camera);
  }

  private updateUniverse() {
    this.spaceObjectService.updateTransmissionLines();
    this._cdr.markForCheck();
  }

  editCelestialBody(body: SpaceObject) {
    this.dialog.open(CelestialBodyDetailsDialogComponent, {
      data: {
        forbiddenNames: this.spaceObjectService.celestialBodies$.value.map(c => c.label),
        edit: body,
      } as CelestialBodyDetailsDialogData,
    })
      .afterClosed()
      .pipe(
        filter(details => details),
        takeUntil(this.unsubscribe$))
      .subscribe(details => {
        this.spaceObjectService.editCelestialBody(body, details);
        this._cdr.markForCheck();
      });
  }

  editCraft(craft: Craft) {
    this.dialog.open(CraftDetailsDialogComponent, {
      data: {
        forbiddenNames: this.spaceObjectService.crafts$.value.map(c => c.label),
        edit: craft,
      } as CraftDetailsDialogData,
    })
      .afterClosed()
      .pipe(
        filter(details => details),
        takeUntil(this.unsubscribe$))
      .subscribe(details => {
        this.spaceObjectService.editCraft(craft, details);
        this._cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
