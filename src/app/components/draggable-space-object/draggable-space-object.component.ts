import { Component, EventEmitter, Input, OnDestroy, Output, ViewEncapsulation } from '@angular/core';
import { Draggable } from '../../common/domain/space-objects/draggable';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { Subject } from 'rxjs';

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

  ngOnDestroy() {
    this.buttonHover$.next();
    this.buttonHover$.complete();
  }

}
