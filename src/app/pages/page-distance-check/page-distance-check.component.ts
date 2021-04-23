import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Orbit } from '../../common/domain/space-objects/orbit';
import { SpaceObject, SpaceObjectType } from '../../common/domain/space-objects/space-object';
import { Craft } from '../../common/domain/space-objects/craft';
import { TransmissionLine } from '../../common/domain/transmission-line';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { CameraComponent } from '../../components/camera/camera.component';
import { SpaceObjectService } from '../../services/space-object.service';
import { Observable } from 'rxjs';
import { CraftDetailsDialogComponent, CraftDetailsDialogData } from '../../dialogs/craft-details-dialog/craft-details-dialog.component';
import { filter, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import {
  CelestialBodyDetailsDialogComponent,
  CelestialBodyDetailsDialogData,
} from '../../dialogs/celestial-body-details-dialog/celestial-body-details-dialog.component';
import { AnalyticsService, EventLogs } from '../../services/analytics.service';
import { WithDestroy } from '../../common/with-destroy';

@Component({
  selector: 'cp-page-distance-check',
  templateUrl: './page-distance-check.component.html',
  styleUrls: ['./page-distance-check.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [CustomAnimation.animateFade],
})
export class PageDistanceCheckComponent extends WithDestroy() {

  orbits$: Observable<Orbit[]>;
  transmissionLines$: Observable<TransmissionLine[]>;
  celestialBodies$: Observable<SpaceObject[]>;
  crafts$: Observable<Craft[]>;

  spaceObjectTypes = SpaceObjectType;

  constructor(private cdr: ChangeDetectorRef,
              private spaceObjectService: SpaceObjectService,
              private dialog: MatDialog,
              private analyticsService: AnalyticsService) {
    super();

    this.orbits$ = this.spaceObjectService.orbits$;
    this.transmissionLines$ = this.spaceObjectService.transmissionLines$;
    this.celestialBodies$ = this.spaceObjectService.celestialBodies$;
    this.crafts$ = this.spaceObjectService.crafts$;
  }

  startBodyDrag(body: SpaceObject, event: MouseEvent, screen: HTMLDivElement, camera?: CameraComponent) {
    body.draggableHandle.startDrag(event, screen, () => this.updateUniverse(body), camera);

    this.analyticsService.logEvent('Drag body', {
      category: EventLogs.Category.CelestialBody,
      details: {
        label: EventLogs.Sanitize.anonymize(body.label),
      },
    });
  }

  private updateUniverse(dragged: SpaceObject) {
    // todo: check if children in SOI feature have antennae
    if (dragged.antennae?.length) {
      this.spaceObjectService.updateTransmissionLines();
    }

    window.requestAnimationFrame(() => this.cdr.markForCheck());
  }

  editCelestialBody(body: SpaceObject) {
    this.analyticsService.logEvent('Start edit body', {
      category: EventLogs.Category.CelestialBody,
      details: {
        label: EventLogs.Sanitize.anonymize(body.label),
      },
    });

    this.dialog.open(CelestialBodyDetailsDialogComponent, {
      data: {
        forbiddenNames: this.spaceObjectService.celestialBodies$.value.map(c => c.label),
        edit: body,
      } as CelestialBodyDetailsDialogData,
    })
      .afterClosed()
      .pipe(
        filter(details => details),
        takeUntil(this.destroy$))
      .subscribe(details => {
        this.spaceObjectService.editCelestialBody(body, details);
        this.cdr.markForCheck();
      });
  }

  editCraft(craft: Craft) {
    this.analyticsService.logEvent('Start edit craft', {
      category: EventLogs.Category.Craft,
    });

    this.dialog.open(CraftDetailsDialogComponent, {
      data: {
        forbiddenNames: this.spaceObjectService.crafts$.value.map(c => c.label),
        edit: craft,
      } as CraftDetailsDialogData,
    })
      .afterClosed()
      .pipe(
        filter(details => details),
        takeUntil(this.destroy$))
      .subscribe(details => {
        this.spaceObjectService.editCraft(craft, details);
        this.cdr.markForCheck();
      });
  }

}
