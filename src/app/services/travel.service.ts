import { Injectable } from '@angular/core';
import {
  MissionDestination,
  MissionNode
} from '../components/maneuver-sequence-panel/maneuver-sequence-panel.component';
import { BehaviorSubject, Subject } from 'rxjs';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { DeltaVGraph } from '../common/data-structures/delta-v-map/delta-v-graph';
import { TravelConditions } from '../common/data-structures/delta-v-map/travel-conditions';

@Injectable({
  providedIn: 'root'
})
export class TravelService {

  missionDestinations$ = new BehaviorSubject<MissionDestination[]>([]);
  selectedDestination$ = new Subject<SpaceObject>();
  unsubscribeSelectedDestination$ = new Subject<SpaceObject>();
  isSelectingDestination$ = new Subject<boolean>();

  dvMap = new DeltaVGraph();

  constructor() {
  }

  addMissionDestination() {
    this.isSelectingDestination$.next(true);
    this.unsubscribeSelectedDestination$.next();

    this.selectedDestination$
      .pipe(
        finalize(() => this.isSelectingDestination$.next(false)),
        take(1),
        takeUntil(this.unsubscribeSelectedDestination$))
      .subscribe(so => {
        this.addNode(so);
      })
  }

  private addNode(so: SpaceObject) {
    let availableConditions = this.dvMap.getAvailableConditionsFor(so.label);

    let node = new MissionNode({
      body: so,
      name: so.label,
      condition: availableConditions.first(),
      availableConditions,
    });

    let newList = [...this.missionDestinations$.value, {node}];

    this.updateMissionList(newList);
  }

  selectDestination(so: SpaceObject) {
    let isSameAsLastNode = false;
    if (isSameAsLastNode) {
      return;
    }

    this.selectedDestination$.next(so);
  }

  resetMission() {
    this.missionDestinations$.next([]);

    this.unsubscribeSelectedDestination$.next();
    this.isSelectingDestination$.next(false);
  }

  removeMissionDestination(md: MissionDestination) {
    let newList = [...this.missionDestinations$.value.remove(md)];

    this.updateMissionList(newList);

    this.isSelectingDestination$.next(false);
    this.unsubscribeSelectedDestination$.next();
  }

  updateMissionDestination(md: MissionDestination) {
    this.updateMissionList(this.missionDestinations$.value);

    this.isSelectingDestination$.next(false);
    this.unsubscribeSelectedDestination$.next();
  }

  private updateMissionList(newList: MissionDestination[]) {
    let nodeList = newList.map(md => md.node);
    nodeList = this.calculateNodeDetails(nodeList);
    let updatedList = this.calculateEdgesDetails(nodeList);
    this.missionDestinations$.next(updatedList);
  }

  private calculateEdgesDetails(nodes: MissionNode[]): MissionDestination[] {
    let destinationEdges = nodes.windowed(2)
      .map(([a, b]) => {
        let trip = this.dvMap.getTripDetails(a, b);
        return {
          edge: {
            dv: trip.totalDv,
            twr: (Math.random() * 2).toFixed(1).toNumber(),
            pathDetails: trip.pathDetails,
          },
          node: b,
        };
      });

    return [
      {node: nodes[0]},
      ...destinationEdges,
    ];
  }

  private calculateNodeDetails(nodes: MissionNode[]): MissionNode[] {
    let processedNodes = nodes.windowed(2)
      .map(([a, b]) => ({
        ...b,
        allowAerobraking: true,
        allowGravityAssist: true,
      }));

    return [nodes.first(), ...processedNodes];
  }

  setHoverBody(body: SpaceObject, hover: boolean) {

  }

  unsubscribeFromComponent() {
    this.selectedDestination$.complete();
    this.unsubscribeSelectedDestination$.complete();
  }

}
