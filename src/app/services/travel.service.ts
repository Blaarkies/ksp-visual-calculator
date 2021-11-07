import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { DeltaVGraph } from '../common/data-structures/delta-v-map/delta-v-graph';
import { TravelCondition } from '../common/data-structures/delta-v-map/travel-condition';
import { CheckpointNode } from '../common/data-structures/delta-v-map/checkpoint-node';
import { CheckpointEdge } from '../common/data-structures/delta-v-map/checkpoint-edge';
import { Checkpoint } from '../common/data-structures/delta-v-map/checkpoint';
import { CheckpointPreferences } from '../common/domain/checkpoint-preferences';
import { StateCheckpoint } from './json-interfaces/state-checkpoint';
import { SetupService } from './setup.service';
import { EventLogs } from './event-logs';
import { AnalyticsService } from './analytics.service';

@Injectable({
  providedIn: 'root'
})
export class TravelService {

  checkpoints$ = new BehaviorSubject<Checkpoint[]>([]);
  selectedCheckpoint$ = new Subject<SpaceObject>();
  unsubscribeSelectedCheckpoint$ = new Subject<SpaceObject>();
  isSelectingCheckpoint$ = new Subject<boolean>();

  dvMap = new DeltaVGraph();

  constructor(private setupService: SetupService,
              private analyticsService: AnalyticsService) {
  }

  addCheckpoint() {
    this.isSelectingCheckpoint$.next(true);
    this.unsubscribeSelectedCheckpoint$.next();

    this.selectedCheckpoint$
      .pipe(
        finalize(() => this.isSelectingCheckpoint$.next(false)),
        take(1),
        takeUntil(this.unsubscribeSelectedCheckpoint$))
      .subscribe(so => this.addNode(so));
  }

  private addNode(so: SpaceObject) {
    let availableConditions = this.getAvailableConditionsByLabel(so.label);

    let node = new CheckpointNode({
      body: so,
      name: so.label,
      condition: availableConditions.find(c => c === this.setupService.checkpointPreferences$.value.condition)
        ?? availableConditions.first(),
      availableConditions,
      aerobraking: this.setupService.checkpointPreferences$.value.aerobraking,
      gravityAssist: false,
    });

    let newList = [...this.checkpoints$.value, new Checkpoint(node)];

    this.updateCheckpoints(newList);

    this.analyticsService.logEvent('Add checkpoint', {
      category: EventLogs.Category.DeltaV,
      checkpoints: newList.map(n => n.node.name),
    });
  }

  private getAvailableConditionsByLabel(label: string): TravelCondition[] {
    return this.dvMap.getAvailableConditionsFor(label);
  }

  selectCheckpoint(so: SpaceObject) {
    this.selectedCheckpoint$.next(so);
  }

  resetCheckpoints() {
    this.checkpoints$.next([]);

    this.stopCheckpointSelection();

    this.analyticsService.logEvent('Reset checkpoints', {
      category: EventLogs.Category.DeltaV,
    });
  }

  stopCheckpointSelection() {
    this.unsubscribeSelectedCheckpoint$.next();
    this.isSelectingCheckpoint$.next(false);
  }

  removeCheckpoint(checkpoint: Checkpoint) {
    let newList = [...this.checkpoints$.value.remove(checkpoint)];

    this.updateCheckpoints(newList);

    this.stopCheckpointSelection();

    this.analyticsService.logEvent('Reset checkpoints', {
      category: EventLogs.Category.DeltaV,
      checkpoint: checkpoint.node.name,
    });
  }

  updateCheckpoint(checkpoint: Checkpoint) {
    this.updateCheckpoints(this.checkpoints$.value);

    this.stopCheckpointSelection();
  }

  updatePreferences(newPreferences: CheckpointPreferences) {
    this.setupService.updateCheckpointPreferences(newPreferences);

    if (!this.checkpoints$.value.length) {
      return;
    }

    this.checkpoints$.value.forEach(({node}) => {
      node.aerobraking = newPreferences.aerobraking;
      let availableConditions = this.dvMap.getAvailableConditionsFor(node.name);
      node.condition = availableConditions.find(c =>
          c === this.setupService.checkpointPreferences$.value.condition)?.toString()
        ?? node.condition;
    });

    this.updateCheckpoints(this.checkpoints$.value);

    this.stopCheckpointSelection();
  }

  private updateCheckpoints(newList: Checkpoint[]) {
    if (!newList.length) {
      return this.checkpoints$.next([]);
    }

    let nodeList = newList.map(md => md.node);
    nodeList = this.calculateNodeDetails(nodeList);
    let updatedList = this.calculateEdgesDetails(nodeList, newList.first());
    this.checkpoints$.next(updatedList);
  }

  private calculateNodeDetails(nodes: CheckpointNode[]): CheckpointNode[] {
    let processedNodes = nodes.windowed(2)
      .map(([a, b]) => {
        b.allowAerobraking = this.dvMap.getNodeAllowsAerobraking(b);
        b.allowGravityAssist = false;
        return b;
      });

    return [nodes.first(), ...processedNodes];
  }

  private calculateEdgesDetails(nodes: CheckpointNode[], firstCheckpoint: Checkpoint): Checkpoint[] {
    let checkpointPreferences = this.setupService.checkpointPreferences$.value;
    let destinationEdges = nodes.windowed(2)
      .map(([a, b]) => {
        let trip = this.dvMap.getTripDetails(
          a,
          b,
          {
            planeChangeFactor: checkpointPreferences.planeChangeCost * .01,
            routeType: checkpointPreferences.routeType,
          });
        let edge = new CheckpointEdge({
          dv: trip.totalDv,
          pathDetails: trip.pathDetails,
        });
        return new Checkpoint(b, edge);
      });

    firstCheckpoint.edge = undefined;

    return [
      firstCheckpoint,
      ...destinationEdges,
    ];
  }

  // TODO: add visual hover effect on planets while user is adding a checkpoint
  setHoverBody(body: SpaceObject, hover: boolean) {

  }

  unsubscribeFromComponent() {
    this.selectedCheckpoint$.complete();
    this.unsubscribeSelectedCheckpoint$.complete();
  }

  setCheckpoints(checkpoints: Checkpoint[]) {
    this.updateCheckpoints(checkpoints);
  }

  buildState(jsonCheckpoints: StateCheckpoint[], getBodyByLabel: (label: string) => SpaceObject) {
    let getAvailableConditions = (label: string) => this.getAvailableConditionsByLabel(label);
    let checkpoints = jsonCheckpoints.map(json => Checkpoint.fromJson(json, getBodyByLabel, getAvailableConditions));

    this.setCheckpoints(checkpoints);
  }
}
