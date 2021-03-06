import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomAnimation } from '../../../common/domain/custom-animation';
import { Icons } from '../../../common/domain/icons';
import { Checkpoint } from '../../../common/data-structures/delta-v-map/checkpoint';

@Component({
  selector: 'cp-msp-list',
  templateUrl: './msp-list.component.html',
  styleUrls: ['./msp-list.component.scss'],
  animations: [CustomAnimation.height, CustomAnimation.fade],
})
export class MspListComponent {

  missionCheckpoints: Checkpoint[];

  @Input() set checkpoints(value: Checkpoint[]) {
    this.missionCheckpoints = value;

    let edges = value.slice(1).map(md => md.edge);
    this.deltaVTotal = edges.map(edge => edge.dv).sum();
    // this.twrMinimum = edges.map(edge => edge.twr).sort().first();
  }

  @Input() isAddingCheckpoint: boolean;

  @Output() add = new EventEmitter();
  @Output() checkpointMode = new EventEmitter<boolean>();
  @Output() resetAll = new EventEmitter();
  @Output() removeNode = new EventEmitter<Checkpoint>();
  @Output() updateNode = new EventEmitter<Checkpoint>();

  deltaVTotal: number;
  // twrMinimum: number;
  icons = Icons;
  isTapCheckpointMode = false;

  getNode(index: number, item: Checkpoint): string {
    return item.node.name;
  }

  toggleTapCheckpointMode() {
    this.isTapCheckpointMode = !this.isTapCheckpointMode;
    this.checkpointMode.emit(this.isTapCheckpointMode);
  }

  addCheckpoint() {
    this.isTapCheckpointMode = false;
    this.checkpointMode.emit(false);

    this.add.emit();
  }

  resetMission() {
    this.isTapCheckpointMode = false;
    this.checkpointMode.emit(false);

    this.resetAll.emit();
  }

}
