import {
  DestroyRef,
  Injectable,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  combineLatest,
  map,
  merge,
  sampleTime,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { CraftDto } from '../../../common/domain/dtos/craft-dto';
import { StateCommnetPlannerDto } from '../../../common/domain/dtos/state-commnet-planner.dto';
import { Group } from '../../../common/domain/group';
import { LabeledOption } from '../../../common/domain/input-fields/labeled-option';
import { AntennaeManager } from '../../../common/domain/space-objects/antennae-manager';
import { Communication } from '../../../common/domain/space-objects/communication';
import { Craft } from '../../../common/domain/space-objects/craft';
import { OrbitParameterData } from '../../../common/domain/space-objects/orbit-parameter-data';
import { Planetoid } from '../../../common/domain/space-objects/planetoid';
import { SpaceObject } from '../../../common/domain/space-objects/space-object';
import { SubjectHandle } from '../../../common/subject-handle';
import { PlanetoidDetails } from '../../../overlays/celestial-body-details-dialog/planetoid-details';
import { CameraService } from '../../../services/camera.service';
import { EnrichedStarSystem } from '../../../services/domain/enriched-star-system.model';
import { EventLogs } from '../../../services/domain/event-logs';
import { PlanetoidFactory } from '../../../services/domain/planetoid-factory';
import { AbstractUniverseBuilderService } from '../../../services/domain/universe-builder.abstract.service';
import { StockEntitiesCacheService } from '../../../services/stock-entities-cache.service';
import { CraftDetails } from '../components/craft-details-dialog/craft-details';
import { DifficultySetting } from '../components/difficulty-settings-dialog/difficulty-setting';
import { Antenna } from '../models/antenna';
import {
  AntennaSignal,
  CanCommunicate,
} from '../models/antenna-signal';
import { ConnectionGraph } from '../models/connection-graph';
import { CraftFactory } from '../models/craft-factory';

@Injectable()
export class CommnetUniverseBuilderService extends AbstractUniverseBuilderService {

  craft$ = new SubjectHandle<Craft[]>();
  antennaSignal$ = new SubjectHandle<AntennaSignal[]>();
  antennae$ = new SubjectHandle<Antenna[]>();
  difficultySetting: DifficultySetting;

  private antennaeLabelMap: Map<string, Antenna>;
  protected planetoidFactory = new PlanetoidFactory(this.soiManager, this.antennaeManager);
  private craftFactory = new CraftFactory(
    this.soiManager, this.antennaeManager);

  constructor(
    protected analyticsService: AnalyticsService,
    protected cacheService: StockEntitiesCacheService,
    protected cameraService: CameraService,
    protected destroyRef: DestroyRef,

    private antennaeManager: AntennaeManager,
  ) {
    super();

    destroyRef.onDestroy(() => this.destroy());

    this.cacheService.antennae$
      .pipe(takeUntilDestroyed())
      .subscribe(antennae => {
        this.antennae$.set(antennae);
        this.antennaeLabelMap = new Map<string, Antenna>(
          antennae.map(a => [a.label, a]));
      });

    this.difficultySetting = DifficultySetting.normal;

    let getConnectionsChange$ = (signals: AntennaSignal[]) =>
      merge(signals.map(s => s.relayChange$)).pipe(
        startWith(undefined),
        map(() => signals),
      );

    let signalsUpdate$ = this.antennaSignal$.stream$.pipe(
      switchMap(signals => getConnectionsChange$(signals)),
    );

    combineLatest([
      signalsUpdate$,
      this.craft$.stream$,
      this.planetoids$,
    ]).pipe(
      sampleTime(200),
      tap(([signals, craft, planets]) => {
        if (!signals.length) {
          craft.forEach(c => c.communication.noSignal());
          return;
        }
        let connectionGraph = new ConnectionGraph(signals, craft, planets);
        craft.forEach(c => {
          let control = connectionGraph.hasControlCraft.has(c);
          return c.communication.hasControl$.set(control);
        });
      }),
    ).subscribe();
  }

  protected override destroy() {
    super.destroy();
    this.craft$.destroy();
    this.antennaSignal$.destroy();
  }

  protected async setStockDetails(enrichedStarSystem: EnrichedStarSystem) {
    this.craft$.set([]);
    this.antennaSignal$.set([]);
    this.difficultySetting = DifficultySetting.normal;

    let dsnIds = enrichedStarSystem.starSystem.dsnIds;
    if (dsnIds) {
      let dsnPlanetoids = this.planetoids$.value.filter(p => p.id.includesSome(dsnIds));
      dsnPlanetoids.forEach(p =>
        p.communication = new Communication(
          this.antennaeManager, [new Group('Tracking Station 1')]));
    }

    this.updateTransmissionLines();
  }

  protected override async buildContextState(lastState: string) {
    await super.buildContextState(lastState);

    let state: StateCommnetPlannerDto = JSON.parse(lastState);
    let {planetoids, craft: craftDtos} = state;

    let planetoidDtoPairs = planetoids
      .map(dto => ({
        planetoid: this.planetoidFactory.makePlanetoidFromJson(dto),
        dto,
      }));
    let orbitsLabelMap = this.makeOrbitsLabelMap(planetoidDtoPairs);

    let craftJsonMap = new Map<Craft, CraftDto>(craftDtos.map(json =>
      [this.craftFactory.makeCraftFromJson(json), json]));
    let craft = Array.from(craftJsonMap.keys());
    let planetoidsChildrenMap = new Map<string, SpaceObject>([
      ...planetoidDtoPairs.map(({planetoid}) => [planetoid.label, planetoid]),
      ...craft.map(c => [c.label, c]),
    ] as any);
    planetoidDtoPairs.forEach(({planetoid, dto}) => {
      let matchingOrbit = orbitsLabelMap.get(dto.draggable.label);
      if (matchingOrbit) {
        planetoid.draggable.setOrbit(matchingOrbit);
      } else {
        planetoid.draggable.parameterData = new OrbitParameterData(dto.draggable.location);
        planetoid.draggable.updateConstrainLocation(
          OrbitParameterData.fromJson(planetoid.draggable.parameterData));
      }

      planetoid.draggable.setChildren(
        dto.draggable.children
          .map(c => planetoidsChildrenMap.get(c))
          // @fix v1.1.1:craft draggables were not removed from parent draggable
          .filter(c => c !== undefined));

      if (dto.orbit) {
        let parameters = OrbitParameterData.fromJson(dto.orbit.parameters);
        planetoid.draggable.updateConstrainLocation(parameters);
      }
    });
    this.planetoids$.next(planetoidDtoPairs.map(e => e.planetoid));

    craft.forEach(c => c.draggable.updateConstrainLocation(
      new OrbitParameterData(
        craftJsonMap.get(c).draggable.location, // setChildren() above resets craft locations. get original location from json
        undefined,
        c.draggable.parent)));
    this.craft$.set(craft);

    this.antennaSignal$.set([]);
    this.updateTransmissionLines();
  }

  private getIndexOfSameCombination = <T>(parentItem: T[], list: T[][]) =>
    list.findIndex(item =>
      item.every(so =>
        parentItem.includes(so)));

  private getFreshTransmissionLines(nodes: CanCommunicate[], signals: AntennaSignal[]): AntennaSignal[] {
    let [removeSignals = [], newSignals = []] = nodes
      .filter(so => so.communication?.stringAntennae?.length)
      .joinSelf()
      .distinct(this.getIndexOfSameCombination)
      // run again, opposing permutations are still similar as combinations
      .distinct(this.getIndexOfSameCombination)
      .map(pair => // leave existing signals here so that visuals do not flicker
        signals.find(t => pair.every(n => t.nodes.includes(n)))
        ?? new AntennaSignal(pair, () => this.difficultySetting.rangeModifier))
      .filterSplit(tl => tl.strengthTotal ? 1 : 0);

    removeSignals.forEach(s => s.destroy());

    return newSignals;
  }

  updateTransmissionLines({reset}: { reset?: boolean } = {}) {
    let nodes = [
      ...this.planetoids$.value ?? [],
      ...this.craft$.value ?? [],
    ];
    let signals = reset ? [] : this.antennaSignal$.value;
    let freshTransmissionLines = this.getFreshTransmissionLines(nodes, signals);
    if (signals.equal(freshTransmissionLines)) {
      return;
    }

    this.antennaSignal$.set(freshTransmissionLines);
  }

  private addCraft(details: CraftDetails, allCraft: Craft[]) {
    let location = details.advancedPlacement?.location
      ?? this.cameraService.getGameSpaceLocationOfScreenSpaceCenter();

    let antennaeGroups = details.antennae.map(g => new Group(g.item.label, g.count));
    let craft = this.craftFactory.makeCraft(
      details.id, details.name, details.craftType, antennaeGroups);

    let parent = this.getSoiParent(location);
    parent.draggable.addChild(craft.draggable);
    craft.draggable.updateConstrainLocation(
      new OrbitParameterData(location.toList(), undefined, parent.draggable));
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
    let newAntennae = craftDetails.antennae.map(g => new Group(g.item.label, g.count));

    let newCraft = this.craftFactory.makeCraft(
      craftDetails.id, craftDetails.name, craftDetails.craftType, newAntennae);
    let parent = craftDetails.advancedPlacement?.orbitParent
      ?? this.getSoiParent(oldCraft.location);

    parent.draggable.replaceChild(oldCraft.draggable, newCraft.draggable);
    newCraft.draggable.updateConstrainLocation(new OrbitParameterData(
      craftDetails.advancedPlacement?.location?.toList() ?? oldCraft.location.toList(),
      undefined,
      parent.draggable));

    this.craft$.set(list => list.replace(oldCraft, newCraft));
    this.updateTransmissionLines();

    this.analyticsService.logEvent('Edit craft', {
      category: EventLogs.Category.Craft,
      old: {
        type: oldCraft.craftType,
        antennae: oldCraft.communication.stringAntennae && oldCraft.communication.stringAntennae.map(a => ({
          label: a.item,
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

    oldCraft.destroy();
  }

  async removeCraft(existing: Craft) {
    existing.draggable.parent.removeChild(existing.draggable);

    this.craft$.set(list => list.remove(existing));
    this.updateTransmissionLines();

    this.analyticsService.logEvent('Remove craft', {
      category: EventLogs.Category.Craft,
      craft: {
        type: existing.craftType,
        antennae: existing.communication.stringAntennae
          && existing.communication.stringAntennae.map(a => ({
            label: a.item,
            count: a.count,
          })),
      },
    });
  }

  getAntenna(search: string): Antenna {
    return this.antennaeLabelMap.get(search);
  }

  get antennaList(): LabeledOption<Antenna>[] {
    return this.antennae$.value.map(a => new LabeledOption<Antenna>(a.label, a));
  }

  updateDifficultySetting(details: DifficultySetting) {
    this.difficultySetting = details;
    if (this.planetoids$.value) {
      this.updateTransmissionLines({reset: true});
    }
  }

  override editCelestialBody(body: Planetoid, details: PlanetoidDetails) {
    super.editCelestialBody(body, details);

    body.communication = details.currentDsn
      ? new Communication(this.antennaeManager, [new Group(details.currentDsn.label)])
      : undefined;
    this.updateTransmissionLines();
  }

}
