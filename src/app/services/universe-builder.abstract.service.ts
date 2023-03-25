import {
  BehaviorSubject,
  delayWhen,
  map,
  Observable,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { Group } from '../common/domain/group';
import { Orbit } from '../common/domain/space-objects/orbit';
import { OrbitParameterData } from '../common/domain/space-objects/orbit-parameter-data';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { SpaceObjectType } from '../common/domain/space-objects/space-object-type';
import { Vector2 } from '../common/domain/vector2';
import { SubjectHandle } from '../common/subject-handle';
import { WithDestroy } from '../common/with-destroy';
import { StockEntitiesCacheService } from '../components/isru-heat-and-power-widget/stock-entities-cache.service';
import { CelestialBodyDetails } from '../overlays/celestial-body-details-dialog/celestial-body-details';
import { AnalyticsService } from './analytics.service';
import { EventLogs } from './domain/event-logs';
import {
  CelestialBody,
  KerbolSystemCharacteristics,
} from './json-interfaces/kerbol-system-characteristics';
import { StateSpaceObject } from './json-interfaces/state-space-object';
import { UniverseContainerInstance } from './universe-container-instance.service';

interface OrbitsBodies {
  listOrbits: Orbit[];
  celestialBodies: SpaceObject[];
}

export abstract class AbstractUniverseBuilderService extends WithDestroy() {

  protected abstract analyticsService: AnalyticsService;
  protected abstract universeContainerInstance: UniverseContainerInstance;
  protected abstract cacheService: StockEntitiesCacheService;

  orbits$ = new BehaviorSubject<Orbit[]>([]);
  planets$ = new BehaviorSubject<SpaceObject[]>([]);

  protected constructor() {
    super();

    // TODO: remove UniverseContainerInstance usages
    setTimeout(() => this.planets$
      .pipe(takeUntil(this.destroy$))
      .subscribe(planets =>
        this.universeContainerInstance.planets$.next(planets)));
  }

  protected destroy() {
    this.orbits$.complete();
    this.planets$.complete();

    this.universeContainerInstance.planets$.next([]);
    this.universeContainerInstance.crafts$.next([]);
  }

  private stockAssetsReady(): Observable<OrbitsBodies> {
    return this.cacheService.planets$
      .pipe(
        take(1),
        map(data => AbstractUniverseBuilderService.generateOrbitsAndCelestialBodies(data)),
        takeUntil(this.destroy$));
  }

  buildStockState(): Observable<OrbitsBodies> {
    return this.stockAssetsReady()
      .pipe(
        tap(({listOrbits, celestialBodies}) => {
          this.orbits$.next(listOrbits);
          this.planets$.next(celestialBodies);
        }),
        delayWhen(() => this.setDetails()));
  }

  protected async setDetails() {
  }

  protected abstract buildContextState(lastState: string): Promise<void>

  buildState(lastState: string): Observable<any> {
    return this.stockAssetsReady()
      .pipe(delayWhen(() => this.buildContextState(lastState)));
  }

  protected makeOrbitsLabelMap(jsonCelestialBodies: StateSpaceObject[]): Map<string, Orbit> {
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
    return orbitsLabelMap;
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

  getSoiParent(location: Vector2): SpaceObject {
    return this.planets$.value
      .filter(p => !p.sphereOfInfluence || location.distance(p.location) <= p.sphereOfInfluence)
      .sort((a, b) => a.location.distance(location) - b.location.distance(location))
      .first();
  }

  private static generateOrbitsAndCelestialBodies(data: KerbolSystemCharacteristics): OrbitsBodies {
    // Setup abstract celestial bodies
    let bodyToJsonMap = new Map<CelestialBody, SpaceObject>(
      data.bodies.map(b => [
        /*key  */ b,
        /*value*/ new SpaceObject(
          Math.log(b.equatorialRadius) * 4,
          b.name, b.imageUrl,
          b.type === SpaceObjectType.types.star ? 'noMove' : 'orbital',
          SpaceObjectType.fromString(b.type as any),
          [],
          b.hasDsn,
          b.sphereOfInfluence,
          b.equatorialRadius),
      ]));

    // Setup SOI hierarchies
    bodyToJsonMap.forEach((parentSo, parentCb, mapCollection) => {
      let moons = Array.from(mapCollection.entries())
        .filter(([cb]) => cb.parent === parentCb.id)
        .map(([, so]) => so);

      parentSo.draggableHandle.setChildren(moons);
    });

    // Setup movement rules
    let bodyToJsonMapEntries = Array.from(bodyToJsonMap.entries());
    let bodyOrbitMap = new Map<SpaceObject, Orbit>(
      bodyToJsonMapEntries
        .filter(([cb]) => cb.type !== SpaceObjectType.types.star)
        .map(([cb, so]) => [
          /*key  */so,
          /*value*/new Orbit(OrbitParameterData.fromRadius(cb.semiMajorAxis), cb.orbitLineColor),
        ]));
    bodyOrbitMap.forEach((orbit, body) => {
      body.draggableHandle.addOrbit(orbit);
      orbit.type = body.type;
    });

    // Done setup, call first location init
    bodyToJsonMapEntries
      .find(([, so]) => so.type === SpaceObjectType.Star)[1]
      .draggableHandle
      .updateConstrainLocation({xy: [0, 0]} as OrbitParameterData);
    let listOrbits = Array.from(bodyOrbitMap.values());
    let celestialBodies = bodyToJsonMapEntries.map(([, so]) => so);

    return {listOrbits, celestialBodies};
  }

}
