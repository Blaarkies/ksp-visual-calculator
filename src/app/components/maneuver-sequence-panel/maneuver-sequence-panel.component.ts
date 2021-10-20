import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { TravelCondition } from '../../common/data-structures/delta-v-map/travel-condition';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { Icons } from '../../common/domain/icons';
import { FormControl } from '@angular/forms';
import { ControlMetaNumber } from '../../common/domain/input-fields/control-meta-number';
import { sampleTime, startWith, takeUntil } from 'rxjs/operators';
import { WithDestroy } from '../../common/with-destroy';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Preferences } from '../../services/travel.service';
import { PathDetailsReader } from './msp-edge/path-details-reader';
import { MatSelectChange } from '@angular/material/select';

export class MissionNode {

  body: SpaceObject;
  name: string;
  condition: string;
  aerobraking: boolean;
  gravityAssist: boolean;
  availableConditions: TravelCondition[];

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
  styleUrls: ['./maneuver-sequence-panel.component.scss'],
  animations: [CustomAnimation.height],
})
export class ManeuverSequencePanelComponent extends WithDestroy() {

  @Input() destinationList: MissionDestination[];

  @Output() add = new EventEmitter();
  @Output() reset = new EventEmitter();
  @Output() removeDestination = new EventEmitter<MissionDestination>();
  @Output() updateDestination = new EventEmitter<MissionDestination>();
  @Output() updatePreferences = new EventEmitter<Preferences>();

  isOptionsOpen = false;
  icons = Icons;
  conditionReadableMap = PathDetailsReader.conditionMap;
  availableConditions = [
    TravelCondition.Surface,
    TravelCondition.LowOrbit,
    TravelCondition.EllipticalOrbit,
  ];

  aerobrakeControl = new FormControl(false);

  planeChangeControl = new FormControl(100);
  planeChangeControlMeta = new ControlMetaNumber(0, 100, 1);

  preferredCondition$ = new BehaviorSubject(TravelCondition.Surface);

  constructor() {
    super();

    combineLatest(
      this.aerobrakeControl.valueChanges.pipe(startWith(this.aerobrakeControl.value)),
      this.planeChangeControl.valueChanges.pipe(startWith(this.planeChangeControl.value)),
      this.preferredCondition$)
      .pipe(
        sampleTime(100),
        takeUntil(this.destroy$))
      .subscribe(([aerobraking, planeChangeCost, condition]) =>
        this.updatePreferences.emit({aerobraking, planeChangeCost, condition} as Preferences));
  }

  setPreferredCondition(event: MatSelectChange) {
    this.preferredCondition$.next(event.value);
  }
}
