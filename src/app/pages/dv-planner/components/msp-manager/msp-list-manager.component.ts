import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { Icons } from '../../../../common/domain/icons';
import { Checkpoint } from '../../domain/checkpoint';
import { MspListComponent } from '../msp-list/msp-list.component';

@Component({
  selector: 'cp-msp-list-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MspListComponent,
  ],
  templateUrl: './msp-list-manager.component.html',
  styleUrls: ['./msp-list-manager.component.scss'],
  animations: [BasicAnimations.height],
})
export class MspListManagerComponent {

  @Input() set checkpoints(value: Checkpoint[]) {
    this.missionCheckpoints = value;

    let edges = value.slice(1).map(md => md.edge);
    this.deltaVTotal = edges.map(edge => edge.dv).sum();
  }

  @Input() isAddingCheckpoint: boolean;

  @Output() add = new EventEmitter();
  @Output() checkpointMode = new EventEmitter<boolean>();
  @Output() resetAll = new EventEmitter();
  @Output() removeNode = new EventEmitter<Checkpoint>();
  @Output() updateAll = new EventEmitter<Checkpoint[]>();
  @Output() updateNode = new EventEmitter<Checkpoint>();

  missionCheckpoints: Checkpoint[];
  deltaVTotal: number;
  icons = Icons;
  isTapCheckpointMode = false;
  dragModeActive = false;

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

  setDragMode(active?: boolean) {
    this.dragModeActive = active === undefined
      ? !this.dragModeActive
      : active;
  }

}
