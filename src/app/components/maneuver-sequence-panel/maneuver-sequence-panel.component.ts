import { Component } from '@angular/core';
import { TravelCondition } from '../../common/data-structures/delta-v-map/travel-condition';
import { BasicAnimations } from '../../common/animations/basic-animations';
import { Icons } from '../../common/domain/icons';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { ControlMetaNumber } from '../../common/domain/input-fields/control-meta-number';
import { WithDestroy } from '../../common/with-destroy';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  sampleTime,
  startWith,
  Subject,
  takeUntil
} from 'rxjs';
import { PathDetailsReader } from './msp-edge/path-details-reader';
import { Checkpoint } from '../../common/data-structures/delta-v-map/checkpoint';
import { CheckpointPreferences } from '../../common/domain/checkpoint-preferences';
import { SetupService } from '../../services/setup.service';
import { AnalyticsService } from '../../services/analytics.service';
import { EventLogs } from '../../services/domain/event-logs';
import { TravelService } from '../../pages/page-dv-planner/services/travel.service';
import { DvRouteType } from '../../common/domain/dv-route-type';
import { CommonModule } from '@angular/common';
import { MspListComponent } from './msp-list/msp-list.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputNumberComponent } from '../controls/input-number/input-number.component';
import { InputToggleComponent } from '../controls/input-toggle/input-toggle.component';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'cp-maneuver-sequence-panel',
  standalone: true,
  imports: [
    CommonModule,
    MspListComponent,
    InputNumberComponent,
    InputToggleComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    ReactiveFormsModule,
  ],
  templateUrl: './maneuver-sequence-panel.component.html',
  styleUrls: ['./maneuver-sequence-panel.component.scss'],
  animations: [BasicAnimations.expandY],
})
export class ManeuverSequencePanelComponent extends WithDestroy() {

  checkpoints$ = this.travelService.checkpoints$.asObservable();
  isSelectingCheckpoint$ = this.travelService.isSelectingCheckpoint$.asObservable();
  isOptionsOpen = false;
  icons = Icons;
  conditionReadableMap = PathDetailsReader.conditionMap;
  availableConditions = [
    TravelCondition.Surface,
    TravelCondition.LowOrbit,
    TravelCondition.EllipticalOrbit,
  ];

  routeTypeReadableMap = {
    [DvRouteType.lessDetours]: 'Direct',
    [DvRouteType.lessDv]: 'Efficient',
  };
  routeTypes = [DvRouteType.lessDv, DvRouteType.lessDetours];

  aerobrakeControl = new UntypedFormControl(this.setupService.checkpointPreferences$.value.aerobraking);

  errorMarginControl = new UntypedFormControl(this.setupService.checkpointPreferences$.value.errorMargin);
  errorMarginControlMeta = new ControlMetaNumber(0, 150, 2);

  planeChangeControl = new UntypedFormControl(this.setupService.checkpointPreferences$.value.planeChangeCost);
  planeChangeControlMeta = new ControlMetaNumber(0, 100, 1.5);

  preferredCondition$ = new BehaviorSubject(this.setupService.checkpointPreferences$.value.condition);
  routeType$ = new BehaviorSubject(this.setupService.checkpointPreferences$.value.routeType);

  constructor(private travelService: TravelService,
              private setupService: SetupService,
              private analyticsService: AnalyticsService) {
    super();

    let preferencesDebouncer$ = new Subject<CheckpointPreferences>();
    combineLatest([
      this.errorMarginControl.valueChanges.pipe(startWith(this.errorMarginControl.value as boolean)),
      this.aerobrakeControl.valueChanges.pipe(startWith(this.aerobrakeControl.value as boolean)),
      this.planeChangeControl.valueChanges.pipe(startWith(this.planeChangeControl.value as number)),
      this.preferredCondition$,
      this.routeType$])
      .pipe(
        sampleTime(50),
        distinctUntilChanged((x, y) => x.every((argument, i) => argument === y[i])),
        takeUntil(this.destroy$))
      .subscribe(([errorMargin, aerobraking, planeChangeCost, condition, routeType]) => {
        let preferences = {errorMargin, aerobraking, planeChangeCost, condition, routeType} as CheckpointPreferences;
        this.updatePreferences(preferences);
        preferencesDebouncer$.next(preferences);
      });

    this.setupService.checkpointPreferences$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cp => {
        this.errorMarginControl.setValue(cp.errorMargin);
        this.aerobrakeControl.setValue(cp.aerobraking);
        this.planeChangeControl.setValue(cp.planeChangeCost);
        this.preferredCondition$.next(cp.condition);
        this.routeType$.next(cp.routeType);
      });

    preferencesDebouncer$.pipe(
      debounceTime(10e3),
      takeUntil(this.destroy$))
      .subscribe(preferences => this.analyticsService.logEvent('Update checkpoint preferences', {
        category: EventLogs.Category.DeltaV,
        ...preferences,
      }));
  }

  setPreferredCondition(value: TravelCondition) {
    this.preferredCondition$.next(value);
  }

  setRouteType(value: DvRouteType) {
    this.routeType$.next(value);
  }

  toggleOptions() {
    this.isOptionsOpen = !this.isOptionsOpen;

    if (this.isOptionsOpen) {
      this.analyticsService.logEvent('Open checkpoints configuration', {
        category: EventLogs.Category.DeltaV,
      });
    }
  }

  addCheckpoint(isSelecting: boolean) {
    if (isSelecting) {
      this.travelService.stopCheckpointSelection();
    } else {
      this.travelService.addCheckpoint();
    }
  }

  setCheckpointMode(isLocked: boolean) {
    this.travelService.setCheckpointMode(isLocked);
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
