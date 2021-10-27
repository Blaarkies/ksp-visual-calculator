import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TravelCondition } from '../../common/data-structures/delta-v-map/travel-condition';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { Icons } from '../../common/domain/icons';
import { FormControl } from '@angular/forms';
import { ControlMetaNumber } from '../../common/domain/input-fields/control-meta-number';
import { debounceTime, distinctUntilChanged, sampleTime, startWith, takeUntil } from 'rxjs/operators';
import { WithDestroy } from '../../common/with-destroy';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { PathDetailsReader } from './msp-edge/path-details-reader';
import { MatSelectChange } from '@angular/material/select';
import { Checkpoint } from '../../common/data-structures/delta-v-map/checkpoint';
import { CheckpointPreferences } from '../../common/domain/checkpoint-preferences';
import { SetupService } from '../../services/setup.service';
import { AnalyticsService } from '../../services/analytics.service';
import { EventLogs } from '../../services/event-logs';
import { TravelService } from '../../services/travel.service';

@Component({
  selector: 'cp-maneuver-sequence-panel',
  templateUrl: './maneuver-sequence-panel.component.html',
  styleUrls: ['./maneuver-sequence-panel.component.scss'],
  animations: [CustomAnimation.height],
})
export class ManeuverSequencePanelComponent extends WithDestroy() {

  checkpoints$ = this.travelService.checkpoints$.asObservable();
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

  constructor(private travelService: TravelService,
              private setupService: SetupService,
              private analyticsService: AnalyticsService) {
    super();

    let preferencesDebouncer$ = new Subject<CheckpointPreferences>();
    combineLatest([
      this.aerobrakeControl.valueChanges.pipe(startWith(this.aerobrakeControl.value as boolean)),
      this.planeChangeControl.valueChanges.pipe(startWith(this.planeChangeControl.value as number)),
      this.preferredCondition$])
      .pipe(
        sampleTime(50),
        distinctUntilChanged((x, y) => x.every((argument, i) => argument === y[i])),
        takeUntil(this.destroy$))
      .subscribe(([aerobraking, planeChangeCost, condition]) => {
        let preferences = {aerobraking, planeChangeCost, condition} as CheckpointPreferences;
        this.updatePreferences(preferences);
        preferencesDebouncer$.next(preferences);
      });

    this.setupService.checkpointPreferences$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cp => {
        this.aerobrakeControl.setValue(cp.aerobraking);
        this.planeChangeControl.setValue(cp.planeChangeCost);
        this.preferredCondition$.next(cp.condition);
      });

    preferencesDebouncer$.pipe(
      debounceTime(10e3),
      takeUntil(this.destroy$))
      .subscribe(preferences => this.analyticsService.logEvent('Update checkpoint configuration', {
        category: EventLogs.Category.DeltaV,
        ...preferences,
      }));
  }

  setPreferredCondition(event: MatSelectChange) {
    this.preferredCondition$.next(event.value);
  }

  toggleOptions() {
    this.isOptionsOpen = !this.isOptionsOpen;

    if (this.isOptionsOpen) {
      this.analyticsService.logEvent('Open checkpoints configuration', {
        category: EventLogs.Category.DeltaV,
      });
    }
  }

  addCheckpoint() {
    this.travelService.addCheckpoint();
  }

  resetMission() {
    this.travelService.resetCheckpoints();
  }

  removeCheckpoint(checkpoint: Checkpoint) {
    this.travelService.removeCheckpoint(checkpoint);
  }

  updateCheckpoint(checkpoint: Checkpoint) {
    this.travelService.updateCheckpoint(checkpoint);
  }

  updatePreferences(newPreferences: CheckpointPreferences) {
    this.travelService.updatePreferences(newPreferences);
  }

}
