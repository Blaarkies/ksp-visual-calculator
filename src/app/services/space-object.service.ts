import { Injectable } from '@angular/core';
import { Orbit } from '../common/domain/space-objects/orbit';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { Group } from '../common/domain/group';
import { Antenna } from '../common/domain/antenna';
import { Craft } from '../common/domain/space-objects/craft';
import { TransmissionLine } from '../common/domain/transmission-line';
import { CameraService } from './camera.service';
import { Vector2 } from '../common/domain/vector2';
import { BehaviorSubject, concat } from 'rxjs';
import { OrbitParameterData } from '../common/domain/space-objects/orbit-parameter-data';
import { CraftDetails } from '../dialogs/craft-details-dialog/craft-details';
import { SetupService } from './setup.service';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { CelestialBodyDetails } from '../dialogs/celestial-body-details-dialog/celestial-body-details';
import { AnalyticsService, EventLogs } from './analytics.service';
import { WithDestroy } from '../common/with-destroy';
import { SpaceObjectContainerService } from './space-object-container.service';
import { AdvancedPlacement } from '../dialogs/craft-details-dialog/advanced-placement';

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

    let setupPlanets$ = setupService.stockPlanets$
      .pipe(tap(({listOrbits, celestialBodies}) => {
        this.orbits$.next(listOrbits);
        this.celestialBodies$.next(celestialBodies);
        this.crafts$.next([]);
        this.transmissionLines$.next([]);
      }));

    let setupCraft$ = setupService.availableAntennae$
      .pipe(
        filter(a => !!a.length),
        tap(() => {
          // this.addCraft(new CraftDetails(
          //   'Craft Communotron16', CraftType.Relay, [new Group(setupService.getAntenna('Communotron 16'), 1)]),
          //   this.celestialBodies$.value[4].location.lerpClone(
          //     this.celestialBodies$.value[5].location),
          // );
          //
          // this.addCraft(new CraftDetails(
          //   'Relay sat 15', CraftType.Relay, [new Group(setupService.getAntenna('HG-5 High Gain Antenna'), 1)]),
          //   this.celestialBodies$.value[4].location.lerpClone(
          //     this.celestialBodies$.value[6].location),
          // );

          // todo: hasDsn is removed. add default tracking station another way
          this.celestialBodies$.value.find(cb => cb.hasDsn).antennae.push(
            new Group<Antenna>(setupService.getAntenna('Tracking Station 1')));

          this.updateTransmissionLines();
        }));

    concat(setupPlanets$, setupCraft$)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  private static getIndexOfSameCombination = (parentItem, list) => list.findIndex(item => item.every(so => parentItem.includes(so)));

  private getFreshTransmissionLines() {
    return [...this.celestialBodies$.value, ...this.crafts$.value]
      .filter(so => so.antennae?.length)
      .joinSelf()
      .distinct(SpaceObjectService.getIndexOfSameCombination)
      .distinct(SpaceObjectService.getIndexOfSameCombination) // opposing permutations are still similar as combinations
      .map(pair => // leave existing transmission lines here so that visuals do not flicker
        this.transmissionLines$.value.find(t => pair.every(n => t.nodes.includes(n)))
        ?? new TransmissionLine(pair, this.setupService))
      .filter(tl => tl.strengthTotal);
  }

  updateTransmissionLines() {
    this.transmissionLines$.next(this.getFreshTransmissionLines());
  }

  private addCraft(details: CraftDetails) {
    let inverseScale = 1 / this.cameraService.scale;
    let location = details.advancedPlacement?.location
      ?? this.cameraService.location.clone()
        .multiply(-inverseScale)
        .addVector2(this.cameraService.screenCenterOffset
          .multiply(inverseScale));
    let craft = new Craft(details.name, details.craftType, details.antennae);
    let parent = this.spaceObjectContainerService.getSoiParent(location);
    parent.draggableHandle.addChild(craft.draggableHandle);
    craft.draggableHandle.updateConstrainLocation(new OrbitParameterData(location.toList(), undefined, parent.draggableHandle));
    this.crafts$.next([...this.crafts$.value, craft]);
  }

  addCraftToUniverse(details: CraftDetails) {
    this.addCraft(details);
    this.updateTransmissionLines();

    this.analyticsService.logEvent('Add craft', {
      category: EventLogs.Category.Craft,
      craft: {
        type: details.craftType,
        antennae: details.antennae && details.antennae.map(a => ({
          label: a.item.label,
          count: a.count,
        })),
      },
    });
  }

  editCelestialBody(body: SpaceObject, details: CelestialBodyDetails) {
    this.analyticsService.logEvent('Edit celestial body', {
      category: EventLogs.Category.CelestialBody,
      old: {
        label: EventLogs.Sanitize.anonymize(body.label),
        type: body.type,
        size: body.size,
        dsn: body.antennae[0] && body.antennae[0].item.label,
      },
      new: {
        label: EventLogs.Sanitize.anonymize(details.name),
        type: details.celestialBodyType,
        size: details.size,
        dsn: details.currentDsn?.label,
      },
    });

    body.draggableHandle.label = details.name;
    body.type = details.celestialBodyType;
    body.size = details.size;
    if (body.draggableHandle.orbit) {
      body.draggableHandle.orbit.color = details.orbitColor;
    }
    body.antennae = details.currentDsn ? [new Group(details.currentDsn)] : [];
  }

  editCraft(oldCraft: Craft, craftDetails: CraftDetails) {
    let newCraft = new Craft(craftDetails.name, craftDetails.craftType, craftDetails.antennae);
    let parent = craftDetails.advancedPlacement.orbitParent ?? this.spaceObjectContainerService.getSoiParent(oldCraft.location);
    parent.draggableHandle.replaceChild(oldCraft.draggableHandle, newCraft.draggableHandle);
    newCraft.draggableHandle.updateConstrainLocation(new OrbitParameterData(
      craftDetails.advancedPlacement.location.toList() ?? oldCraft.location.toList(),
      undefined,
      parent.draggableHandle));
    this.crafts$.next(this.crafts$.value.replace(oldCraft, newCraft));
    this.updateTransmissionLines();

    this.analyticsService.logEvent('Edit craft', {
      category: EventLogs.Category.Craft,
      old: {
        type: oldCraft.craftType,
        antennae: oldCraft.antennae && oldCraft.antennae.map(a => ({
          label: a.item.label,
          count: a.count,
        })),
      },
      new: {
        type: craftDetails.craftType,
        antennae: craftDetails.antennae && craftDetails.antennae.map(a => ({
          label: a.item.label,
          count: a.count,
        })),
      },
    });
  }

  removeCraft(existing: Craft) {
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
