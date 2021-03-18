import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Draggable } from '../../common/domain/draggable';
import { Orbit } from '../../common/domain/orbit';
import { SpaceObject } from '../../common/domain/space-object';
import { Craft } from '../../common/domain/craft';
import { TransmissionLine } from '../../common/domain/transmission-line';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { CameraComponent } from '../../components/camera/camera.component';
import { SpaceObjectService } from '../../services/space-object.service';
import { Observable, Subject } from 'rxjs';
import { CraftDetailsDialogComponent, CraftDetailsDialogData } from '../../dialogs/craft-details-dialog/craft-details-dialog.component';
import { filter, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

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
    // this.spaceObjectService.editCelestialBody(body);
  }

  editCraft(craft: Craft) {
    this.dialog.open(CraftDetailsDialogComponent, {
      data: {
        forbiddenCraftNames: this.spaceObjectService.crafts$.value.map(c => c.label),
        edit: craft,
      } as CraftDetailsDialogData,
    })
      .afterClosed()
      .pipe(
        filter(craftDetails => craftDetails),
        takeUntil(this.unsubscribe$))
      .subscribe(craftDetails => {
        this.spaceObjectService.editCraft(craft, craftDetails);
        this._cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
