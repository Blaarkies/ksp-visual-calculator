import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { TravelConditions } from '../../common/data-structures/delta-v-map/travel-conditions';

export class MissionNode {

  body: SpaceObject;
  name: string;
  condition: string;
  aerobraking: boolean;
  gravityAssist: boolean;
  availableConditions: TravelConditions[];

  allowAerobraking: boolean;
  allowGravityAssist: boolean;

  constructor(params: any) {
    this.body = params.body;
    this.name = params.name;
    this.condition = params.condition;
    this.aerobraking = params.aerobraking;
    this.gravityAssist = params.gravityAssist;
    this.availableConditions = params.availableConditions;
  }

}

export class MissionEdge {
  dv: number;
  twr: number;
  pathDetails: any[];
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
export class ManeuverSequencePanelComponent {

  @Input() destinationList: MissionDestination[];

  @Output() add = new EventEmitter();
  @Output() reset = new EventEmitter();
  @Output() removeDestination = new EventEmitter<MissionDestination>();
  @Output() updateDestination = new EventEmitter<MissionDestination>();

  constructor() {
  }

}
