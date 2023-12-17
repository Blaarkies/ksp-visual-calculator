import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  combineLatest,
  filter,
  map,
  Observable,
  Subject,
  takeUntil,
} from 'rxjs';
import { BasicAnimations } from '../../animations/basic-animations';
import { Icons } from '../../common/domain/icons';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { NegatePipe } from '../../common/negate.pipe';
import { WithDestroy } from '../../common/with-destroy';
import { DoublePointerActionDirective } from '../../directives/double-pointer-action.directive';
import { MouseHoverDirective } from '../../directives/mouse-hover.directive';
import { CameraService } from '../../services/camera.service';

@Component({
  selector: 'cp-draggable-space-object',
  standalone: true,
  imports: [
    CommonModule,
    MouseHoverDirective,
    DoublePointerActionDirective,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NegatePipe,
  ],
  templateUrl: './draggable-space-object.component.html',
  styleUrls: ['./draggable-space-object.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [BasicAnimations.fade],
})
export class DraggableSpaceObjectComponent extends WithDestroy() implements OnInit, OnDestroy {

  @Input() spaceObject: SpaceObject;
  @Input() allowEdit = true;

  @Output() dragSpaceObject = new EventEmitter<PointerEvent>();
  @Output() focusObject = new EventEmitter<PointerEvent>();
  @Output() editSpaceObject = new EventEmitter<void>();

  buttonHover$ = new Subject<boolean>();
  normalizedScale = 100 * CameraService.normalizedScale;
  icons = Icons;
  showEdit$: Observable<boolean>;
  isIdle$: Observable<boolean>;

  constructor(cameraService: CameraService) {
    super();
    // tell camera service that any zoomAt action should focus on this object
    this.buttonHover$
      .pipe(
        filter(hoverOn => {
          let mustSetNewObject = !cameraService.currentHoverObject || hoverOn;
          let mustRemoveSelf = cameraService.currentHoverObject === this.spaceObject.draggable && !hoverOn;
          return mustSetNewObject || mustRemoveSelf;
        }),
        takeUntil(this.destroy$))
      .subscribe(hoverOn => cameraService.currentHoverObject = hoverOn ? this.spaceObject.draggable : null);
  }

  ngOnDestroy() {
    this.buttonHover$.next(false);
    this.buttonHover$.complete();
  }

  ngOnInit() {
    this.isIdle$ = this.spaceObject.draggable.isGrabbing$.stream$
      .pipe(map(grabbed => !grabbed));

    this.showEdit$ =
      combineLatest([
        this.buttonHover$,
        this.isIdle$,
      ]).pipe(
        map(([hovered, idled]) =>
          this.editSpaceObject.observed
          && hovered
          && idled));
  }

}
