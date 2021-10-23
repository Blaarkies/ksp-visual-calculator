import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomAnimation } from '../../../common/domain/custom-animation';
import { Icons } from '../../../common/domain/icons';
import { Checkpoint } from '../../../common/data-structures/delta-v-map/checkpoint';

@Component({
  selector: 'cp-msp-list',
  templateUrl: './msp-list.component.html',
  styleUrls: ['./msp-list.component.scss'],
  animations: [CustomAnimation.height],
})
export class MspListComponent {

  missionCheckpoints: Checkpoint[];

  @Input() set checkpoints(value: Checkpoint[]) {
    this.missionCheckpoints = value;

    let edges = value.slice(1).map(md => md.edge);
    this.deltaVTotal = edges.map(edge => edge.dv).sum();
    // this.twrMinimum = edges.map(edge => edge.twr).sort().first();
  }

  @Output() add = new EventEmitter();
  @Output() resetAll = new EventEmitter();
  @Output() removeNode = new EventEmitter<Checkpoint>();
  @Output() updateNode = new EventEmitter<Checkpoint>();

  deltaVTotal: number;
  // twrMinimum: number;
  icons = Icons;

  getNode(index: number, item: Checkpoint): string {
    return item.node.name;
  }

}
