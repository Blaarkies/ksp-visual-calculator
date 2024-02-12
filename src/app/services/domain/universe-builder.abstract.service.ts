import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  delayWhen,
  map,
  Observable,
  take,
  tap,
} from 'rxjs';
import { PlanetoidAssetDto } from '../../common/domain/dtos/planetoid-asset.dto';
import { StarSystemDto } from '../../common/domain/dtos/star-system-dto';
import { StateCommnetPlannerDto } from '../../common/domain/dtos/state-commnet-planner.dto';
import { Orbit } from '../../common/domain/space-objects/orbit';
import { OrbitParameterData } from '../../common/domain/space-objects/orbit-parameter-data';
import { Planetoid } from '../../common/domain/space-objects/planetoid';
import { PlanetoidType } from '../../common/domain/space-objects/planetoid-type';
import { Vector2 } from '../../common/domain/vector2';
import { PlanetoidDetails } from '../../overlays/celestial-body-details-dialog/planetoid-details';
import { AnalyticsService } from '../analytics.service';
import { CameraService } from '../camera.service';
import { StockEntitiesCacheService } from '../stock-entities-cache.service';
import { EnrichedStarSystem } from './enriched-star-system.model';
import { EventLogs } from './event-logs';
import { PlanetoidFactory } from './planetoid-factory';
import { PlanetoidWithDto } from './planetoid-with-dto.model';
import { SoiManager } from './soi-manager';

export abstract class AbstractUniverseBuilderService {

  protected abstract analyticsService: AnalyticsService;
  protected abstract cacheService: StockEntitiesCacheService;
  protected abstract cameraService: CameraService;
  protected abstract destroyRef: DestroyRef;

  soiManager = new SoiManager(this);
  orbits$ = new BehaviorSubject<Orbit[]>([]);
  planetoids$ = new BehaviorSubject<Planetoid[]>([]);

  protected planetoidFactory = new PlanetoidFactory(this.soiManager);

  protected destroy() {
    this.orbits$.complete();
    this.planetoids$.complete();
  }

  private stockAssetsReady(): Observable<EnrichedStarSystem> {
    return this.cacheService.starSystem$
      .pipe(
        take(1),
        map(starSystemDto => this.generateEnrichedStarSystem(starSystemDto)),
        takeUntilDestroyed(this.destroyRef));
  }

  buildStockState(): Observable<EnrichedStarSystem> {
    return this.stockAssetsReady()
      .pipe(
        tap(({starSystem, listOrbits, planetoids}) => {
          this.orbits$.next(listOrbits);
          this.planetoids$.next(planetoids);
          this.cameraService.focusSpaceObject(
            planetoids.find(p => p.label.includesSome(starSystem.dsnIds))
            ?? planetoids[0]);
        }),
        delayWhen(enrichedStarSystem => this.setStockDetails(enrichedStarSystem)));
  }

  protected abstract setStockDetails(enrichedStarSystem: EnrichedStarSystem): Promise<void>

  protected async buildContextState(lastState: string): Promise<void> {
    let state: StateCommnetPlannerDto = JSON.parse(lastState);
    let {camera} = state;

    if (camera) {
      this.cameraService.setFromJson(camera);
    } else {
      this.planetoids$.pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef))
        .subscribe(planetoids => {
          let target = planetoids.find(p => p.communication) || planetoids[4];
          if (target) {
            this.cameraService.focusSpaceObject(target);
          }
        });
    }
    return;
  }

  buildState(lastState: string): Observable<EnrichedStarSystem> {
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

  editCelestialBody(body: Planetoid, details: PlanetoidDetails) {
    this.analyticsService.logEvent('Edit celestial body', {
      category: EventLogs.Category.CelestialBody,
      old: {
        label: EventLogs.Sanitize.anonymize(body.label),
        type: body.type,
        size: body.size,
        dsn: body.communication?.stringAntennae[0] && body.communication?.stringAntennae[0].item,
      },
      new: {
        label: EventLogs.Sanitize.anonymize(details.name),
        type: details.planetoidType,
        size: details.size,
        dsn: details.currentDsn?.label,
      },
    });

    body.draggable.label = details.name;
    body.planetoidType = details.planetoidType;
    body.size = details.size;
    if (body.draggable.orbit) {
      body.draggable.orbit.color = details.orbitColor;
    }
  }

  getSoiParent(location: Vector2): Planetoid {
    return this.planetoids$.value
      .filter(p => !p.sphereOfInfluence || location.distance(p.location) <= p.sphereOfInfluence)
      .min(p => p.location.distance(location));
  }

  private generateEnrichedStarSystem(starSystem: StarSystemDto): EnrichedStarSystem {
    // Setup abstract planetoids
    let bodyToJsonMap = new Map<PlanetoidAssetDto, Planetoid>(
      starSystem.planetoids.map(b => [
        /*key  */ b,
        /*value*/ this.planetoidFactory.makePlanetoid(
          b.id,
          b.name,
          b.imageUrl,
          b.type === PlanetoidType.types.star ? 'noMove' : 'orbital',
          [],
          PlanetoidType.fromString(b.type),
          (Math.log(b.equatorialRadius) * 4).toInt(),
          b.sphereOfInfluence,
          b.equatorialRadius),
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
        .filter(([, p]) => p.planetoidType !== PlanetoidType.Star)
        .map(([dto, p]) => [p, Orbit.fromJson(dto, p.draggable)]));
    bodyOrbitMap.forEach((orbit, body) => body.draggable.setOrbit(orbit));

    // Done setup, call first location init
    bodyToJsonMapEntries
      .find(([, p]) => p.planetoidType === PlanetoidType.Star)[1]
      .draggable
      .updateConstrainLocation({xy: [0, 0]} as OrbitParameterData);
    let listOrbits = Array.from(bodyOrbitMap.values());
    let planetoids = bodyToJsonMapEntries.map(([, so]) => so);

    return {starSystem, listOrbits, planetoids};
  }

}
