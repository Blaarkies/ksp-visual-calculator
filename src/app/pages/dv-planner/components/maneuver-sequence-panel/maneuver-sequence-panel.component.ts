import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  sampleTime,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { ConfigurableAnimations } from '../../../../animations/configurable-animations';
import { CheckpointPreferences } from '../../../../common/domain/checkpoint-preferences';
import { Icons } from '../../../../common/domain/icons';
import { ControlMetaNumber } from '../../../../common/domain/input-fields/control-meta-number';
import { WithDestroy } from '../../../../common/with-destroy';
import { InputNumberComponent } from '../../../../components/controls/input-number/input-number.component';
import { InputToggleComponent } from '../../../../components/controls/input-toggle/input-toggle.component';
import { AnalyticsService } from '../../../../services/analytics.service';
import { EventLogs } from '../../../../services/domain/event-logs';
import { Checkpoint } from '../../domain/checkpoint';
import { DvRouteType } from '../../domain/dv-route-type';
import { PathDetailsReader } from '../../domain/path-details-reader';
import { TravelCondition } from '../../domain/travel-condition';
import { DvUniverseBuilderService } from '../../services/dv-universe-builder.service';
import { TravelService } from '../../services/travel.service';
import { MspListManagerComponent } from '../msp-manager/msp-list-manager.component';

@Component({
  selector: 'cp-maneuver-sequence-panel',
  standalone: true,
  imports: [
    CommonModule,
    InputNumberComponent,
    InputToggleComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    ReactiveFormsModule,
    MspListManagerComponent,
  ],
  templateUrl: './maneuver-sequence-panel.component.html',
  styleUrls: ['./maneuver-sequence-panel.component.scss'],
  animations: [
    BasicAnimations.expandY,
    ConfigurableAnimations.openCloseX(28),
    ConfigurableAnimations.openCloseY(28),
    BasicAnimations.flipHorizontal,
  ],
})
export class ManeuverSequencePanelComponent extends WithDestroy() {

  checkpoints$ = this.travelService.checkpoints$.stream$;
  isSelectingCheckpoint$ = this.travelService.isSelectingCheckpoint$.asObservable();
  isOpen = true;
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

  aerobrakeControl: FormControl<boolean>;
  errorMarginControl: FormControl<number>;
  errorMarginControlMeta: ControlMetaNumber;
  planeChangeControl: FormControl<number>;
  planeChangeControlMeta: ControlMetaNumber;
  preferredCondition$: BehaviorSubject<TravelCondition>;
  routeType$: BehaviorSubject<DvRouteType>;

  constructor(private travelService: TravelService,
              private universeBuilderService: DvUniverseBuilderService,
              private analyticsService: AnalyticsService) {
    super();

    let preferences = this.universeBuilderService.checkpointPreferences$.value;
    this.aerobrakeControl = new FormControl(preferences.aerobraking);
    this.errorMarginControl = new FormControl(preferences.errorMargin);
    this.errorMarginControlMeta = new ControlMetaNumber(0, 150, 2);
    this.planeChangeControl = new FormControl(preferences.planeChangeCost);
    this.planeChangeControlMeta = new ControlMetaNumber(0, 100, 1.5);
    this.preferredCondition$ = new BehaviorSubject(preferences.condition);
    this.routeType$ = new BehaviorSubject(preferences.routeType);

    let preferencesDebouncer$ = new Subject<CheckpointPreferences>();
    combineLatest([
      this.errorMarginControl.valueChanges.pipe(startWith(this.errorMarginControl.value as number)),
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

    this.universeBuilderService.checkpointPreferences$.stream$
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

  updateMission(checkpoints: Checkpoint[]) {
    this.travelService.refreshCheckpoints(checkpoints);
  }

  removeCheckpoint(checkpoint: Checkpoint) {
    this.travelService.removeCheckpoint(checkpoint);
  }

  updateCheckpoint(checkpoint: Checkpoint) {
    this.travelService.updateCheckpoint(checkpoint);
  }

  updatePreferences(value: CheckpointPreferences) {
    this.universeBuilderService.updateCheckpointPreferences(value);
  }

}
