import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MissionDestination, MissionNode } from '../maneuver-sequence-panel.component';
import { CustomAnimation } from '../../../common/domain/custom-animation';
import { Icons } from '../../../common/domain/icons';

@Component({
  selector: 'cp-msp-list',
  templateUrl: './msp-list.component.html',
  styleUrls: ['./msp-list.component.scss'],
  animations: [CustomAnimation.animateScaleVertical],
})
export class MspListComponent {

  @Input() destinationList: MissionDestination[];

  @Output() add = new EventEmitter();
  @Output() reset = new EventEmitter();
  @Output() removeNode = new EventEmitter<MissionDestination>();

  icons = Icons;

  constructor() {
  }

  getNode(index: number, item: MissionDestination): MissionNode {
    return item.node;
  }

}
