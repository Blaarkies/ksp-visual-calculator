import {
  BehaviorSubject,
  delayWhen,
  map,
  Observable,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { PlanetoidAssetDto } from '../../common/domain/dtos/planetoid-asset.dto';
import { StarSystemDto } from '../../common/domain/dtos/star-system-dto';
import { Group } from '../../common/domain/group';
import { Orbit } from '../../common/domain/space-objects/orbit';
import { OrbitParameterData } from '../../common/domain/space-objects/orbit-parameter-data';
import { Planetoid } from '../../common/domain/space-objects/planetoid';
import { PlanetoidType } from '../../common/domain/space-objects/planetoid-type';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { Vector2 } from '../../common/domain/vector2';
import { WithDestroy } from '../../common/with-destroy';
import { CelestialBodyDetails } from '../../overlays/celestial-body-details-dialog/celestial-body-details';
import { AnalyticsService } from '../analytics.service';
import { StockEntitiesCacheService } from '../stock-entities-cache.service';
import { UniverseContainerInstance } from '../universe-container-instance.service';
import { EventLogs } from './event-logs';
import { OrbitsBodies } from './orbits-bodies';
import { PlanetoidWithDto } from './planetoid-with-dto.model';

export abstract class AbstractUniverseBuilderService extends WithDestroy() {

  protected abstract analyticsService: AnalyticsService;
  protected abstract universeContainerInstance: UniverseContainerInstance;
  protected abstract cacheService: StockEntitiesCacheService;

  orbits$ = new BehaviorSubject<Orbit[]>([]);
  planetoids$ = new BehaviorSubject<Planetoid[]>([]);

  protected constructor() {
    super();

    // TODO: remove UniverseContainerInstance usages
    setTimeout(() => this.planetoids$
      .pipe(takeUntil(this.destroy$))
      .subscribe(planets =>
        this.universeContainerInstance.planets$.next(planets)));
  }

  protected destroy() {
    this.orbits$.complete();
    this.planetoids$.complete();

    this.universeContainerInstance.planets$.next([]);
    this.universeContainerInstance.crafts$.next([]);
  }

  private stockAssetsReady(): Observable<OrbitsBodies> {
    return this.cacheService.planetoids$
      .pipe(
        take(1),
        map(data => AbstractUniverseBuilderService.generateOrbitsAndPlanetoids(data)),
        takeUntil(this.destroy$));
  }

  buildStockState(): Observable<OrbitsBodies> {
    return this.stockAssetsReady()
      .pipe(
        tap(({listOrbits, celestialBodies}) => {
          this.orbits$.next(listOrbits);
          this.planetoids$.next(celestialBodies);
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

  protected makeOrbitsLabelMap(planetoids: PlanetoidWithDto[]): Map<string, Orbit> {
    let orbitsLabels = planetoids
      .filter(e => e.planetoid.planetoidType !== PlanetoidType.Star)
      .map(({planetoid, dto}) => {
        let {parameters, color} = dto.orbit;
        let orbit = new Orbit(
          new OrbitParameterData(parameters.xy, parameters.r, parameters.parent),
          color,
          planetoid.draggable);
        return {label: planetoid.label, orbit};
      });
    let orbitsLabelMap = new Map<string, Orbit>(
      orbitsLabels.map(e => [e.label, e.orbit]));
    this.orbits$.next(orbitsLabels.map(e => e.orbit));
    return orbitsLabelMap;
  }

  editCelestialBody(body: Planetoid, details: CelestialBodyDetails) {
    this.analyticsService.logEvent('Edit celestial body', {
      category: EventLogs.Category.CelestialBody,
      old: {
        label: EventLogs.Sanitize.anonymize(body.label),
        type: body.type,
        size: body.size,
        dsn: body.communication.antennae[0] && body.communication.antennae[0].item,
      },
      new: {
        label: EventLogs.Sanitize.anonymize(details.name),
        type: details.celestialBodyType,
        size: details.size,
        dsn: details.currentDsn?.label,
      },
    });

    body.draggable.label = details.name;
    body.type = details.celestialBodyType;
    body.size = details.size;
    if (body.draggable.orbit) {
      body.draggable.orbit.color = details.orbitColor;
    }
    let antennaeIfDsn = details.currentDsn ? [new Group(details.currentDsn.label)] : [];
    body.communication.setAntennae(antennaeIfDsn);
  }

  getSoiParent(location: Vector2): Planetoid {
    return this.planetoids$.value
      .filter(p => !p.sphereOfInfluence || location.distance(p.location) <= p.sphereOfInfluence)
      .min(p => p.location.distance(location));
  }

  private static generateOrbitsAndPlanetoids(data: StarSystemDto): OrbitsBodies {
    // Setup abstract planetoids
    let bodyToJsonMap = new Map<PlanetoidAssetDto, Planetoid>(
      data.planetoids.map(b => [
        /*key  */ b,
        /*value*/ new Planetoid(
          b.name,
          b.imageUrl,
          b.type === PlanetoidType.types.star ? 'noMove' : 'orbital',
          [],
          PlanetoidType.fromString(b.type),
          (Math.log(b.equatorialRadius) * 4).toInt(),
          b.sphereOfInfluence,
          b.equatorialRadius,
          b.hasDsn),
      ]));

    // Setup SOI hierarchies
    bodyToJsonMap.forEach((parentP, parentPDto, mapCollection) => {
      let moons = Array.from(mapCollection.entries())
        .filter(([p]) => p.parent === parentPDto.id)
        .map(([, so]) => so);

      parentP.draggable.setChildren(moons);
    });

    // Setup movement rules
    let bodyToJsonMapEntries = Array.from(bodyToJsonMap.entries());
    let bodyOrbitMap = new Map<Planetoid, Orbit>(
      bodyToJsonMapEntries
        .filter(([,p]) => p.planetoidType !== PlanetoidType.Star)
        .map(([dto, p]) => [p, Orbit.fromJson(dto, p.draggable)]));
    bodyOrbitMap.forEach((orbit, body) => body.draggable.setOrbit(orbit));

    // Done setup, call first location init
    bodyToJsonMapEntries
      .find(([, p]) => p.planetoidType === PlanetoidType.Star)[1]
      .draggable
      .updateConstrainLocation({xy: [0, 0]} as OrbitParameterData);
    let listOrbits = Array.from(bodyOrbitMap.values());
    let celestialBodies = bodyToJsonMapEntries.map(([, so]) => so);

    return {listOrbits, celestialBodies};
  }

}
