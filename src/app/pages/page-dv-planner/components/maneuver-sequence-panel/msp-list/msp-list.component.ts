import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BasicAnimations } from '../../../../../animations/basic-animations';
import { Icons } from '../../../../../common/domain/icons';
import { Checkpoint } from '../../../domain/checkpoint';
import { CommonModule } from '@angular/common';
import { MspEdgeComponent } from '../msp-edge/msp-edge.component';
import { MspNodeComponent } from '../msp-node/msp-node.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'cp-msp-list',
  standalone: true,
  imports: [
    CommonModule,
    MspEdgeComponent,
    MspNodeComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './msp-list.component.html',
  styleUrls: ['./msp-list.component.scss'],
  animations: [
    BasicAnimations.height,
    BasicAnimations.fade,
  ],
})
export class MspListComponent {

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

  missionCheckpoints: Checkpoint[];
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
