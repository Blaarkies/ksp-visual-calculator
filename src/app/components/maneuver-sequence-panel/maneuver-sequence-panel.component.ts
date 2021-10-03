import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UniverseMapComponent } from '../universe-map/universe-map.component';
import { SpaceObject } from '../../common/domain/space-objects/space-object';

export class MissionNode {
  body: SpaceObject;
  name: string;
  situation: string;
}

export class MissionEdge {
  dv: number;
  twr: number;
}

export class MissionDestination {
  edge?: MissionEdge;
  node: MissionNode;
}

@Component({
  selector: 'cp-maneuver-sequence-panel',
  templateUrl: './maneuver-sequence-panel.component.html',
  styleUrls: ['./maneuver-sequence-panel.component.scss']
})
export class ManeuverSequencePanelComponent implements OnInit {

  @Input() destinationList: MissionDestination[];

  @Output() add = new EventEmitter();
  @Output() reset = new EventEmitter();
  @Output() removeDestination = new EventEmitter<MissionDestination>();

  constructor() {
  }

  ngOnInit(): void {
  }

}
