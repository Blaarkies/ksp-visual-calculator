import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { BasicAnimations } from '../../animations/basic-animations';
import { WithDestroy } from '../../common/with-destroy';
import {
  filter,
  Observable,
  takeUntil,
} from 'rxjs';
import { Orbit } from '../../common/domain/space-objects/orbit';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { SpaceObjectType } from '../../common/domain/space-objects/space-object-type';
import { CameraService } from '../../services/camera.service';
import { Icons } from '../../common/domain/icons';
import { MatDialog } from '@angular/material/dialog';
import { AnalyticsService } from '../../services/analytics.service';
import { CameraComponent } from '../camera/camera.component';
import { EventLogs } from '../../services/domain/event-logs';
import {
  CelestialBodyDetailsDialogComponent,
  CelestialBodyDetailsDialogData,
} from '../../overlays/celestial-body-details-dialog/celestial-body-details-dialog.component';
import { GlobalStyleClass } from '../../common/global-style-class';
import { CommonModule } from '@angular/common';
import { OrbitLineComponent } from '../orbit-line/orbit-line.component';
import { DraggableSpaceObjectComponent } from '../draggable-space-object/draggable-space-object.component';
import { MouseHoverDirective } from '../../directives/mouse-hover.directive';
import { SoiCircleComponent } from '../soi-circle/soi-circle.component';

@Component({
  selector: 'cp-universe-map',
  standalone: true,
  imports: [
    CommonModule,
    MouseHoverDirective,
    CameraComponent,
    OrbitLineComponent,
    DraggableSpaceObjectComponent,
    SoiCircleComponent,
    CelestialBodyDetailsDialogComponent,
  ],
  templateUrl: './universe-map.component.html',
  styleUrls: ['./universe-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [BasicAnimations.fade],
})
export class UniverseMapComponent extends WithDestroy() implements OnDestroy {

  @Input() set orbits(value: Orbit[]) {
    this.filteredOrbits = value?.filter(o =>
      this.spaceObjectTypesToShow.includes(o.type));
  }

  @Input() set planets(value: SpaceObject[]) {
    this.allPlanets = value ?? [];
    this.filteredPlanets = value?.filter(b =>
      this.spaceObjectTypesToShow.includes(b.type));
  }

  @Input() allowEdit = true;

  @Output() editPlanet = new EventEmitter<{ body, details }>();
  @Output() update = new EventEmitter<SpaceObject>();
  @Output() startDrag = new EventEmitter<SpaceObject>();
  @Output() hoverBody = new EventEmitter<{ body: SpaceObject, hover: boolean }>();

  orbits$: Observable<Orbit[]>;
  celestialBodies$: Observable<SpaceObject[]>;

  spaceObjectTypes = SpaceObjectType;
  scaleToShowMoons = CameraService.scaleToShowMoons;

  icons = Icons;

  @ViewChild(CameraComponent, {static: true}) camera: CameraComponent;
  @ViewChild('backboard', {static: true}) backboard: ElementRef<HTMLDivElement>;

  filteredOrbits: Orbit[];
  filteredPlanets: SpaceObject[];

  private spaceObjectTypesToShow = [SpaceObjectType.Star, SpaceObjectType.Planet, SpaceObjectType.Moon];
  private allPlanets: SpaceObject[];

  constructor(private cdr: ChangeDetectorRef,
              private dialog: MatDialog,
              private analyticsService: AnalyticsService,
              private cameraService: CameraService) {
    super();
  }

  startBodyDrag(body: SpaceObject, event: PointerEvent, screen: HTMLDivElement, camera: CameraComponent) {
    body.draggableHandle.startDrag(event, screen, () => this.updateUniverse(body), camera);
    this.startDrag.emit(body);

    this.analyticsService.logEventThrottled(EventLogs.Name.DragBody, {
      category: EventLogs.Category.CelestialBody,
      touch: event.pointerType === 'touch',
      details: {
        label: EventLogs.Sanitize.anonymize(body.label),
      },
    });
  }

  private updateUniverse(dragged: SpaceObject) {
    this.update.emit(dragged);

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
        forbiddenNames: this.allPlanets.map(c => c.label),
        edit: body,
      } as CelestialBodyDetailsDialogData,
      backdropClass: GlobalStyleClass.MobileFriendly,
    })
      .afterClosed()
      .pipe(
        filter(details => details),
        takeUntil(this.destroy$))
      .subscribe(details => {
        this.editPlanet.emit({body, details});
        this.cdr.markForCheck();
      });
  }

  focusBody(body: SpaceObject, event: PointerEvent) {
    this.cameraService.focusSpaceObject(body, event.pointerType === 'touch');

    this.analyticsService.logEvent(
      `Focus body with double tap or click`, {
        category: EventLogs.Category.Camera,
        touch: event.pointerType === 'touch',
        body: EventLogs.Sanitize.anonymize(body.label),
      });
  }

}
