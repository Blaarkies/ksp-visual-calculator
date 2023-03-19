import { Injectable } from '@angular/core';
import {
  take,
  takeUntil,
} from 'rxjs';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { Antenna } from '../../../common/domain/antenna';
import { Group } from '../../../common/domain/group';
import { LabeledOption } from '../../../common/domain/input-fields/labeled-option';
import { Craft } from '../../../common/domain/space-objects/craft';
import { OrbitParameterData } from '../../../common/domain/space-objects/orbit-parameter-data';
import { SpaceObject } from '../../../common/domain/space-objects/space-object';
import { SpaceObjectType } from '../../../common/domain/space-objects/space-object-type';
import { TransmissionLine } from '../../../common/domain/transmission-line';
import { Vector2 } from '../../../common/domain/vector2';
import { SubjectHandle } from '../../../common/subject-handle';
import { StockEntitiesCacheService } from '../../../components/isru-heat-and-power-widget/stock-entities-cache.service';
import { CraftDetails } from '../../../overlays/craft-details-dialog/craft-details';
import { DifficultySetting } from '../../../overlays/difficulty-settings-dialog/difficulty-setting';
import { CameraService } from '../../../services/camera.service';
import { EventLogs } from '../../../services/domain/event-logs';
import { StateCommnetPlanner } from '../../../services/json-interfaces/state-commnet-planner';
import { StateCraft } from '../../../services/json-interfaces/state-craft';
import { StateSpaceObject } from '../../../services/json-interfaces/state-space-object';
import { AbstractUniverseBuilderService } from '../../../services/universe-builder.abstract.service';
import { UniverseContainerInstance } from '../../../services/universe-container-instance.service';

@Injectable({providedIn: 'root'})
export class CommnetUniverseBuilderService extends AbstractUniverseBuilderService {

  craft$ = new SubjectHandle<Craft[]>();
  signals$ = new SubjectHandle<TransmissionLine[]>();
  antennae$ = new SubjectHandle<Antenna[]>();
  difficultySetting: DifficultySetting;

  private antennaeLabelMap: Map<string, Antenna>;

  constructor(
    protected universeContainerInstance: UniverseContainerInstance,
    protected analyticsService: AnalyticsService,
    protected cacheService: StockEntitiesCacheService,
    private cameraService: CameraService,
  ) {
    super(new SubjectHandle<SpaceObject[]>());

    this.cacheService.antennae$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(antennae => {
        this.antennae$.set(antennae);
        this.antennaeLabelMap = new Map<string, Antenna>(
          antennae.map(a => [a.label, a]));
      });

    this.difficultySetting = DifficultySetting.normal;

    // TODO: remove this
    this.craft$.stream$
      .pipe(takeUntil(this.destroy$))
      .subscribe(craft => this.universeContainerInstance.crafts$.next(craft));
  }

  protected async setDetails() {
    await super.setDetails();

    this.craft$.set([]);
    this.signals$.set([]);

    // todo: hasDsn is removed. add default tracking station another way
    let needsBasicDsn = this.planets$.value
      .find(cb => cb.hasDsn && cb.antennae?.length === 0);
    if (needsBasicDsn) {
      needsBasicDsn.antennae.push(
        new Group<Antenna>(this.getAntenna('Tracking Station 1')));
    }

    this.updateTransmissionLines();
  }

  protected async buildContextState(lastState: string) {
    let state: StateCommnetPlanner = JSON.parse(lastState);
    let {celestialBodies: jsonCelestialBodies, craft: jsonCraft} = state;

    let orbitsLabelMap = this.makeOrbitsLabelMap(jsonCelestialBodies);

    let antennaGetter = name => this.getAntenna(name);

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
    this.planets$.set(bodies.map(([b]: [SpaceObject]) => b));

    craft.forEach(c => c.draggableHandle.updateConstrainLocation(
      new OrbitParameterData(
        craftJsonMap.get(c).location, // setChildren() above resets craft locations. get original location from json
        undefined,
        c.draggableHandle.parent)));
    this.craft$.set(craft);

    this.signals$.set([]);
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
        ?? new TransmissionLine(pair, this))
      .filter(tl => tl.strengthTotal);
  }

  updateTransmissionLines() {
    let nodes = this.planets$.value.concat(this.craft$.value);
    this.signals$.set(this.getFreshTransmissionLines(nodes, this.signals$.value));
  }

  private addCraft(details: CraftDetails, allCraft: Craft[]) {
    let location = details.advancedPlacement?.location
      ?? this.cameraService.convertScreenToGameSpace(this.cameraService.screenCenterOffset);

    let craft = new Craft(details.name, details.craftType, details.antennae);
    let parent = this.getSoiParent(location);
    parent.draggableHandle.addChild(craft.draggableHandle);
    craft.draggableHandle.updateConstrainLocation(new OrbitParameterData(location.toList(), undefined, parent.draggableHandle));
    this.craft$.set([...allCraft, craft]);
  }

  async addCraftToUniverse(details: CraftDetails) {
    this.addCraft(details, this.craft$.value);
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

  async editCraft(oldCraft: Craft, craftDetails: CraftDetails) {
    let newCraft = new Craft(craftDetails.name, craftDetails.craftType, craftDetails.antennae);
    let parent = craftDetails.advancedPlacement?.orbitParent
      ?? this.getSoiParent(oldCraft.location);

    parent.draggableHandle.replaceChild(oldCraft.draggableHandle, newCraft.draggableHandle);
    newCraft.draggableHandle.updateConstrainLocation(new OrbitParameterData(
      craftDetails.advancedPlacement?.location?.toList() ?? oldCraft.location.toList(),
      undefined,
      parent.draggableHandle));

    this.craft$.set(list => list.replace(oldCraft, newCraft));
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

    this.craft$.set(list => list.remove(existing));
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

  getSoiParent(location: Vector2): SpaceObject {
    return this.planets$.value
      .filter(cb => !cb.sphereOfInfluence || location.distance(cb.location) <= cb.sphereOfInfluence)
      .sort((a, b) => a.location.distance(location) - b.location.distance(location))
      .first();
  }

  getAntenna(search: string): Antenna {
    return this.antennaeLabelMap.get(search);
  }

  get antennaList(): LabeledOption<Antenna>[] {
    return this.antennae$.value.map(a => new LabeledOption<Antenna>(a.label, a));
  }

  updateDifficultySetting(details: DifficultySetting) {
    this.difficultySetting = details;
  }

}
