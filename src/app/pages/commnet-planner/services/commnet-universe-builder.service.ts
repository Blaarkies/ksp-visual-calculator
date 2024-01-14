import {
  Injectable,
  OnDestroy,
} from '@angular/core';
import {
  combineLatest,
  map,
  merge,
  sampleTime,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { Antenna } from '../models/antenna';
import {
  AntennaSignal,
  CanCommunicate,
} from '../models/antenna-signal';
import { CraftDto } from '../../../common/domain/dtos/craft-dto';
import { StateCommnetPlannerDto } from '../../../common/domain/dtos/state-commnet-planner.dto';
import { Group } from '../../../common/domain/group';
import { LabeledOption } from '../../../common/domain/input-fields/labeled-option';
import { Communication } from '../../../common/domain/space-objects/communication';
import { Craft } from '../../../common/domain/space-objects/craft';
import { OrbitParameterData } from '../../../common/domain/space-objects/orbit-parameter-data';
import { Planetoid } from '../../../common/domain/space-objects/planetoid';
import { SpaceObject } from '../../../common/domain/space-objects/space-object';
import { SubjectHandle } from '../../../common/subject-handle';
import { CameraService } from '../../../services/camera.service';
import { EnrichedStarSystem } from '../../../services/domain/enriched-star-system.model';
import { EventLogs } from '../../../services/domain/event-logs';
import { AbstractUniverseBuilderService } from '../../../services/domain/universe-builder.abstract.service';
import { StockEntitiesCacheService } from '../../../services/stock-entities-cache.service';
import { UniverseContainerInstance } from '../../../services/universe-container-instance.service';
import { CraftDetails } from '../components/craft-details-dialog/craft-details';
import { DifficultySetting } from '../components/difficulty-settings-dialog/difficulty-setting';
import { ConnectionGraph } from '../models/connection-graph';
import {
  antennaServiceDestroy,
  antennaServiceSetAntennae,
} from './pseudo/antenna.service';

@Injectable()
export class CommnetUniverseBuilderService extends AbstractUniverseBuilderService implements OnDestroy {

  craft$ = new SubjectHandle<Craft[]>();
  signals$ = new SubjectHandle<AntennaSignal[]>();
  antennae$ = new SubjectHandle<Antenna[]>();
  difficultySetting: DifficultySetting;

  private antennaeLabelMap: Map<string, Antenna>;

  constructor(
    protected universeContainerInstance: UniverseContainerInstance,
    protected analyticsService: AnalyticsService,
    protected cacheService: StockEntitiesCacheService,
    protected cameraService: CameraService,
  ) {
    super();

    this.cacheService.antennae$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(antennae => {
        antennaServiceSetAntennae(antennae);
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

    let signalsUpdate$ = this.signals$.stream$.pipe(
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

    // TODO: remove UniverseContainerInstance usages
    this.craft$.stream$
      .pipe(takeUntil(this.destroy$))
      .subscribe(craft => this.universeContainerInstance.crafts$.next(craft));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    super.destroy();

    this.craft$.destroy();
    this.signals$.destroy();
    antennaServiceDestroy();
  }

  protected async setStockDetails(enrichedStarSystem: EnrichedStarSystem) {
    this.craft$.set([]);
    this.signals$.set([]);
    this.difficultySetting = DifficultySetting.normal;

    let dsnIds = enrichedStarSystem.starSystem.dsnIds;
    if (dsnIds) {
      let dsnPlanetoids = this.planetoids$.value.filter(p => p.id.includesSome(dsnIds));
      dsnPlanetoids.forEach(p =>
        p.communication = new Communication([new Group('Tracking Station 1')]));
    }

    this.updateTransmissionLines();
  }

  protected override async buildContextState(lastState: string) {
    await super.buildContextState(lastState);

    let state: StateCommnetPlannerDto = JSON.parse(lastState);
    let {planetoids, craft: craftDtos} = state;

    let planetoidDtoPairs = planetoids
      .map(dto => ({planetoid: Planetoid.fromJson(dto), dto}));
    let orbitsLabelMap = this.makeOrbitsLabelMap(planetoidDtoPairs);

    let craftJsonMap = new Map<Craft, CraftDto>(craftDtos.map(json =>
      [Craft.fromJson(json), json]));
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

    this.signals$.set([]);
    this.updateTransmissionLines();
  }

  private getIndexOfSameCombination = <T>(parentItem: T[], list: T[][]) =>
    list.findIndex(item =>
      item.every(so =>
        parentItem.includes(so)));

  private getFreshTransmissionLines(nodes: CanCommunicate[], signals: AntennaSignal[]): AntennaSignal[] {
    let [removeSignals = [], newSignals = []] = nodes
      .filter(so => so.communication?.antennae?.length)
      .joinSelf()
      .distinct(this.getIndexOfSameCombination)
      // run again, opposing permutations are still similar as combinations
      .distinct(this.getIndexOfSameCombination)
      .map(pair => // leave existing signals here so that visuals do not flicker
        signals.find(t => pair.every(n => t.nodes.includes(n)))
        ?? new AntennaSignal(pair, () => this.difficultySetting.rangeModifier))
      .splitFilter(tl => tl.strengthTotal ? 1 : 0);

    removeSignals.forEach(s => s.destroy());

    return newSignals;
  }

  updateTransmissionLines({reset}: { reset?: boolean } = {}) {
    let nodes = [
      ...this.planetoids$.value ?? [],
      ...this.craft$.value ?? [],
    ];
    let signals = reset ? [] : this.signals$.value;
    let freshTransmissionLines = this.getFreshTransmissionLines(nodes, signals);
    if (signals.equal(freshTransmissionLines)) {
      return;
    }

    this.signals$.set(freshTransmissionLines);
  }

  private addCraft(details: CraftDetails, allCraft: Craft[]) {
    let location = details.advancedPlacement?.location
      ?? this.cameraService.convertScreenToGameSpace(this.cameraService.screenCenterOffset);

    let craft = new Craft(details.id, details.name, details.craftType,
      details.antennae.map(g => new Group(g.item.label, g.count)));
    let parent = this.getSoiParent(location);
    parent.draggable.addChild(craft.draggable);
    craft.draggable.updateConstrainLocation(new OrbitParameterData(location.toList(), undefined, parent.draggable));
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
    let newCraft = new Craft(craftDetails.id, craftDetails.name, craftDetails.craftType,
      craftDetails.antennae.map(g => new Group(g.item.label, g.count)));
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
        antennae: oldCraft.communication.antennae && oldCraft.communication.antennae.map(a => ({
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
  }

  async removeCraft(existing: Craft) {
    existing.draggable.parent.removeChild(existing.draggable);

    this.craft$.set(list => list.remove(existing));
    this.updateTransmissionLines();

    this.analyticsService.logEvent('Remove craft', {
      category: EventLogs.Category.Craft,
      craft: {
        type: existing.craftType,
        antennae: existing.communication.antennae
          && existing.communication.antennae.map(a => ({
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

}
