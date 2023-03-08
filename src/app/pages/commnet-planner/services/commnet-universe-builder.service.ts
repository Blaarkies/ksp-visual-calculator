import { Injectable } from '@angular/core';
import { AbstractUniverseBuilderService } from '../../../services/universe-builder.abstract.service';
import { SpaceObjectType } from '../../../common/domain/space-objects/space-object-type';
import { SpaceObject } from '../../../common/domain/space-objects/space-object';
import { StateSpaceObject } from '../../../services/json-interfaces/state-space-object';
import { OrbitParameterData } from '../../../common/domain/space-objects/orbit-parameter-data';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { SetupService } from 'src/app/services/setup.service';
import { SpaceObjectContainerService } from '../../../services/space-object-container.service';
import { StateCommnetPlanner } from '../../../services/json-interfaces/state-commnet-planner';
import { Craft } from '../../../common/domain/space-objects/craft';
import { StateCraft } from '../../../services/json-interfaces/state-craft';
import {
  combineLatest,
  firstValueFrom,
  map,
  ReplaySubject,
  take,
  takeUntil,
} from 'rxjs';
import { TransmissionLine } from '../../../common/domain/transmission-line';
import { CraftDetails } from '../../../overlays/craft-details-dialog/craft-details';
import { EventLogs } from '../../../services/domain/event-logs';
import { Group } from '../../../common/domain/group';
import { Antenna } from '../../../common/domain/antenna';
import { CameraService } from '../../../services/camera.service';

@Injectable({
  providedIn: 'any',
})
export class CommnetUniverseBuilderService extends AbstractUniverseBuilderService {

  crafts$ = new ReplaySubject<Craft[]>();
  transmissionLines$ = new ReplaySubject<TransmissionLine[]>();

  celestialBodies$ = new ReplaySubject<SpaceObject[]>();

  constructor(
    protected setupService: SetupService,
    protected analyticsService: AnalyticsService,

    private spaceObjectContainerService: SpaceObjectContainerService,
    private cameraService: CameraService,
  ) {
    super();
  }

  protected async setDetails() {
    await super.setDetails();

    this.crafts$.next([]);
    this.transmissionLines$.next([]);

    // todo: hasDsn is removed. add default tracking station another way
    let planets = await firstValueFrom<SpaceObject[]>(this.celestialBodies$);
    let needsBasicDsn = planets
      .find(cb => cb.hasDsn && cb.antennae?.length === 0);
    if (needsBasicDsn) {
      needsBasicDsn.antennae.push(
        new Group<Antenna>(this.setupService.getAntenna('Tracking Station 1')));
    }

    this.updateTransmissionLines();
  }

  protected async buildContextState(lastState: string) {
    let state: StateCommnetPlanner = JSON.parse(lastState);
    let {celestialBodies: jsonCelestialBodies, craft: jsonCraft} = state;

    let orbitsLabelMap = this.makeOrbitsLabelMap(jsonCelestialBodies);

    let antennaGetter = name => this.setupService.getAntenna(name);

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
        json.draggableHandle.children
          .map(c => bodiesChildrenMap.get(c))
          // @fix v1.1.1:craft draggables were not removed from parent draggable
          .filter(c => c !== undefined));

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
  }

  private getIndexOfSameCombination = (parentItem, list) =>
    list.findIndex(item =>
      item.every(so =>
        parentItem.includes(so)));

  private getFreshTransmissionLines(nodes: SpaceObject[], signals: TransmissionLine[]) {
    return nodes
      .filter(so => so.antennae?.length)
      .joinSelf()
      .distinct(this.getIndexOfSameCombination)
      .distinct(this.getIndexOfSameCombination) // run again, opposing permutations are still similar as
      // combinations
      .map(pair => // leave existing transmission lines here so that visuals do not flicker
        signals.find(t => pair.every(n => t.nodes.includes(n)))
        ?? new TransmissionLine(pair, this.setupService))
      .filter(tl => tl.strengthTotal);
  }

  updateTransmissionLines() {
    combineLatest([this.celestialBodies$, this.crafts$, this.transmissionLines$])
      .pipe(
        take(1),
        map(([planets, craft, signals]) => ({
          nodes: planets.concat(craft),
          signals,
        })),
        takeUntil(this.destroy$))
      .subscribe(({nodes, signals}) => this.transmissionLines$.next(
        this.getFreshTransmissionLines(nodes, signals)));
  }

  private addCraft(details: CraftDetails, allCraft: Craft[]) {
    let location = details.advancedPlacement?.location
      ?? this.cameraService.convertScreenToGameSpace(this.cameraService.screenCenterOffset);

    let craft = new Craft(details.name, details.craftType, details.antennae);
    let parent = this.spaceObjectContainerService.getSoiParent(location);
    parent.draggableHandle.addChild(craft.draggableHandle);
    craft.draggableHandle.updateConstrainLocation(new OrbitParameterData(location.toList(), undefined, parent.draggableHandle));
    this.crafts$.next([...allCraft, craft]);
  }

  async addCraftToUniverse(details: CraftDetails) {
    let allCraft = await this.getAllCraft();
    this.addCraft(details, allCraft);
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

  private async getAllCraft(): Promise<Craft[]> {
    return firstValueFrom<Craft[]>(this.crafts$);
  }

  async editCraft(oldCraft: Craft, craftDetails: CraftDetails) {
    let newCraft = new Craft(craftDetails.name, craftDetails.craftType, craftDetails.antennae);
    let parent = craftDetails.advancedPlacement?.orbitParent ?? this.spaceObjectContainerService.getSoiParent(oldCraft.location);
    parent.draggableHandle.replaceChild(oldCraft.draggableHandle, newCraft.draggableHandle);
    newCraft.draggableHandle.updateConstrainLocation(new OrbitParameterData(
      craftDetails.advancedPlacement?.location?.toList() ?? oldCraft.location.toList(),
      undefined,
      parent.draggableHandle));

    let allCraft = await this.getAllCraft();
    this.crafts$.next(allCraft.replace(oldCraft, newCraft));
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

  async removeCraft(existing: Craft) {
    existing.draggableHandle.parent.removeChild(existing.draggableHandle);

    let allCraft = await this.getAllCraft();
    this.crafts$.next(allCraft.remove(existing));
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
