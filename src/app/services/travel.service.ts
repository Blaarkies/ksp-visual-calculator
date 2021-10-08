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
    let conditions = [
      TravelConditions.Surface,
      TravelConditions.LowOrbit,
      TravelConditions.EllipticalOrbit,
    ];
    let randomCondition = (Math.random() * (conditions.length - 1)).toInt();

    let node = {
      body: so,
      name: so.label,
      condition: conditions[randomCondition],
    };

    let newList = [...this.missionDestinations$.value, {node}];

    this.updateMissionEdges(newList);
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

    this.updateMissionEdges(newList);

    this.isSelectingDestination$.next(false);
    this.unsubscribeSelectedDestination$.next();
  }

  private updateMissionEdges(newList: MissionDestination[]) {
    let updatedList = this.calculateEdges(newList.map(md => md.node));
    this.missionDestinations$.next(updatedList);
  }

  private calculateEdges(nodes: MissionNode[]): MissionDestination[] {

    let destinationEdges = nodes.windowed(2)
      .map(([a, b]) => ({
        edge: {
          dv: this.dvMap.getDeltaVRequirement(a, b, {}),
          twr: (Math.random() * 2).toFixed(1).toNumber(),
        },
        node: b,
      }));

    return [
      {node: nodes[0]},
      ...destinationEdges,
    ];
  }

  setHoverBody(body: SpaceObject, hover: boolean) {

  }

  unsubscribeFromComponent() {
    this.selectedDestination$.complete();
    this.unsubscribeSelectedDestination$.complete();
  }

}
