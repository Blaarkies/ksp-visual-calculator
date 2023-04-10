import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { Icons } from '../../../../common/domain/icons';
import { Checkpoint } from '../../domain/checkpoint';
import { MspEdgeComponent } from '../msp-edge/msp-edge.component';
import { MspNodeComponent } from '../msp-node/msp-node.component';

@Component({
  selector: 'cp-msp-list',
  standalone: true,
  imports: [
    CommonModule,
    MspEdgeComponent,
    MspNodeComponent,
    DragDropModule,
  ],
  templateUrl: './msp-list.component.html',
  styleUrls: ['./msp-list.component.scss'],
  animations: [
    BasicAnimations.height,
  ],
})
export class MspListComponent {

  @Input() dragModeActive: boolean;
  @Input() missionCheckpoints: Checkpoint[];

  @Output() removeNode = new EventEmitter<Checkpoint>();
  @Output() updateAll = new EventEmitter<Checkpoint[]>();
  @Output() updateNode = new EventEmitter<Checkpoint>();
  @Output() dragSuccess = new EventEmitter();

  icons = Icons;

  getNode(index: number, item: Checkpoint): string {
    return item.node.name;
  }

  drop(event: CdkDragDrop<any, any, MspNodeComponent>) {
    moveItemInArray(this.missionCheckpoints, event.previousIndex, event.currentIndex);
    this.dragSuccess.emit();
    this.updateAll.emit(this.missionCheckpoints);
  }

}
