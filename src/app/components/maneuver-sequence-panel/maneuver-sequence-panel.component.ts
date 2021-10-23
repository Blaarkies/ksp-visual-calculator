import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TravelCondition } from '../../common/data-structures/delta-v-map/travel-condition';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { Icons } from '../../common/domain/icons';
import { FormControl } from '@angular/forms';
import { ControlMetaNumber } from '../../common/domain/input-fields/control-meta-number';
import { sampleTime, startWith, takeUntil } from 'rxjs/operators';
import { WithDestroy } from '../../common/with-destroy';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { PathDetailsReader } from './msp-edge/path-details-reader';
import { MatSelectChange } from '@angular/material/select';
import { Checkpoint } from '../../common/data-structures/delta-v-map/checkpoint';
import { CheckpointPreferences } from '../../common/domain/checkpoint-preferences';
import { SetupService } from '../../services/setup.service';

@Component({
  selector: 'cp-maneuver-sequence-panel',
  templateUrl: './maneuver-sequence-panel.component.html',
  styleUrls: ['./maneuver-sequence-panel.component.scss'],
  animations: [CustomAnimation.height],
})
export class ManeuverSequencePanelComponent extends WithDestroy() {

  @Input() checkpoints: Checkpoint[];

  @Output() add = new EventEmitter();
  @Output() resetAll = new EventEmitter();
  @Output() removeCheckpoint = new EventEmitter<Checkpoint>();
  @Output() updateCheckpoint = new EventEmitter<Checkpoint>();
  @Output() updatePreferences = new EventEmitter<CheckpointPreferences>();

  isOptionsOpen = false;
  icons = Icons;
  conditionReadableMap = PathDetailsReader.conditionMap;
  availableConditions = [
    TravelCondition.Surface,
    TravelCondition.LowOrbit,
    TravelCondition.EllipticalOrbit,
  ];

  aerobrakeControl = new FormControl(this.setupService.checkpointPreferences$.value.aerobraking);

  planeChangeControl = new FormControl(this.setupService.checkpointPreferences$.value.planeChangeCost);
  planeChangeControlMeta = new ControlMetaNumber(0, 100, 1);

  preferredCondition$ = new BehaviorSubject(this.setupService.checkpointPreferences$.value.condition);

  constructor(private setupService: SetupService) {
    super();

    combineLatest([
      this.aerobrakeControl.valueChanges.pipe(startWith(this.aerobrakeControl.value as boolean)),
      this.planeChangeControl.valueChanges.pipe(startWith(this.planeChangeControl.value as number)),
      this.preferredCondition$])
      .pipe(
        sampleTime(50),
        takeUntil(this.destroy$))
      .subscribe(([aerobraking, planeChangeCost, condition]) =>
        this.updatePreferences.emit({aerobraking, planeChangeCost, condition} as CheckpointPreferences));

    this.setupService.checkpointPreferences$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cp => {
        this.aerobrakeControl.setValue(cp.aerobraking);
        this.planeChangeControl.setValue(cp.planeChangeCost);
        this.preferredCondition$.next(cp.condition);
      });
  }

  setPreferredCondition(event: MatSelectChange) {
    this.preferredCondition$.next(event.value);
  }
}
