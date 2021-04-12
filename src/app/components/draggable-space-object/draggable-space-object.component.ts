import { Component, EventEmitter, Input, OnDestroy, Output, ViewEncapsulation } from '@angular/core';
import { Draggable } from '../../common/domain/space-objects/draggable';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { Subject } from 'rxjs';
import { CameraService } from '../../services/camera.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'cp-draggable-space-object',
  templateUrl: './draggable-space-object.component.html',
  styleUrls: ['./draggable-space-object.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [CustomAnimation.animateFade],
})
export class DraggableSpaceObjectComponent implements OnDestroy {

  @Input() spaceObject: Draggable;
  @Input() scale: number;

  @Output() dragSpaceObject = new EventEmitter<MouseEvent>();
  @Output() editSpaceObject = new EventEmitter<void>();

  buttonHover$ = new Subject<boolean>();

  constructor(cameraService: CameraService) {
    // tell camera service that any zoom at action should focus on this object
    this.buttonHover$
      .pipe(
        filter(hoverOn => {
          let mustSetNewObject = !cameraService.currentHoverObject || hoverOn;
          let mustRemoveSelf = cameraService.currentHoverObject === this.spaceObject && !hoverOn;
          return mustSetNewObject || mustRemoveSelf;
        }),
      )
      .subscribe(hoverOn => cameraService.currentHoverObject = hoverOn ? this.spaceObject : null);
  }

  ngOnDestroy() {
    this.buttonHover$.next();
    this.buttonHover$.complete();
  }

}
