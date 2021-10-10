import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MissionDestination, MissionNode } from '../maneuver-sequence-panel.component';
import { CustomAnimation } from '../../../common/domain/custom-animation';
import { Icons } from '../../../common/domain/icons';

@Component({
  selector: 'cp-msp-list',
  templateUrl: './msp-list.component.html',
  styleUrls: ['./msp-list.component.scss'],
  animations: [CustomAnimation.animateHeight],
})
export class MspListComponent {

  _missionDestinations: MissionDestination[];

  @Input() set destinationList(value: MissionDestination[]) {
    this._missionDestinations = value;

    let edges = value.slice(1).map(md => md.edge);
    this.deltaVTotal = edges.map(edge => edge.dv).sum();
    this.twrMinimum = edges.map(edge => edge.twr).sort().first();
  }

  @Output() add = new EventEmitter();
  @Output() reset = new EventEmitter();
  @Output() removeNode = new EventEmitter<MissionDestination>();
  @Output() updateNode = new EventEmitter<MissionDestination>();

  deltaVTotal: number;
  twrMinimum: number;
  icons = Icons;

  constructor() {
  }

  getNode(index: number, item: MissionDestination): MissionNode {
    return item.node;
  }

}
