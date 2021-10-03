import { Component, ViewChild } from '@angular/core';
import { UsableRoutes } from '../../usable-routes';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { WithDestroy } from '../../common/with-destroy';
import { HudService } from '../../services/hud.service';
import { StateService } from '../../services/state.service';
import { UniverseMapComponent } from '../../components/universe-map/universe-map.component';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import {
  MissionDestination,
  MissionEdge, MissionNode
} from '../../components/maneuver-sequence-panel/maneuver-sequence-panel.component';
import { Subject } from 'rxjs';
import { Uid } from '../../common/uid';

@Component({
  selector: 'cp-page-dv-planner',
  templateUrl: './page-dv-planner.component.html',
  styleUrls: ['./page-dv-planner.component.scss'],
})
export class PageDvPlannerComponent extends WithDestroy() {

  @ViewChild('universeMap') universeMap: UniverseMapComponent;

  missionDestinations: MissionDestination[] = [];

  selectedDestination$ = new Subject<SpaceObject>();
  unsubscribeSelectedDestination$ = new Subject<SpaceObject>();
  isSelectingDestination = false;

  constructor(hudService: HudService,
              stateService: StateService) {
    super();

    hudService.setPageContext(UsableRoutes.DvPlanner);
    stateService.pageContext = UsableRoutes.DvPlanner;
    stateService.loadState().pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.selectedDestination$.complete();
    this.unsubscribeSelectedDestination$.complete();
  }

  addMissionDestination() {
    this.isSelectingDestination = true;
    this.unsubscribeSelectedDestination$.next();

    this.selectedDestination$
      .pipe(
        finalize(() => this.isSelectingDestination = false),
        take(1),
        takeUntil(this.unsubscribeSelectedDestination$),
        takeUntil(this.destroy$))
      .subscribe(so => {
        this.addNode(so);
      })
  }

  private addNode(so: SpaceObject) {
    let conditions = [
      'Surface',
      'Low orbit',
      'Elliptical',
      'Fly by',
    ];
    let randomCondition = (Math.random() * (conditions.length - 1))
      .toInt();

    let node = {
      body: so,
      name: so.label,
      situation: conditions[randomCondition],
    };

    this.missionDestinations.push({node});

    if (this.missionDestinations.length) {
      this.updateMissionEdges();
    }
  }

  selectDestination(so: SpaceObject) {
    let isSameAsLastNode = false;
    if (isSameAsLastNode) {
      return;
    }

    this.selectedDestination$.next(so);
  }

  resetMission() {
    this.missionDestinations = [];

    this.unsubscribeSelectedDestination$.next();
    this.isSelectingDestination = false;
  }

  removeMissionDestination(md: MissionDestination) {
    this.missionDestinations.remove(md);

    this.updateMissionEdges();

    this.isSelectingDestination = false;
    this.unsubscribeSelectedDestination$.next();
  }

  private updateMissionEdges() {
    this.missionDestinations = this.calculateEdges(this.missionDestinations.map(md => md.node));
  }

  private calculateEdges(nodes: MissionNode[]): MissionDestination[] {
    let edge = () => ({
      dv: (Math.random() * 1e3).toInt(),
      twr: (Math.random() * 2).toFixed(1).toNumber(),
    } as MissionEdge);

    return nodes.map((node, i) => i === 0
      ? {node}
      : {edge: edge(), node});
  }

  setHoverBody(body: SpaceObject, hover: boolean) {

  }

}
