import { Injectable } from '@angular/core';
import { Orbit } from '../common/domain/space-objects/orbit';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { Group } from '../common/domain/group';
import { Antenna } from '../common/domain/antenna';
import { Craft } from '../common/domain/space-objects/craft';
import { TransmissionLine } from '../common/domain/transmission-line';
import { CameraService } from './camera.service';
import { BehaviorSubject, filter, mapTo, Observable, of, take, takeUntil, tap, zip } from 'rxjs';
import { OrbitParameterData } from '../common/domain/space-objects/orbit-parameter-data';
import { CraftDetails } from '../overlays/craft-details-dialog/craft-details';
import { SetupService } from './setup.service';
import { CelestialBodyDetails } from '../overlays/celestial-body-details-dialog/celestial-body-details';
import { AnalyticsService } from './analytics.service';
import { WithDestroy } from '../common/with-destroy';
import { SpaceObjectContainerService } from './space-object-container.service';
import { SpaceObjectType } from '../common/domain/space-objects/space-object-type';
import { StateCommnetPlanner } from './json-interfaces/state-commnet-planner';
import { StateCraft } from './json-interfaces/state-craft';
import { StateSpaceObject } from './json-interfaces/state-space-object';
import { EventLogs } from './domain/event-logs';
import { StateDvPlanner } from './json-interfaces/state-dv-planner';
import { TravelService } from '../pages/page-dv-planner/services/travel.service';
import { GameStateType } from '../common/domain/game-state-type';

@Injectable({
  providedIn: 'root',
})
export class SpaceObjectService extends WithDestroy() {

  orbits$ = new BehaviorSubject<Orbit[]>(null);
  transmissionLines$ = new BehaviorSubject<TransmissionLine[]>(null);
  celestialBodies$ = this.spaceObjectContainerService.celestialBodies$;
  crafts$ = this.spaceObjectContainerService.crafts$;

  constructor(private cameraService: CameraService,
              private setupService: SetupService,
              private analyticsService: AnalyticsService,
              private spaceObjectContainerService: SpaceObjectContainerService) {
    super();
  }

  private static getIndexOfSameCombination = (parentItem, list) => list.findIndex(item => item.every(so => parentItem.includes(so)));

  private getFreshTransmissionLines() {
    return [...this.celestialBodies$.value, ...this.crafts$.value]
      .filter(so => so.antennae?.length)
      .joinSelf()
      .distinct(SpaceObjectService.getIndexOfSameCombination)
      .distinct(SpaceObjectService.getIndexOfSameCombination) // run again, opposing permutations are still similar as
                                                              // combinations
      .map(pair => // leave existing transmission lines here so that visuals do not flicker
        this.transmissionLines$.value.find(t => pair.every(n => t.nodes.includes(n)))
        ?? new TransmissionLine(pair, this.setupService))
      .filter(tl => tl.strengthTotal);
  }

  updateTransmissionLines() {
    this.transmissionLines$.next(this.getFreshTransmissionLines());
  }

  removeCraft(existing: Craft) {
    existing.draggableHandle.parent.removeChild(existing.draggableHandle);
    this.crafts$.next(this.crafts$.value.remove(existing));
    this.updateTransmissionLines();

    this.analyticsService.logEvent('Remove craft', {
      category: EventLogs.Category.Craft,
      craft: {
        type: existing.craftType,
        antennae: existing.antennae && existing.antennae.map(a => ({
          label: a.item.label,
          count: a.count,
        })),
      },
    });
  }

}
