import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MissionNode } from '../maneuver-sequence-panel.component';
import { Icons } from '../../../common/domain/icons';

@Component({
  selector: 'cp-msp-node',
  templateUrl: './msp-node.component.html',
  styleUrls: ['./msp-node.component.scss']
})
export class MspNodeComponent implements OnInit {

  @Input() details: MissionNode;

  @Output() remove = new EventEmitter();

  icons = Icons;

  constructor() { }

  ngOnInit(): void {
  }

}
