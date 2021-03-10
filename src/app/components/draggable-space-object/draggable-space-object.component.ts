import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Draggable } from '../../common/domain/draggable';

@Component({
    selector: 'cp-draggable-space-object',
    templateUrl: './draggable-space-object.component.html',
    styleUrls: ['./draggable-space-object.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class DraggableSpaceObjectComponent {

    @Input() spaceObject: Draggable;
    @Input() scale: number;

    @Output() dragSpaceObject = new EventEmitter<MouseEvent>();

}
