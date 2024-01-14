import { CommonModule } from '@angular/common';
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
import { MatDialog } from '@angular/material/dialog';
import {
  filter,
  takeUntil,
} from 'rxjs';
import { BasicAnimations } from '../../animations/basic-animations';
import { Icons } from '../../common/domain/icons';
import { OrbitWithPlanetoidType } from '../../common/domain/orbit-with-planetoid-type.model';
import { Planetoid } from '../../common/domain/space-objects/planetoid';
import { PlanetoidType } from '../../common/domain/space-objects/planetoid-type';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { GlobalStyleClass } from '../../common/global-style-class';
import { WithDestroy } from '../../common/with-destroy';
import { MouseHoverDirective } from '../../directives/mouse-hover.directive';
import {
  PlanetoidDetailsDialogComponent,
  PlanetoidDetailsDialogData,
} from '../../overlays/celestial-body-details-dialog/planetoid-details-dialog.component';
import { CanCommunicate } from '../../pages/commnet-planner/models/antenna-signal';
import { AnalyticsService } from '../../services/analytics.service';
import { CameraService } from '../../services/camera.service';
import { EventLogs } from '../../services/domain/event-logs';
import { AbstractUniverseBuilderService } from '../../services/domain/universe-builder.abstract.service';
import { CameraComponent } from '../camera/camera.component';
import { DraggableSpaceObjectComponent } from '../draggable-space-object/draggable-space-object.component';
import { OrbitLineComponent } from '../orbit-line/orbit-line.component';
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
    PlanetoidDetailsDialogComponent,
  ],
  templateUrl: './universe-map.component.html',
  styleUrls: ['./universe-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [BasicAnimations.fade],
})
export class UniverseMapComponent extends WithDestroy() implements OnDestroy {

  bodies: Planetoid[];
  @Input() set planetoids(value: Planetoid[]) {
    this.bodies = value;
    this.orbits = value?.filter(p => p.draggable.orbit)
        .map(p => ({orbit: p.draggable.orbit, type: p.planetoidType}));
  }

  @Output() editPlanetoid = new EventEmitter<{ body, details }>();
  @Output() update = new EventEmitter<CanCommunicate>();
  @Output() startDrag = new EventEmitter<SpaceObject>();
  @Output() hoverBody = new EventEmitter<{ body: SpaceObject, hover: boolean }>();

  @ViewChild(CameraComponent, {static: true}) camera: CameraComponent;
  @ViewChild('backboard', {static: true}) backboard: ElementRef<HTMLDivElement>;

  orbits: OrbitWithPlanetoidType[];
  planetoidType = PlanetoidType;
  scaleToShowMoons = CameraService.scaleToShowMoons;
  icons = Icons;

  constructor(private cdr: ChangeDetectorRef,
              private dialog: MatDialog,
              private analyticsService: AnalyticsService,
              private cameraService: CameraService,
              private universeBuilderService: AbstractUniverseBuilderService,
              private window: Window) {
    super();
  }

  startBodyDrag(body: CanCommunicate, event: PointerEvent, screen: HTMLDivElement, camera: CameraComponent) {
    body.draggable.startDrag(event, screen, () => this.updateUniverse(body), camera);
    this.startDrag.emit(body);

    this.analyticsService.logEventThrottled(EventLogs.Name.DragBody, {
      category: EventLogs.Category.CelestialBody,
      touch: event.pointerType === 'touch',
      details: {
        label: EventLogs.Sanitize.anonymize(body.label),
      },
    });
  }

  private updateUniverse(dragged: CanCommunicate) {
    this.update.emit(dragged);

    this.window.requestAnimationFrame(() => this.cdr.markForCheck());
  }

  editPlanetoidWithDialog(body: Planetoid) {
    this.analyticsService.logEvent('Start edit body', {
      category: EventLogs.Category.CelestialBody,
      details: {
        label: EventLogs.Sanitize.anonymize(body.label),
      },
    });

    this.dialog.open(PlanetoidDetailsDialogComponent, {
      data: {
        forbiddenNames: this.bodies.map(c => c.label),
        edit: body,
        universeBuilderHandler: this.universeBuilderService,
      } as PlanetoidDetailsDialogData,
      backdropClass: GlobalStyleClass.MobileFriendly,
    })
      .afterClosed()
      .pipe(
        filter(details => details),
        takeUntil(this.destroy$))
      .subscribe(details => {
        this.editPlanetoid.emit({body, details});
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
