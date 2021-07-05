import { Injectable } from '@angular/core';
import { Orbit } from '../common/domain/space-objects/orbit';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { Group } from '../common/domain/group';
import { Antenna } from '../common/domain/antenna';
import { Craft } from '../common/domain/space-objects/craft';
import { TransmissionLine } from '../common/domain/transmission-line';
import { CameraService } from './camera.service';
import { BehaviorSubject, concat, Observable, zip } from 'rxjs';
import { OrbitParameterData } from '../common/domain/space-objects/orbit-parameter-data';
import { CraftDetails } from '../dialogs/craft-details-dialog/craft-details';
import { SetupService } from './setup.service';
import { filter, mapTo, take, takeUntil, tap } from 'rxjs/operators';
import { CelestialBodyDetails } from '../dialogs/celestial-body-details-dialog/celestial-body-details';
import { AnalyticsService, EventLogs } from './analytics.service';
import { WithDestroy } from '../common/with-destroy';
import { SpaceObjectContainerService } from './space-object-container.service';
import { SpaceObjectType } from '../common/domain/space-objects/space-object-type';
import { StateSignalCheck } from './json-interfaces/state-signal-check';
import { StateCraft } from './json-interfaces/state-craft';
import { StateSpaceObject } from './json-interfaces/state-space-object';

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

  private runWhenStockAssetsReady(callback?: ({listOrbits, celestialBodies, antennae}) => void)
    : Observable<void> {
    let stockPlanets$ = this.setupService.stockPlanets$;

    let stockAntennae$ = this.setupService.availableAntennae$
      .pipe(filter(a => !!a.length));

    return zip(stockPlanets$, stockAntennae$)
      .pipe(
        take(1),
        tap(([{listOrbits, celestialBodies}, antennae]) =>
          callback && callback({listOrbits, celestialBodies, antennae})),
        mapTo(void 0),
        takeUntil(this.destroy$));
  }

  buildStockState(): Observable<void> {
    return this.runWhenStockAssetsReady(({listOrbits, celestialBodies, antennae}) => {
      this.orbits$.next(listOrbits);
      this.celestialBodies$.next(celestialBodies);
      this.crafts$.next([]);
      this.transmissionLines$.next([]);

      // todo: hasDsn is removed. add default tracking station another way
      let needsBasicDsn = this.celestialBodies$.value
        .find(cb => cb.hasDsn && cb.antennae?.length === 0);
      if (needsBasicDsn) {
        needsBasicDsn.antennae.push(
          new Group<Antenna>(this.setupService.getAntenna('Tracking Station 1')));
      }

      this.updateTransmissionLines();
    });
  }

  buildState(lastState: string): Observable<void> {
    let parseState = () => {
      let state: StateSignalCheck = JSON.parse(lastState);
      let {celestialBodies: jsonCelestialBodies, craft: jsonCraft} = state;

      let antennaGetter = name => this.setupService.getAntenna(name);

      let orbitsLabels = jsonCelestialBodies.filter(json => [
        SpaceObjectType.types.planet,
        SpaceObjectType.types.moon].includes(json.type))
        .map(b => b.draggableHandle)
        .map(draggable => {
          let {parameters, color, type} = draggable.orbit;
          let orbit = new Orbit(new OrbitParameterData(parameters.xy, parameters.r, parameters.parent), color);
          orbit.type = SpaceObjectType.fromString(type);
          return [draggable.label, orbit];
        });
      let orbitsLabelMap = new Map<string, Orbit>(orbitsLabels as []);
      this.orbits$.next(orbitsLabels.map(([, orbit]) => orbit) as Orbit[]);

      let bodies = jsonCelestialBodies.filter(json => [
        SpaceObjectType.types.star,
        SpaceObjectType.types.planet,
        SpaceObjectType.types.moon].includes(json.type))
        .map(b => [SpaceObject.fromJson(b, antennaGetter), b]);

      let craftJsonMap = new Map<Craft, StateCraft>(jsonCraft.map(json => [Craft.fromJson(json, antennaGetter), json]));
      let craft = Array.from(craftJsonMap.keys());
      let bodiesChildrenMap = new Map<string, SpaceObject>([
        ...bodies.map(([b]: [SpaceObject]) => [b.label, b]),
        ...craft.map(c => [c.label, c]),
      ] as any);
      bodies.forEach(([b, json]: [SpaceObject, StateSpaceObject]) => {
        let matchingOrbit = orbitsLabelMap.get(json.draggableHandle.label);
        if (matchingOrbit) {
          b.draggableHandle.addOrbit(matchingOrbit);
        } else {
          b.draggableHandle.parameterData = new OrbitParameterData(json.draggableHandle.location);
          b.draggableHandle.updateConstrainLocation(OrbitParameterData.fromJson(b.draggableHandle.parameterData));
        }

        b.draggableHandle.setChildren(
          json.draggableHandle.children.map(c => bodiesChildrenMap.get(c)));

        if (json.draggableHandle.orbit) {
          let parameters = OrbitParameterData.fromJson(json.draggableHandle.orbit.parameters);
          b.draggableHandle.updateConstrainLocation(parameters);
        }
      });
      this.celestialBodies$.next(bodies.map(([b]: [SpaceObject]) => b));

      craft.forEach(c => c.draggableHandle.updateConstrainLocation(
        new OrbitParameterData(
          craftJsonMap.get(c).location, // setChildren() above resets craft locations. get original location from json
          undefined,
          c.draggableHandle.parent)));
      this.crafts$.next(craft);

      this.transmissionLines$.next([]);
      this.updateTransmissionLines();
    };

    return this.runWhenStockAssetsReady(() => parseState());
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
    let parent = craftDetails.advancedPlacement?.orbitParent ?? this.spaceObjectContainerService.getSoiParent(oldCraft.location);
    parent.draggableHandle.replaceChild(oldCraft.draggableHandle, newCraft.draggableHandle);
    newCraft.draggableHandle.updateConstrainLocation(new OrbitParameterData(
      craftDetails.advancedPlacement?.location?.toList() ?? oldCraft.location.toList(),
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
