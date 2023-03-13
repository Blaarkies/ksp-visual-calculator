import {
  delayWhen,
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
import { CelestialBodyDetails } from '../overlays/celestial-body-details-dialog/celestial-body-details';
import { AnalyticsService } from './analytics.service';
import { EventLogs } from './domain/event-logs';
import { StateSpaceObject } from './json-interfaces/state-space-object';
import { SetupService } from './setup.service';
import { UniverseContainerInstance } from './universe-container-instance.service';

export abstract class AbstractUniverseBuilderService extends WithDestroy() {

  protected abstract setupService: SetupService;
  protected abstract analyticsService: AnalyticsService;
  protected abstract spaceObjectContainerService: UniverseContainerInstance;

  lastPlanetsValue: SpaceObject[] = [];
  orbits$ = new SubjectHandle<Orbit[]>();

  protected constructor(
    public planets$: SubjectHandle<SpaceObject[]>
  ) {
    super();
    // TODO: remove this
    this.planets$.stream$
      .pipe(takeUntil(this.destroy$))
      .subscribe(planets => {
        this.lastPlanetsValue = planets;
        this.spaceObjectContainerService.celestialBodies$.next(planets);
      });
  }

  private stockAssetsReady(): Observable<{ listOrbits, celestialBodies }> {
    let stockOrbitsPlanets$ = this.setupService.stockPlanets$;

    return stockOrbitsPlanets$
      .pipe(
        take(1),
        takeUntil(this.destroy$));
  }

  buildStockState(): Observable<any> {
    return this.stockAssetsReady().pipe(
      tap(({listOrbits, celestialBodies}) => {
        this.orbits$.set(listOrbits);
        this.planets$.set(celestialBodies);
      }),
      delayWhen(() => this.setDetails()),
    );
  }

  protected async setDetails() {
  }

  protected abstract buildContextState(lastState: string): Promise<void>

  buildState(lastState: string): Observable<any> {
    return this.stockAssetsReady().pipe(
      delayWhen(() => this.buildContextState(lastState)),
    );
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
    this.orbits$.set(orbitsLabels.map(([, orbit]) => orbit) as Orbit[]);
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
    return this.lastPlanetsValue
      .filter(p => !p.sphereOfInfluence || location.distance(p.location) <= p.sphereOfInfluence)
      .sort((a, b) => a.location.distance(location) - b.location.distance(location))
      .first();
  }

}
