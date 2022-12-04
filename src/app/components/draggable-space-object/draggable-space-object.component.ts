import { Component, EventEmitter, Input, OnDestroy, Output, ViewEncapsulation } from '@angular/core';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { filter, Subject, takeUntil } from 'rxjs';
import { CameraService } from '../../services/camera.service';
import { WithDestroy } from '../../common/with-destroy';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { Icons } from '../../common/domain/icons';

@Component({
  selector: 'cp-draggable-space-object',
  templateUrl: './draggable-space-object.component.html',
  styleUrls: ['./draggable-space-object.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [CustomAnimation.fade],
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
