import { Component, EventEmitter, Input, OnDestroy, Output, ViewEncapsulation } from '@angular/core';
import { BasicAnimations } from '../../common/animations/basic-animations';
import { filter, Subject, takeUntil } from 'rxjs';
import { CameraService } from '../../services/camera.service';
import { WithDestroy } from '../../common/with-destroy';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { Icons } from '../../common/domain/icons';
import { CommonModule } from '@angular/common';
import { MouseHoverDirective } from '../../directives/mouse-hover.directive';
import { DoublePointerActionDirective } from '../../directives/double-pointer-action.directive';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'cp-draggable-space-object',
  standalone: true,
  imports: [
    CommonModule,
    MouseHoverDirective,
    DoublePointerActionDirective,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './draggable-space-object.component.html',
  styleUrls: ['./draggable-space-object.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [BasicAnimations.fade],
})
export class DraggableSpaceObjectComponent extends WithDestroy() implements OnDestroy {

  @Input() spaceObject: SpaceObject;
  @Input() allowEdit = true;

  @Output() dragSpaceObject = new EventEmitter<PointerEvent>();
  @Output() focusObject = new EventEmitter<PointerEvent>();
  @Output() editSpaceObject = new EventEmitter<void>();

  buttonHover$ = new Subject<boolean>();
  normalizedScale = 100 * CameraService.normalizedScale;
  icons = Icons;

  constructor(cameraService: CameraService) {
    super();
    // tell camera service that any zoomAt action should focus on this object
    this.buttonHover$
      .pipe(
        filter(hoverOn => {
          let mustSetNewObject = !cameraService.currentHoverObject || hoverOn;
          let mustRemoveSelf = cameraService.currentHoverObject === this.spaceObject.draggableHandle && !hoverOn;
          return mustSetNewObject || mustRemoveSelf;
        }),
        takeUntil(this.destroy$))
      .subscribe(hoverOn => cameraService.currentHoverObject = hoverOn ? this.spaceObject.draggableHandle : null);
  }

  ngOnDestroy() {
    this.buttonHover$.next(false);
    this.buttonHover$.complete();
  }

}
